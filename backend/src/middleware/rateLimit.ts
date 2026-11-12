import { Request, Response } from 'express';

// Live traffic is Visitor -> Cloudflare -> host nginx -> container nginx -> API, and the server only
// accepts connections from Cloudflare, which always overwrites CF-Connecting-IP with the real visitor IP.
// X-Forwarded-For is never used because the visitor can set it to anything.
export const getClientIp = (req: Request): string => {
  const header = req.headers['cf-connecting-ip'];
  const cfIp = (Array.isArray(header) ? header[0] : header || '').trim();
  return cfIp || req.socket.remoteAddress || 'unknown';
};

interface Hit {
  at: number;
  tag: string;
}

// In-memory sliding window counter (the API runs as a single process).
// Each hit can carry a tag so that only some hits of a key can be cleared later.
export class RateLimiter {
  private hits = new Map<string, Hit[]>();

  constructor(private limit: number, private windowMs: number) {
    setInterval(() => this.cleanup(), 60 * 1000).unref();
  }

  private active(key: string, now = Date.now()) {
    const list = (this.hits.get(key) || []).filter(h => now - h.at < this.windowMs);
    if (list.length) this.hits.set(key, list);
    else this.hits.delete(key);
    return list;
  }

  // Milliseconds until the key is allowed again, 0 when it is not blocked
  retryAfterMs(key: string): number {
    const now = Date.now();
    const list = this.active(key, now);
    if (list.length < this.limit) return 0;
    return list[list.length - this.limit].at + this.windowMs - now;
  }

  hit(key: string, tag = '') {
    const list = this.active(key);
    list.push({ at: Date.now(), tag });
    this.hits.set(key, list);
  }

  clear(key: string, tag?: string) {
    if (tag === undefined) {
      this.hits.delete(key);
      return;
    }
    const list = this.active(key).filter(h => h.tag !== tag);
    if (list.length) this.hits.set(key, list);
    else this.hits.delete(key);
  }

  private cleanup() {
    for (const key of Array.from(this.hits.keys())) this.active(key);
  }
}

export const sendTooManyRequests = (res: Response, retryAfterMs: number, action: string) => {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  const minutes = Math.ceil(seconds / 60);
  res.set('Retry-After', String(seconds));
  return res.status(429).json({
    message: `Too many ${action} attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`
  });
};

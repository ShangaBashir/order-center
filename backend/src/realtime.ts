import { Response } from 'express';

export interface RealtimeOrderEvent {
  type: 'ORDER_CREATED' | 'ORDER_UPDATED' | 'ORDER_STATUS_UPDATED' | 'ORDER_DELETED';
  orderId: string;
  trackingNumber?: string;
  status?: string;
  order?: any;
  timestamp?: number;
}

class RealtimeHub {
  private clients: Map<string, Response> = new Map();

  constructor() {
    // Send keepalive heartbeat every 20 seconds to prevent connection drops across proxies/browsers
    setInterval(() => {
      this.sendHeartbeat();
    }, 20000);
  }

  public addClient(res: Response): string {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    this.clients.set(clientId, res);

    try {
      res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: Date.now() })}\n\n`);
    } catch (err) {
      this.clients.delete(clientId);
    }

    return clientId;
  }

  public removeClient(clientId: string) {
    this.clients.delete(clientId);
  }

  private sendHeartbeat() {
    const deadClients: string[] = [];
    this.clients.forEach((res, id) => {
      try {
        res.write(`: heartbeat ${Date.now()}\n\n`);
      } catch (err) {
        deadClients.push(id);
      }
    });
    deadClients.forEach(id => this.clients.delete(id));
  }

  public broadcast(event: RealtimeOrderEvent) {
    // The stream is public (tracking pages listen without logging in), so never send
    // customer details: listeners only need the IDs and status, and refetch the rest.
    const { order, ...rest } = event;
    const payload = JSON.stringify({
      ...rest,
      order: order ? { orderId: order.orderId, trackingNumber: order.trackingNumber } : undefined,
      timestamp: event.timestamp || Date.now()
    });

    const deadClients: string[] = [];
    this.clients.forEach((res, id) => {
      try {
        res.write(`data: ${payload}\n\n`);
      } catch (err) {
        deadClients.push(id);
      }
    });
    deadClients.forEach(id => this.clients.delete(id));
  }

  public getConnectedCount(): number {
    return this.clients.size;
  }
}

export const realtimeHub = new RealtimeHub();


import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
    name?: string;
    isCustomer?: boolean;
    customerId?: string;
  };
}

// Accounts with these emails get admin access. Public sign-up refuses them (routes/auth.ts),
// so nobody can create a new account with one of these addresses.
export const RESERVED_ADMIN_EMAILS = ['shanga.bashir22@gmail.com'];

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  // Local development only: the demo admin token must never work in production,
  // where it would give anyone full admin access.
  if (token === 'demo_admin_jwt_token' && process.env.NODE_ENV !== 'production' && !process.env.ADMIN_PASSWORD) {
    req.user = {
      id: 'admin_1',
      role: 'admin',
      email: 'admin@ordercenter.iq',
      name: 'OrderCenter Admin'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey') as { id: string, role: string, email?: string, name?: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Admin dashboard endpoints: a valid token is not enough, the account must be an admin
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  authMiddleware(req, res, () => {
    const role = (req.user?.role || '').toLowerCase();
    const email = (req.user?.email || '').toLowerCase();
    // Tokens are signed by the server, so role, id and email can be trusted. Only emails that
    // cannot be claimed through public sign-up may be listed here (see RESERVED_ADMIN_EMAILS).
    const isAdmin =
      role === 'admin' ||
      req.user?.id === 'admin_1' ||
      RESERVED_ADMIN_EMAILS.includes(email);

    if (!isAdmin) {
      return res.status(403).json({
        message: `Admin access required. Your active session is signed in as a standard user (${req.user?.email || 'user'}). Please sign in with the Admin account (admin@ordercenter.iq).`
      });
    }
    next();
  });
};

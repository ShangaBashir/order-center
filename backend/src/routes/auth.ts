import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Customer from '../models/Customer';
import { memoryStore } from '../memoryStore';
import { RateLimiter, getClientIp, sendTooManyRequests } from '../middleware/rateLimit';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// Admin login comes from ADMIN_EMAIL / ADMIN_PASSWORD. The old demo login (admin123) only
// works in local development when no ADMIN_PASSWORD is set.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@ordercenter.iq').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const DEMO_ADMIN_ALLOWED = !ADMIN_PASSWORD && process.env.NODE_ENV !== 'production';

const isAdminCredentials = (email: string, password: string) => {
  if (ADMIN_PASSWORD) {
    return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
  }
  return DEMO_ADMIN_ALLOWED &&
    (email === 'admin@ordercenter.iq' || email === 'admin@gmail.com' || email === 'admin') &&
    (password === 'admin123' || password === 'admin');
};

// Failed logins: 10 per IP per 15 minutes, 30 per account per hour (attacks spread over many IPs).
// A successful login clears only the failures of that IP + email pair.
const loginFailuresByIp = new RateLimiter(10, 15 * 60 * 1000);
const loginFailuresByEmail = new RateLimiter(30, 60 * 60 * 1000);
const signupsByIp = new RateLimiter(10, 60 * 60 * 1000);

const recordLoginFailure = (ip: string, email: string) => {
  loginFailuresByIp.hit(ip, email);
  loginFailuresByEmail.hit(email, ip);
};

// 1. POST /api/auth/login - User & Admin Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const ip = getClientIp(req);

    // Checked before the password, so a blocked attempt reveals nothing
    const retryAfterMs = Math.max(loginFailuresByIp.retryAfterMs(ip), loginFailuresByEmail.retryAfterMs(cleanEmail));
    if (retryAfterMs > 0) {
      return sendTooManyRequests(res, retryAfterMs, 'login');
    }

    // Built-in admin account
    if (isAdminCredentials(cleanEmail, password)) {
      loginFailuresByIp.clear(ip, cleanEmail);
      loginFailuresByEmail.clear(cleanEmail, ip);
      const token = jwt.sign(
        { id: 'admin_1', role: 'admin', email: ADMIN_EMAIL, name: 'OrderCenter Admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: { id: 'admin_1', name: 'OrderCenter Admin', email: ADMIN_EMAIL, role: 'admin' }
      });
    }

    // Try finding in Mongo DB
    let user: any = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    // Fallback to memoryStore
    if (!user) {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      recordLoginFailure(ip, cleanEmail);
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordLoginFailure(ip, cleanEmail);
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    loginFailuresByIp.clear(ip, cleanEmail);
    loginFailuresByEmail.clear(cleanEmail, ip);

    const userId = user._id || user.id;
    const token = jwt.sign(
      {
        id: userId,
        role: user.role || 'user',
        email: user.email,
        name: user.name,
        isCustomer: !!user.isCustomer,
        customerId: user.customerId || ''
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role || 'user',
        isCustomer: !!user.isCustomer,
        customerId: user.customerId || ''
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during authentication' });
  }
});

// 2. POST /api/auth/register - Register User / Customer
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, isCustomer, customerId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // 10 sign-up attempts per IP per hour
    const ip = getClientIp(req);
    const retryAfterMs = signupsByIp.retryAfterMs(ip);
    if (retryAfterMs > 0) {
      return sendTooManyRequests(res, retryAfterMs, 'sign-up');
    }
    signupsByIp.hit(ip);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCustomerId = isCustomer && customerId ? customerId.trim().toUpperCase() : '';

    // The admin email can never be registered from the public sign-up form
    if (cleanEmail === ADMIN_EMAIL || cleanEmail === 'admin@ordercenter.iq') {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Check if user already exists in Mongo
    let existingUser: any = null;
    try {
      existingUser = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (!existingUser) {
      existingUser = memoryStore.findUserByEmail(cleanEmail);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Public sign-up never creates admin accounts
    const userRole = isCustomer ? 'customer' : 'user';

    let createdUser: any = null;

    try {
      const newUser = new User({
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || '',
        role: userRole,
        isCustomer: !!isCustomer,
        customerId: cleanCustomerId
      });
      createdUser = await newUser.save();
    } catch (dbErr) {
      // Memory store fallback
      createdUser = memoryStore.addUser({
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || '',
        role: userRole as any,
        isCustomer: !!isCustomer,
        customerId: cleanCustomerId
      });
    }

    // Always keep memoryStore updated
    if (!memoryStore.findUserByEmail(cleanEmail)) {
      memoryStore.addUser({
        name,
        email: cleanEmail,
        password: hashedPassword,
        phone: phone || '',
        role: userRole as any,
        isCustomer: !!isCustomer,
        customerId: cleanCustomerId
      });
    }

    const userId = createdUser._id || createdUser.id;
    const token = jwt.sign(
      {
        id: userId,
        role: userRole,
        email: cleanEmail,
        name,
        isCustomer: !!isCustomer,
        customerId: cleanCustomerId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name,
        email: cleanEmail,
        phone: phone || '',
        role: userRole,
        isCustomer: !!isCustomer,
        customerId: cleanCustomerId
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error creating account', error: err.message });
  }
});

// 3. GET /api/auth/me - Current User Info
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    let user: any = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {}

    if (!user) {
      user = memoryStore.findUserByEmail(decoded.email);
    }

    if (!user) {
      return res.json({
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role,
          isCustomer: decoded.isCustomer,
          customerId: decoded.customerId
        }
      });
    }

    return res.json({
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        isCustomer: user.isCustomer,
        customerId: user.customerId
      }
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
});

export default router;

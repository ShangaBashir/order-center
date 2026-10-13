import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Customer from '../models/Customer';
import { memoryStore } from '../memoryStore';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// 1. POST /api/auth/login - User & Admin Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check fallback seed admin credentials
    if ((cleanEmail === 'admin@ordercenter.iq' || cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin') &&
        (password === 'admin123' || password === 'admin')) {
      const token = jwt.sign(
        { id: 'admin_1', role: 'admin', email: 'admin@ordercenter.iq', name: 'OrderCenter Admin' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: { id: 'admin_1', name: 'OrderCenter Admin', email: 'admin@ordercenter.iq', role: 'admin' }
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
      return res.status(400).json({ message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

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

    const cleanEmail = email.trim().toLowerCase();
    const cleanCustomerId = isCustomer && customerId ? customerId.trim().toUpperCase() : '';

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

    const userRole = cleanEmail === 'admin@ordercenter.iq' ? 'admin' : (isCustomer ? 'customer' : 'user');

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

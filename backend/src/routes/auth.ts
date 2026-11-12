import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Customer from '../models/Customer';
import { memoryStore } from '../memoryStore';
import { sendPasswordResetEmail } from '../utils/mailer';

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

    if (!name || !email || !password || !phone || !phone.trim()) {
      return res.status(400).json({ message: 'Full name, email address, phone number, and password are all required.' });
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

// 4. POST /api/auth/link-customer - Link Customer ID to user account
router.post('/link-customer', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    const { customerId } = req.body;
    if (!customerId || !customerId.trim()) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const cleanCustomerId = customerId.trim().toUpperCase();

    // Verify Customer exists in MongoDB or memoryStore
    let customer: any = null;
    try {
      customer = await Customer.findOne({
        customerId: { $regex: new RegExp(`^${cleanCustomerId}$`, 'i') }
      }).lean();
    } catch (e) {}

    if (!customer) {
      customer = memoryStore.findCustomerById(cleanCustomerId);
    }

    if (!customer) {
      return res.status(404).json({
        message: `Customer ID "${cleanCustomerId}" was not found. Please verify the ID provided by Order Center.`
      });
    }

    // Find and update the user in DB / memoryStore
    let updatedUser: any = null;
    try {
      updatedUser = await User.findByIdAndUpdate(
        decoded.id,
        {
          isCustomer: true,
          customerId: customer.customerId,
          role: decoded.role === 'admin' ? 'admin' : 'customer',
          ...(customer.phone && !decoded.phone ? { phone: customer.phone } : {})
        },
        { new: true }
      ).select('-password');
    } catch (e) {}

    const memUser = memoryStore.updateUser(decoded.id || decoded.email, {
      isCustomer: true,
      customerId: customer.customerId,
      role: decoded.role === 'admin' ? 'admin' : 'customer',
      ...(customer.phone && !decoded.phone ? { phone: customer.phone } : {})
    });

    if (!updatedUser) updatedUser = memUser;

    const finalUserId = updatedUser?._id || updatedUser?.id || decoded.id;
    const finalName = updatedUser?.name || decoded.name;
    const finalEmail = updatedUser?.email || decoded.email;
    const finalPhone = updatedUser?.phone || customer.phone || decoded.phone || '';
    const finalRole = decoded.role === 'admin' ? 'admin' : 'customer';

    // Issue updated token
    const newToken = jwt.sign(
      {
        id: finalUserId,
        name: finalName,
        email: finalEmail,
        role: finalRole,
        isCustomer: true,
        customerId: customer.customerId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Customer ID successfully linked!',
      token: newToken,
      user: {
        id: finalUserId,
        name: finalName,
        email: finalEmail,
        phone: finalPhone,
        role: finalRole,
        isCustomer: true,
        customerId: customer.customerId
      },
      customer: {
        id: customer._id || customer.customerId,
        customerId: customer.customerId,
        name: customer.name,
        phone: customer.phone,
        secondaryPhone: customer.secondaryPhone,
        email: customer.email,
        address: customer.address
      }
    });
  } catch (err: any) {
    console.error('Link customer error:', err);
    return res.status(500).json({ message: 'Server error linking customer: ' + err.message });
  }
});

// 5. POST /api/auth/unlink-customer - Unlink Customer ID
router.post('/unlink-customer', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    try {
      await User.findByIdAndUpdate(decoded.id, {
        isCustomer: false,
        customerId: '',
        role: decoded.role === 'admin' ? 'admin' : 'user'
      });
    } catch (e) {}

    memoryStore.updateUser(decoded.id || decoded.email, {
      isCustomer: false,
      customerId: '',
      role: decoded.role === 'admin' ? 'admin' : 'user'
    });

    const finalRole = decoded.role === 'admin' ? 'admin' : 'user';
    const newToken = jwt.sign(
      {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: finalRole,
        isCustomer: false,
        customerId: ''
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Customer ID disconnected',
      token: newToken,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: finalRole,
        isCustomer: false,
        customerId: ''
      }
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to unlink customer ID' });
  }
});

// 6. POST /api/auth/forgot-password - Send 6-digit verification code to email
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Please enter your email address' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if account exists
    let user: any = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (!user) {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    // Special check for seed admin account
    if (!user && (cleanEmail === 'admin@ordercenter.iq' || cleanEmail === 'admin@gmail.com' || cleanEmail === 'admin')) {
      user = {
        name: 'OrderCenter Admin',
        email: 'admin@ordercenter.iq',
        role: 'admin'
      };
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Generate 6-digit verification code (valid for 60 seconds)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 65 * 1000); // 65 seconds (60s timer + 5s network grace)

    // Save code to MongoDB if connected
    try {
      await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          resetPasswordCode: verificationCode,
          resetPasswordExpires: expiresAt
        }
      );
    } catch (e) {}

    // Save code to memoryStore
    memoryStore.updateUser(cleanEmail, {
      resetPasswordCode: verificationCode,
      resetPasswordExpires: expiresAt.toISOString()
    });

    // Send email from website email (Wazhamyassin98@gmail.com)
    await sendPasswordResetEmail(cleanEmail, user.name || 'Customer', verificationCode);

    return res.json({
      message: 'A 6-digit verification code has been sent to your email address from Wazhamyassin98@gmail.com.',
      email: cleanEmail,
      expiresInSeconds: 60
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Failed to process password reset request. ' + err.message });
  }
});

// 7. POST /api/auth/reset-password - Verify code and set new password
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !email.trim() || !code || !code.trim() || !newPassword) {
      return res.status(400).json({ message: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // Find user
    let user: any = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (!user) {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // Check code and expiration
    const savedCode = user.resetPasswordCode;
    const expiresTime = user.resetPasswordExpires ? new Date(user.resetPasswordExpires).getTime() : 0;

    if (!savedCode || savedCode !== cleanCode) {
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    }

    if (Date.now() > expiresTime) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update in MongoDB
    try {
      await User.findOneAndUpdate(
        { email: cleanEmail },
        {
          password: hashedPassword,
          resetPasswordCode: '',
          resetPasswordExpires: null
        }
      );
    } catch (e) {}

    // Update in memoryStore
    memoryStore.updateUser(cleanEmail, {
      password: hashedPassword,
      resetPasswordCode: '',
      resetPasswordExpires: undefined
    });

    return res.json({
      message: 'Your password has been successfully reset! You can now sign in with your new password.'
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    return res.status(500).json({ message: 'Failed to reset password: ' + err.message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Customer from '../models/Customer';
import { memoryStore } from '../memoryStore';
import { sendPasswordResetEmail } from '../utils/mailer';
import { RateLimiter, getClientIp, sendTooManyRequests } from '../middleware/rateLimit';
import crypto from 'crypto';
import mongoose from 'mongoose';

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
// Customer ID linking: 10 failed attempts per account and 20 per IP per hour
const linkFailuresByUser = new RateLimiter(10, 60 * 60 * 1000);
const linkFailuresByIp = new RateLimiter(20, 60 * 60 * 1000);
// Password reset: 5 code requests per email and 10 per IP per 15 minutes;
// 5 wrong codes per email and 20 per IP per 15 minutes (the code is voided after 5 wrong tries)
const resetRequestsByEmail = new RateLimiter(5, 15 * 60 * 1000);
const resetRequestsByIp = new RateLimiter(10, 15 * 60 * 1000);
const resetFailuresByEmail = new RateLimiter(5, 15 * 60 * 1000);
const resetFailuresByIp = new RateLimiter(20, 15 * 60 * 1000);

// Last 10 digits, so 0770..., 964770... and +964 770... compare equal
const phoneKey = (phone?: string) => (phone || '').replace(/\D/g, '').slice(-10);

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
    const { name, email, password, phone, isCustomer } = req.body;

    if (!name || !email || !password || !phone || !phone.trim()) {
      return res.status(400).json({ message: 'Full name, email address, phone number, and password are all required.' });
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
    // A Customer ID is never accepted from the sign-up form: it would let anyone attach another
    // customer's orders. Customers connect their ID afterwards via /link-customer, which verifies it.
    const cleanCustomerId = '';

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

    const cleanCustomerId = String(customerId).trim().toUpperCase();
    const ip = getClientIp(req);
    const userKey = String(decoded.id || decoded.email || '');

    const retryAfterMs = Math.max(linkFailuresByUser.retryAfterMs(userKey), linkFailuresByIp.retryAfterMs(ip));
    if (retryAfterMs > 0) {
      return sendTooManyRequests(res, retryAfterMs, 'Customer ID');
    }

    // Unknown IDs and IDs that do not belong to this account get the same answer,
    // so this cannot be used to find out which Customer IDs exist.
    const notLinked = () => {
      linkFailuresByUser.hit(userKey);
      linkFailuresByIp.hit(ip);
      return res.status(404).json({
        message: 'This Customer ID could not be connected to your account. Please check the ID, and make sure your account uses the same phone number or email address that Order Center has on file for you.'
      });
    };

    if (cleanCustomerId.length > 64 || !/^[A-Z0-9-]+$/.test(cleanCustomerId)) {
      return notLinked();
    }

    // Verify Customer exists in MongoDB or memoryStore (exact match; the ID is validated above)
    let customer: any = null;
    try {
      customer = await Customer.findOne({
        customerId: { $regex: new RegExp(`^${cleanCustomerId}$`, 'i') }
      }).lean();
    } catch (e) {}

    if (!customer && mongoose.connection.readyState !== 1) {
      customer = memoryStore.findCustomerById(cleanCustomerId);
    }

    if (!customer) {
      return notLinked();
    }

    // Proof of ownership: the Customer ID alone is not enough. The account's stored phone
    // (last 10 digits) or email must match the customer record Order Center created.
    let account: any = null;
    try {
      if (mongoose.Types.ObjectId.isValid(String(decoded.id))) {
        account = await User.findById(decoded.id).lean();
      }
    } catch (e) {}
    if (!account && decoded.email) {
      account = memoryStore.findUserByEmail(String(decoded.email).trim().toLowerCase());
    }
    if (!account) {
      return notLinked();
    }

    const accountPhone = phoneKey(account.phone);
    const accountEmail = (account.email || '').trim().toLowerCase();
    const customerPhones = [customer.phone, customer.secondaryPhone].map(phoneKey).filter(p => p.length >= 7);
    const customerEmail = (customer.email || '').trim().toLowerCase();
    const ownsCustomer =
      (accountPhone.length >= 7 && customerPhones.includes(accountPhone)) ||
      (!!accountEmail && !!customerEmail && accountEmail === customerEmail);

    if (decoded.role !== 'admin' && !ownsCustomer) {
      return notLinked();
    }
    linkFailuresByUser.clear(userKey);

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

    const cleanEmail = String(email).trim().toLowerCase();
    const ip = getClientIp(req);

    const retryAfterMs = Math.max(resetRequestsByEmail.retryAfterMs(cleanEmail), resetRequestsByIp.retryAfterMs(ip));
    if (retryAfterMs > 0) {
      return sendTooManyRequests(res, retryAfterMs, 'password reset');
    }
    resetRequestsByEmail.hit(cleanEmail);
    resetRequestsByIp.hit(ip);

    // Same answer whether or not the account exists, so this cannot be used to find registered emails
    const genericResponse = () => res.json({
      message: 'If an account exists for this email address, a 6-digit verification code has been sent to it.',
      email: cleanEmail,
      expiresInSeconds: 60
    });

    // Check if account exists
    let user: any = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (!user && mongoose.connection.readyState !== 1) {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    // The built-in admin login comes from server settings and cannot be reset by email
    if (!user) {
      return genericResponse();
    }

    // A new code also clears earlier wrong guesses for this email
    resetFailuresByEmail.clear(cleanEmail);

    // Generate 6-digit verification code (valid for 60 seconds) with a cryptographically secure RNG
    const verificationCode = crypto.randomInt(100000, 1000000).toString();
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

    return genericResponse();
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

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanCode = String(code).trim();
    const ip = getClientIp(req);

    const retryAfterMs = Math.max(resetFailuresByEmail.retryAfterMs(cleanEmail), resetFailuresByIp.retryAfterMs(ip));
    if (retryAfterMs > 0) {
      return sendTooManyRequests(res, retryAfterMs, 'verification code');
    }

    const invalidCode = async () => {
      resetFailuresByEmail.hit(cleanEmail);
      resetFailuresByIp.hit(ip);
      // After 5 wrong codes the current code is voided; the user must request a new one
      if (resetFailuresByEmail.retryAfterMs(cleanEmail) > 0) {
        try {
          await User.findOneAndUpdate({ email: cleanEmail }, { resetPasswordCode: '', resetPasswordExpires: null });
        } catch (e) {}
        memoryStore.updateUser(cleanEmail, { resetPasswordCode: '', resetPasswordExpires: undefined });
      }
      return res.status(400).json({ message: 'Invalid verification code. Please check your email and try again.' });
    };

    // Find user
    let user: any = null;
    try {
      user = await User.findOne({ email: cleanEmail });
    } catch (e) {}

    if (!user) {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return invalidCode();
    }

    // Check code and expiration
    const savedCode = user.resetPasswordCode;
    const expiresTime = user.resetPasswordExpires ? new Date(user.resetPasswordExpires).getTime() : 0;

    if (!savedCode || savedCode.length !== cleanCode.length ||
        !crypto.timingSafeEqual(Buffer.from(savedCode), Buffer.from(cleanCode))) {
      return invalidCode();
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

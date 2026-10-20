import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { memoryStore } from '../memoryStore';
import { RateLimiter } from '../middleware/rateLimit';
import { realtimeHub } from '../realtime';

const router = Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

// Match an order by its Order ID, or by its database _id when the value is a valid ObjectId
// (passing a non-ObjectId string as _id makes MongoDB reject the whole query).
const orderIdFilter = (rawId: string) => {
  const clauses: any[] = [{ orderId: rawId }];
  if (mongoose.Types.ObjectId.isValid(rawId)) clauses.push({ _id: rawId });
  return { $or: clauses };
};

// Last 10 digits, so 0770..., 964770... and +964 770... compare equal
const phoneKey = (phone?: string) => (phone || '').replace(/\D/g, '').slice(-10);

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

interface Account {
  inDb: boolean;
  id: string;
  email: string;
  phone: string;
  claimedOrders: string[];
}

// The logged-in account as stored on the server: the User document when MongoDB is connected,
// the in-memory copy when it is offline (or for accounts that only exist in memory).
async function loadAccount(req: AuthRequest): Promise<Account | null> {
  const id = req.user?.id || '';
  const email = (req.user?.email || '').trim().toLowerCase();

  if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
    const dbUser: any = await User.findById(id).lean();
    if (!dbUser) return null;
    return {
      inDb: true,
      id,
      email: (dbUser.email || '').trim().toLowerCase(),
      phone: dbUser.phone || '',
      claimedOrders: dbUser.claimedOrders || []
    };
  }

  const memUser = email ? memoryStore.findUserByEmail(email) : null;
  if (!memUser) return null;
  return {
    inDb: false,
    id,
    email: memUser.email.trim().toLowerCase(),
    phone: memUser.phone || '',
    claimedOrders: memUser.claimedOrders || []
  };
}

// Admin-only fields that customers never receive
const forCustomer = (order: any) => {
  const { notes, ...rest } = order;
  return rest;
};

// Failed claim attempts: 20 per account per hour
const claimFailures = new RateLimiter(20, 60 * 60 * 1000);

// An order belongs to an account when its phone (last 10 digits) or its email matches the account
const accountOwnsOrder = (order: any, account: Account) => {
  const accountPhone = phoneKey(account.phone);
  const orderEmail = (order.email || '').trim().toLowerCase();
  return (
    (accountPhone.length >= 7 && phoneKey(order.phone) === accountPhone) ||
    (!!account.email && orderEmail === account.email)
  );
};

// Helper to generate unique random Order ID (e.g. ORD-9X7K2M4P)
async function generateUniqueOrderId(): Promise<string> {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let candidateId = '';
  let exists = true;
  let attempts = 0;

  while (exists && attempts < 100) {
    attempts++;
    let randomStr = '';
    for (let i = 0; i < 8; i++) {
      randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    candidateId = `ORD-${randomStr}`;

    let foundInDb = false;
    if (isDbConnected()) {
      try {
        const count = await Order.countDocuments({ orderId: candidateId });
        if (count > 0) foundInDb = true;
      } catch (e) {}
    }

    const foundInMem = memoryStore.getAllOrders().some(o => o.orderId === candidateId);
    exists = foundInDb || foundInMem;
  }

  return candidateId;
}// GET /api/orders/next-id - Preview next auto-assigned Order ID
router.get('/next-id', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const orderId = await generateUniqueOrderId();
    res.json({ orderId });
  } catch (err: any) {
    res.status(500).json({ message: 'Error generating order ID', error: err.message });
  }
});

// 1. POST /api/orders (Create Order)
router.post('/', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      phone,
      email,
      address,
      productName,
      productUrl,
      productImage,
      quantity,
      productPrice,
      shippingFee,
      currency,
      originCountry,
      destinationCountry,
      shippingMethod,
      trackingNumber,
      estimatedDelivery,
      status
    } = req.body;

    if (
      !customerName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !productName?.trim() ||
      !productUrl?.trim() ||
      productPrice === undefined ||
      Number(productPrice) <= 0 ||
      !quantity ||
      Number(quantity) <= 0
    ) {
      return res.status(400).json({
        message: 'Customer Name, Phone, Address, Product Name, Product Link, Quantity, and Price are required.'
      });
    }

    const orderId = await generateUniqueOrderId();
    const qty = Number(quantity) || 1;
    const price = Number(productPrice) || 0;
    const fee = Number(shippingFee) || 0;
    const totalPrice = qty * price + fee;
    const initialStatus = status || 'Purchased';
    const now = new Date();

    const statusHistory = [
      {
        status: initialStatus,
        date: now,
        note: 'Order created manually in Admin Dashboard'
      }
    ];

    let newOrder: any = null;

    if (isDbConnected()) {
      try {
        const orderDoc = new Order({
          orderId,
          customerName,
          phone,
          email: email || '',
          address,
          productName,
          productUrl: productUrl.trim(),
          productImage: productImage || '',
          quantity: qty,
          productPrice: price,
          shippingFee: fee,
          totalPrice,
          currency: currency || 'USD',
          originCountry: originCountry || 'China',
          destinationCountry: destinationCountry || 'Iraq',
          shippingMethod: shippingMethod || 'Express Air',
          trackingNumber: trackingNumber || '',
          estimatedDelivery: estimatedDelivery || '',
          status: initialStatus,
          statusHistory,
          notes: req.body.notes || ''
        });

        newOrder = await orderDoc.save();
      } catch (dbErr) {
        console.warn('MongoDB save failed, persisting to MemoryStore:', dbErr);
      }
    }

    // Always keep memoryStore synced
    const memOrder = memoryStore.addOrder({
      orderId,
      customerName,
      phone,
      email,
      address,
      productName,
      productUrl,
      productImage,
      quantity: qty,
      productPrice: price,
      shippingFee: fee,
      totalPrice,
      currency,
      originCountry,
      destinationCountry,
      shippingMethod,
      trackingNumber,
      estimatedDelivery,
      status: initialStatus,
      statusHistory,
      notes: req.body.notes || ''
    });

    const finalCreated = newOrder ? (newOrder.toObject ? newOrder.toObject() : newOrder) : memOrder;
    realtimeHub.broadcast({
      type: 'ORDER_CREATED',
      orderId: finalCreated.orderId || orderId,
      trackingNumber: finalCreated.trackingNumber,
      status: finalCreated.status,
      order: finalCreated
    });

    return res.status(201).json({
      message: 'Order created successfully.',
      order: finalCreated,
      orderId
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return res.status(500).json({ message: 'Failed to create order.' });
  }
});

// 2. GET /api/orders (Get All Orders)
router.get('/', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    if (isDbConnected()) {
      const dbOrders = await Order.find().sort({ createdAt: -1 }).lean();
      return res.json(dbOrders);
    }

    const memOrders = memoryStore.getAllOrders();
    return res.json(memOrders);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving orders.' });
  }
});

// GET /api/orders/mine - Orders the logged-in customer has claimed with their Order ID.
// Phone and email are not verified at sign-up, so they are never enough on their own.
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const account = await loadAccount(req);
    const claimed = account?.claimedOrders || [];
    if (claimed.length === 0) return res.json([]);

    const mine: any[] = isDbConnected()
      ? await Order.find({ orderId: { $in: claimed } }).sort({ createdAt: -1 }).lean()
      : memoryStore.getAllOrders().filter(o => claimed.includes(o.orderId));

    // Re-check ownership: an admin may have changed the order's phone or email since it was claimed
    return res.json(mine.filter(o => accountOwnsOrder(o, account!)).map(forCustomer));
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving your orders.' });
  }
});

// POST /api/orders/claim - Add an order to the logged-in account using its Order ID.
// Tracking numbers are not accepted: they are printed on parcels and are much easier to obtain.
// The order must also match the account's phone or email. Unknown and non-matching orders get the
// same 404, so this cannot be used to find out which Order IDs exist.
router.post('/claim', authMiddleware, async (req: AuthRequest, res: Response) => {
  const notFound = () => res.status(404).json({ message: 'No order with this ID was found for your account.' });
  try {
    const raw = req.body?.orderId;
    if (typeof raw !== 'string' || !raw.trim()) {
      return res.status(400).json({ message: 'Please enter your Order ID.' });
    }
    const code = raw.trim();
    if (code.length > 64) return notFound();

    const account = await loadAccount(req);
    if (!account) return notFound();

    const limitKey = account.id || account.email;
    const retryAfterMs = claimFailures.retryAfterMs(limitKey);
    if (retryAfterMs > 0) {
      const minutes = Math.ceil(retryAfterMs / 60000);
      res.set('Retry-After', String(Math.ceil(retryAfterMs / 1000)));
      return res.status(429).json({ message: `Too many attempts. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` });
    }

    let matches: any[];
    if (isDbConnected()) {
      const exact = new RegExp(`^${escapeRegex(code)}$`, 'i');
      matches = await Order.find({ orderId: exact }).lean();
    } else {
      const q = code.toLowerCase();
      matches = memoryStore.getAllOrders().filter(o => o.orderId && o.orderId.toLowerCase() === q);
    }

    const owned = matches.filter(o => o.orderId && accountOwnsOrder(o, account));
    if (owned.length === 0) {
      claimFailures.hit(limitKey);
      return notFound();
    }

    const ids: string[] = Array.from(new Set(owned.map(o => o.orderId as string)));
    const alreadyClaimed = ids.every(id => account.claimedOrders.includes(id));

    if (account.inDb) {
      await User.updateOne({ _id: account.id }, { $addToSet: { claimedOrders: { $each: ids } } });
    }
    // Keep the in-memory copy in step, as the other routes do
    ids.forEach(id => memoryStore.addClaimedOrder(account.email, id));

    return res.json({
      message: alreadyClaimed ? 'This order is already in your account.' : 'Order added to your account.',
      order: forCustomer(owned[0])
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error adding the order to your account.' });
  }
});

// 3. GET /api/orders/:orderId (Get Single Order)
router.get('/:orderId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();
    let order: any = null;

    try {
      const escaped = rawId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const orClauses: any[] = [
        { orderId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
        { trackingNumber: { $regex: new RegExp(`^${escaped}$`, 'i') } }
      ];
      if (mongoose.Types.ObjectId.isValid(rawId)) {
        orClauses.push({ _id: rawId });
      }
      order = await Order.findOne({ $or: orClauses }).lean();
    } catch (e) {}

    if (!order && !isDbConnected()) {
      order = memoryStore.findOrder(rawId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving order.' });
  }
});

// 4. PUT /api/orders/:orderId (Update Order Details)
router.put('/:orderId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();
    const updates = req.body;

    if (updates.productUrl !== undefined && !updates.productUrl.trim()) {
      return res.status(400).json({ message: 'Product Link / URL cannot be empty.' });
    }
    if (updates.productName !== undefined && !updates.productName.trim()) {
      return res.status(400).json({ message: 'Product Name cannot be empty.' });
    }
    if (updates.customerName !== undefined && !updates.customerName.trim()) {
      return res.status(400).json({ message: 'Customer Name cannot be empty.' });
    }
    if (updates.phone !== undefined && !updates.phone.trim()) {
      return res.status(400).json({ message: 'Phone Number cannot be empty.' });
    }
    if (updates.address !== undefined && !updates.address.trim()) {
      return res.status(400).json({ message: 'Delivery Address cannot be empty.' });
    }

    if (updates.quantity || updates.productPrice || updates.shippingFee) {
      const qty = Number(updates.quantity) || 1;
      const price = Number(updates.productPrice) || 0;
      const fee = Number(updates.shippingFee) || 0;
      updates.totalPrice = qty * price + fee;
    }

    let updatedOrder: any = null;
    try {
      const updateDoc: any = { $set: updates };
      if (updates.status) {
        const existingOrder = await Order.findOne(orderIdFilter(rawId));
        if (existingOrder && existingOrder.status !== updates.status) {
          updateDoc.$push = {
            statusHistory: {
              status: updates.status,
              date: new Date(),
              note: `Status updated to ${updates.status}`
            }
          };
        }
      }
      updatedOrder = await Order.findOneAndUpdate(
        orderIdFilter(rawId),
        updateDoc,
        { new: true }
      ).lean();
    } catch (e) {}

    const memOrder = memoryStore.updateOrder(rawId, updates);
    const finalUpdated = isDbConnected() ? updatedOrder : memOrder;

    if (!finalUpdated) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    realtimeHub.broadcast({
      type: 'ORDER_UPDATED',
      orderId: finalUpdated.orderId || rawId,
      trackingNumber: finalUpdated.trackingNumber,
      status: finalUpdated.status,
      order: finalUpdated
    });

    return res.json({
      message: 'Order updated successfully.',
      order: finalUpdated
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error updating order.' });
  }
});

// 5. PUT /api/orders/:orderId/status (Update Order Status)
router.put('/:orderId/status', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();
    const { status, note } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required.' });
    }

    const now = new Date();
    const historyItem = { status, date: now, note: note || `Status updated to ${status}` };

    let dbOrder: any = null;
    try {
      dbOrder = await Order.findOneAndUpdate(
        orderIdFilter(rawId),
        {
          $set: { status },
          $push: { statusHistory: historyItem }
        },
        { new: true }
      ).lean();
    } catch (e) {}

    const memOrder = memoryStore.updateOrderStatus(rawId, status, note);
    const finalStatusOrder = isDbConnected() ? dbOrder : memOrder;

    if (!finalStatusOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    realtimeHub.broadcast({
      type: 'ORDER_STATUS_UPDATED',
      orderId: finalStatusOrder.orderId || rawId,
      trackingNumber: finalStatusOrder.trackingNumber,
      status,
      order: finalStatusOrder
    });

    return res.json({
      message: `Order status updated to ${status}`,
      order: finalStatusOrder
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error updating status.' });
  }
});

// 6. DELETE /api/orders/:orderId (Delete Order)
router.delete('/:orderId', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();

    try {
      await Order.deleteOne(orderIdFilter(rawId));
    } catch (e) {}

    memoryStore.deleteOrder(rawId);

    realtimeHub.broadcast({
      type: 'ORDER_DELETED',
      orderId: rawId
    });

    return res.json({ message: 'Order deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error deleting order.' });
  }
});

export default router;

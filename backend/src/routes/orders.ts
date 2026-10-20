import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Order from '../models/Order';
import User from '../models/User';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import { memoryStore } from '../memoryStore';
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

// GET /api/orders/mine - Orders belonging to the logged-in customer (matched by account email or phone)
router.get('/mine', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const email = (req.user?.email || '').trim().toLowerCase();
    let phone = '';
    try {
      if (isDbConnected() && req.user?.id && mongoose.Types.ObjectId.isValid(req.user.id)) {
        const account: any = await User.findById(req.user.id).lean();
        phone = account?.phone || '';
      }
    } catch (e) {}
    if (!phone && email) {
      phone = memoryStore.findUserByEmail(email)?.phone || '';
    }
    const userPhone = phoneKey(phone);

    const allOrders: any[] = isDbConnected()
      ? await Order.find().sort({ createdAt: -1 }).lean()
      : memoryStore.getAllOrders();

    const mine = allOrders.filter(o =>
      (email && (o.email || '').trim().toLowerCase() === email) ||
      (userPhone.length >= 7 && phoneKey(o.phone) === userPhone)
    );

    return res.json(mine);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving your orders.' });
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

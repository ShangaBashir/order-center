import { Router, Response } from 'express';
import Order from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { memoryStore } from '../memoryStore';

const router = Router();

// Helper to generate unique HB-YYYY-XXXXX Order ID
async function generateUniqueOrderId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `HB-${year}-`;
  
  let maxNum = 0;
  try {
    const latestOrder = await Order.findOne({ orderId: new RegExp(`^${prefix}`) })
      .sort({ createdAt: -1 })
      .lean();
    if (latestOrder && latestOrder.orderId) {
      const parts = latestOrder.orderId.split('-');
      if (parts.length === 3) {
        maxNum = parseInt(parts[2], 10) || 0;
      }
    }
  } catch (e) {
    // ignore
  }

  // Also check memory store
  const memOrders = memoryStore.getAllOrders();
  for (const o of memOrders) {
    if (o.orderId.startsWith(prefix)) {
      const parts = o.orderId.split('-');
      if (parts.length === 3) {
        const num = parseInt(parts[2], 10) || 0;
        if (num > maxNum) maxNum = num;
      }
    }
  }

  const nextNum = (maxNum + 1).toString().padStart(5, '0');
  const candidateId = `${prefix}${nextNum}`;
  return candidateId;
}

// 1. POST /api/orders (Create Order)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
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

    if (!customerName || !phone || !address || !productName || productPrice === undefined) {
      return res.status(400).json({ message: 'Customer Name, Phone, Address, Product Name, and Price are required.' });
    }

    const orderId = await generateUniqueOrderId();
    const qty = Number(quantity) || 1;
    const price = Number(productPrice) || 0;
    const fee = Number(shippingFee) || 0;
    const totalPrice = qty * price + fee;
    const initialStatus = status || 'Order Received';
    const now = new Date();

    const statusHistory = [
      {
        status: initialStatus,
        date: now,
        note: 'Order created manually in Admin Dashboard'
      }
    ];

    let newOrder: any = null;

    try {
      const orderDoc = new Order({
        orderId,
        customerName,
        phone,
        email: email || '',
        address,
        productName,
        productUrl: productUrl || '',
        productImage: productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
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
        statusHistory
      });

      newOrder = await orderDoc.save();
    } catch (dbErr) {
      console.warn('MongoDB save failed, persisting to MemoryStore:', dbErr);
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
      status: initialStatus
    });

    return res.status(201).json({
      message: 'Order created successfully.',
      order: newOrder || memOrder,
      orderId
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    return res.status(500).json({ message: 'Failed to create order.' });
  }
});

// 2. GET /api/orders (Get All Orders)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let dbOrders: any[] = [];
    try {
      dbOrders = await Order.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      // ignore
    }

    if (dbOrders && dbOrders.length > 0) {
      return res.json(dbOrders);
    }

    const memOrders = memoryStore.getAllOrders();
    return res.json(memOrders);
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error retrieving orders.' });
  }
});

// 3. GET /api/orders/:orderId (Get Single Order)
router.get('/:orderId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();
    let order: any = null;

    try {
      order = await Order.findOne({
        $or: [
          { orderId: { $regex: new RegExp(`^${rawId}$`, 'i') } },
          { _id: rawId }
        ]
      }).lean();
    } catch (e) {}

    if (!order) {
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
router.put('/:orderId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();
    const updates = req.body;

    if (updates.quantity || updates.productPrice || updates.shippingFee) {
      const qty = Number(updates.quantity) || 1;
      const price = Number(updates.productPrice) || 0;
      const fee = Number(updates.shippingFee) || 0;
      updates.totalPrice = qty * price + fee;
    }

    let updatedOrder: any = null;
    try {
      updatedOrder = await Order.findOneAndUpdate(
        { $or: [{ orderId: rawId }, { _id: rawId }] },
        { $set: updates },
        { new: true }
      ).lean();
    } catch (e) {}

    const memOrder = memoryStore.updateOrder(rawId, updates);

    if (!updatedOrder && !memOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({
      message: 'Order updated successfully.',
      order: updatedOrder || memOrder
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error updating order.' });
  }
});

// 5. PUT /api/orders/:orderId/status (Update Order Status)
router.put('/:orderId/status', authMiddleware, async (req: AuthRequest, res: Response) => {
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
        { $or: [{ orderId: rawId }, { _id: rawId }] },
        {
          $set: { status },
          $push: { statusHistory: historyItem }
        },
        { new: true }
      ).lean();
    } catch (e) {}

    const memOrder = memoryStore.updateOrderStatus(rawId, status, note);

    if (!dbOrder && !memOrder) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.json({
      message: `Order status updated to ${status}`,
      order: dbOrder || memOrder
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error updating status.' });
  }
});

// 6. DELETE /api/orders/:orderId (Delete Order)
router.delete('/:orderId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const rawId = req.params.orderId.trim();

    try {
      await Order.deleteOne({ $or: [{ orderId: rawId }, { _id: rawId }] });
    } catch (e) {}

    memoryStore.deleteOrder(rawId);

    return res.json({ message: 'Order deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Server error deleting order.' });
  }
});

export default router;

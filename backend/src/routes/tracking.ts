import { Router } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Order from '../models/Order';
import { memoryStore } from '../memoryStore';
import { realtimeHub } from '../realtime';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey';

// GET /api/tracking/events (Real-time SSE event stream for live tracking updates)
router.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no'
  });

  const clientId = realtimeHub.addClient(res);

  req.on('close', () => {
    realtimeHub.removeClient(clientId);
  });
});

// GET /api/tracking/:orderId (Scoped: customers can ONLY see their own orders; users cannot see any orders)
router.get('/:orderId', async (req, res) => {
  try {
    const rawId = req.params.orderId.trim();

    // 1. Authenticate user from Bearer token
    const authHeader = req.header('Authorization');
    let currentUser: any = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        currentUser = jwt.verify(token, JWT_SECRET);
      } catch (e) {}
    }

    // Require sign-in to track orders
    if (!currentUser) {
      return res.status(401).json({
        message: 'Please sign in to track your order. Order tracking is only available to registered customers.'
      });
    }

    // Standard Users have NO access to orders or order details
    const isCustomer = Boolean(currentUser.isCustomer && currentUser.customerId);
    if (currentUser.role !== 'admin' && !isCustomer) {
      return res.status(403).json({
        message: 'Standard user accounts cannot view orders. Please connect your Customer ID in My Account to view your orders.'
      });
    }

    let order: any = null;

    // Try MongoDB if connected
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

    // Fallback memory search
    if (!order && mongoose.connection.readyState !== 1) {
      order = memoryStore.findOrder(rawId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your Order ID or Tracking Number.' });
    }

    // Strict customer isolation: Each customer can ONLY see their own orders
    if (currentUser.role !== 'admin') {
      const ordCustId = (order.customerId || '').trim().toUpperCase();
      const userCustId = (currentUser.customerId || '').trim().toUpperCase();

      if (!ordCustId || ordCustId !== userCustId) {
        return res.status(403).json({
          message: 'Access denied. This order does not belong to your account. You can only view your own orders.'
        });
      }
    }

    // Return customer-safe public view
    const publicData = {
      orderId: order.orderId,
      customerName: order.customerName,
      productName: order.productName,
      productImage: order.productImage,
      quantity: order.quantity,
      currency: order.currency,
      totalPrice: order.totalPrice,
      originCountry: order.originCountry,
      destinationCountry: order.destinationCountry,
      shippingMethod: order.shippingMethod,
      trackingNumber: order.trackingNumber,
      estimatedDelivery: order.estimatedDelivery,
      approximateDeliveryDate: order.approximateDeliveryDate,
      status: order.status,
      statusHistory: order.statusHistory || [],
      updatedAt: order.updatedAt || order.createdAt || new Date().toISOString()
    };

    return res.json(publicData);
  } catch (err: any) {
    console.error('Tracking endpoint error:', err);
    return res.status(500).json({ message: 'Server error retrieving tracking info' });
  }
});

export default router;

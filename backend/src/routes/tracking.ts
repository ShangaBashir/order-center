import { Router } from 'express';
import Order from '../models/Order';
import { memoryStore } from '../memoryStore';
import { realtimeHub } from '../realtime';

const router = Router();

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

// GET /api/tracking/:orderId (Public endpoint for customer tracking)
router.get('/:orderId', async (req, res) => {
  try {
    const rawId = req.params.orderId.trim();
    
    let order: any = null;
    
    // Try MongoDB if connected
    try {
      order = await Order.findOne({
        $or: [
          { orderId: { $regex: new RegExp(`^${rawId}$`, 'i') } },
          { trackingNumber: { $regex: new RegExp(`^${rawId}$`, 'i') } }
        ]
      }).lean();
    } catch (e) {
      // Fallback memory search
    }

    if (!order) {
      order = memoryStore.findOrder(rawId);
    }

    if (!order) {
      return res.status(404).json({ message: 'Order not found. Please check your Order ID or Tracking Number.' });
    }

    // Return customer-safe public view
    const publicData = {
      orderId: order.orderId,
      customerName: order.customerName, // Name is safe to show greeting
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

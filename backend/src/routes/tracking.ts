import { Router } from 'express';
import Order from '../models/Order';
import { memoryStore } from '../memoryStore';

const router = Router();

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

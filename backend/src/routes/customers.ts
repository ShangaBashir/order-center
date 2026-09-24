import { Router, Response } from 'express';
import Customer from '../models/Customer';
import Order from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { memoryStore } from '../memoryStore';

const router = Router();

// Helper to generate unique CUST-XXXX Customer ID
async function generateUniqueCustomerId(): Promise<string> {
  let maxNum = 1000;
  try {
    const latestCust = await Customer.findOne({ customerId: /^CUST-/ })
      .sort({ createdAt: -1 })
      .lean();
    if (latestCust && latestCust.customerId) {
      const num = parseInt(latestCust.customerId.replace('CUST-', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  } catch (e) {
    // ignore
  }

  // Also check memory store
  const memCusts = memoryStore.getAllCustomers();
  for (const c of memCusts) {
    if (c.customerId && c.customerId.startsWith('CUST-')) {
      const num = parseInt(c.customerId.replace('CUST-', ''), 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }
  }

  return `CUST-${maxNum + 1}`;
}

// 1. GET /api/customers - List all customers with aggregate order stats
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    let customersList: any[] = [];
    try {
      customersList = await Customer.find().sort({ createdAt: -1 }).lean();
    } catch (e) {
      customersList = memoryStore.getAllCustomers();
    }

    if (!customersList || customersList.length === 0) {
      customersList = memoryStore.getAllCustomers();
    }

    // Fetch order statistics
    let ordersList: any[] = [];
    try {
      ordersList = await Order.find().lean();
    } catch (e) {
      ordersList = memoryStore.getAllOrders();
    }
    if (!ordersList || ordersList.length === 0) {
      ordersList = memoryStore.getAllOrders();
    }

    // Calculate total orders and total spent for each customer
    const result = customersList.map(cust => {
      const custOrders = ordersList.filter(o => 
        (o.phone && cust.phone && o.phone.trim() === cust.phone.trim()) ||
        (o.customerName && cust.name && o.customerName.trim().toLowerCase() === cust.name.trim().toLowerCase())
      );
      const totalOrders = custOrders.length;
      const totalSpent = custOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      return {
        ...cust,
        totalOrders,
        totalSpent
      };
    });

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: 'Error fetching customers', error: err.message });
  }
});

// 2. POST /api/customers - Create new customer
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, email, address, notes } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Customer name, phone, and address are required' });
    }

    const customerId = await generateUniqueCustomerId();

    let createdCustomer: any;
    try {
      const newCust = new Customer({
        customerId,
        name,
        phone,
        email: email || '',
        address,
        notes: notes || '',
      });
      createdCustomer = await newCust.save();
    } catch (e) {
      // Fallback to memoryStore
      createdCustomer = memoryStore.addCustomer({
        customerId,
        name,
        phone,
        email: email || '',
        address,
        notes: notes || '',
      });
    }

    // Ensure it's in memory store as well
    memoryStore.addCustomer({
      customerId,
      name,
      phone,
      email: email || '',
      address,
      notes: notes || '',
    });

    res.status(201).json({
      message: 'Customer created successfully',
      customer: createdCustomer,
      customerId
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Error creating customer', error: err.message });
  }
});

// 3. DELETE /api/customers/:id
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await Customer.findOneAndDelete({ $or: [{ _id: id }, { customerId: id }] });
    } catch (e) {
      // ignore
    }
    memoryStore.deleteCustomer(id);

    res.json({ message: 'Customer deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ message: 'Error deleting customer', error: err.message });
  }
});

export default router;

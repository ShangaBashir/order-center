import { Router, Response } from 'express';
import mongoose from 'mongoose';
import Customer from '../models/Customer';
import Order from '../models/Order';
import { adminOnly, AuthRequest } from '../middleware/auth';
import { memoryStore } from '../memoryStore';

const router = Router();
const isDbConnected = () => mongoose.connection.readyState === 1;

// Match a customer by Customer ID, or by database _id when the value is a valid ObjectId
// (a non-ObjectId string as _id makes MongoDB reject the whole query, so nothing was updated or deleted).
const customerIdFilter = (id: string) => {
  const clauses: any[] = [{ customerId: id }];
  if (mongoose.Types.ObjectId.isValid(id)) clauses.push({ _id: id });
  return { $or: clauses };
};

// Helper to generate unique Customer ID with distinct 4-letter prefix and 4 digits
async function generateUniqueCustomerId(name?: string): Promise<string> {
  return memoryStore.generateCustomerId(name);
}

// 1. GET /api/customers - List all customers with aggregate order stats
router.get('/', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    // The database is the source of truth when connected; demo data only when it is offline
    let customersList: any[] = isDbConnected()
      ? await Customer.find().sort({ createdAt: -1 }).lean()
      : memoryStore.getAllCustomers();

    // Deduplicate by customerId / _id
    const seenCust = new Set<string>();
    customersList = customersList.filter(c => {
      const key = c.customerId || c._id;
      if (seenCust.has(key)) return false;
      seenCust.add(key);
      return true;
    });

    // Fetch order statistics
    const ordersList: any[] = isDbConnected()
      ? await Order.find().lean()
      : memoryStore.getAllOrders();

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
router.post('/', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, secondaryPhone, email, address, notes } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({ message: 'Customer name, phone, and address are required' });
    }

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanSecondary = (secondaryPhone || '').replace(/\D/g, '');
    if (cleanSecondary && cleanPhone && cleanPhone === cleanSecondary) {
      return res.status(400).json({ message: 'Primary and secondary phone numbers cannot be the same' });
    }

    const customerId = await generateUniqueCustomerId(name);

    let createdCustomer: any;
    try {
      const newCust = new Customer({
        customerId,
        name,
        phone,
        secondaryPhone: secondaryPhone || '',
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
        secondaryPhone: secondaryPhone || '',
        email: email || '',
        address,
        notes: notes || '',
      });
    }

    // Always keep memory store updated without duplicating
    memoryStore.addCustomer({
      customerId,
      name,
      phone,
      secondaryPhone: secondaryPhone || '',
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

// 3. PUT /api/customers/:id - Update customer details
router.put('/:id', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, secondaryPhone, email, address, notes } = req.body;

    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanSecondary = (secondaryPhone || '').replace(/\D/g, '');
    if (cleanSecondary && cleanPhone && cleanPhone === cleanSecondary) {
      return res.status(400).json({ message: 'Primary and secondary phone numbers cannot be the same' });
    }

    let updatedCust: any = null;
    try {
      updatedCust = await Customer.findOneAndUpdate(
        customerIdFilter(id),
        { name, phone, secondaryPhone: secondaryPhone || '', email, address, notes },
        { new: true }
      ).lean();
    } catch (e) {
      // ignore
    }

    const memUpdated = memoryStore.updateCustomer(id, { name, phone, secondaryPhone: secondaryPhone || '', email, address, notes });
    if (!isDbConnected()) updatedCust = memUpdated;

    if (!updatedCust) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ message: 'Customer updated successfully', customer: updatedCust });
  } catch (err: any) {
    res.status(500).json({ message: 'Error updating customer', error: err.message });
  }
});

// 4. DELETE /api/customers/:id
router.delete('/:id', adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    try {
      await Customer.findOneAndDelete(customerIdFilter(id));
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

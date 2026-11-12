import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import trackingRoutes from './routes/tracking';
import customerRoutes from './routes/customers';
import websiteContentRoutes from './routes/websiteContent';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/website-content', websiteContentRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Order Center API', timestamp: new Date() });
});

// Full System Backup Endpoint
app.get('/api/backup', async (req, res) => {
  try {
    let orders: any[] = [];
    let customers: any[] = [];
    let websiteContent: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const Order = (await import('./models/Order')).default;
        const Customer = (await import('./models/Customer')).default;
        const WebsiteContent = (await import('./models/WebsiteContent')).default;
        orders = await Order.find().lean();
        customers = await Customer.find().lean();
        websiteContent = await WebsiteContent.findOne().lean();
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      const { memoryStore } = await import('./memoryStore');
      orders = memoryStore.getAllOrders();
    }
    if (!customers || customers.length === 0) {
      const { memoryStore } = await import('./memoryStore');
      customers = memoryStore.getAllCustomers();
    }
    if (!websiteContent) {
      const { memoryStore } = await import('./memoryStore');
      websiteContent = memoryStore.getWebsiteContent();
    }

    const backup = {
      version: '1.0.0',
      system: 'Order Center Platform',
      exportedAt: new Date().toISOString(),
      ordersCount: orders.length,
      customersCount: customers.length,
      orders,
      customers,
      websiteContent
    };

    res.json({
      message: 'Backup generated successfully',
      backup
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create backup: ' + err.message });
  }
});

// Direct Download Attachment
app.get('/api/backup/download', async (req, res) => {
  try {
    let orders: any[] = [];
    let customers: any[] = [];
    let websiteContent: any = null;

    if (mongoose.connection.readyState === 1) {
      try {
        const Order = (await import('./models/Order')).default;
        const Customer = (await import('./models/Customer')).default;
        const WebsiteContent = (await import('./models/WebsiteContent')).default;
        orders = await Order.find().lean();
        customers = await Customer.find().lean();
        websiteContent = await WebsiteContent.findOne().lean();
      } catch (e) {}
    }

    if (!orders || orders.length === 0) {
      const { memoryStore } = await import('./memoryStore');
      orders = memoryStore.getAllOrders();
    }
    if (!customers || customers.length === 0) {
      const { memoryStore } = await import('./memoryStore');
      customers = memoryStore.getAllCustomers();
    }
    if (!websiteContent) {
      const { memoryStore } = await import('./memoryStore');
      websiteContent = memoryStore.getWebsiteContent();
    }

    const backup = {
      version: '1.0.0',
      system: 'Order Center Platform',
      exportedAt: new Date().toISOString(),
      ordersCount: orders.length,
      customersCount: customers.length,
      orders,
      customers,
      websiteContent
    };

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `ordercenter_backup_${dateStr}.json`;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(JSON.stringify(backup, null, 2));
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to download backup: ' + err.message });
  }
});

// Configure Mongoose for immediate fallback when DB is offline
mongoose.set('bufferCommands', false);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/global-order';

import { migrateAllOrderStatuses } from './migrateStatuses';

// Attempt MongoDB Connection with 1-second timeout
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 1000,
  connectTimeoutMS: 1000,
})
  .then(async () => {
    console.log('Successfully connected to MongoDB database.');
    await migrateAllOrderStatuses();
  })
  .catch(async err => {
    console.warn('MongoDB connection pending or offline. Instant in-memory fallback active.');
    await migrateAllOrderStatuses();
  });

app.listen(PORT, () => {
  console.log(`Order Center Backend API running on http://localhost:${PORT}`);
});

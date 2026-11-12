import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import trackingRoutes from './routes/tracking';
import customerRoutes from './routes/customers';
import websiteContentRoutes from './routes/websiteContent';
import { adminOnly } from './middleware/auth';

dotenv.config();

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// In production, refuse API requests while MongoDB is disconnected instead of letting the
// routes fall back to the in-memory demo store (fake data, and writes that would be lost).
app.use('/api', (req, res, next) => {
  if (IS_PRODUCTION && mongoose.connection.readyState !== 1 && req.path !== '/health') {
    return res.status(503).json({ message: 'Service temporarily unavailable. Please try again in a moment.' });
  }
  next();
});

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

// Builds the backup from the real database. Demo data from the memory store is only used in
// local development without Mongo, never in production (where a missing DB is an error).
const buildBackup = async () => {
  let orders: any[] = [];
  let customers: any[] = [];
  let websiteContent: any = null;

  if (mongoose.connection.readyState === 1) {
    const Order = (await import('./models/Order')).default;
    const Customer = (await import('./models/Customer')).default;
    const WebsiteContent = (await import('./models/WebsiteContent')).default;
    orders = await Order.find().lean();
    customers = await Customer.find().lean();
    websiteContent = await WebsiteContent.findOne().lean();
  } else if (IS_PRODUCTION) {
    throw new Error('Database is not connected');
  } else {
    const { memoryStore } = await import('./memoryStore');
    orders = memoryStore.getAllOrders();
    customers = memoryStore.getAllCustomers();
    websiteContent = memoryStore.getWebsiteContent();
  }

  return {
    version: '1.0.0',
    system: 'Order Center Platform',
    exportedAt: new Date().toISOString(),
    ordersCount: orders.length,
    customersCount: customers.length,
    orders,
    customers,
    websiteContent
  };
};

// Full System Backup Endpoint (admin only: contains every customer's personal data)
app.get('/api/backup', adminOnly, async (req, res) => {
  try {
    const backup = await buildBackup();
    res.json({
      message: 'Backup generated successfully',
      backup
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create backup: ' + err.message });
  }
});

// Direct Download Attachment (admin only)
app.get('/api/backup/download', adminOnly, async (req, res) => {
  try {
    const backup = await buildBackup();

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

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Order Center Backend API running on http://localhost:${PORT}`);
  });
};

if (IS_PRODUCTION) {
  // Production never runs on the in-memory demo store: it would show demo orders and silently
  // lose every write. Wait for MongoDB before accepting requests; if it cannot be reached, exit
  // so Docker restarts the container instead of serving fake data.
  mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })
    .then(async () => {
      console.log('Successfully connected to MongoDB database.');
      await migrateAllOrderStatuses();
      startServer();
    })
    .catch(err => {
      console.error('MongoDB connection failed, exiting so the container restarts:', err?.message || err);
      process.exit(1);
    });
} else {
  // Local development: fall back to the in-memory store when Mongo is not running
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
  startServer();
}

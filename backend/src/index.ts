import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import trackingRoutes from './routes/tracking';
import customerRoutes from './routes/customers';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/customers', customerRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Order Center API', timestamp: new Date() });
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
  console.log(`🚀 Order Center Backend API running on http://localhost:${PORT}`);
});

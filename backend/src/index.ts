import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import orderRoutes from './routes/orders';
import trackingRoutes from './routes/tracking';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tracking', trackingRoutes);

// Root health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Order Center API', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/global-order';

// Attempt MongoDB Connection asynchronously
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB database.');
  })
  .catch(err => {
    console.warn('MongoDB connection pending or offline. Using in-memory fallback database store.', err.message);
  });

app.listen(PORT, () => {
  console.log(`🚀 Order Center Backend API running on http://localhost:${PORT}`);
});

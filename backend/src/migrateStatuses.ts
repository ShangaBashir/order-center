import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order';
import { memoryStore } from './memoryStore';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/global-order';

function normalizeStatus(st: string): string {
  if (!st) return 'Purchased';
  const lower = st.toLowerCase().trim();
  if (lower === 'purchased' || lower === 'pending') return 'Purchased';
  if (lower === 'in office' || lower === 'in transit' || lower === 'shipped' || lower === 'processing') return 'In Office';
  if (lower === 'arrived' || lower === 'delivered' || lower === 'completed') return 'Arrived';
  return 'Purchased';
}

export async function migrateAllOrderStatuses() {
  console.log('--- Migrating Order Statuses to the 3 approved statuses (Purchased, In Office, Arrived) ---');
  
  // 1. Migrate MemoryStore
  const memOrders = memoryStore.getAllOrders();
  let memUpdated = 0;
  for (const ord of memOrders) {
    const valid = ['Purchased', 'In Office', 'Arrived'];
    if (!valid.includes(ord.status)) {
      const old = ord.status;
      ord.status = normalizeStatus(ord.status);
      console.log(`Memory order ${ord.orderId}: changed status "${old}" -> "${ord.status}"`);
      memUpdated++;
    }
    if (Array.isArray(ord.statusHistory)) {
      for (const h of ord.statusHistory) {
        if (!valid.includes(h.status)) {
          h.status = normalizeStatus(h.status);
        }
      }
    }
  }
  console.log(`MemoryStore checked: ${memOrders.length} orders (${memUpdated} updated)`);

  // 2. Migrate MongoDB if connected
  try {
    if (mongoose.connection.readyState === 1) {
      const ordersCol = mongoose.connection.collection('orders');
      const dbOrders = await ordersCol.find({}).toArray();
      let dbUpdated = 0;
      for (const doc of dbOrders) {
        const valid = ['Purchased', 'In Office', 'Arrived'];
        let needsUpdate = false;
        let newStatus = doc.status;
        if (!valid.includes(doc.status)) {
          newStatus = normalizeStatus(doc.status);
          needsUpdate = true;
        }

        const newHistory = Array.isArray(doc.statusHistory)
          ? doc.statusHistory.map((h: any) => ({
              ...h,
              status: normalizeStatus(h.status)
            }))
          : [];

        if (needsUpdate || JSON.stringify(newHistory) !== JSON.stringify(doc.statusHistory)) {
          await ordersCol.updateOne(
            { _id: doc._id },
            { $set: { status: newStatus, statusHistory: newHistory } }
          );
          dbUpdated++;
          console.log(`MongoDB order ${doc.orderId || doc._id}: updated status to "${newStatus}"`);
        }
      }
      console.log(`MongoDB checked: ${dbOrders.length} orders (${dbUpdated} updated)`);
    }
  } catch (err: any) {
    console.log('MongoDB migration skipped (not connected):', err.message);
  }
}

if (require.main === module) {
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 2000 })
    .then(async () => {
      console.log('Connected to MongoDB');
      await migrateAllOrderStatuses();
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async () => {
      console.log('MongoDB not reachable, migrating memoryStore only');
      await migrateAllOrderStatuses();
      process.exit(0);
    });
}

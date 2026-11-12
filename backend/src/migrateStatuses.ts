import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order';
import { memoryStore } from './memoryStore';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/global-order';

// Every status the app accepts today. Entries already using one of these are never touched.
const VALID_STATUSES = ['Purchased', 'Received in Warehouse', 'Dispatched from Warehouse', 'Arrived', 'Done', 'Canceled', 'In Office'];
const isValidStatus = (st: string) => VALID_STATUSES.includes(st);
// Only legacy/unknown values are mapped; valid values pass through unchanged
const fixStatus = (st: string) => (isValidStatus(st) ? st : normalizeStatus(st));

function normalizeStatus(st: string): string {
  if (!st) return 'Purchased';
  const lower = st.toLowerCase().trim();
  if (lower === 'purchased' || lower === 'pending') return 'Purchased';
  if (lower === 'in office' || lower === 'in transit' || lower === 'shipped' || lower === 'processing') return 'In Office';
  if (lower === 'arrived' || lower === 'delivered' || lower === 'completed') return 'Arrived';
  return 'Purchased';
}

export async function migrateAllOrderStatuses() {
  console.log('--- Verifying Order Statuses for all lifecycle statuses (Purchased, Received in Warehouse, Dispatched from Warehouse, Arrived, Done) ---');
  
  // 1. Migrate MemoryStore
  const memOrders = memoryStore.getAllOrders();
  let memUpdated = 0;
  for (const ord of memOrders) {
    if (!isValidStatus(ord.status)) {
      const old = ord.status;
      ord.status = normalizeStatus(ord.status);
      console.log(`Memory order ${ord.orderId}: changed status "${old}" -> "${ord.status}"`);
      memUpdated++;
    }
    if (Array.isArray(ord.statusHistory)) {
      for (const h of ord.statusHistory) {
        if (!isValidStatus(h.status)) {
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
        const update: Record<string, any> = {};
        if (!isValidStatus(doc.status)) {
          update.status = normalizeStatus(doc.status);
        }

        // Only rewrite history when an entry has a legacy/unknown status; valid entries stay as they are
        if (Array.isArray(doc.statusHistory) && doc.statusHistory.some((h: any) => !isValidStatus(h?.status))) {
          update.statusHistory = doc.statusHistory.map((h: any) => ({ ...h, status: fixStatus(h?.status) }));
        }

        if (Object.keys(update).length > 0) {
          const newStatus = update.status ?? doc.status;
          await ordersCol.updateOne({ _id: doc._id }, { $set: update });
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

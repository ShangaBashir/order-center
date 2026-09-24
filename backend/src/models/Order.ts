
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  productLink: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Purchased', 'In Transit', 'Delivered'], default: 'Pending' },
  trackingNumber: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);

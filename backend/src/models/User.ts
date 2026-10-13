
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin', 'customer'], default: 'user' },
  isCustomer: { type: Boolean, default: false },
  customerId: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('User', userSchema);

import mongoose from 'mongoose';

export interface ICustomer {
  _id?: string;
  customerId: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const customerSchema = new mongoose.Schema({
  customerId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model<ICustomer & mongoose.Document>('Customer', customerSchema);

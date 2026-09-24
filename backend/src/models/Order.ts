import mongoose from 'mongoose';

export interface IStatusHistory {
  status: string;
  date: Date;
  note?: string;
}

export interface IOrder {
  _id?: string;
  orderId: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  productName: string;
  productUrl?: string;
  productImage?: string;
  quantity: number;
  productPrice: number;
  shippingFee: number;
  totalPrice: number;
  currency: string;
  originCountry: string;
  destinationCountry: string;
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  status: string;
  statusHistory: IStatusHistory[];
  createdAt?: Date;
  updatedAt?: Date;
}

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  date: { type: Date, default: Date.now },
  note: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  address: { type: String, required: true },
  productName: { type: String, required: true },
  productUrl: { type: String, default: '' },
  productImage: { type: String, default: '' },
  quantity: { type: Number, default: 1 },
  productPrice: { type: Number, required: true, default: 0 },
  shippingFee: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'USD' },
  originCountry: { type: String, default: 'China' },
  destinationCountry: { type: String, default: 'Iraq' },
  shippingMethod: { type: String, default: 'Express Air' },
  trackingNumber: { type: String, default: '' },
  estimatedDelivery: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'Order Received',
      'Order Confirmed',
      'Purchased',
      'Preparing',
      'Shipped',
      'In Transit',
      'Arrived',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Order Received'
  },
  statusHistory: [statusHistorySchema],
}, { timestamps: true });

export default mongoose.model<IOrder & mongoose.Document>('Order', orderSchema);

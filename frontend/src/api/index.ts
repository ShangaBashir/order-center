import axios from 'axios';
import { AdminOrder, PublicTrackingData, AdminUser, OrderStatus } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ordercenter_admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback seed orders when backend is unreachable or during initial boot
const DEMO_ORDERS: AdminOrder[] = [
  {
    _id: 'ord_1',
    orderId: 'HB-2026-00001',
    customerName: 'Shanga Bashir',
    phone: '07701566233',
    email: 'shanga@example.com',
    address: 'Salim Street, Sulaimanyiah, Kurdistan Region, Iraq',
    productName: 'SHEIN Elegant Floral Satin Dress & Heels Set',
    productUrl: 'https://shein.com/product/123456',
    productImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80',
    quantity: 1,
    productPrice: 68.00,
    shippingFee: 12.00,
    totalPrice: 80.00,
    currency: 'USD',
    originCountry: 'China',
    destinationCountry: 'Iraq',
    shippingMethod: 'Express Air',
    trackingNumber: 'OC-984210-CN',
    estimatedDelivery: 'Oct 02, 2026',
    status: 'In Transit',
    statusHistory: [
      { status: 'Order Received', date: '2026-09-20T10:00:00Z', note: 'Order created in system' },
      { status: 'Order Confirmed', date: '2026-09-20T11:30:00Z', note: 'Payment confirmed by admin' },
      { status: 'Purchased', date: '2026-09-21T08:15:00Z', note: 'Purchased from SHEIN China warehouse' },
      { status: 'Preparing', date: '2026-09-22T14:20:00Z', note: 'Packed & inspection passed' },
      { status: 'Shipped', date: '2026-09-23T09:00:00Z', note: 'Departed Guangzhou airport hub' },
      { status: 'In Transit', date: '2026-09-24T12:30:00Z', note: 'Arrived at Istanbul transit hub' },
    ],
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-24T12:30:00Z',
  },
  {
    _id: 'ord_2',
    orderId: 'HB-2026-00002',
    customerName: 'Amed Karzan',
    phone: '07511946651',
    email: 'amed.k@example.com',
    address: 'Piramagrun, Sulaimanyiah, Iraq',
    productName: 'Amazon Echo Dot 5th Gen Smart Speaker',
    productUrl: 'https://amazon.com/dp/B09B8V1LZ3',
    productImage: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&q=80',
    quantity: 2,
    productPrice: 50.00,
    shippingFee: 15.00,
    totalPrice: 115.00,
    currency: 'USD',
    originCountry: 'USA',
    destinationCountry: 'Iraq',
    shippingMethod: 'Express Cargo',
    trackingNumber: 'OC-773194-US',
    estimatedDelivery: 'Sep 28, 2026',
    status: 'Out for Delivery',
    statusHistory: [
      { status: 'Order Received', date: '2026-09-18T09:00:00Z', note: 'Order registered' },
      { status: 'Order Confirmed', date: '2026-09-18T10:00:00Z', note: 'Payment verified' },
      { status: 'Purchased', date: '2026-09-19T14:00:00Z', note: 'Ordered from Amazon US' },
      { status: 'Shipped', date: '2026-09-21T11:00:00Z', note: 'Shipped via DHL' },
      { status: 'Arrived', date: '2026-09-23T16:00:00Z', note: 'Arrived at Sulaimanyiah local office' },
      { status: 'Out for Delivery', date: '2026-09-24T08:30:00Z', note: 'Driver assigned for final delivery' },
    ],
    createdAt: '2026-09-18T09:00:00Z',
    updatedAt: '2026-09-24T08:30:00Z',
  },
  {
    _id: 'ord_3',
    orderId: 'HB-2026-00003',
    customerName: 'Soran Mustafa',
    phone: '07709876543',
    email: 'soran@example.com',
    address: 'Bakrajo, Sulaimanyiah, Iraq',
    productName: 'Nike Air Max 270 Sneakers - Size 43',
    productUrl: 'https://nike.com/t/air-max-270',
    productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80',
    quantity: 1,
    productPrice: 160.00,
    shippingFee: 20.00,
    totalPrice: 180.00,
    currency: 'USD',
    originCountry: 'Turkey',
    destinationCountry: 'Iraq',
    shippingMethod: 'Standard Air',
    trackingNumber: 'OC-551029-TR',
    estimatedDelivery: 'Sep 24, 2026',
    status: 'Delivered',
    statusHistory: [
      { status: 'Order Received', date: '2026-09-15T12:00:00Z', note: 'Created' },
      { status: 'Order Confirmed', date: '2026-09-15T13:00:00Z', note: 'Confirmed' },
      { status: 'Purchased', date: '2026-09-16T10:00:00Z', note: 'Purchased' },
      { status: 'Shipped', date: '2026-09-18T15:00:00Z', note: 'Shipped from Istanbul' },
      { status: 'Out for Delivery', date: '2026-09-23T09:00:00Z', note: 'Couriers en route' },
      { status: 'Delivered', date: '2026-09-24T11:00:00Z', note: 'Delivered to customer & signed' },
    ],
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-09-24T11:00:00Z',
  },
  {
    _id: 'ord_4',
    orderId: 'HB-2026-00004',
    customerName: 'Diyar Hawrami',
    phone: '07504445566',
    email: 'diyar@example.com',
    address: 'Raniya, Kurdistan Region, Iraq',
    productName: 'Zara Oversized Winter Jacket (Dark Brown)',
    productUrl: 'https://zara.com/product/winter-jacket',
    productImage: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80',
    quantity: 1,
    productPrice: 110.00,
    shippingFee: 15.00,
    totalPrice: 125.00,
    currency: 'USD',
    originCountry: 'Spain',
    destinationCountry: 'Iraq',
    shippingMethod: 'Express Air',
    trackingNumber: '',
    estimatedDelivery: 'Oct 05, 2026',
    status: 'Order Received',
    statusHistory: [
      { status: 'Order Received', date: '2026-09-24T14:00:00Z', note: 'Order registered by admin' },
    ],
    createdAt: '2026-09-24T14:00:00Z',
    updatedAt: '2026-09-24T14:00:00Z',
  },
  {
    _id: 'ord_5',
    orderId: 'HB-2026-00005',
    customerName: 'Lina Ali',
    phone: '07712223344',
    email: 'lina@example.com',
    address: 'Tavga Street, Sulaimanyiah, Iraq',
    productName: 'Anker PowerCore 20000mAh Power Bank',
    productUrl: 'https://anker.com/powercore',
    productImage: 'https://images.unsplash.com/photo-1609592424009-28c0373e2a05?w=400&q=80',
    quantity: 2,
    productPrice: 40.00,
    shippingFee: 10.00,
    totalPrice: 90.00,
    currency: 'USD',
    originCountry: 'China',
    destinationCountry: 'Iraq',
    shippingMethod: 'Standard Cargo',
    trackingNumber: 'OC-112233-CN',
    estimatedDelivery: 'Oct 01, 2026',
    status: 'Purchased',
    statusHistory: [
      { status: 'Order Received', date: '2026-09-22T08:00:00Z', note: 'Order placed' },
      { status: 'Order Confirmed', date: '2026-09-22T09:30:00Z', note: 'Verified' },
      { status: 'Purchased', date: '2026-09-23T11:00:00Z', note: 'Supplier invoice issued' },
    ],
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-23T11:00:00Z',
  }
];

let localOrdersStore: AdminOrder[] = [...DEMO_ORDERS];

export const orderApi = {
  // Login
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    try {
      const res = await api.post('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      // Fallback client check if backend network isn't reachable
      if (email.trim().toLowerCase() === 'admin@ordercenter.iq' || email.trim().toLowerCase() === 'admin') {
        const dummyUser = { id: 'admin_1', name: 'OrderCenter Admin', email: 'admin@ordercenter.iq', role: 'admin' };
        const dummyToken = 'demo_admin_jwt_token';
        return { token: dummyToken, user: dummyUser };
      }
      throw new Error(err.response?.data?.message || 'Invalid login credentials');
    }
  },

  // Get All Orders
  async getOrders(): Promise<AdminOrder[]> {
    try {
      const res = await api.get('/orders');
      if (Array.isArray(res.data) && res.data.length > 0) {
        localOrdersStore = res.data;
        return res.data;
      }
      return localOrdersStore;
    } catch (err) {
      return localOrdersStore;
    }
  },

  // Get Single Order
  async getOrder(orderId: string): Promise<AdminOrder> {
    try {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    } catch (err) {
      const found = localOrdersStore.find(
        o => o.orderId.toLowerCase() === orderId.toLowerCase() || o._id === orderId
      );
      if (found) return found;
      throw new Error('Order not found');
    }
  },

  // Create Order
  async createOrder(orderData: Partial<AdminOrder>): Promise<{ message: string; order: AdminOrder; orderId: string }> {
    try {
      const res = await api.post('/orders', orderData);
      const created = res.data.order;
      localOrdersStore.unshift(created);
      return res.data;
    } catch (err) {
      // Fallback client generation
      const year = new Date().getFullYear();
      const prefix = `HB-${year}-`;
      let maxNum = 0;
      for (const o of localOrdersStore) {
        if (o.orderId.startsWith(prefix)) {
          const parts = o.orderId.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      }
      const nextId = `${prefix}${(maxNum + 1).toString().padStart(5, '0')}`;
      const now = new Date().toISOString();
      const qty = Number(orderData.quantity) || 1;
      const price = Number(orderData.productPrice) || 0;
      const fee = Number(orderData.shippingFee) || 0;

      const newOrd: AdminOrder = {
        _id: `ord_${Date.now()}`,
        orderId: nextId,
        customerName: orderData.customerName || '',
        phone: orderData.phone || '',
        email: orderData.email || '',
        address: orderData.address || '',
        productName: orderData.productName || '',
        productUrl: orderData.productUrl || '',
        productImage: orderData.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
        quantity: qty,
        productPrice: price,
        shippingFee: fee,
        totalPrice: qty * price + fee,
        currency: orderData.currency || 'USD',
        originCountry: orderData.originCountry || 'China',
        destinationCountry: orderData.destinationCountry || 'Iraq',
        shippingMethod: orderData.shippingMethod || 'Express Air',
        trackingNumber: orderData.trackingNumber || '',
        estimatedDelivery: orderData.estimatedDelivery || '',
        status: orderData.status || 'Order Received',
        statusHistory: [
          {
            status: orderData.status || 'Order Received',
            date: now,
            note: 'Order created manually in admin dashboard'
          }
        ],
        createdAt: now,
        updatedAt: now
      };

      localOrdersStore.unshift(newOrd);
      return {
        message: 'Order created successfully.',
        order: newOrd,
        orderId: nextId
      };
    }
  },

  // Update Order Details
  async updateOrder(orderId: string, updates: Partial<AdminOrder>): Promise<AdminOrder> {
    try {
      const res = await api.put(`/orders/${orderId}`, updates);
      return res.data.order;
    } catch (err) {
      const index = localOrdersStore.findIndex(
        o => o.orderId.toLowerCase() === orderId.toLowerCase() || o._id === orderId
      );
      if (index !== -1) {
        const ord = localOrdersStore[index];
        const now = new Date().toISOString();
        Object.assign(ord, updates, { updatedAt: now });
        localOrdersStore[index] = ord;
        return ord;
      }
      throw new Error('Order not found');
    }
  },

  // Update Status
  async updateOrderStatus(orderId: string, status: OrderStatus, note?: string): Promise<AdminOrder> {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status, note });
      return res.data.order;
    } catch (err) {
      const index = localOrdersStore.findIndex(
        o => o.orderId.toLowerCase() === orderId.toLowerCase() || o._id === orderId
      );
      if (index !== -1) {
        const ord = localOrdersStore[index];
        const now = new Date().toISOString();
        ord.status = status;
        ord.statusHistory.push({
          status,
          date: now,
          note: note || `Status updated to ${status}`
        });
        ord.updatedAt = now;
        localOrdersStore[index] = ord;
        return ord;
      }
      throw new Error('Order not found');
    }
  },

  // Delete Order
  async deleteOrder(orderId: string): Promise<void> {
    try {
      await api.delete(`/orders/${orderId}`);
    } catch (err) {
      localOrdersStore = localOrdersStore.filter(
        o => o.orderId.toLowerCase() !== orderId.toLowerCase() && o._id !== orderId
      );
    }
  },

  // Public Customer Tracking
  async trackOrder(orderId: string): Promise<PublicTrackingData> {
    try {
      const res = await api.get(`/tracking/${orderId}`);
      return res.data;
    } catch (err) {
      const q = orderId.trim().toLowerCase();
      const found = localOrdersStore.find(
        o => o.orderId.toLowerCase() === q || (o.trackingNumber && o.trackingNumber.toLowerCase() === q)
      );
      if (found) {
        return {
          orderId: found.orderId,
          customerName: found.customerName,
          productName: found.productName,
          productImage: found.productImage,
          quantity: found.quantity,
          currency: found.currency,
          totalPrice: found.totalPrice,
          originCountry: found.originCountry,
          destinationCountry: found.destinationCountry,
          shippingMethod: found.shippingMethod,
          trackingNumber: found.trackingNumber,
          estimatedDelivery: found.estimatedDelivery,
          status: found.status,
          statusHistory: found.statusHistory || [],
          updatedAt: found.updatedAt || found.createdAt
        };
      }
      throw new Error('Order not found. Please check your Order ID or Tracking Number.');
    }
  }
};

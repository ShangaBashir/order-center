import axios from 'axios';
import { AdminOrder, PublicTrackingData, AdminUser, OrderStatus, Customer } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
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

// Expired or invalid admin session: clear it and send the admin back to the login page
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (error?.response?.status === 401 && path.startsWith('/admin') && path !== '/admin/login') {
      localStorage.removeItem('ordercenter_admin_token');
      localStorage.removeItem('ordercenter_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// The demo data below is only used in local development when the API is not running.
// On the live site, API errors are shown as errors instead of being replaced by demo data.
const useDemoFallback = (err: any) => import.meta.env.DEV && !err?.response;
const apiError = (err: any, fallback: string) => new Error(err?.response?.data?.message || fallback);

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
    productImage: '',
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
    status: 'In Office',
    statusHistory: [
      { status: 'Purchased', date: '2026-09-21T08:15:00Z', note: 'Purchased from SHEIN China warehouse' },
      { status: 'In Office', date: '2026-09-24T12:30:00Z', note: 'Arrived at local office in Sulaimanyiah' },
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
    productImage: '',
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
    status: 'Arrived',
    statusHistory: [
      { status: 'Purchased', date: '2026-09-19T14:00:00Z', note: 'Ordered from Amazon US' },
      { status: 'In Office', date: '2026-09-22T10:00:00Z', note: 'Received at sorting hub' },
      { status: 'Arrived', date: '2026-09-24T08:30:00Z', note: 'Package arrived at destination' },
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
    productImage: '',
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
    status: 'Arrived',
    statusHistory: [
      { status: 'Purchased', date: '2026-09-16T10:00:00Z', note: 'Purchased from supplier' },
      { status: 'In Office', date: '2026-09-20T12:00:00Z', note: 'Arrived in regional office' },
      { status: 'Arrived', date: '2026-09-24T11:00:00Z', note: 'Package arrived at delivery counter' },
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
    productImage: '',
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
    status: 'Purchased',
    statusHistory: [
      { status: 'Purchased', date: '2026-09-24T14:00:00Z', note: 'Order purchased by admin' },
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
    productImage: '',
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
    status: 'In Office',
    statusHistory: [
      { status: 'Purchased', date: '2026-09-22T08:00:00Z', note: 'Purchased' },
      { status: 'In Office', date: '2026-09-23T11:00:00Z', note: 'Received at office' },
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
      // Local development only: allow the demo admin while the API is not running
      if (useDemoFallback(err) && (email.trim().toLowerCase() === 'admin@ordercenter.iq' || email.trim().toLowerCase() === 'admin')) {
        const dummyUser = { id: 'admin_1', name: 'OrderCenter Admin', email: 'admin@ordercenter.iq', role: 'admin' };
        const dummyToken = 'demo_admin_jwt_token';
        return { token: dummyToken, user: dummyUser };
      }
      throw new Error(err.response?.data?.message || 'Invalid login credentials');
    }
  },

  // Register User or Customer
  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    isCustomer?: boolean;
    customerId?: string;
  }): Promise<{ token: string; user: AdminUser }> {
    try {
      const res = await api.post('/auth/register', userData);
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Registration failed');
    }
  },

  // Get Current User Profile
  async getMe(): Promise<{ user: AdminUser }> {
    try {
      const res = await api.get('/auth/me');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to fetch user profile');
    }
  },

  // Get All Orders
  async getOrders(): Promise<AdminOrder[]> {
    try {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (useDemoFallback(err)) return localOrdersStore;
      throw apiError(err, 'Could not load orders');
    }
  },

  // Orders belonging to the logged-in customer (filtered by the server)
  async getMyOrders(): Promise<AdminOrder[]> {
    try {
      const res = await api.get('/orders/mine');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      throw apiError(err, 'Could not load your orders');
    }
  },

  // Get Single Order
  async getOrder(orderId: string): Promise<AdminOrder> {
    try {
      const res = await api.get(`/orders/${orderId}`);
      return res.data;
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Order not found');
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
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to create order.');
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
        productImage: orderData.productImage || '',
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
        status: orderData.status || 'Purchased',
        statusHistory: [
          {
            status: orderData.status || 'Purchased',
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
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to update order.');
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
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to update status.');
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
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to delete order.');
      localOrdersStore = localOrdersStore.filter(
        o => o.orderId.toLowerCase() !== orderId.toLowerCase() && o._id !== orderId
      );
    }
  },

  // Get Next Auto Order ID
  async getNextOrderId(): Promise<string> {
    try {
      const res = await api.get('/orders/next-id');
      return res.data.orderId;
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Could not get the next order ID');
      const year = new Date().getFullYear();
      const prefix = `HB-${year}-`;
      let maxNum = 0;
      for (const o of localOrdersStore) {
        if (o.orderId.startsWith(prefix)) {
          const parts = o.orderId.split('-');
          if (parts.length === 3) {
            const num = parseInt(parts[2], 10) || 0;
            if (num > maxNum) maxNum = num;
          }
        }
      }
      return `${prefix}${(maxNum + 1).toString().padStart(5, '0')}`;
    }
  },

  // Public Customer Tracking
  async trackOrder(orderId: string): Promise<PublicTrackingData> {
    try {
      const res = await api.get(`/tracking/${orderId}`);
      return res.data;
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Order not found. Please check your Order ID or Tracking Number.');
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

let localCustomersStore: Customer[] = [
  {
    _id: 'cust_1',
    customerId: 'SNGB-7492',
    name: 'Shanga Bashir',
    phone: '07701566233',
    email: 'shanga@example.com',
    address: 'Salim Street, Sulaimanyiah, Kurdistan Region, Iraq',
    notes: 'VIP Customer',
    totalOrders: 1,
    totalSpent: 80.00,
    createdAt: '2026-09-20T10:00:00Z',
  },
  {
    _id: 'cust_2',
    customerId: 'MDKR-4183',
    name: 'Amed Karzan',
    phone: '07511946651',
    email: 'amed.k@example.com',
    address: 'Piramagrun, Sulaimanyiah, Iraq',
    notes: '',
    totalOrders: 1,
    totalSpent: 115.00,
    createdAt: '2026-09-18T09:00:00Z',
  },
  {
    _id: 'cust_3',
    customerId: 'SRNM-9315',
    name: 'Soran Mustafa',
    phone: '07709876543',
    email: 'soran@example.com',
    address: 'Bakrajo, Sulaimanyiah, Iraq',
    notes: '',
    totalOrders: 1,
    totalSpent: 180.00,
    createdAt: '2026-09-15T12:00:00Z',
  },
  {
    _id: 'cust_4',
    customerId: 'DYRH-6824',
    name: 'Diyar Hawrami',
    phone: '07504445566',
    email: 'diyar@example.com',
    address: 'Raniya, Kurdistan Region, Iraq',
    notes: '',
    totalOrders: 1,
    totalSpent: 125.00,
    createdAt: '2026-09-24T14:00:00Z',
  },
  {
    _id: 'cust_5',
    customerId: 'LNLA-5291',
    name: 'Lina Ali',
    phone: '07712223344',
    email: 'lina@example.com',
    address: 'Tavga Street, Sulaimanyiah, Iraq',
    notes: '',
    totalOrders: 1,
    totalSpent: 90.00,
    createdAt: '2026-09-22T08:00:00Z',
  },
];

export const customerApi = {
  async getCustomers(): Promise<Customer[]> {
    let list: Customer[] = [];
    try {
      const res = await api.get('/customers');
      list = Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Could not load customers');
      list = localCustomersStore;
    }

    // Deduplicate by customerId / _id
    const seen = new Set<string>();
    const deduplicated = list.filter(c => {
      const key = c.customerId || c._id || '';
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    localCustomersStore = deduplicated;
    return deduplicated;
  },

  async createCustomer(custData: Partial<Customer>): Promise<{ message: string; customer: Customer; customerId: string }> {
    try {
      const res = await api.post('/customers', custData);
      const created = res.data.customer;
      
      const existingIdx = localCustomersStore.findIndex(c => c.customerId === created.customerId || c._id === created._id);
      if (existingIdx !== -1) {
        localCustomersStore[existingIdx] = created;
      } else {
        localCustomersStore.unshift(created);
      }
      return res.data;
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to create customer.');
      let prefix = '';
      if (custData.name && custData.name.trim()) {
        const clean = custData.name.trim().toUpperCase().replace(/[^A-Z]/g, '');
        const consonants = clean.replace(/[AEIOU]/g, '');
        const source = consonants.length >= 4 ? consonants : clean;
        prefix = source.slice(0, 4);
      }
      const alpha = 'BCDFGHJKLMNPQRSTVWXYZ';
      while (prefix.length < 4) {
        prefix += alpha.charAt(Math.floor(Math.random() * alpha.length));
      }
      const existingIds = localCustomersStore.map(c => c.customerId);
      let newCustId = '';
      do {
        const num = Math.floor(1000 + Math.random() * 9000);
        newCustId = `${prefix}-${num}`;
      } while (existingIds.includes(newCustId));

      const now = new Date().toISOString();
      const newCust: Customer = {
        _id: `cust_${Date.now()}`,
        customerId: newCustId,
        name: custData.name || '',
        phone: custData.phone || '',
        email: custData.email || '',
        address: custData.address || '',
        notes: custData.notes || '',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: now,
        updatedAt: now
      };
      localCustomersStore.unshift(newCust);
      return {
        message: 'Customer registered successfully.',
        customer: newCust,
        customerId: newCustId
      };
    }
  },

  async updateCustomer(id: string, custData: Partial<Customer>): Promise<{ message: string; customer: Customer }> {
    try {
      const res = await api.put(`/customers/${id}`, custData);
      const updated = res.data.customer;
      const idx = localCustomersStore.findIndex(c => c.customerId === id || c._id === id);
      if (idx !== -1) {
        localCustomersStore[idx] = { ...localCustomersStore[idx], ...updated };
      }
      return res.data;
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to update customer.');
      const idx = localCustomersStore.findIndex(c => c.customerId === id || c._id === id);
      if (idx !== -1) {
        localCustomersStore[idx] = {
          ...localCustomersStore[idx],
          ...custData,
          updatedAt: new Date().toISOString()
        };
        return {
          message: 'Customer updated successfully.',
          customer: localCustomersStore[idx]
        };
      }
      throw new Error('Customer not found');
    }
  },

  async deleteCustomer(id: string): Promise<void> {
    try {
      await api.delete(`/customers/${id}`);
    } catch (err) {
      if (!useDemoFallback(err)) throw apiError(err, 'Failed to delete customer.');
    }
    localCustomersStore = localCustomersStore.filter(
      c => c.customerId !== id && c._id !== id
    );
  }
};

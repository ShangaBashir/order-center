import { WebsiteContent } from '../types';
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

  // Link Customer ID to user account
  async linkCustomerId(customerId: string): Promise<{ token: string; user: AdminUser; customer: Customer }> {
    try {
      const res = await api.post('/auth/link-customer', { customerId });
      return res.data;
    } catch (err: any) {
      const cleanId = (customerId || '').trim().toUpperCase();
      const matched = localCustomersStore.find(
        c => (c.customerId && c.customerId.toUpperCase() === cleanId) || c._id === cleanId
      );
      if (matched) {
        const storedUser = localStorage.getItem('ordercenter_admin_user');
        const userObj: AdminUser = storedUser ? JSON.parse(storedUser) : {
          id: 'user_local',
          name: matched.name,
          email: matched.email || 'customer@ordercenter.iq',
          role: 'customer'
        };
        const updatedUser: AdminUser = {
          ...userObj,
          role: userObj.role === 'admin' ? 'admin' : 'customer',
          isCustomer: true,
          customerId: matched.customerId,
          phone: userObj.phone || matched.phone
        };
        const dummyToken = localStorage.getItem('ordercenter_admin_token') || 'demo_token';
        return {
          token: dummyToken,
          user: updatedUser,
          customer: matched
        };
      }
      throw new Error(err.response?.data?.message || `Customer ID "${customerId}" not found.`);
    }
  },

  // Unlink Customer ID from user account
  async unlinkCustomerId(): Promise<{ token: string; user: AdminUser }> {
    try {
      const res = await api.post('/auth/unlink-customer');
      return res.data;
    } catch (err: any) {
      const storedUser = localStorage.getItem('ordercenter_admin_user');
      const userObj: AdminUser = storedUser ? JSON.parse(storedUser) : {
        id: 'user_local',
        name: 'User',
        email: 'user@ordercenter.iq',
        role: 'user'
      };
      const updatedUser: AdminUser = {
        ...userObj,
        role: userObj.role === 'admin' ? 'admin' : 'user',
        isCustomer: false,
        customerId: ''
      };
      const dummyToken = localStorage.getItem('ordercenter_admin_token') || 'demo_token';
      return {
        token: dummyToken,
        user: updatedUser
      };
    }
  },

  // Request password reset code
  async forgotPassword(email: string): Promise<{ message: string; email: string }> {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to send password reset code');
    }
  },

  // Verify code and reset password
  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await api.post('/auth/reset-password', { email, code, newPassword });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to reset password');
    }
  },

  // Get All Orders
  async getOrders(): Promise<AdminOrder[]> {
    try {
      const res = await api.get('/orders');
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      if (useDemoFallback(err)) {
        try {
          const storedUser = localStorage.getItem('ordercenter_admin_user');
          const userObj = storedUser ? JSON.parse(storedUser) : null;
          if (!userObj || userObj.role !== 'admin') {
            const isCustomer = Boolean(userObj?.isCustomer && userObj?.customerId);
            if (!isCustomer) return [];
            const userCustId = (userObj.customerId || '').trim().toUpperCase();
            return localOrdersStore.filter(o => (o.customerId || '').trim().toUpperCase() === userCustId);
          }
        } catch (e) {}
        return localOrdersStore;
      }
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

  // Add an order to the logged-in account with its Order ID (or tracking number)
  async claimOrder(orderId: string): Promise<{ message: string; order: AdminOrder }> {
    try {
      const res = await api.post('/orders/claim', { orderId });
      return res.data;
    } catch (err) {
      throw apiError(err, 'Could not add this order');
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

  // Customer Tracking: strictly scoped to customer's own orders
  async trackOrder(orderId: string): Promise<PublicTrackingData> {
    try {
      const res = await api.get(`/tracking/${orderId}`);
      return res.data;
    } catch (err: any) {
      if (err?.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      if (!useDemoFallback(err)) throw apiError(err, 'Order not found. Please check your Order ID or Tracking Number.');

      const storedUser = localStorage.getItem('ordercenter_admin_user');
      const userObj = storedUser ? JSON.parse(storedUser) : null;
      if (!userObj || userObj.role !== 'admin') {
        const isCustomer = Boolean(userObj?.isCustomer && userObj?.customerId);
        if (!isCustomer) {
          throw new Error('Standard user accounts cannot view orders. Please connect your Customer ID in My Account to view your orders.');
        }
      }

      const q = orderId.trim().toLowerCase();
      const found = localOrdersStore.find(
        o => o.orderId.toLowerCase() === q || (o.trackingNumber && o.trackingNumber.toLowerCase() === q)
      );
      if (found) {
        if (userObj && userObj.role !== 'admin') {
          const ordCustId = (found.customerId || '').trim().toUpperCase();
          const userCustId = (userObj.customerId || '').trim().toUpperCase();
          if (!ordCustId || ordCustId !== userCustId) {
            throw new Error('Access denied. This order does not belong to your account. You can only view your own orders.');
          }
        }

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
          approximateDeliveryDate: found.approximateDeliveryDate,
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


// ── Website Dynamic Content API ──────────────────────────────────────────────────
const WEBSITE_CONTENT_STORAGE_KEY = 'ordercenter_website_content';

export const DEFAULT_WEBSITE_CONTENT: WebsiteContent = {
  "about": {
    "hero": {
      "badge": {
        "en": "About OrderCenter",
        "ku": "دەربارەی ئۆردەر سەنتەر",
        "ar": "عن أوردر سنتر"
      },
      "title": {
        "en": "About Us",
        "ku": "دەربارەی ئێمە",
        "ar": "من نحن"
      },
      "description": {
        "en": "Your trusted bridge between global online marketplaces and your doorstep. We simplify international shopping and make it accessible to everyone.",
        "ku": "پردی متمانەپێکراوی نێوان بازاڕە جیهانییەکان و بەردەرگاکەت. ئێمە کڕینی نێودەوڵەتی ئاسان دەکەین و دەیخەینە بەردەستی هەمووان.",
        "ar": "جسرك الموثوق بين الأسواق الإلكترونية العالمية وعتبة دارك. نبسط التسوق الدولي ونجعله في متناول الجميع."
      },
      "bannerImage": ""
    },
    "whoWeAre": {
      "label": {
        "en": "Who We Are",
        "ku": "ئێمە کێین",
        "ar": "من نكون"
      },
      "title": {
        "en": "Who We Are",
        "ku": "ئێمە کێین",
        "ar": "من نكون"
      },
      "paragraph1": {
        "en": "OrderCenter is a premier international shopping and shipping service dedicated to bridging the gap between global e-commerce and local customers. We were founded with a simple but powerful vision: make the world's best products accessible to everyone, regardless of geographical boundaries.",
        "ku": "ئۆردەر سەنتەر خزمەتگوزارییەکی پێشەنگی کڕین و گەیاندنی نێودەوڵەتییە کە تەرخانکراوە بۆ پڕکردنەوەی بۆشایی نێوان بازرگانی ئەلیکترۆنی جیهانی و کڕیارانی ناوخۆیی. ئێمە بە دیدگایەکی سادە بەڵام بەهێز دامەزراین: بەردەستکردنی باشترین بەرهەمەکانی جیهان بۆ هەمووان، بەبێ گوێدانە سنوورە جوگرافییەکان.",
        "ar": "أوردر سنتر هي خدمة رائدة في التسوق والشحن الدولي مكرسة لسد الفجوة بين التجارة الإلكترونية العالمية والعملاء المحليين. تأسسنا برؤية بسيطة ولكنها قوية: جعل أفضل منتجات العالم في متناول الجميع، بغض النظر عن الحدود الجغرافية."
      },
      "paragraph2": {
        "en": "Based in the Kurdistan Region of Iraq, we serve customers across the region by purchasing products from leading international platforms including SHEIN, Amazon, Alibaba, AliExpress, Temu, eBay, and more — then handling all shipping logistics to deliver directly to your door.",
        "ku": "لە هەرێمی کوردستانی عێراق کاردەکەین، خزمەتی کڕیاران دەکەین لە سەرانسەری ناوچەکە لە ڕێگەی کڕینی کاڵا لە بەناوبانگترین پلاتفۆرمە جیهانییەکان لەوانە شین، ئەمازۆن، عەلی بابا، عەلی ئێکسپرێس، تێمۆ، ئی بەی، و هتد — پاشان سەرپەرشتی هەموو قۆناغەکانی گەیاندن دەکەین تا بەردەرگات.",
        "ar": "انطلاقاً من إقليم كوردستان العراق، نخدم العملاء في جميع أنحاء المنطقة من خلال شراء المنتجات من المنصات العالمية الرائدة بما في ذلك شي إن، أمازون، علي بابا، علي إكسبرس، تيمو، إيباي، والمزيد — ثم إدارة جميع العمليات اللوجستية للشحن لتوصيلها إلى باب منزلك مباشرة."
      },
      "cardTitle": {
        "en": "Global Shopping,",
        "ku": "کڕینی جیهانی،",
        "ar": "تسوق عالمي،"
      },
      "cardHighlight": {
        "en": "Locally Delivered",
        "ku": "گەیاندنی ناوخۆیی",
        "ar": "توصيل محلي"
      },
      "cardDescription": {
        "en": "We connect you with 50+ international platforms and handle every step of the journey.",
        "ku": "ئێمە پەیوەندیت پێوە دەکەین بە زیاتر لە ٥٠ وێبسایتی جیهانی و هەموو هەنگاوێکی گەشتەکە دەگرینە ئەستۆ.",
        "ar": "نربطك بأكثر من 50 منصة دولية ونتولى كل خطوة في هذه الرحلة."
      },
      "image": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
      "stats": [
        {
          "id": "stat_1",
          "value": "5+",
          "label": {
            "en": "Years",
            "ku": "ساڵ ئەزموون",
            "ar": "سنوات خبرة"
          }
        },
        {
          "id": "stat_2",
          "value": "10K+",
          "label": {
            "en": "Orders",
            "ku": "داواکاری سەرکەوتوو",
            "ar": "طلب مكتمل"
          }
        },
        {
          "id": "stat_3",
          "value": "50+",
          "label": {
            "en": "Websites",
            "ku": "ماڵپەڕی جیهانی",
            "ar": "موقع إلكتروني"
          }
        }
      ]
    },
    "whatWeDo": {
      "label": {
        "en": "What We Do",
        "ku": "چی دەکەین",
        "ar": "ماذا نفعل"
      },
      "title": {
        "en": "What We Do",
        "ku": "چی دەکەین",
        "ar": "ماذا نفعل"
      },
      "subtitle": {
        "en": "We act as your personal international shopping agent — handling everything from purchase to delivery.",
        "ku": "ئێمە وەک بریکاری کەسی کڕینی نێودەوڵەتیت کاردەکەین — هەموو شتێک لە کڕینەوە تا گەیاندن دەگرینە ئەستۆ.",
        "ar": "نعمل كوكيلك الشخصي للتسوق الدولي — ونتولى كل شيء من الشراء حتى التوصيل."
      },
      "items": [
        {
          "id": "wwd_1",
          "icon": "ShieldCheck",
          "title": {
            "en": "International Purchasing",
            "ku": "کڕینی نێودەوڵەتی",
            "ar": "الشراء الدولي"
          },
          "description": {
            "en": "We buy products from any global website on your behalf, handling payment, communication, and all purchasing details.",
            "ku": "ئێمە کاڵاکان لە هەر ماڵپەڕێکی جیهانییەوە لە جیاتی تۆ دەکڕین، پارەدان و پەیوەندی و هەموو وردەکارییەکانی کڕین جێبەجێ دەکەین.",
            "ar": "نشتري المنتجات من أي موقع عالمي بالنيابة عنك، مع إدارة الدفع والتواصل وجميع تفاصيل الشراء."
          }
        },
        {
          "id": "wwd_2",
          "icon": "Globe",
          "title": {
            "en": "Customs & Logistics",
            "ku": "گومرگ و لۆجستی",
            "ar": "الجمارك واللوجستيات"
          },
          "description": {
            "en": "We manage all customs clearance, import documentation, and international logistics so you don't have to worry about a thing.",
            "ku": "سەرپەرشتی هەموو ڕێکارەکانی گومرگ و بەڵگەنامەکانی هاوردەکردن و لۆجستی نێودەوڵەتی دەکەین تا تۆ بێ خەم بیت.",
            "ar": "ندير جميع إجراءات التخليص الجمركي ومستندات الاستيراد والخدمات اللوجستية الدولية حتى لا تقلق بشأن أي شيء."
          }
        },
        {
          "id": "wwd_3",
          "icon": "Star",
          "title": {
            "en": "Quality Control",
            "ku": "کۆنتڕۆڵی کوالێتی",
            "ar": "مراقبة الجودة"
          },
          "description": {
            "en": "Before shipping, we inspect your products to ensure they match your order and meet our quality standards.",
            "ku": "پێش بارکردن و گەیاندن، پشکنین بۆ کاڵاکانت دەکەین دڵنیادەبینەوە لەوەی لەگەڵ داواکارییەکەت و کوالێتی بەرزمانی دەگونجێت.",
            "ar": "قبل الشحن، نقوم بفحص منتجاتك للتأكد من مطابقتها لطلبك واستيفائها لمعايير الجودة لدينا."
          }
        },
        {
          "id": "wwd_4",
          "icon": "ArrowRight",
          "title": {
            "en": "Last-Mile Delivery",
            "ku": "گەیاندن تا بەردەرگا",
            "ar": "التوصيل حتى باب المنزل"
          },
          "description": {
            "en": "We deliver your package directly to your door with full tracking and customer notifications at every step.",
            "ku": "بستەکەت ڕاستەوخۆ دەگەیەنینە بەردەم دەرگات لەگەڵ شوێنپێهەڵگرتنی تەواو و ئاگادارکردنەوەی کڕیار لە هەموو هەنگاوێکدا.",
            "ar": "نوصل طردك مباشرة إلى باب بيتك مع ميزة التتبع الكامل وإشعارات فورية في كل مرحلة."
          }
        }
      ]
    },
    "missionVision": {
      "missionTitle": {
        "en": "Our Mission",
        "ku": "ئامانجمان",
        "ar": "مهمتنا"
      },
      "missionDescription": {
        "en": "To simplify international shopping for our customers by providing a reliable, transparent, and affordable service that connects them with the world's best products. We are committed to removing barriers and making global e-commerce accessible to everyone in our region.",
        "ku": "ئاسانکردنی کڕینی نێودەوڵەتی بۆ کڕیارانمان لە ڕێگەی دابینکردنی خزمەتگوزارییەکی باوەڕپێکراو، ڕوون و هەرزان کە ئەوان بە باشترین بەرهەمەکانی جیهانەوە دەبەستێتەوە. ئێمە پابەندین بە لابردنی بەربەستەکان و بەردەستکردنی بازرگانی ئەلیکترۆنی جیهانی بۆ هەمووان لە ناوچەکەماندا.",
        "ar": "تبسيط التسوق الدولي لعملائنا من خلال تقديم خدمة موثوقة وشفافة وبأسعار معقولة تربطهم بأفضل المنتجات في العالم. نحن ملتزمون بإزالة العوائق وجعل التجارة الإلكترونية العالمية متاحة للجميع في منطقتنا."
      },
      "visionTitle": {
        "en": "Our Vision",
        "ku": "دیدگامان",
        "ar": "رؤيتنا"
      },
      "visionDescription": {
        "en": "To become the leading international shopping and shipping service in the region, known for our excellence, reliability, and customer-first approach. We envision a future where every customer can access any product from anywhere in the world with complete ease and confidence.",
        "ku": "بوون بە پێشەنگترین خزمەتگوزاری کڕین و بارکردنی نێودەوڵەتی لە ناوچەکەدا، کە ناسراو بێت بە لێهاتوویی، باوەڕپێکراوی، و گرنگیدان بە کڕیار لە پلەی یەکەمدا. دیدگامان داهاتوویەکە کە هەر کڕیارێک بتوانێت بە ئاسانی و متمانەی تەواوەوە دەستی بگات بە هەر بەرهەمێک لە هەر شوێنێکی جیهانەوە.",
        "ar": "أن نصبح الخدمة الرائدة في مجال التسوق والشحن الدولي في المنطقة، المشهود لها بالتميز والموثوقية والنهج الذي يضع العميل أولاً. نتطلع إلى مستقبل يمكن فيه لأي عميل الوصول إلى أي منتج من أي مكان في العالم بكل سهولة وثقة."
      }
    },
    "values": {
      "label": {
        "en": "Our Values",
        "ku": "بەهاکانمان",
        "ar": "قيمنا"
      },
      "title": {
        "en": "Our Values",
        "ku": "بەهاکانمان",
        "ar": "قيمنا"
      },
      "items": [
        {
          "id": "val_1",
          "icon": "ShieldCheck",
          "title": {
            "en": "Trust & Transparency",
            "ku": "متمانە و ڕوونی",
            "ar": "الثقة والشفافية"
          },
          "description": {
            "en": "We believe in honest pricing, clear communication, and no hidden fees. Every transaction is transparent from start to finish.",
            "ku": "باوەڕمان بە نرخێکی دادپەروەرانە، پەیوەندییەکی ڕوون، و بەبێ هیچ تێچوویەکی شاراوەیە. هەموو مامەڵەیەک لە سەرەتاوە تا کۆتایی شەفافە.",
            "ar": "نؤمن بالتسعير العادل والتواصل الواضح والابتعاد عن الرسوم المخفية. كل معاملة تتسم بالشفافية من البداية إلى النهاية."
          }
        },
        {
          "id": "val_2",
          "icon": "Star",
          "title": {
            "en": "Quality Service",
            "ku": "خزمەتگوزاری کوالێتی بەرز",
            "ar": "جودة الخدمة"
          },
          "description": {
            "en": "We maintain the highest standards in every interaction, from handling your products with care to delivering them safely.",
            "ku": "بەرزترین پێوەرەکان لە هەموو پەیوەندییەکدا دەپارێزین، لە پاراستنی کاڵاکانت بە وریاییەوە تا گەیاندنیان بە سەلامەتی.",
            "ar": "نحافظ على أعلى المعايير في كل تعامل، بدءاً من الاعتناء بمنتجاتك بدقة وحتى تسليمها بأمان تام."
          }
        },
        {
          "id": "val_3",
          "icon": "Heart",
          "title": {
            "en": "Customer First",
            "ku": "کڕیار لە پێشینەیە",
            "ar": "العميل أولاً"
          },
          "description": {
            "en": "Our customers are at the heart of everything we do. We go above and beyond to ensure complete satisfaction.",
            "ku": "کڕیارانمان لە دڵی هەموو کارێکدان کە دەیکەین. هەموو هەوڵێک دەدەین بۆ دەستەبەرکردنی ڕەزامەندی تەواوی تۆ.",
            "ar": "عملاؤنا هم جوهر كل ما نقوم به. نبذل قصارى جهدنا لضمان رضاكم التام وسعادتكم."
          }
        },
        {
          "id": "val_4",
          "icon": "Globe",
          "title": {
            "en": "Global Reach",
            "ku": "دەستڕاگەیشتنی جیهانی",
            "ar": "انتشار عالمي"
          },
          "description": {
            "en": "We connect you with the world's best products, breaking down geographical barriers to bring international shopping within reach.",
            "ku": "تۆ بە باشترین بەرهەمەکانی جیهانەوە دەبەستینەوە، بەربەستە جوگرافییەکان تێکدەشکێنین تا کڕینی نێودەوڵەتی بکەینە دەستپێگەیشتوو.",
            "ar": "نربطك بأفضل المنتجات العالمية، متجاوزين الحواجز الجغرافية لنجعل التسوق الدولي في متناول يدك."
          }
        }
      ]
    },
    "process": {
      "label": {
        "en": "Our Process",
        "ku": "هەنگاوەکانی کارکردنمان",
        "ar": "خطوات العمل"
      },
      "title": {
        "en": "Our Process",
        "ku": "هەنگاوەکانی کارکردنمان",
        "ar": "خطوات العمل"
      },
      "subtitle": {
        "en": "The complete journey from your product discovery to your doorstep.",
        "ku": "گەشتی تەواو لە دۆزینەوەی کاڵاکەتەوە تا گەیشتن بە بەردەرگات.",
        "ar": "الرحلة الكاملة من لحظة اختيار المنتج حتى وصوله إلى بابك."
      },
      "items": [
        {
          "id": "step_1",
          "stepNumber": 1,
          "label": {
            "en": "Global Website",
            "ku": "وێبسایتی جیهانی",
            "ar": "موقع عالمي"
          },
          "description": {
            "en": "Browse and choose any item",
            "ku": "گەڕان و هەڵبژاردنی کاڵا",
            "ar": "تصفح واختيار أي منتج"
          },
          "icon": "Globe",
          "color": "bg-brand text-white"
        },
        {
          "id": "step_2",
          "stepNumber": 2,
          "label": {
            "en": "Purchase",
            "ku": "کڕینی کاڵا",
            "ar": "الشراء والدفع"
          },
          "description": {
            "en": "We buy it securely on your behalf",
            "ku": "بۆت دەکڕین بە شێوەیەکی پارێزراو",
            "ar": "نشتريه بأمان نيابة عنك"
          },
          "icon": "ShieldCheck",
          "color": "bg-gold text-charcoal"
        },
        {
          "id": "step_3",
          "stepNumber": 3,
          "label": {
            "en": "International Shipping",
            "ku": "بارکردنی نێودەوڵەتی",
            "ar": "الشحن الدولي"
          },
          "description": {
            "en": "Swift transit to our central hub",
            "ku": "گواستنەوەی خێرا بۆ کۆگای سەرەکی",
            "ar": "شحن سريع إلى مستودعنا"
          },
          "icon": "Plane",
          "color": "bg-brand text-white"
        },
        {
          "id": "step_4",
          "stepNumber": 4,
          "label": {
            "en": "Tracking",
            "ku": "شوێنپێهەڵگرتن",
            "ar": "تتبع الشحنة"
          },
          "description": {
            "en": "Live updates from start to finish",
            "ku": "ئاگاداری ڕاستەوخۆ تا گەیشتن",
            "ar": "تحديثات حية ومستمرة"
          },
          "icon": "Search",
          "color": "bg-gold text-charcoal"
        },
        {
          "id": "step_5",
          "stepNumber": 5,
          "label": {
            "en": "Local Delivery",
            "ku": "گەیاندنی ناوخۆیی",
            "ar": "التوصيل المحلي"
          },
          "description": {
            "en": "Safe doorstep courier service",
            "ku": "گەیاندنی پارێزراو بۆ ماڵەوە",
            "ar": "توصيل آمن إلى منزلك"
          },
          "icon": "Truck",
          "color": "bg-brand text-white"
        },
        {
          "id": "step_6",
          "stepNumber": 6,
          "label": {
            "en": "Customer",
            "ku": "کڕیار / وەرگرتن",
            "ar": "استلام العميل"
          },
          "description": {
            "en": "Handed over directly to you",
            "ku": "ڕادەستکردنی ڕاستەوخۆ بە تۆ",
            "ar": "تسليم المنتج ليدك"
          },
          "icon": "Users",
          "color": "bg-gold text-charcoal"
        }
      ]
    },
    "pictures": [
      {
        "id": "pic_hero",
        "category": "Hero Banner",
        "title": {
          "en": "Hero Background / Network",
          "ku": "وێنەی سەرەکی تۆڕی جیهانی",
          "ar": "صورة الواجهة الرئيسية"
        },
        "imageUrl": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
        "caption": {
          "en": "Global Logistics Network",
          "ku": "تۆڕی لۆجستی جیهانی",
          "ar": "شبكة اللوجستيات العالمية"
        }
      },
      {
        "id": "pic_who",
        "category": "Who We Are",
        "title": {
          "en": "Who We Are Card & Showcase",
          "ku": "وێنەی پڕۆفایلی ئێمە کێین",
          "ar": "صورة قسم من نحن"
        },
        "imageUrl": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80",
        "caption": {
          "en": "Warehouse & Global Distribution",
          "ku": "کۆگاو دابەشکردنی جیهانی",
          "ar": "المستودعات والتوزيع العالمي"
        }
      },
      {
        "id": "pic_mission",
        "category": "Mission & Vision",
        "title": {
          "en": "Customer Care & Operation Center",
          "ku": "تیمی کارپێکردن و خزمەتگوزاری",
          "ar": "فريق العمليات والخدمة"
        },
        "imageUrl": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80",
        "caption": {
          "en": "Dedicated Operations & Service",
          "ku": "تیمی بەردەوام لە خزمەتتدا",
          "ar": "عمليات مخصصة لخدمتكم"
        }
      },
      {
        "id": "pic_delivery",
        "category": "Process & Delivery",
        "title": {
          "en": "Doorstep Courier & Packaging",
          "ku": "گەیاندنی خێرا بۆ بەردەرگا",
          "ar": "توصيل وتغليف متميز"
        },
        "imageUrl": "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80",
        "caption": {
          "en": "Secure, inspected doorstep delivery",
          "ku": "گەیاندنی پارێزراوی پشکنراو",
          "ar": "توصيل مفحوص وآمن"
        }
      }
    ],
    "cta": {
      "title": {
        "en": "Ready to Start Shopping?",
        "ku": "ئامادەیت بۆ دەستپێکردنی کڕین؟",
        "ar": "هل أنت مستعد لبدء التسوق؟"
      },
      "subtitle": {
        "en": "Join thousands of satisfied customers who trust us with their international shopping needs.",
        "ku": "بەشداربە لەگەڵ هەزاران کڕیاری ڕازی کە متمانەیان پێمان بەخشیوە بۆ پێداویستییە نێودەوڵەتییەکانیان.",
        "ar": "انضم إلى آلاف العملاء الراضين الذين يثقون بنا لتلبية جميع احتياجاتهم في التسوق الدولي."
      },
      "primaryBtn": {
        "en": "Explore Services",
        "ku": "خزمەتگوزارییەکان ببینە",
        "ar": "استكشف الخدمات"
      },
      "secondaryBtn": {
        "en": "Contact Us",
        "ku": "پەیوەندیمان پێوە بکە",
        "ar": "اتصل بنا"
      }
    }
  },
  "general": {
    "companyName": {
      "en": "Order Center",
      "ku": "ئۆردەر سەنتەر",
      "ar": "أوردر سنتر"
    },
    "tagline": {
      "en": "Global Shopping & Shipping",
      "ku": "کڕین و گەیاندنی نێودەوڵەتی",
      "ar": "التسوق والشحن الدولي"
    },
    "phone": "0770 156 6233",
    "whatsapp": "9647701566233",
    "email": "support@ordercenter.com",
    "location": {
      "en": "Salim Street, Sulaimanyiah, Kurdistan Region, Iraq",
      "ku": "شەقامی سەلیم، سلێمانی، هەرێمی کوردستان، عێراق",
      "ar": "شارع سالم، السليمانية، إقليم كوردستان، العراق"
    },
    "footerDescription": {
      "en": "Your trusted partner for international shopping and shipping. We bring the world's best products to your doorstep.",
      "ku": "هاوبەشی باوەڕپێکراوت بۆ کڕین و گەیاندنی نێودەوڵەتی. باشترین بەرهەمەکانی جیهان دەهێنینە بەردەرگاکەت.",
      "ar": "شريكك الموثوق للتسوق والشحن الدولي. نجلب أفضل منتجات العالم إلى بابك."
    }
  },
  "home": {
    "hero": {
      "badge": {
        "en": "Worldwide Shipping To Iraq",
        "ku": "گەیاندنی جیهانی بۆ عێراق و کوردستان",
        "ar": "شحن دولي إلى العراق وكردستان"
      },
      "title": {
        "en": "Shop Globally, Delivered Directly To Your Door",
        "ku": "لە هەموو جیهان بکڕە، راستەوخۆ دەگاتە بەردەرگاکەت",
        "ar": "تسوق من جميع أنحاء العالم، واستلم عند باب منزلك"
      },
      "description": {
        "en": "Send us any link from Amazon, SHEIN, Trendyol, eBay or AliExpress. We purchase, handle international customs, and deliver safely to you.",
        "ku": "هەر بەستەرێکت هەیە لە ئەمازۆن، شین، ترێندیۆل، ئیبەی یان عەلی ئێکسپرێس بۆمان بنێرە. ئێمە دەیکڕین و بە سەلامەتی دەیگەیەنین.",
        "ar": "أرسل لنا أي رابط من أمازون، شي إن، ترينديول، إيباي أو علي إكسبريس. نتولى الشراء والتخليص الجمركي والتوصيل الآمن."
      },
      "primaryBtn": {
        "en": "Shop With Link",
        "ku": "کڕین بە بەستەر",
        "ar": "تسوق عبر الرابط"
      },
      "secondaryBtn": {
        "en": "Track My Order",
        "ku": "شوێنپێهەڵگرتنی داواکاری",
        "ar": "تتبع طلبي"
      },
      "bannerImage": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
      "bannerImages": [
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
        "data:image/jpeg;base64,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",
        "data:image/webp;base64,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bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGF1eDpBcHByb3hpbWF0ZUZvY3VzRGlzdGFuY2U9IjAvMSIgYXV4OkZpcm13YXJlPSJGaXJtd2FyZSBWZXJzaW9uIDEuMy4zIiBhdXg6Rmxhc2hDb21wZW5zYXRpb249IjAvMSIgYXV4OkxlbnM9IkNhbm9uIEVGIDI0LTEwNW1tIGYvNEwgSVMgSUkgVVNNIiBhdXg6TGVuc0luZm89IjI0LzEgMTA1LzEgMC8wIDAvMCIgYXV4OkxlbnNTZXJpYWxOdW1iZXI9IjY0MjMwMDM3OTkiIGF1eDpTZXJpYWxOdW1iZXI9IjE5MzA1NjAwMTc5OSIgZGM6Zm9ybWF0PSJpbWFnZS9qcGVnIiBwaG90b3Nob3A6RGF0ZUNyZWF0ZWQ9IjIwMjMtMDQtMjRUMDg6MzM6MzQrMDE6MDAiIHBob3Rvc2hvcDpMZWdhY3lJUFRDRGlnZXN0PSJFMzY4NTlDQ0Q2Q0RCRThEODkzQUI0MEE2MTc1OTM2NCIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXA6Q3JlYXRvclRvb2w9IkNhcHR1cmUgT25lIDE1IE1hY2ludG9zaCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wNC0yNVQyMDowNjo0MyswMTowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDQtMjVUMjA6MDY6NDMrMDE6MDAiIHhtcDpDcmVhdGVEYXRlPSIyMDIzLTA0LTI0VDE1OjA4OjM0IiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NzRjNjZjOWQtMmZjYi1mODRlLWFkY2EtNjM4ODExM2Y2YjUzIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjc5OWM2NWFmLTU4NjQtNDFhYy1iZWJiLWVjZTFiZDlmYThiOSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjMwOGUyMGU1LTZkMTgtNDFjOS1hZmIwLWZhMGZjYWI5OTM1NCI+IDxkYzpyaWdodHM+IDxyZGY6QWx0PiA8cmRmOmxpIHhtbDpsYW5nPSJ4LWRlZmF1bHQiPldXVy5LQVRJRUhPV0VZLkNPTTwvcmRmOmxpPiA8L3JkZjpBbHQ+IDwvZGM6cmlnaHRzPiA8ZGM6Y3JlYXRvcj4gPHJkZjpTZXE+IDxyZGY6bGk+S0FUSUUgSE9XRVk8L3JkZjpsaT4gPC9yZGY6U2VxPiA8L2RjOmNyZWF0b3I+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YWM2ZGQ0YzQtNjk2ZC01OTRlLTkzNGMtZDJhODIxOWYzN2MxIiBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjBjMzFiMmRkLWM0OWEtNGYxMC1hMDI3LTg5NTE3MTk1NTE3NCIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjMwOGUyMGU1LTZkMTgtNDFjOS1hZmIwLWZhMGZjYWI5OTM1NCIvPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6Y2hhbmdlZD0iLyIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDozMDhlMjBlNS02ZDE4LTQxYzktYWZiMC1mYTBmY2FiOTkzNTQiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4xIChNYWNpbnRvc2gpIiBzdEV2dDp3aGVuPSIyMDIzLTA0LTExVDE1OjEwOjM1KzAxOjAwIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6Y2hhbmdlZD0iLyIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDowYzMxYjJkZC1jNDlhLTRmMTAtYTAyNy04OTUxNzE5NTUxNzQiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyNC4xIChNYWNpbnRvc2gpIiBzdEV2dDp3aGVuPSIyMDIzLTA0LTE3VDA5OjMyOjI0KzAxOjAwIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvdGlmZiB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS90aWZmIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDpjaGFuZ2VkPSIvIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjMyNThjMTIwLWZlYmQtNDNhMS1hOTFlLWM2M2VkYmIwZjlmMiIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjEgKE1hY2ludG9zaCkiIHN0RXZ0OndoZW49IjIwMjMtMDQtMTdUMDk6MzI6MjQrMDE6MDAiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjc5OWM2NWFmLTU4NjQtNDFhYy1iZWJiLWVjZTFiZDlmYThiOSIgc3RFdnQ6d2hlbj0iMjAyMy0wNC0yNVQyMDowNjo0MyswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDI0LjEgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz4="
      ],
      "carouselInterval": 4
    },
    "features": {
      "label": {
        "en": "Why Choose OrderCenter",
        "ku": "بۆچی ئۆردەر سەنتەر هەڵبژێریت",
        "ar": "لماذا تختار أوردر سنتر"
      },
      "title": {
        "en": "Smartest International Shopping Experience",
        "ku": "ئەزموونی زیرەکانەی کڕینی نێودەوڵەتی",
        "ar": "تجربة التسوق الدولي الأكثر ذكاءً"
      },
      "subtitle": {
        "en": "We remove all international shopping barriers: payments, customs, languages, and delayed deliveries.",
        "ku": "هەموو بەربەستەکانی کڕینی نێودەوڵەتی لادەبەین: پارەدان، گومرگ، زمان، و دواکەوتن.",
        "ar": "نزيل جميع عوائق التسوق الدولي: الدفع، الجمارك، اللغات، وتأخير التوصيل."
      },
      "items": [
        {
          "id": "feat-1",
          "icon": "Truck",
          "title": {
            "en": "Fast Express Air Freight",
            "ku": "بارهەڵگری خێرای ئاسمانی",
            "ar": "شحن جوي سريع ومباشر"
          },
          "description": {
            "en": "Direct regular flights guarantee your packages reach Iraq in record time with full tracking.",
            "ku": "گەشتە ئاسمانییە ڕاستەوخۆکان گەرەنتی گەیشتنی پاکێجەکانت دەکەن لە کاتی دیاریکراودا بە شوێنپێهەڵگرتنی تەواو.",
            "ar": "رحلات جوية منتظمة ومباشرة تضمن وصول شحناتك إلى العراق في وقت قياسي مع تتبع دقيق."
          }
        },
        {
          "id": "feat-2",
          "icon": "ShieldCheck",
          "title": {
            "en": "100% Package Insurance",
            "ku": "دڵنیایی و بیمەی ١٠٠٪ی پاکێج",
            "ar": "تأمين كامل بنسبة 100% على الشحنات"
          },
          "description": {
            "en": "Every item is fully insured against damage or loss from purchase through final door delivery.",
            "ku": "هەموو بابەتێک بە تەواوی بیمە کراوە دژی زیان یان ونبوون لە کڕینەوە تا گەیاندن.",
            "ar": "كل طلبية مؤمنة بالكامل ضد التلف أو الفقدان من وقت الشراء وحتى التسليم النهائي."
          }
        },
        {
          "id": "feat-3",
          "icon": "Globe",
          "title": {
            "en": "Global Store Coverage",
            "ku": "دەستڕاگەیشتن بە هەموو فرۆشگاکانی جیهان",
            "ar": "تغطية شاملة للمتاجر العالمية"
          },
          "description": {
            "en": "Shop from USA, UK, Turkey, China, UAE, and Europe even if the store does not ship to Iraq.",
            "ku": "لە ئەمریکا، بەریتانیا، تورکیا، چین، ئیمارات و ئەوروپا بکڕە تەنانەت ئەگەر فرۆشگاکە گەیاندنی بۆ عێراق نەبێت.",
            "ar": "تسوق من أمريكا، بريطانيا، تركيا، الصين، الإمارات وأوروبا حتى لو كان المتجر لا يشحن للعراق."
          }
        },
        {
          "id": "feat-4",
          "icon": "Award",
          "title": {
            "en": "Best Currency Exchange & Rates",
            "ku": "باشترین نرخی ئاڵوگۆڕ و گەیاندن",
            "ar": "أفضل أسعار الصرف والشحن"
          },
          "description": {
            "en": "Fair transparent exchange rates with no hidden fees or surprise clearance charges.",
            "ku": "نرخی ئاڵوگۆڕی دادپەروەرانە و ڕوون بەبێ هیچ تێچوویەکی شاراوە یان پارەی گومرگی لەناکاو.",
            "ar": "أسعار صرف شفافة وعادلة بدون أي رسوم خفية أو مفاجآت جمركية."
          }
        },
        {
          "id": "feat-5",
          "icon": "Sparkles",
          "title": {
            "en": "Zero Customs & Clearance Hassle",
            "ku": "بەبێ هیچ کێشەیەکی گومرگی",
            "ar": "تخليص جمركي بدون أي تعقيدات"
          },
          "description": {
            "en": "We handle all customs duties, paperwork, and inspections smoothly with no surprise clearance fees.",
            "ku": "هەموو کار و ڕێکارە گومرگییەکان بە تەواوی ئەنجام دەدەین بەبێ هیچ خەرجییەکی لەناکاو.",
            "ar": "نتولى جميع الإجراءات والأوراق الجمركية بسلاسة تامة وبدون أي رسوم تخليص مفاجئة."
          }
        },
        {
          "id": "feat-6",
          "icon": "Users",
          "title": {
            "en": "Personal Shopping Concierge",
            "ku": "یارمەتیدەری تایبەتی کڕین",
            "ar": "مساعد تسوق شخصي متخصص"
          },
          "description": {
            "en": "Multilingual support team ready to help you place orders, find discounts, and track packages 24/7.",
            "ku": "تیمێکی پشتگیری فرەزمان ٢٤/٧ ئامادەیە بۆ یارمەتیدانت لە داواکردن، دۆزینەوەی داشکاندن و چاودێری.",
            "ar": "فريق دعم متعدد اللغات متواجد لمساعدتك في تقديم الطلبات، البحث عن عروض، ومتابعة شحنتك على مدار الساعة."
          }
        }
      ]
    },
    "howItWorks": {
      "label": {
        "en": "Simple Process",
        "ku": "هەنگاوە سادەکان",
        "ar": "خطوات بسيطة"
      },
      "title": {
        "en": "How OrderCenter Works",
        "ku": "چۆن کار دەکات؟",
        "ar": "كيف تعمل خدمة أوردر سنتر؟"
      },
      "subtitle": {
        "en": "Get your favourite international items delivered in 6 effortless steps.",
        "ku": "کاڵا نێودەوڵەتییە دڵخوازەکانت بە ٦ هەنگاوی ئاسان وەربگرە.",
        "ar": "احصل على منتجاتك العالمية المفضلة من خلال 6 خطوات سهلة للغاية."
      },
      "items": [
        {
          "id": "step-1",
          "stepNumber": "01",
          "title": {
            "en": "Send Product Link",
            "ku": "بەستەری کاڵاکە بنێرە",
            "ar": "أرسل رابط المنتج"
          },
          "description": {
            "en": "Copy the URL of the product from any site and paste it into our link order form.",
            "ku": "بەستەری کاڵاکە لە هەر ماڵپەڕێک کۆپی بکە و لە فۆڕمەکەدا دایبنێ.",
            "ar": "انسخ رابط المنتج من أي متجر والصقه في نموذج الطلب لدينا."
          },
          "icon": "Search"
        },
        {
          "id": "step-2",
          "stepNumber": "02",
          "title": {
            "en": "Receive Exact Quote",
            "ku": "نرخی تەواو وەربگرە",
            "ar": "استلم التكلفة الإجمالية"
          },
          "description": {
            "en": "We calculate exact item price, shipping, and customs in IQD and USD with zero surprises.",
            "ku": "نرخی کاڵا، گەیاندن و گومرگ بە دینار و دۆلار بە وردی هەژمار دەکەین.",
            "ar": "نحسب سعر المنتج والشحن والجمارك بالدينار والدولار بكل شفافية."
          },
          "icon": "ArrowRight"
        },
        {
          "id": "step-3",
          "stepNumber": "03",
          "title": {
            "en": "We Purchase & Inspect",
            "ku": "ئێمە دەیکڕین و پشکنینی بۆ دەکەین",
            "ar": "نقوم بالشراء والفحص"
          },
          "description": {
            "en": "Our international agents purchase the item, check quality, and pack it safely for flight.",
            "ku": "نوێنەرە نێودەوڵەتییەکانمان دەیکڕن، پشکنینی کوالێتی دەکەن و بە سەلامەتی دەپێچنەوە.",
            "ar": "وكلاؤنا الدوليون يشترون المنتج ويفحصون جودته ويجهزونه للشحن الجوي."
          },
          "icon": "ShieldCheck"
        },
        {
          "id": "step-4",
          "stepNumber": "04",
          "title": {
            "en": "Priority Air Freight",
            "ku": "بارهەڵگری خێرای ئاسمانی",
            "ar": "الشحن الجوي السريع"
          },
          "description": {
            "en": "Packages take off on scheduled flights with priority handling and live departure tracking.",
            "ku": "پاکێجەکان بە گەشتی ئاسمانی دیاریکراو و بە چاودێری ڕاستەوخۆ دەگوازرێنەوە.",
            "ar": "تنطلق شحنتك عبر رحلات جوية مجدولة مع تتبع مباشر للإقلاع والمسار."
          },
          "icon": "Plane"
        },
        {
          "id": "step-5",
          "stepNumber": "05",
          "title": {
            "en": "Customs & Quality Clearance",
            "ku": "گومرگ و پشکنینی کوالێتی",
            "ar": "التخليص الجمركي والفحص"
          },
          "description": {
            "en": "Our customs brokers clear airport duties smoothly with 100% legal compliance and zero hassle.",
            "ku": "شارەزایانی ئێمە کارە گومرگییەکان تەواو دەکەن بەبێ هیچ کێشە و دواکەوتنێک.",
            "ar": "يتولى مخلصونا الجمركيون كافة الإجراءات الرسمية بسلاسة وبدون أي تعقيدات."
          },
          "icon": "Award"
        },
        {
          "id": "step-6",
          "stepNumber": "06",
          "title": {
            "en": "Delivery To Your Door",
            "ku": "گەیاندن بۆ بەردەرگای ماڵەوە",
            "ar": "التسليم عند باب منزلك"
          },
          "description": {
            "en": "Track progress live online until your package is safely handed over to your hands anywhere in Iraq.",
            "ku": "بە شێوازی راستەوخۆ چاودێری بکە تاوەکو پاکێجەکەت دەگاتە دەستت لە هەر شوێنێکی عێراق.",
            "ar": "تتبع طلبيتك مباشرة حتى تسليمها بيدك بأمان في أي مكان بالعراق أو من فروعنا."
          },
          "icon": "Package"
        }
      ]
    },
    "globalWebsites": {
      "label": {
        "en": "GLOBAL WEBSITES WE SHOP FROM",
        "ku": "وێبسایتە جیهانییەکانی کڕینمان",
        "ar": "المواقع العالمية التي نتسوق منها"
      },
      "title": {
        "en": "Global Websites We Shop From",
        "ku": "وێبسایتە جیهانییەکانی کڕینمان",
        "ar": "المواقع العالمية التي نتسوق منها"
      },
      "subtitle": {
        "en": "We purchase from all major international platforms on your behalf.",
        "ku": "ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.",
        "ar": "نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك."
      },
      "bottomNote": {
        "en": "And many more international websites — if it's online, we can get it for you.",
        "ku": "و چەندین وێبسایتی نێودەوڵەتی تر — ئەگەر لە ئۆنلاین بێت، دەتوانین بۆت بهێنین.",
        "ar": "والعديد من المواقع العالمية الأخرى — إذا كان متوفراً عبر الإنترنت، يمكننا توفيره لك."
      },
      "items": [
        {
          "id": "site-1",
          "name": "SHEIN",
          "abbr": "SHEIN",
          "url": "https://www.shein.com",
          "color": "#111111",
          "bg": "#ffffff",
          "border": "#e0e0e0",
          "logo": ""
        },
        {
          "id": "site-2",
          "name": "Alibaba",
          "abbr": "Alibaba",
          "url": "https://www.alibaba.com",
          "color": "#FF6A00",
          "bg": "#fff5ee",
          "border": "#ffe4cc",
          "logo": ""
        },
        {
          "id": "site-3",
          "name": "Amazon",
          "abbr": "Amazon",
          "url": "https://www.amazon.com",
          "color": "#FF9900",
          "bg": "#fff8ee",
          "border": "#ffe5b0",
          "logo": ""
        },
        {
          "id": "site-4",
          "name": "AliExpress",
          "abbr": "AliEx",
          "url": "https://www.aliexpress.com",
          "color": "#e62e04",
          "bg": "#fff0ee",
          "border": "#ffc5bb",
          "logo": ""
        },
        {
          "id": "site-5",
          "name": "Temu",
          "abbr": "Temu",
          "url": "https://www.temu.com",
          "color": "#fb5c02",
          "bg": "#fff2ee",
          "border": "#ffd0bb",
          "logo": ""
        },
        {
          "id": "site-6",
          "name": "eBay",
          "abbr": "eBay",
          "url": "https://www.ebay.com",
          "color": "#86b817",
          "bg": "#f5fff0",
          "border": "#c8f0a0",
          "logo": ""
        }
      ]
    },
    "stats": {
      "items": [
        {
          "id": "stat-1",
          "value": "50K+",
          "label": {
            "en": "Orders Delivered",
            "ku": "داواکاری گەیەندراو",
            "ar": "طلب تم توصيله"
          }
        },
        {
          "id": "stat-2",
          "value": "18K+",
          "label": {
            "en": "Happy Customers",
            "ku": "کڕیاری ڕازی",
            "ar": "عميل سعيد"
          }
        },
        {
          "id": "stat-3",
          "value": "12+",
          "label": {
            "en": "Countries Covered",
            "ku": "وڵاتی بەردەست",
            "ar": "دولة متوفرة"
          }
        },
        {
          "id": "stat-4",
          "value": "99.8%",
          "label": {
            "en": "On-Time Rate",
            "ku": "ڕێژەی گەیشتن لە کاتدا",
            "ar": "نسبة الالتزام بالوقت"
          }
        }
      ]
    },
    "cta": {
      "title": {
        "en": "Ready to order your favourite items from abroad?",
        "ku": "ئامادەیت بۆ داواکردنی کاڵا دڵخوازەکانت لە دەرەوە؟",
        "ar": "جاهز لطلب منتجاتك المفضلة من الخارج؟"
      },
      "subtitle": {
        "en": "Paste your link now and get an instant quote from our concierge shopping team.",
        "ku": "بەستەرەکەت بنێرە و ڕاستەوخۆ نرخ وەربگرە لە تیمی پسپۆڕمان.",
        "ar": "الصق الرابط الآن واحصل على تسعيرة فورية من فريق التسوق لدينا."
      },
      "primaryBtn": {
        "en": "Start Shopping Now",
        "ku": "دەستپێکردنی کڕین",
        "ar": "ابدأ التسوق الآن"
      }
    }
  },
  "services": {
    "hero": {
      "badge": {
        "en": "Comprehensive Logistics Solutions",
        "ku": "چارەسەری تەواوی گواستنەوە و گەیاندن",
        "ar": "حلول لوجستية شاملة ومتكاملة"
      },
      "title": {
        "en": "Our Shipping & Concierge Services",
        "ku": "خزمەتگوزارییەکانی کڕین و گەیاندنمان",
        "ar": "خدمات الشحن والتسوق الدولي"
      },
      "description": {
        "en": "Whether you are shopping for a single outfit or importing commercial merchandise, OrderCenter provides end-to-end shopping and shipping services.",
        "ku": "چ کڕیاری تاک بیت یان بازرگان، ئۆردەر سەنتەر خزمەتگوزاری تەواوی کڕین و گواستنەوەت پێشکەش دەکات.",
        "ar": "سواء كنت تتسوق لمنتج فردي أو تستورد بضائع تجارية، يوفر لك أوردر سنتر حلولاً متكاملة للشراء والشحن."
      },
      "bannerImage": "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    },
    "servicesList": {
      "label": {
        "en": "What We Offer",
        "ku": "خزمەتگوزارییەکانمان",
        "ar": "ما نقدمه لك"
      },
      "title": {
        "en": "Tailored Services for Every Need",
        "ku": "خزمەتگوزاری تایبەت بۆ هەموو پێداویستییەک",
        "ar": "خدمات مصممة لكل احتياج"
      },
      "subtitle": {
        "en": "Choose the service that fits your international shopping and shipping goals.",
        "ku": "ئەو خزمەتگوزارییە هەڵبژێرە کە لەگەڵ پێداویستییەکانت دەگونجێت.",
        "ar": "اختر الخدمة التي تناسب أهدافك في التسوق والشحن الدولي."
      },
      "items": [
        {
          "id": "srv-1",
          "icon": "Globe",
          "title": {
            "en": "Assisted International Shopping",
            "ku": "کڕینی نێودەوڵەتی بە هاوکاری",
            "ar": "التسوق الدولي بالنيابة"
          },
          "description": {
            "en": "You find the product link, we take care of foreign currency cards, checkout, seller communication, and customs clearance.",
            "ku": "تۆ بەستەرەکەمان بۆ بنێرە، ئێمە کڕین، دراوی بیانی، پەیوەندی بە فرۆشیار و گومرگ لە ئەستۆ دەگرین.",
            "ar": "أنت تختار المنتج، ونحن نتكفل بالدفع بالعملة الأجنبية والشراء والتواصل مع البائع والتخليص الجمركي."
          },
          "tags": [
            "Amazon",
            "SHEIN",
            "Trendyol",
            "eBay",
            "AliExpress"
          ],
          "featured": true
        },
        {
          "id": "srv-2",
          "icon": "Package",
          "title": {
            "en": "Package Forwarding & Virtual Addresses",
            "ku": "ناونیشانی بیانی و کۆکردنەوەی پاکێج",
            "ar": "عناوين افتراضية وتجميع الشحنات"
          },
          "description": {
            "en": "Get your own shipping addresses in USA, UK, Turkey, and China to receive purchases from multiple stores and combine into one box.",
            "ku": "ناونیشانی تایبەت بەدەستبهێنە لە ئەمریکا، بەریتانیا، تورکیا و چین بۆ کۆکردنەوەی پاکێجەکانت لە یەک باردا.",
            "ar": "احصل على عناوين شحن في أمريكا، بريطانيا، تركيا والصين لتجميع مشترياتك في طرد واحد وتوفير تكاليف الشحن."
          },
          "tags": [
            "Consolidation",
            "Repackaging",
            "Inspection"
          ],
          "featured": false
        },
        {
          "id": "srv-3",
          "icon": "Truck",
          "title": {
            "en": "Express Air Freight & Door Delivery",
            "ku": "بارهەڵگری خێرا و گەیاندن بۆ ماڵەوە",
            "ar": "الشحن الجوي السريع والتوصيل للمنزل"
          },
          "description": {
            "en": "Scheduled weekly air shipments ensuring prompt arrival into Erbil, Sulaymaniyah, Baghdad, and all Iraqi governorates.",
            "ku": "گەشتی هەفتانەی خێرا بۆ هەولێر، سلێمانی، بەغدا و هەموو پارێزگاکانی عێراق بە گەیاندنی بەردەرگا.",
            "ar": "شحنات جوية أسبوعية منتظمة تصل إلى أربيل والسليمانية وبغداد وكافة محافظات العراق مع التوصيل لباب المنزل."
          },
          "tags": [
            "All Governorates",
            "Tracking",
            "Fast Transit"
          ],
          "featured": true
        },
        {
          "id": "srv-4",
          "icon": "ShieldCheck",
          "title": {
            "en": "Commercial & Wholesale Cargo",
            "ku": "باری بازرگانی و کۆمەڵ",
            "ar": "الشحن التجاري والجملة"
          },
          "description": {
            "en": "Heavy-weight commercial logistics, container solutions, customs paperwork, and enterprise invoice management for Iraqi businesses.",
            "ku": "گواستنەوەی باری قورس، کانتینەر، بەڵگەنامە گومرگییەکان و پسوولەی فەرمی بۆ خاوەنکارانی عێراق.",
            "ar": "شحن الحمولات الثقيلة والتجارية وحلول الحاويات والتخليص الجمركي وإدارة الفواتير للشركات والمتاجر العراقية."
          },
          "tags": [
            "Wholesale",
            "B2B",
            "Customs Support"
          ],
          "featured": false
        }
      ]
    },
    "whyChoose": {
      "label": {
        "en": "Our Advantages",
        "ku": "سوودەکانمان",
        "ar": "مميزاتنا"
      },
      "title": {
        "en": "Why Shop Through OrderCenter",
        "ku": "بۆچی لە ڕێگەی ئۆردەر سەنتەرەوە بکڕیت؟",
        "ar": "لماذا تتسوق عبر أوردر سنتر؟"
      },
      "subtitle": {
        "en": "Built specifically for Iraqi online shoppers to deliver peace of mind on every order.",
        "ku": "تایبەت بۆ کڕیارانی عێراق و کوردستان دروستکراوە بۆ دڵنیایی تەواو لە هەموو داواکارییەکدا.",
        "ar": "مصمم خصيصاً للمتسوقين في العراق لتوفير أقصى درجات الراحة والموثوقية في كل طلب."
      },
      "items": [
        {
          "id": "adv-1",
          "icon": "ShieldCheck",
          "title": {
            "en": "Zero Card Headaches",
            "ku": "بێ کێشەی کارتی بانکی",
            "ar": "بدون مشاكل بطاقات الدفع"
          },
          "description": {
            "en": "No international Visa or Mastercard required. Pay locally in IQD or Cash upon order confirmation.",
            "ku": "پێویستت بە کارتی نێودەوڵەتی نییە. بە دیناری عێراقی یان کاش پارە بدە.",
            "ar": "لا حاجة لبطاقات دولية. ادفع محلياً بالدينار العراقي أو نقداً عند تأكيد الطلب."
          }
        },
        {
          "id": "adv-2",
          "icon": "Search",
          "title": {
            "en": "End-to-End Tracking",
            "ku": "شوێنپێهەڵگرتنی بەردەوام",
            "ar": "تتبع شامل ومباشر"
          },
          "description": {
            "en": "Live milestone updates from international warehouse receipt through local courier dispatch.",
            "ku": "ئاگاداری بەردەوام لە وەرگرتنی کاڵاکە لە کۆگای دەرەوە تا گەیاندنی بەردەرگا.",
            "ar": "تحديثات مستمرة لمراحل الشحنة من وصولها للمستودع الخارجي وحتى تسليمها."
          }
        },
        {
          "id": "adv-3",
          "icon": "Users",
          "title": {
            "en": "Multilingual Support",
            "ku": "پشتیوانی فرەزمان",
            "ar": "دعم فني متعدد اللغات"
          },
          "description": {
            "en": "Our friendly team assists you in Kurdish, Arabic, and English 7 days a week via WhatsApp and phone.",
            "ku": "تیمەکەمان ٧ ڕۆژی هەفتە بە کوردی، عەرەبی و ئینگلیزی لە ڕێگەی واتسئەپ و پەیوەندی یارمەتیت دەدەن.",
            "ar": "فريق دعم ودود يخدمك بالكردية والعربية والإنجليزية طوال أيام الأسبوع عبر واتساب والهاتف."
          }
        }
      ]
    },
    "cta": {
      "title": {
        "en": "Have a special or bulk shipping inquiry?",
        "ku": "پرسیارێکت هەیە لەسەر باری تایبەت یان کۆمەڵ؟",
        "ar": "هل لديك استفسار عن شحنة خاصة أو تجارية؟"
      },
      "subtitle": {
        "en": "Talk to our logistics managers today for custom commercial pricing and tailored flight schedules.",
        "ku": "ئەمڕۆ پەیوەندی بکە بە بەڕێوەبەرانی گواستنەوەمان بۆ نرخی تایبەتی بازرگانی.",
        "ar": "تواصل مع مدراء الشحن اليوم للحصول على أسعار تجارية خاصة وجداول رحلات مخصصة."
      },
      "primaryBtn": {
        "en": "Contact Logistics Desk",
        "ku": "پەیوەندی بە تیمی گواستنەوە",
        "ar": "تواصل مع قسم الشحن"
      },
      "secondaryBtn": {
        "en": "Submit Order Link",
        "ku": "ناردنی بەستەری داواکاری",
        "ar": "إرسال رابط الطلب"
      }
    }
  },
  "offers": {
    "hero": {
      "badge": {
        "en": "Exclusive Discounts & Seasonal Promos",
        "ku": "داشکاندنی تایبەت و ئۆفەری وەرزی",
        "ar": "عروض حصرية وخصومات موسمية"
      },
      "title": {
        "en": "Active Shopping Offers & Shipping Deals",
        "ku": "ئۆفەرە چالاکەکانی کڕین و گەیاندن",
        "ar": "عروض التسوق وتخفيضات الشحن الحالية"
      },
      "description": {
        "en": "Save big on international freight fees, special retail holiday sales, and exclusive partner coupon codes.",
        "ku": "داشکاندنی گەورە بەدەستبهێنە لەسەر تێچووی گەیاندن و داشکاندنی وەرزی فرۆشگاکان بە کۆدی تایبەت.",
        "ar": "وفر أكثر على رسوم الشحن الدولي وتخفيضات المواسم والأعياد مع كوبونات حصرية."
      },
      "bannerImage": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80"
    },
    "featuredDeals": {
      "label": {
        "en": "Featured Highlights",
        "ku": "ئۆفەرە سەرەکییەکان",
        "ar": "أبرز العروض المميزة"
      },
      "title": {
        "en": "Limited-Time Shipping Promotions",
        "ku": "ئۆفەری کاتیی گەیاندن",
        "ar": "عروض شحن لفترة محدودة"
      },
      "subtitle": {
        "en": "Take advantage of our current seasonal discounts before they expire.",
        "ku": "سوود لە داشکاندنە وەرزییەکان وەربگرە پێش بەسەرچوونی کاتەکەیان.",
        "ar": "استفد من التخفيضات الموسمية الحالية قبل انتهاء مدتها."
      },
      "items": [
        {
          "id": "deal-1",
          "badge": {
            "en": "Special Promo",
            "ku": "ئۆفەری تایبەت",
            "ar": "عرض خاص"
          },
          "title": {
            "en": "First Order Free Delivery",
            "ku": "گەیاندنی خۆڕایی بۆ یەکەم داواکاری",
            "ar": "توصيل مجاني للطلب الأول"
          },
          "description": {
            "en": "New to OrderCenter? Enjoy free local delivery to your home in Iraq on your very first order.",
            "ku": "تازە هاتوویتە ئۆردەر سەنتەر؟ چێژ لە گەیاندنی خۆڕایی ناوخۆیی بۆ ماڵەوە وەربگرە بۆ یەکەم داواکاریت.",
            "ar": "جديد في أوردر سنتر؟ استمتع بتوصيل محلي مجاني إلى منزلك لطلبك الأول."
          },
          "discount": "FREE DELIVERY",
          "validUntil": {
            "en": "Ongoing for new members",
            "ku": "بەردەوامە بۆ ئەندامانی نوێ",
            "ar": "مستمر للأعضاء الجدد"
          },
          "code": "WELCOME2026"
        },
        {
          "id": "deal-2",
          "badge": {
            "en": "Trending Deals",
            "ku": "داشکاندنی تایبەت",
            "ar": "عروض شائعة"
          },
          "title": {
            "en": "SHEIN & Trendyol 20% Off Air Shipping",
            "ku": "٢٠٪ داشکاندن لەسەر گەیاندنی شین و ترێندیۆل",
            "ar": "خصم 20% على شحن شي إن وترينديول"
          },
          "description": {
            "en": "Get a 20% discount on air shipping weights for all clothing and fashion orders placed this week.",
            "ku": "داشکاندنی ٢٠٪ وەربگرە لەسەر کێشی باری جلوبەرگ و مۆدە بۆ هەموو داواکارییەکانی ئەم هەفتەیە.",
            "ar": "احصل على خصم 20% على وزن الشحن الجوي لكافة طلبات الملابس والأزياء لهذا الأسبوع."
          },
          "discount": "20% OFF SHIPPING",
          "validUntil": {
            "en": "Limited time seasonal deal",
            "ku": "بۆ ماوەیەکی سنووردار",
            "ar": "لفترة محدودة"
          },
          "code": "FASHION20"
        }
      ]
    },
    "storeDeals": {
      "label": {
        "en": "Partner Store Coupons",
        "ku": "کۆدی داشکاندنی فرۆشگاکان",
        "ar": "كوبونات المتاجر الشريكة"
      },
      "title": {
        "en": "Verified Store Coupons",
        "ku": "کۆپۆنی باوەڕپێکراوی فرۆشگاکان",
        "ar": "كوبونات خصم مؤكدة للمتاجر"
      },
      "subtitle": {
        "en": "Verified coupons you can apply to your product links right now.",
        "ku": "کۆپۆنی پشتڕاستکراوە کە دەتوانیت لەگەڵ بەستەرەکانت بەکاریان بهێنیت.",
        "ar": "كوبونات مؤكدة وفعالة يمكنك تطبيقها على روابط منتجاتك الآن."
      },
      "items": [
        {
          "id": "store-1",
          "storeName": "Trendyol",
          "discount": "Up to 50% Off",
          "code": "TREND50",
          "category": {
            "en": "Fashion & Shoes",
            "ku": "جلوبەرگ و پێڵاو",
            "ar": "أزياء وأحذية"
          },
          "description": {
            "en": "Huge discount on Turkish brands and seasonal trends.",
            "ku": "داشکاندنی گەورە لەسەر براندە تورکییەکان.",
            "ar": "تخفيضات هائلة على الماركات التركية والأزياء."
          }
        },
        {
          "id": "store-2",
          "storeName": "SHEIN",
          "discount": "15% Off Orders Over $50",
          "code": "SHEIN15",
          "category": {
            "en": "Clothing & Home",
            "ku": "جلوبەرگ و ماڵ",
            "ar": "ملابس ومستلزمات منزل"
          },
          "description": {
            "en": "Sitewide coupon applicable to all women, men and kids items.",
            "ku": "کۆپۆن بۆ هەموو بەشەکانی ژنان، پیاوان و منداڵان.",
            "ar": "كوبون يشمل جميع أقسام النساء والرجال والأطفال."
          }
        },
        {
          "id": "store-3",
          "storeName": "AliExpress",
          "discount": "$10 Off Over $70",
          "code": "ALIEX10",
          "category": {
            "en": "Electronics & Gadgets",
            "ku": "ئەلیکترۆنیات و کەلوپەل",
            "ar": "إلكترونيات وأجهزة"
          },
          "description": {
            "en": "Save on tech accessories, smartphone parts, and gadgets.",
            "ku": "داشکاندن لەسەر کەلوپەلی ئەلیکترۆنی و مۆبایل.",
            "ar": "وفر على ملحقات التكنولوجيا وقطع الهواتف."
          }
        }
      ]
    },
    "cta": {
      "title": {
        "en": "Found an item on sale? Do not miss the deal!",
        "ku": "کاڵایەکت بە داشکاندنەوە دۆزیوەتەوە؟ مەهێڵە لەدەستت بچێت!",
        "ar": "وجدت منتجاً بسعر مخفض؟ لا تفوت الفرصة!"
      },
      "subtitle": {
        "en": "Send us the link immediately before the store promo ends and our team will purchase it for you.",
        "ku": "ڕاستەوخۆ بەستەرەکە بنێرە پێش تەواوبوونی کاتی ئۆفەرەکە و تیمەکەمان بۆت دەیکڕن.",
        "ar": "أرسل لنا الرابط فوراً قبل انتهاء العرض في المتجر وسيقوم فريقنا بشرائه لك على الفور."
      },
      "primaryBtn": {
        "en": "Submit Deal Link",
        "ku": "ناردنی بەستەری داشکاندن",
        "ar": "إرسال رابط العرض"
      }
    }
  },
  "contact": {
    "hero": {
      "badge": {
        "en": "Customer Care & Branch Network",
        "ku": "خزمەتگوزاری کڕیاران و تۆڕی ل высەکان",
        "ar": "خدمة العملاء وشبكة الفروع"
      },
      "title": {
        "en": "Get in Touch with OrderCenter",
        "ku": "پەیوەندیمان پێوە بکە",
        "ar": "تواصل مع فريق أوردر سنتر"
      },
      "description": {
        "en": "We are here to help with your orders, price inquiries, tracking status, or commercial cargo consultations.",
        "ku": "ئێمە لێرەین بۆ هاوکاریت لەسەر داواکارییەکانت، پرسیاری نرخ، شوێنپێهەڵگرتن یان باری بازرگانی.",
        "ar": "نحن هنا لمساعدتك في استفسارات الأسعار ومتابعة الشحنات واستشارات الشحن التجاري."
      },
      "bannerImage": "https://images.unsplash.com/photo-1534536281715-e28d76689b4d?auto=format&fit=crop&w=1200&q=80"
    },
    "directChannels": {
      "phone": "+964 750 000 0000",
      "whatsapp": "+964 750 000 0000",
      "email": "support@ordercenter.iq",
      "workingHours": {
        "en": "Saturday – Thursday: 9:00 AM – 9:00 PM (Friday: Closed)",
        "ku": "شەممە – پێنجشەممە: ٩:٠٠ بەیانی – ٩:٠٠ شەو (هەینی داخراوە)",
        "ar": "السبت – الخميس: 9:00 صباحاً – 9:00 مساءً (الجمعة: عطلة)"
      },
      "supportNote": {
        "en": "Instant replies during working hours via WhatsApp and telephone.",
        "ku": "وەڵامدانەوەی خێرا لە کاتی دەوام لە ڕێگەی واتسئەپ و تەلەفۆن.",
        "ar": "رد فوري خلال ساعات العمل عبر واتساب والهاتف."
      }
    },
    "officeLocations": {
      "label": {
        "en": "Our Branches",
        "ku": "لقی ئۆفیسەکانمان",
        "ar": "فروعنا ومكاتبنا"
      },
      "title": {
        "en": "Visit Our Walk-in Centers",
        "ku": "سەردانی ئۆفیسەکانمان بکە",
        "ar": "تفضل بزيارة مراكزنا"
      },
      "items": [
        {
          "id": "loc-1",
          "city": {
            "en": "Erbil",
            "ku": "هەولێر",
            "ar": "أربيل"
          },
          "name": {
            "en": "Erbil Main Office",
            "ku": "ئۆفیسی سەرەکی هەولێر",
            "ar": "المكتب الرئيسي - أربيل"
          },
          "address": {
            "en": "60 Meter Road, Near Family Mall, Erbil, Kurdistan Region",
            "ku": "شەقامی ٦٠ مەتری، نزیک فامیلی مۆڵ، هەولێر",
            "ar": "شارع 60 متري، قرب فاميلي مول، أربيل"
          },
          "phone": "+964 750 111 2233",
          "workingHours": {
            "en": "9:00 AM – 9:00 PM",
            "ku": "٩:٠٠ بەیانی – ٩:٠٠ شەو",
            "ar": "9:00 ص – 9:00 م"
          }
        },
        {
          "id": "loc-2",
          "city": {
            "en": "Sulaymaniyah",
            "ku": "سلێمانی",
            "ar": "السليمانية"
          },
          "name": {
            "en": "Sulaymaniyah Branch",
            "ku": "لقی سلێمانی",
            "ar": "فرع السليمانية"
          },
          "address": {
            "en": "Salim Street, Near Rand Gallery, Sulaymaniyah",
            "ku": "شەقامی سالم، نزیک ڕەند گەلەری، سلێمانی",
            "ar": "شارع سالم، قرب راند غاليري، السليمانية"
          },
          "phone": "+964 770 444 5566",
          "workingHours": {
            "en": "9:00 AM – 8:30 PM",
            "ku": "٩:٠٠ بەیانی – ٨:٣٠ شەو",
            "ar": "9:00 ص – 8:30 م"
          }
        },
        {
          "id": "loc-3",
          "city": {
            "en": "Baghdad",
            "ku": "بەغدا",
            "ar": "بغداد"
          },
          "name": {
            "en": "Baghdad Distribution Hub",
            "ku": "ناوەندی دابەشکردنی بەغدا",
            "ar": "مركز توزيع بغداد"
          },
          "address": {
            "en": "Al-Mansour, 14th Ramadan Street, Baghdad",
            "ku": "مەنسوور، شەقامی ١٤ی ڕەمەزان، بەغدا",
            "ar": "المنصور، شارع 14 رمضان، بغداد"
          },
          "phone": "+964 780 777 8899",
          "workingHours": {
            "en": "9:30 AM – 8:00 PM",
            "ku": "٩:٣٠ بەیانی – ٨:٠٠ شەو",
            "ar": "9:30 ص – 8:00 م"
          }
        }
      ]
    },
    "faq": {
      "label": {
        "en": "Frequently Asked Questions",
        "ku": "پرسیارە باوەکان",
        "ar": "الأسئلة الشائعة"
      },
      "title": {
        "en": "Everything You Need to Know",
        "ku": "هەموو ئەوەی پێویستە بیزانیت",
        "ar": "كل ما تحتاج لمعرفته"
      },
      "subtitle": {
        "en": "Quick answers to common questions about international shopping and delivery to Iraq.",
        "ku": "وەڵامی خێرا بۆ پرسیارە باوەکان سەبارەت بە کڕین و گەیاندن بۆ عێراق.",
        "ar": "إجابات سريعة على الأسئلة الشائعة حول التسوق والشحن إلى العراق."
      },
      "items": [
        {
          "id": "faq-1",
          "question": {
            "en": "How do I place an order with a link?",
            "ku": "چۆن داواکاری بە بەستەر تۆمار بکەم؟",
            "ar": "كيف أقدم طلباً باستخدام الرابط؟"
          },
          "answer": {
            "en": "Simply find the item on any international website (like SHEIN, Amazon, Trendyol), copy its link, and send it to us via our online form or WhatsApp. We will reply within minutes with the exact price.",
            "ku": "کاڵاکە لە هەر ماڵپەڕێکی نێودەوڵەتی بدۆزەرەوە، بەستەرەکەی کۆپی بکە و لە فۆڕمەکە یان واتسئەپ بۆمان بنێرە. لە ماوەی چەند خولەکێکدا نرخەکەت پێ دەڵێین.",
            "ar": "ابحث عن المنتج في أي متجر عالمي، وانسخ رابطه وأرسله لنا عبر الموقع أو الواتساب، وسنوافيك بالتكلفة الدقيقة خلال دقائق."
          }
        },
        {
          "id": "faq-2",
          "question": {
            "en": "How long does shipping take to Iraq?",
            "ku": "گەیاندن بۆ عێراق چەند کات دەخایەنێت؟",
            "ar": "كم يستغرق الشحن إلى العراق؟"
          },
          "answer": {
            "en": "Standard express air shipping typically takes 7 to 12 business days from the moment the item arrives at our international transit hubs.",
            "ku": "گەیاندنی خێرای ئاسمانی بە شێوەیەکی ئاسایی ٧ تا ١٢ ڕۆژی کاری دەخایەنێت لە کاتی گەیشتنی کاڵاکە بۆ کۆگاکانی دەرەوەمان.",
            "ar": "يستغرق الشحن الجوي السريع عادة من 7 إلى 12 يوم عمل من تاريخ استلام الشحنة في مستودعاتنا الدولية."
          }
        },
        {
          "id": "faq-3",
          "question": {
            "en": "What payment methods do you accept?",
            "ku": "چ ڕێگەیەکی پارەدان وەردەگرن؟",
            "ar": "ما هي طرق الدفع المقبولة لديكم؟"
          },
          "answer": {
            "en": "We accept FIB (First Iraqi Bank), ZainCash, Qi Card, FastPay, and Cash on Delivery or Cash safe deposit at our local branches.",
            "ku": "پارەدان بە FIB، زەین کاش، کیو کارت، فاستپەی و کاش لە کاتی وەرگرتن یان لە لقەکانمان وەردەگرین.",
            "ar": "نقبل الدفع عبر FIB، زين كاش، كي كارد، فاست بي، والدفع نقداً عند الاستلام أو في فروعنا."
          }
        }
      ]
    },
    "cta": {
      "title": {
        "en": "Still have a question? Our support is live right now.",
        "ku": "هێشتا پرسیارت هەیە؟ تیمی پشتیوانیمان لەسەر هێڵن.",
        "ar": "هل لديك استفسار آخر؟ فريق الدعم متاح الآن لمساعدتك."
      },
      "subtitle": {
        "en": "Message our WhatsApp support directly for fast answers within minutes.",
        "ku": "ڕاستەوخۆ لە واتسئەپەوە نامە بنێرە بۆ وەڵامدانەوەی خێرا لە چەند خولەکێکدا.",
        "ar": "راسلنا مباشرة عبر واتساب للحصول على إجابات فورية خلال دقائق."
      },
      "primaryBtn": {
        "en": "Chat on WhatsApp",
        "ku": "گفتوگۆ لە واتسئەپ",
        "ar": "محادثة عبر واتساب"
      }
    }
  }
};

export const websiteContentApi = {
  async getContent(): Promise<WebsiteContent> {
    try {
      const res = await api.get('/website-content');
      if (res.data && res.data.data) {
        localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(res.data.data));
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend unavailable, using cached website content', err);
    }

    const cached = localStorage.getItem(WEBSITE_CONTENT_STORAGE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure steps & features have all 6 items
        if (parsed?.home?.howItWorks?.items && parsed.home.howItWorks.items.length < 6) {
          parsed.home.howItWorks.items = DEFAULT_WEBSITE_CONTENT.home.howItWorks.items;
          localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(parsed));
        }
        if (parsed?.home?.features?.items && parsed.home.features.items.length < 6) {
          parsed.home.features.items = DEFAULT_WEBSITE_CONTENT.home.features.items;
          localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(parsed));
        }
        if (!parsed?.home?.globalWebsites || !parsed.home.globalWebsites.items || parsed.home.globalWebsites.items.length === 0) {
          parsed.home.globalWebsites = DEFAULT_WEBSITE_CONTENT.home.globalWebsites;
          localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(parsed));
        } else {
          // Remove "+More" or "& More" items
          parsed.home.globalWebsites.items = parsed.home.globalWebsites.items.filter(
            (item: any) => item.name !== '& More' && item.abbr !== '+More'
          );
          localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      } catch (e) {
        // ignore
      }
    }

    return DEFAULT_WEBSITE_CONTENT;
  },

  async updateContent(data: Partial<WebsiteContent>): Promise<WebsiteContent> {
    try {
      const res = await api.put('/website-content', data);
      if (res.data && res.data.data) {
        localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(res.data.data));
        window.dispatchEvent(new Event('ordercenter_content_updated'));
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend update failed, saving to local cache', err);
    }

    const current = await this.getContent();
    const updated = {
      ...current,
      ...data,
      home: {
        ...current.home,
        ...(data.home || {})
      },
      about: {
        ...current.about,
        ...(data.about || {})
      },
      services: {
        ...current.services,
        ...(data.services || {})
      },
      offers: {
        ...current.offers,
        ...(data.offers || {})
      },
      contact: {
        ...current.contact,
        ...(data.contact || {})
      },
      general: {
        ...current.general,
        ...(data.general || {})
      }
    };
    localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('ordercenter_content_updated'));
    return updated;
  },

  async resetContent(): Promise<WebsiteContent> {
    try {
      const res = await api.post('/website-content/reset');
      if (res.data && res.data.data) {
        localStorage.setItem(WEBSITE_CONTENT_STORAGE_KEY, JSON.stringify(res.data.data));
        window.dispatchEvent(new Event('ordercenter_content_updated'));
        return res.data.data;
      }
    } catch (err) {
      console.warn('Backend reset failed, resetting local cache', err);
    }
    localStorage.removeItem(WEBSITE_CONTENT_STORAGE_KEY);
    window.dispatchEvent(new Event('ordercenter_content_updated'));
    return this.getContent();
  }
};

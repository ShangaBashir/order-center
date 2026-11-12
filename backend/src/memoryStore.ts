
function normalizeOrderStatus(st: string): string {
  if (!st) return 'Purchased';
  const lower = st.toLowerCase().trim();
  if (lower === 'purchased' || lower === 'pending') return 'Purchased';
  if (lower === 'received in warehouse' || lower === 'in office') return 'Received in Warehouse';
  if (lower === 'dispatched from warehouse' || lower === 'dispatched' || lower === 'in transit' || lower === 'shipped') return 'Dispatched from Warehouse';
  if (lower === 'arrived') return 'Arrived';
  if (lower === 'done' || lower === 'delivered' || lower === 'completed') return 'Done';
  if (lower === 'canceled' || lower === 'cancelled') return 'Canceled';
  return st;
}
import fs from 'fs';
import path from 'path';

export interface OrderData {
  _id: string;
  orderId: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  productName: string;
  productUrl: string;
  productImage: string;
  quantity: number;
  productPrice: number;
  shippingFee: number;
  totalPrice: number;
  currency: string;
  originCountry: string;
  destinationCountry: string;
  shippingMethod: string;
  trackingNumber: string;
  estimatedDelivery: string;
  approximateDeliveryDate?: string;
  status: string;
  statusHistory: Array<{ status: string; date: string | Date; note?: string }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerData {
  _id: string;
  customerId: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserData {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'user' | 'admin' | 'customer';
  isCustomer?: boolean;
  customerId?: string;
  resetPasswordCode?: string;
  resetPasswordExpires?: string;
  createdAt: string;
}

class MemoryStore {
  private users: UserData[] = [];
  private customers: CustomerData[] = [
    {
      _id: 'cust_1',
      customerId: 'SNGB-7492',
      name: 'Shanga Bashir',
      phone: '07701566233',
      email: 'shanga@example.com',
      address: 'Salim Street, Sulaimanyiah, Kurdistan Region, Iraq',
      notes: 'VIP Customer',
      createdAt: '2026-09-20T10:00:00Z',
      updatedAt: '2026-09-20T10:00:00Z',
    },
    {
      _id: 'cust_2',
      customerId: 'MDKR-4183',
      name: 'Amed Karzan',
      phone: '07511946651',
      email: 'amed.k@example.com',
      address: 'Piramagrun, Sulaimanyiah, Iraq',
      notes: '',
      createdAt: '2026-09-18T09:00:00Z',
      updatedAt: '2026-09-18T09:00:00Z',
    },
    {
      _id: 'cust_3',
      customerId: 'SRNM-9315',
      name: 'Soran Mustafa',
      phone: '07709876543',
      email: 'soran@example.com',
      address: 'Bakrajo, Sulaimanyiah, Iraq',
      notes: '',
      createdAt: '2026-09-15T12:00:00Z',
      updatedAt: '2026-09-15T12:00:00Z',
    },
    {
      _id: 'cust_4',
      customerId: 'DYRH-6824',
      name: 'Diyar Hawrami',
      phone: '07504445566',
      email: 'diyar@example.com',
      address: 'Raniya, Kurdistan Region, Iraq',
      notes: '',
      createdAt: '2026-09-24T14:00:00Z',
      updatedAt: '2026-09-24T14:00:00Z',
    },
    {
      _id: 'cust_5',
      customerId: 'LNLA-5291',
      name: 'Lina Ali',
      phone: '07712223344',
      email: 'lina@example.com',
      address: 'Tavga Street, Sulaimanyiah, Iraq',
      notes: '',
      createdAt: '2026-09-22T08:00:00Z',
      updatedAt: '2026-09-22T08:00:00Z',
    },
  ];

  private orders: OrderData[] = [
    {
      _id: 'ord_1',
      orderId: 'HB-2026-00001',
      customerName: 'Shanga Bashir',
      phone: '07701566233',
      email: 'shanga@example.com',
      address: 'Bakhtiyari, Sulaimanyiah, Iraq',
      productName: 'SHEIN Floral Summer Wrap Dress - Medium',
      productUrl: 'https://shein.com/product/123456',
      productImage: '',
      quantity: 1,
      productPrice: 35.00,
      shippingFee: 8.00,
      totalPrice: 43.00,
      currency: 'USD',
      originCountry: 'China',
      destinationCountry: 'Iraq',
      shippingMethod: 'Express Air',
      trackingNumber: 'OC-984210-CN',
      estimatedDelivery: 'Nov 04, 2026',
      status: 'Dispatched from Warehouse',
      statusHistory: [
        { status: 'Purchased', date: '2026-10-20T09:15:00Z', note: 'Purchased from SHEIN China warehouse' },
        { status: 'Received in Warehouse', date: '2026-10-23T14:30:00Z', note: 'Received & inspected at international sorting hub' },
        { status: 'Dispatched from Warehouse', date: '2026-10-27T16:45:00Z', note: 'Dispatched on flight cargo to Sulaimanyiah' },
      ],
      createdAt: '2026-10-20T09:15:00Z',
      updatedAt: '2026-10-27T16:45:00Z',
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
      estimatedDelivery: 'Oct 28, 2026',
      status: 'Done',
      statusHistory: [
        { status: 'Purchased', date: '2026-10-15T14:00:00Z', note: 'Ordered from Amazon US' },
        { status: 'Received in Warehouse', date: '2026-10-18T10:00:00Z', note: 'Received at Delaware export facility' },
        { status: 'Dispatched from Warehouse', date: '2026-10-21T08:30:00Z', note: 'Departed JFK international cargo flight' },
        { status: 'Arrived', date: '2026-10-26T12:00:00Z', note: 'Arrived at Sulaimanyiah distribution point' },
        { status: 'Done', date: '2026-10-28T16:30:00Z', note: 'Package successfully delivered to customer doorstep' },
      ],
      createdAt: '2026-10-15T14:00:00Z',
      updatedAt: '2026-10-28T16:30:00Z',
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
      estimatedDelivery: 'Oct 30, 2026',
      status: 'Arrived',
      statusHistory: [
        { status: 'Purchased', date: '2026-10-18T10:00:00Z', note: 'Purchased from Turkey' },
        { status: 'Received in Warehouse', date: '2026-10-21T12:00:00Z', note: 'Received in Istanbul warehouse hub' },
        { status: 'Dispatched from Warehouse', date: '2026-10-24T09:30:00Z', note: 'Dispatched on Turkish Airlines air freight' },
        { status: 'Arrived', date: '2026-10-28T15:10:00Z', note: 'Arrived at local office in Sulaimanyiah & ready for delivery' },
      ],
      createdAt: '2026-10-18T10:00:00Z',
      updatedAt: '2026-10-28T15:10:00Z',
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
      estimatedDelivery: 'Nov 08, 2026',
      status: 'Purchased',
      statusHistory: [
        { status: 'Purchased', date: '2026-10-29T10:00:00Z', note: 'Order registered and payment verified by admin' },
      ],
      createdAt: '2026-10-29T10:00:00Z',
      updatedAt: '2026-10-29T10:00:00Z',
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
      estimatedDelivery: 'Nov 06, 2026',
      status: 'Received in Warehouse',
      statusHistory: [
        { status: 'Purchased', date: '2026-10-24T08:00:00Z', note: 'Item ordered from manufacturer' },
        { status: 'Received in Warehouse', date: '2026-10-28T11:45:00Z', note: 'Received at Guangzhou consolidation warehouse' },
      ],
      createdAt: '2026-10-24T08:00:00Z',
      updatedAt: '2026-10-28T11:45:00Z',
    }
  ];

  private ordersFilePath = path.join(__dirname, '..', 'data', 'orders.json');
  private customersFilePath = path.join(__dirname, '..', 'data', 'customers.json');
  private usersFilePath = path.join(__dirname, '..', 'data', 'users.json');

  constructor() {
    this.initOrders();
    this.initCustomers();
    this.initUsers();
    this.initWebsiteContent();
  }

  private initOrders(): void {
    try {
      if (fs.existsSync(this.ordersFilePath)) {
        const raw = fs.readFileSync(this.ordersFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.orders = parsed;
          return;
        }
      }
      this.saveOrdersToFile();
    } catch (e) {
      console.warn('Could not load orders from disk:', e);
    }
  }

  public saveOrdersToFile(): void {
    try {
      const dir = path.dirname(this.ordersFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.ordersFilePath, JSON.stringify(this.orders, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save orders to disk:', e);
    }
  }

  private initCustomers(): void {
    try {
      if (fs.existsSync(this.customersFilePath)) {
        const raw = fs.readFileSync(this.customersFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.customers = parsed;
          return;
        }
      }
      this.saveCustomersToFile();
    } catch (e) {
      console.warn('Could not load customers from disk:', e);
    }
  }

  public saveCustomersToFile(): void {
    try {
      const dir = path.dirname(this.customersFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.customersFilePath, JSON.stringify(this.customers, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save customers to disk:', e);
    }
  }

  private initUsers(): void {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const raw = fs.readFileSync(this.usersFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          return;
        }
      }
      this.saveUsersToFile();
    } catch (e) {
      console.warn('Could not load users from disk:', e);
    }
  }

  public saveUsersToFile(): void {
    try {
      const dir = path.dirname(this.usersFilePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.usersFilePath, JSON.stringify(this.users, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save users to disk:', e);
    }
  }

  public getNextOrderId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let candidateId = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 100) {
      attempts++;
      let randomStr = '';
      for (let i = 0; i < 8; i++) {
        randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      candidateId = `ORD-${randomStr}`;
      exists = this.orders.some(o => o.orderId === candidateId);
    }
    return candidateId;
  }

  public getAllOrders(): OrderData[] {
    return [...this.orders].sort((a, b) => {
      const timeA = Math.max(new Date(a.updatedAt || a.createdAt || 0).getTime(), new Date(a.createdAt || 0).getTime());
      const timeB = Math.max(new Date(b.updatedAt || b.createdAt || 0).getTime(), new Date(b.createdAt || 0).getTime());
      return timeB - timeA;
    });
  }

  public findOrder(query: string): OrderData | undefined {
    const q = query.trim().toLowerCase();
    return this.orders.find(o => 
      (o.orderId && o.orderId.toLowerCase() === q) || 
      (o.trackingNumber && o.trackingNumber.toLowerCase() === q) ||
      o._id === q
    );
  }

  public addOrder(data: Partial<OrderData>): OrderData {
    const newOrderId = data.orderId ? data.orderId.trim() : this.getNextOrderId();
    const now = new Date().toISOString();
    const newOrder: OrderData = {
      _id: data._id || `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId: newOrderId,
      customerId: data.customerId || '',
      customerName: data.customerName || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      productName: data.productName || '',
      productUrl: data.productUrl || '',
      productImage: data.productImage || '',
      quantity: Number(data.quantity) || 1,
      productPrice: Number(data.productPrice) || 0,
      shippingFee: Number(data.shippingFee) || 0,
      totalPrice: data.totalPrice !== undefined ? Number(data.totalPrice) : ((Number(data.quantity) || 1) * (Number(data.productPrice) || 0) + (Number(data.shippingFee) || 0)),
      currency: data.currency || 'USD',
      originCountry: data.originCountry || 'China',
      destinationCountry: data.destinationCountry || 'Iraq',
      shippingMethod: data.shippingMethod || 'Express Air',
      trackingNumber: data.trackingNumber || '',
      estimatedDelivery: data.estimatedDelivery || '',
      approximateDeliveryDate: data.approximateDeliveryDate || '',
      status: normalizeOrderStatus(data.status || 'Purchased'),
      statusHistory: data.statusHistory && data.statusHistory.length > 0 ? data.statusHistory : [
        {
          status: normalizeOrderStatus(data.status || 'Purchased'),
          date: now,
          note: 'Order registered in admin dashboard'
        }
      ],
      notes: data.notes || '',
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    this.orders.unshift(newOrder);
    this.saveOrdersToFile();
    return newOrder;
  }

  public updateOrder(orderId: string, updates: Partial<OrderData>): OrderData | null {
    const q = orderId.trim().toLowerCase();
    const index = this.orders.findIndex(o => 
      (o.orderId && o.orderId.toLowerCase() === q) || 
      (o.trackingNumber && o.trackingNumber.toLowerCase() === q) || 
      o._id === orderId ||
      (o._id && o._id.toLowerCase() === q)
    );
    if (index === -1) return null;

    const ord = this.orders[index];
    const now = new Date().toISOString();

    if (updates.status && updates.status !== ord.status) {
      const normalizedStatus = normalizeOrderStatus(updates.status);
      ord.statusHistory = ord.statusHistory || [];
      ord.statusHistory.push({
        status: normalizedStatus,
        date: now,
        note: updates.statusHistory?.[updates.statusHistory.length - 1]?.note || `Status updated to ${normalizedStatus}`
      });
      ord.status = normalizedStatus;
    }

    const preservedId = ord.orderId;
    const preservedDocId = ord._id;
    const preservedCreated = ord.createdAt || now;

    Object.assign(ord, updates, { 
      orderId: preservedId,
      _id: preservedDocId,
      createdAt: preservedCreated,
      updatedAt: now 
    });

    this.orders[index] = ord;
    this.saveOrdersToFile();
    return ord;
  }

  public updateOrderStatus(orderId: string, status: string, note?: string): OrderData | null {
    const q = orderId.trim().toLowerCase();
    const index = this.orders.findIndex(o => 
      (o.orderId && o.orderId.toLowerCase() === q) || 
      (o.trackingNumber && o.trackingNumber.toLowerCase() === q) || 
      o._id === orderId ||
      (o._id && o._id.toLowerCase() === q)
    );
    if (index === -1) return null;

    const ord = this.orders[index];
    const now = new Date().toISOString();
    const normalized = normalizeOrderStatus(status);
    ord.status = normalized;
    ord.statusHistory = ord.statusHistory || [];
    ord.statusHistory.push({
      status: normalized,
      date: now,
      note: note || `Status updated to ${normalized}`
    });
    ord.updatedAt = now;
    this.orders[index] = ord;
    this.saveOrdersToFile();
    return ord;
  }

  public deleteOrder(orderId: string): boolean {
    const q = orderId.trim().toLowerCase();
    const initialLen = this.orders.length;
    this.orders = this.orders.filter(o => 
      (o.orderId && o.orderId.toLowerCase() !== q) && 
      (o.trackingNumber && o.trackingNumber.toLowerCase() !== q) && 
      o._id !== orderId &&
      (o._id && o._id.toLowerCase() !== q)
    );
    if (this.orders.length < initialLen) {
      this.saveOrdersToFile();
      return true;
    }
    return false;
  }

  // Customer Methods
  public getAllCustomers(): CustomerData[] {
    const seen = new Set<string>();
    return this.customers.filter(c => {
      const key = c.customerId || c._id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  public getCustomer(idOrCustomerId: string): CustomerData | undefined {
    return this.customers.find(
      c => c.customerId.toLowerCase() === idOrCustomerId.toLowerCase() || c._id === idOrCustomerId
    );
  }

  public generateCustomerId(name?: string): string {
    let prefix = '';
    if (name && name.trim()) {
      const clean = name.trim().toUpperCase().replace(/[^A-Z]/g, '');
      const consonants = clean.replace(/[AEIOU]/g, '');
      const source = consonants.length >= 4 ? consonants : clean;
      prefix = source.slice(0, 4);
    }

    const alpha = 'BCDFGHJKLMNPQRSTVWXYZ';
    while (prefix.length < 4) {
      prefix += alpha.charAt(Math.floor(Math.random() * alpha.length));
    }

    const existingIds = this.customers.map(c => c.customerId);
    let fullId = '';
    do {
      const num = Math.floor(1000 + Math.random() * 9000);
      fullId = `${prefix}-${num}`;
    } while (existingIds.includes(fullId));

    return fullId;
  }

  public addCustomer(data: Omit<CustomerData, '_id' | 'createdAt' | 'updatedAt' | 'customerId'> & { customerId?: string }): CustomerData {
    const now = new Date().toISOString();
    const newId = data.customerId || this.generateCustomerId(data.name);
    
    const existing = this.customers.find(c => c.customerId === newId);
    if (existing) {
      Object.assign(existing, data, { updatedAt: now });
      this.saveCustomersToFile();
      return existing;
    }

    const customer: CustomerData = {
      _id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customerId: newId,
      name: data.name,
      phone: data.phone,
      secondaryPhone: data.secondaryPhone || '',
      email: data.email || '',
      address: data.address,
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };
    this.customers.unshift(customer);
    this.saveCustomersToFile();
    return customer;
  }

  public updateCustomer(idOrCustomerId: string, data: Partial<CustomerData>): CustomerData | null {
    const index = this.customers.findIndex(
      c => c.customerId.toLowerCase() === idOrCustomerId.toLowerCase() || c._id === idOrCustomerId
    );
    if (index === -1) return null;
    const cust = this.customers[index];
    Object.assign(cust, data, { updatedAt: new Date().toISOString() });
    this.customers[index] = cust;
    this.saveCustomersToFile();
    return cust;
  }

  public deleteCustomer(idOrCustomerId: string): boolean {
    const initialLen = this.customers.length;
    this.customers = this.customers.filter(
      c => c.customerId.toLowerCase() !== idOrCustomerId.toLowerCase() && c._id !== idOrCustomerId
    );
    if (this.customers.length < initialLen) {
      this.saveCustomersToFile();
      return true;
    }
    return false;
  }

  public findCustomerById(idOrCustomerId: string): CustomerData | null {
    if (!idOrCustomerId) return null;
    const clean = idOrCustomerId.trim().toLowerCase();
    return this.customers.find(
      c => c.customerId.toLowerCase() === clean || c._id.toLowerCase() === clean
    ) || null;
  }

  public findUserById(id: string): UserData | null {
    if (!id) return null;
    return this.users.find(u => u._id === id) || null;
  }

  public updateUser(idOrEmail: string, update: Partial<UserData>): UserData | null {
    if (!idOrEmail) return null;
    const clean = idOrEmail.trim().toLowerCase();
    const index = this.users.findIndex(u => u._id === idOrEmail || u.email.toLowerCase() === clean);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...update };
    this.saveUsersToFile();
    return this.users[index];
  }

  public findUserByEmail(email: string): UserData | null {
    const clean = email.trim().toLowerCase();
    const found = this.users.find(u => u.email.toLowerCase() === clean);
    if (found) return found;
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const raw = fs.readFileSync(this.usersFilePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.users = parsed;
          return this.users.find(u => u.email.toLowerCase() === clean) || null;
        }
      }
    } catch (e) {}
    return null;
  }

  public addUser(user: Omit<UserData, '_id' | 'createdAt'>): UserData {
    const newUser: UserData = {
      ...user,
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    this.saveUsersToFile();
    return newUser;
  }

  // --------------------------------------------------------------------------
  // Website CMS Dynamic Content Storage
  // --------------------------------------------------------------------------
  private websiteContentPath = path.join(__dirname, '..', 'data', 'websiteContent.json');
  private websiteContent: any = null;

  private getDefaultWebsiteContent() {
    return {
      home: {
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
            "bannerImage": "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80"
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
                  "en": "Get your favourite international items delivered in 4 effortless steps.",
                  "ku": "کاڵا نێودەوڵەتییە دڵخوازەکانت بە ٤ هەنگاوی ئاسان وەربگرە.",
                  "ar": "احصل على منتجاتك العالمية المفضلة من خلال 4 خطوات سهلة للغاية."
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
                              "en": "Delivery To Your Door",
                              "ku": "گەیاندن بۆ بەردەرگات",
                              "ar": "توصيل لباب منزلك"
                        },
                        "description": {
                              "en": "Track progress live online until your package is handed over right to your door.",
                              "ku": "بە شێوەی ڕاستەوخۆ شوێنپێی هەڵبگرە تا ئەو کاتەی دەگاتە بەردەرگاکەت.",
                              "ar": "تتبع خط سير الشحنة مباشرة حتى وصولها إلى باب بيتك."
                        },
                        "icon": "Package"
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
      services: {
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
      offers: {
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
      contact: {
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
            "phone": "0770 156 6233",
            "secondaryPhone": "0751 194 6651",
            "whatsapp": "0770 156 6233",
            "email": "Wazhamyassin98@gmail.com",
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
      "inquiryForm": {
            "badge": {
                  "en": "Direct Assistance",
                  "ku": "هاوکاری ڕاستەوخۆ",
                  "ar": "مساعدة مباشرة"
            },
            "title": {
                  "en": "Send Us a Direct Inquiry",
                  "ku": "پەیامێکی ڕاستەوخۆمان بۆ بنێرە",
                  "ar": "أرسل لنا استفساراً مباشراً"
            },
            "description": {
                  "en": "Fill in your details below and we will connect with you right away.",
                  "ku": "زانیارییەکانت لە خوارەوە پڕبکەرەوە و دەستبەجێ پەیوەندیت پێوە دەکەین.",
                  "ar": "املأ بياناتك أدناه وسنتواصل معك على الفور."
            },
            "submitButtonText": {
                  "en": "Send Message",
                  "ku": "ناردنی پەیام",
                  "ar": "إرسال الرسالة"
            },
            "successTitle": {
                  "en": "Message Sent Successfully!",
                  "ku": "پەیامەکەت بە سەرکەوتوویی نێردرا!",
                  "ar": "تم إرسال الرسالة بنجاح!"
            },
            "successMessage": {
                  "en": "Thank you for reaching out. A WhatsApp chat was initiated with our support desk, and one of our logistics specialists will assist you momentarily.",
                  "ku": "سوپاس بۆ پەیوەندیکردنت. چاتی واتسئەپ دەستی پێکرد و پسپۆڕەکانمان هاوکاریت دەکەن.",
                  "ar": "شكراً لتواصلك معنا. تم فتح محادثة واتساب وسيقوم أحد خبرائنا بمساعدتك فوراً."
            }
      },
      "officeLocations": {
            "label": {
                  "en": "Official Headquarters",
                  "ku": "ئۆفیسی فەرمی",
                  "ar": "المقر الرسمي"
            },
            "title": {
                  "en": "Visit Our Sulaymaniyah Center",
                  "ku": "سەردانی لقی سلێمانیمان بکە",
                  "ar": "تفضل بزيارة مركز السليمانية"
            },
            "description": {
                  "en": "Visit our physical office in Sulaymaniyah for parcel pick-up, local payment, or in-person logistics consultations.",
                  "ku": "سەردانی ئۆفیسی سلێمانی بکە بۆ وەرگرتنی کەرەستەکان، پارەدان، یان ڕاوێژکاری بارکردن.",
                  "ar": "تفضل بزيارة مكتبنا الفعلي في السليمانية لاستلام الطرود أو الدفع المحلي أو الاستشارات اللوجستية."
            },
            "items": [
                  {
                        "id": "loc-sulaimany",
                        "city": {
                              "en": "Sulaymaniyah, Iraq",
                              "ku": "سلێمانی، عێراق",
                              "ar": "السليمانية، العراق"
                        },
                        "name": {
                              "en": "Order Center — Sulaimany Hub",
                              "ku": "ئۆردەر سەنتەر — لقی سلێمانی",
                              "ar": "أوردر سنتر — فرع السليمانية"
                        },
                        "address": {
                              "en": "Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq",
                              "ku": "بەختیاری، نزیک خواردنی خێرای فەلافێلۆ، سلێمانی، عێراق",
                              "ar": "بختياري، قرب وجبات فلافيلو السريعة، السليمانية، العراق"
                        },
                        "district": {
                              "en": "Bakhtyari",
                              "ku": "بەختیاری",
                              "ar": "بختياري"
                        },
                        "landmark": {
                              "en": "Near Falafelo Fast Food",
                              "ku": "نزیک خواردنی خێرای فەلافێلۆ",
                              "ar": "قرب وجبات فلافيلو السريعة"
                        },
                        "phone": "0770 156 6233",
                        "workingHours": {
                              "en": "9:00 AM – 9:00 PM",
                              "ku": "٩:٠٠ بەیانی – ٩:٠٠ شەو",
                              "ar": "9:00 ص – 9:00 م"
                        },
                        "mapCoordinates": "35.5712825,45.3985297",
                        "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297"
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
},
      about: {
        hero: {
          badge: {
            en: 'About OrderCenter',
            ku: 'دەربارەی ئۆردەر سەنتەر',
            ar: 'عن أوردر سنتر'
          },
          title: {
            en: 'About Us',
            ku: 'دەربارەی ئێمە',
            ar: 'من نحن'
          },
          description: {
            en: 'Your trusted bridge between global online marketplaces and your doorstep. We simplify international shopping and make it accessible to everyone.',
            ku: 'پردی متمانەپێکراوی نێوان بازاڕە جیهانییەکان و بەردەرگاکەت. ئێمە کڕینی نێودەوڵەتی ئاسان دەکەین و دەیخەینە بەردەستی هەمووان.',
            ar: 'جسرك الموثوق بين الأسواق الإلكترونية العالمية وعتبة دارك. نبسط التسوق الدولي ونجعله في متناول الجميع.'
          },
          bannerImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
        },
        whoWeAre: {
          label: {
            en: 'Who We Are',
            ku: 'ئێمە کێین',
            ar: 'من نكون'
          },
          title: {
            en: 'Who We Are',
            ku: 'ئێمە کێین',
            ar: 'من نكون'
          },
          paragraph1: {
            en: 'OrderCenter is a premier international shopping and shipping service dedicated to bridging the gap between global e-commerce and local customers. We were founded with a simple but powerful vision: make the world\'s best products accessible to everyone, regardless of geographical boundaries.',
            ku: 'ئۆردەر سەنتەر خزمەتگوزارییەکی پێشەنگی کڕین و گەیاندنی نێودەوڵەتییە کە تەرخانکراوە بۆ پڕکردنەوەی بۆشایی نێوان بازرگانی ئەلیکترۆنی جیهانی و کڕیارانی ناوخۆیی. ئێمە بە دیدگایەکی سادە بەڵام بەهێز دامەزراین: بەردەستکردنی باشترین بەرهەمەکانی جیهان بۆ هەمووان، بەبێ گوێدانە سنوورە جوگرافییەکان.',
            ar: 'أوردر سنتر هي خدمة رائدة في التسوق والشحن الدولي مكرسة لسد الفجوة بين التجارة الإلكترونية العالمية والعملاء المحليين. تأسسنا برؤية بسيطة ولكنها قوية: جعل أفضل منتجات العالم في متناول الجميع، بغض النظر عن الحدود الجغرافية.'
          },
          paragraph2: {
            en: 'Based in the Kurdistan Region of Iraq, we serve customers across the region by purchasing products from leading international platforms including SHEIN, Amazon, Alibaba, AliExpress, Temu, eBay, and more — then handling all shipping logistics to deliver directly to your door.',
            ku: 'لە هەرێمی کوردستانی عێراق کاردەکەین، خزمەتی کڕیاران دەکەین لە سەرانسەری ناوچەکە لە ڕێگەی کڕینی کاڵا لە بەناوبانگترین پلاتفۆرمە جیهانییەکان لەوانە شین، ئەمازۆن، عەلی بابا، عەلی ئێکسپرێس، تێمۆ، ئی بەی، و هتد — پاشان سەرپەرشتی هەموو قۆناغەکانی گەیاندن دەکەین تا بەردەرگات.',
            ar: 'انطلاقاً من إقليم كوردستان العراق، نخدم العملاء في جميع أنحاء المنطقة من خلال شراء المنتجات من المنصات العالمية الرائدة بما في ذلك شي إن، أمازون، علي بابا، علي إكسبرس، تيمو، إيباي، والمزيد — ثم إدارة جميع العمليات اللوجستية للشحن لتوصيلها إلى باب منزلك مباشرة.'
          },
          cardTitle: {
            en: 'Global Shopping,',
            ku: 'کڕینی جیهانی،',
            ar: 'تسوق عالمي،'
          },
          cardHighlight: {
            en: 'Locally Delivered',
            ku: 'گەیاندنی ناوخۆیی',
            ar: 'توصيل محلي'
          },
          cardDescription: {
            en: 'We connect you with 50+ international platforms and handle every step of the journey.',
            ku: 'ئێمە پەیوەندیت پێوە دەکەین بە زیاتر لە ٥٠ وێبسایتی جیهانی و هەموو هەنگاوێکی گەشتەکە دەگرینە ئەستۆ.',
            ar: 'نربطك بأكثر من 50 منصة دولية ونتولى كل خطوة في هذه الرحلة.'
          },
          image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
          stats: [
            { id: 'stat_1', value: '5+', label: { en: 'Years', ku: 'ساڵ ئەزموون', ar: 'سنوات خبرة' } },
            { id: 'stat_2', value: '10K+', label: { en: 'Orders', ku: 'داواکاری سەرکەوتوو', ar: 'طلب مكتمل' } },
            { id: 'stat_3', value: '50+', label: { en: 'Websites', ku: 'ماڵپەڕی جیهانی', ar: 'موقع إلكتروني' } }
          ]
        },
        whatWeDo: {
          label: {
            en: 'What We Do',
            ku: 'چی دەکەین',
            ar: 'ماذا نفعل'
          },
          title: {
            en: 'What We Do',
            ku: 'چی دەکەین',
            ar: 'ماذا نفعل'
          },
          subtitle: {
            en: 'We act as your personal international shopping agent — handling everything from purchase to delivery.',
            ku: 'ئێمە وەک بریکاری کەسی کڕینی نێودەوڵەتیت کاردەکەین — هەموو شتێک لە کڕینەوە تا گەیاندن دەگرینە ئەستۆ.',
            ar: 'نعمل كوكيلك الشخصي للتسوق الدولي — ونتولى كل شيء من الشراء حتى التوصيل.'
          },
          items: [
            {
              id: 'wwd_1',
              icon: 'ShieldCheck',
              title: { en: 'International Purchasing', ku: 'کڕینی نێودەوڵەتی', ar: 'الشراء الدولي' },
              description: {
                en: 'We buy products from any global website on your behalf, handling payment, communication, and all purchasing details.',
                ku: 'ئێمە کاڵاکان لە هەر ماڵپەڕێکی جیهانییەوە لە جیاتی تۆ دەکڕین، پارەدان و پەیوەندی و هەموو وردەکارییەکانی کڕین جێبەجێ دەکەین.',
                ar: 'نشتري المنتجات من أي موقع عالمي بالنيابة عنك، مع إدارة الدفع والتواصل وجميع تفاصيل الشراء.'
              }
            },
            {
              id: 'wwd_2',
              icon: 'Globe',
              title: { en: 'Customs & Logistics', ku: 'گومرگ و لۆجستی', ar: 'الجمارك واللوجستيات' },
              description: {
                en: 'We manage all customs clearance, import documentation, and international logistics so you don\'t have to worry about a thing.',
                ku: 'سەرپەرشتی هەموو ڕێکارەکانی گومرگ و بەڵگەنامەکانی هاوردەکردن و لۆجستی نێودەوڵەتی دەکەین تا تۆ بێ خەم بیت.',
                ar: 'ندير جميع إجراءات التخليص الجمركي ومستندات الاستيراد والخدمات اللوجستية الدولية حتى لا تقلق بشأن أي شيء.'
              }
            },
            {
              id: 'wwd_3',
              icon: 'Star',
              title: { en: 'Quality Control', ku: 'کۆنتڕۆڵی کوالێتی', ar: 'مراقبة الجودة' },
              description: {
                en: 'Before shipping, we inspect your products to ensure they match your order and meet our quality standards.',
                ku: 'پێش بارکردن و گەیاندن، پشکنین بۆ کاڵاکانت دەکەین دڵنیادەبینەوە لەوەی لەگەڵ داواکارییەکەت و کوالێتی بەرزمانی دەگونجێت.',
                ar: 'قبل الشحن، نقوم بفحص منتجاتك للتأكد من مطابقتها لطلبك واستيفائها لمعايير الجودة لدينا.'
              }
            },
            {
              id: 'wwd_4',
              icon: 'ArrowRight',
              title: { en: 'Last-Mile Delivery', ku: 'گەیاندن تا بەردەرگا', ar: 'التوصيل حتى باب المنزل' },
              description: {
                en: 'We deliver your package directly to your door with full tracking and customer notifications at every step.',
                ku: 'بستەکەت ڕاستەوخۆ دەگەیەنینە بەردەم دەرگات لەگەڵ شوێنپێهەڵگرتنی تەواو و ئاگادارکردنەوەی کڕیار لە هەموو هەنگاوێکدا.',
                ar: 'نوصل طردك مباشرة إلى باب بيتك مع ميزة التتبع الكامل وإشعارات فورية في كل مرحلة.'
              }
            }
          ]
        },
        missionVision: {
          missionTitle: {
            en: 'Our Mission',
            ku: 'ئامانجمان',
            ar: 'مهمتنا'
          },
          missionDescription: {
            en: 'To simplify international shopping for our customers by providing a reliable, transparent, and affordable service that connects them with the world\'s best products. We are committed to removing barriers and making global e-commerce accessible to everyone in our region.',
            ku: 'ئاسانکردنی کڕینی نێودەوڵەتی بۆ کڕیارانمان لە ڕێگەی دابینکردنی خزمەتگوزارییەکی باوەڕپێکراو، ڕوون و هەرزان کە ئەوان بە باشترین بەرهەمەکانی جیهانەوە دەبەستێتەوە. ئێمە پابەندین بە لابردنی بەربەستەکان و بەردەستکردنی بازرگانی ئەلیکترۆنی جیهانی بۆ هەمووان لە ناوچەکەماندا.',
            ar: 'تبسيط التسوق الدولي لعملائنا من خلال تقديم خدمة موثوقة وشفافة وبأسعار معقولة تربطهم بأفضل المنتجات في العالم. نحن ملتزمون بإزالة العوائق وجعل التجارة الإلكترونية العالمية متاحة للجميع في منطقتنا.'
          },
          visionTitle: {
            en: 'Our Vision',
            ku: 'دیدگامان',
            ar: 'رؤيتنا'
          },
          visionDescription: {
            en: 'To become the leading international shopping and shipping service in the region, known for our excellence, reliability, and customer-first approach. We envision a future where every customer can access any product from anywhere in the world with complete ease and confidence.',
            ku: 'بوون بە پێشەنگترین خزمەتگوزاری کڕین و بارکردنی نێودەوڵەتی لە ناوچەکەدا، کە ناسراو بێت بە لێهاتوویی، باوەڕپێکراوی، و گرنگیدان بە کڕیار لە پلەی یەکەمدا. دیدگامان داهاتوویەکە کە هەر کڕیارێک بتوانێت بە ئاسانی و متمانەی تەواوەوە دەستی بگات بە هەر بەرهەمێک لە هەر شوێنێکی جیهانەوە.',
            ar: 'أن نصبح الخدمة الرائدة في مجال التسوق والشحن الدولي في المنطقة، المشهود لها بالتميز والموثوقية والنهج الذي يضع العميل أولاً. نتطلع إلى مستقبل يمكن فيه لأي عميل الوصول إلى أي منتج من أي مكان في العالم بكل سهولة وثقة.'
          }
        },
        values: {
          label: {
            en: 'Our Values',
            ku: 'بەهاکانمان',
            ar: 'قيمنا'
          },
          title: {
            en: 'Our Values',
            ku: 'بەهاکانمان',
            ar: 'قيمنا'
          },
          items: [
            {
              id: 'val_1',
              icon: 'ShieldCheck',
              title: { en: 'Trust & Transparency', ku: 'متمانە و ڕوونی', ar: 'الثقة والشفافية' },
              description: {
                en: 'We believe in honest pricing, clear communication, and no hidden fees. Every transaction is transparent from start to finish.',
                ku: 'باوەڕمان بە نرخێکی دادپەروەرانە، پەیوەندییەکی ڕوون، و بەبێ هیچ تێچوویەکی شاراوەیە. هەموو مامەڵەیەک لە سەرەتاوە تا کۆتایی شەفافە.',
                ar: 'نؤمن بالتسعير العادل والتواصل الواضح والابتعاد عن الرسوم المخفية. كل معاملة تتسم بالشفافية من البداية إلى النهاية.'
              }
            },
            {
              id: 'val_2',
              icon: 'Star',
              title: { en: 'Quality Service', ku: 'خزمەتگوزاری کوالێتی بەرز', ar: 'جودة الخدمة' },
              description: {
                en: 'We maintain the highest standards in every interaction, from handling your products with care to delivering them safely.',
                ku: 'بەرزترین پێوەرەکان لە هەموو پەیوەندییەکدا دەپارێزین، لە پاراستنی کاڵاکانت بە وریاییەوە تا گەیاندنیان بە سەلامەتی.',
                ar: 'نحافظ على أعلى المعايير في كل تعامل، بدءاً من الاعتناء بمنتجاتك بدقة وحتى تسليمها بأمان تام.'
              }
            },
            {
              id: 'val_3',
              icon: 'Heart',
              title: { en: 'Customer First', ku: 'کڕیار لە پێشینەیە', ar: 'العميل أولاً' },
              description: {
                en: 'Our customers are at the heart of everything we do. We go above and beyond to ensure complete satisfaction.',
                ku: 'کڕیارانمان لە دڵی هەموو کارێکدان کە دەیکەین. هەموو هەوڵێک دەدەین بۆ دەستەبەرکردنی ڕەزامەندی تەواوی تۆ.',
                ar: 'عملاؤنا هم جوهر كل ما نقوم به. نبذل قصارى جهدنا لضمان رضاكم التام وسعادتكم.'
              }
            },
            {
              id: 'val_4',
              icon: 'Globe',
              title: { en: 'Global Reach', ku: 'دەستڕاگەیشتنی جیهانی', ar: 'انتشار عالمي' },
              description: {
                en: 'We connect you with the world\'s best products, breaking down geographical barriers to bring international shopping within reach.',
                ku: 'تۆ بە باشترین بەرهەمەکانی جیهانەوە دەبەستینەوە، بەربەستە جوگرافییەکان تێکدەشکێنین تا کڕینی نێودەوڵەتی بکەینە دەستپێگەیشتوو.',
                ar: 'نربطك بأفضل المنتجات العالمية، متجاوزين الحواجز الجغرافية لنجعل التسوق الدولي في متناول يدك.'
              }
            }
          ]
        },
        process: {
          label: {
            en: 'Our Process',
            ku: 'هەنگاوەکانی کارکردنمان',
            ar: 'خطوات العمل'
          },
          title: {
            en: 'Our Process',
            ku: 'هەنگاوەکانی کارکردنمان',
            ar: 'خطوات العمل'
          },
          subtitle: {
            en: 'The complete journey from your product discovery to your doorstep.',
            ku: 'گەشتی تەواو لە دۆزینەوەی کاڵاکەتەوە تا گەیشتن بە بەردەرگات.',
            ar: 'الرحلة الكاملة من لحظة اختيار المنتج حتى وصوله إلى بابك.'
          },
          items: [
            { id: 'step_1', stepNumber: 1, label: { en: 'Global Website', ku: 'وێبسایتی جیهانی', ar: 'موقع عالمي' }, description: { en: 'Browse and choose any item', ku: 'گەڕان و هەڵبژاردنی کاڵا', ar: 'تصفح واختيار أي منتج' }, icon: 'Globe', color: 'bg-brand text-white' },
            { id: 'step_2', stepNumber: 2, label: { en: 'Purchase', ku: 'کڕینی کاڵا', ar: 'الشراء والدفع' }, description: { en: 'We buy it securely on your behalf', ku: 'بۆت دەکڕین بە شێوەیەکی پارێزراو', ar: 'نشتريه بأمان نيابة عنك' }, icon: 'ShieldCheck', color: 'bg-gold text-charcoal' },
            { id: 'step_3', stepNumber: 3, label: { en: 'International Shipping', ku: 'بارکردنی نێودەوڵەتی', ar: 'الشحن الدولي' }, description: { en: 'Swift transit to our central hub', ku: 'گواستنەوەی خێرا بۆ کۆگای سەرەکی', ar: 'شحن سريع إلى مستودعنا' }, icon: 'Plane', color: 'bg-brand text-white' },
            { id: 'step_4', stepNumber: 4, label: { en: 'Tracking', ku: 'شوێنپێهەڵگرتن', ar: 'تتبع الشحنة' }, description: { en: 'Live updates from start to finish', ku: 'ئاگاداری ڕاستەوخۆ تا گەیشتن', ar: 'تحديثات حية ومستمرة' }, icon: 'Search', color: 'bg-gold text-charcoal' },
            { id: 'step_5', stepNumber: 5, label: { en: 'Local Delivery', ku: 'گەیاندنی ناوخۆیی', ar: 'التوصيل المحلي' }, description: { en: 'Safe doorstep courier service', ku: 'گەیاندنی پارێزراو بۆ ماڵەوە', ar: 'توصيل آمن إلى منزلك' }, icon: 'Truck', color: 'bg-brand text-white' },
            { id: 'step_6', stepNumber: 6, label: { en: 'Customer', ku: 'کڕیار / وەرگرتن', ar: 'استلام العميل' }, description: { en: 'Handed over directly to you', ku: 'ڕادەستکردنی ڕاستەوخۆ بە تۆ', ar: 'تسليم المنتج ليدك' }, icon: 'Users', color: 'bg-gold text-charcoal' }
          ]
        },
        pictures: [
          {
            id: 'pic_hero',
            category: 'Hero Banner',
            title: { en: 'Hero Background / Network', ku: 'وێنەی سەرەکی تۆڕی جیهانی', ar: 'صورة الواجهة الرئيسية' },
            imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
            caption: { en: 'Global Logistics Network', ku: 'تۆڕی لۆجستی جیهانی', ar: 'شبكة اللوجستيات العالمية' }
          },
          {
            id: 'pic_who',
            category: 'Who We Are',
            title: { en: 'Who We Are Card & Showcase', ku: 'وێنەی پڕۆفایلی ئێمە کێین', ar: 'صورة قسم من نحن' },
            imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80',
            caption: { en: 'Warehouse & Global Distribution', ku: 'کۆگاو دابەشکردنی جیهانی', ar: 'المستودعات والتوزيع العالمي' }
          },
          {
            id: 'pic_mission',
            category: 'Mission & Vision',
            title: { en: 'Customer Care & Operation Center', ku: 'تیمی کارپێکردن و خزمەتگوزاری', ar: 'فريق العمليات والخدمة' },
            imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
            caption: { en: 'Dedicated Operations & Service', ku: 'تیمی بەردەوام لە خزمەتتدا', ar: 'عمليات مخصصة لخدمتكم' }
          },
          {
            id: 'pic_delivery',
            category: 'Process & Delivery',
            title: { en: 'Doorstep Courier & Packaging', ku: 'گەیاندنی خێرا بۆ بەردەرگا', ar: 'توصيل وتغليف متميز' },
            imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
            caption: { en: 'Secure, inspected doorstep delivery', ku: 'گەیاندنی پارێزراوی پشکنراو', ar: 'توصيل مفحوص وآمن' }
          }
        ],
        cta: {
          title: {
            en: 'Ready to Start Shopping?',
            ku: 'ئامادەیت بۆ دەستپێکردنی کڕین؟',
            ar: 'هل أنت مستعد لبدء التسوق؟'
          },
          subtitle: {
            en: 'Join thousands of satisfied customers who trust us with their international shopping needs.',
            ku: 'بەشداربە لەگەڵ هەزاران کڕیاری ڕازی کە متمانەیان پێمان بەخشیوە بۆ پێداویستییە نێودەوڵەتییەکانیان.',
            ar: 'انضم إلى آلاف العملاء الراضين الذين يثقون بنا لتلبية جميع احتياجاتهم في التسوق الدولي.'
          },
          primaryBtn: {
            en: 'Explore Services',
            ku: 'خزمەتگوزارییەکان ببینە',
            ar: 'استكشف الخدمات'
          },
          secondaryBtn: {
            en: 'Contact Us',
            ku: 'پەیوەندیمان پێوە بکە',
            ar: 'اتصل بنا'
          }
        }
      },
      general: {
        companyName: {
          en: 'Order Center',
          ku: 'ئۆردەر سەنتەر',
          ar: 'أوردر سنتر'
        },
        footerDescription: {
          en: "Your trusted partner for international shopping and shipping. We bring the world's best products to your doorstep.",
          ku: "هاوبەشی باوەڕپێکراوت بۆ کڕین و گەیاندنی نێودەوڵەتی. باشترین بەرهەمەکانی جیهان دەهێنینە بەردەرگاکەت.",
          ar: "شريكك الموثوق للتسوق والشحن الدولي. نجلب أفضل منتجات العالم إلى بابك."
        },
        tagline: {
          en: 'Global Shopping & Shipping',
          ku: 'کڕین و گەیاندنی نێودەوڵەتی',
          ar: 'التسوق والشحن الدولي'
        },
        phone: '0770 156 6233',
        secondaryPhone: '0751 194 6651',
        whatsapp: '0770 156 6233',
        email: 'Wazhamyassin98@gmail.com',
        location: {
          en: 'Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq',
          ku: 'بەختیاری، نزیک خواردنی خێرای فەلافێلۆ، سلێمانی، عێراق',
          ar: 'بختياري، قرب وجبات فلافيلو السريعة، السليمانية، العراق'
        },
        googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297'
      }
    };
  }

  private initWebsiteContent(): void {
    try {
      if (fs.existsSync(this.websiteContentPath)) {
        const raw = fs.readFileSync(this.websiteContentPath, 'utf8');
        this.websiteContent = JSON.parse(raw);
      } else {
        this.websiteContent = this.getDefaultWebsiteContent();
        this.saveWebsiteContentToFile();
      }
    } catch (e) {
      console.warn('Could not load website content from disk, using defaults:', e);
      this.websiteContent = this.getDefaultWebsiteContent();
    }
  }

  private saveWebsiteContentToFile(): void {
    try {
      const dir = path.dirname(this.websiteContentPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.websiteContentPath, JSON.stringify(this.websiteContent, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save website content to disk:', e);
    }
  }

  public getWebsiteContent(): any {
    if (!this.websiteContent) {
      this.initWebsiteContent();
    }
    return this.websiteContent;
  }

  public updateWebsiteContent(newData: any): any {
    if (!this.websiteContent) {
      this.initWebsiteContent();
    }
    // Deep merge / replace
    this.websiteContent = {
      ...this.websiteContent,
      ...newData,
      home: {
        ...(this.websiteContent?.home || {}),
        ...(newData?.home || {})
      },
      about: {
        ...(this.websiteContent?.about || {}),
        ...(newData?.about || {})
      },
      services: {
        ...(this.websiteContent?.services || {}),
        ...(newData?.services || {})
      },
      offers: {
        ...(this.websiteContent?.offers || {}),
        ...(newData?.offers || {})
      },
      contact: {
        ...(this.websiteContent?.contact || {}),
        ...(newData?.contact || {})
      },
      general: {
        ...(this.websiteContent?.general || {}),
        ...(newData?.general || {})
      }
    };
    this.saveWebsiteContentToFile();
    return this.websiteContent;
  }

  public resetWebsiteContent(): any {
    this.websiteContent = this.getDefaultWebsiteContent();
    this.saveWebsiteContentToFile();
    return this.websiteContent;
  }
}

export const memoryStore = new MemoryStore();


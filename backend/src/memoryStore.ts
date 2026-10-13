export interface OrderData {
  _id: string;
  orderId: string;
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
      address: 'Salim Street, Sulaimanyiah, Kurdistan Region, Iraq',
      productName: "SHEIN Elegant Floral Satin Dress & Heels Set",
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
        { status: 'Arrived', date: '2026-09-24T08:30:00Z', note: 'Package arrived at Sulaimanyiah local office' },
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
        { status: 'Purchased', date: '2026-09-16T10:00:00Z', note: 'Purchased from Turkey' },
        { status: 'In Office', date: '2026-09-20T12:00:00Z', note: 'Received in regional office' },
        { status: 'Arrived', date: '2026-09-24T11:00:00Z', note: 'Delivered to customer & signed' },
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
        { status: 'Purchased', date: '2026-09-24T14:00:00Z', note: 'Order registered by admin' },
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
        { status: 'Purchased', date: '2026-09-22T08:00:00Z', note: 'Order placed' },
        { status: 'In Office', date: '2026-09-23T11:00:00Z', note: 'Received at office' },
      ],
      createdAt: '2026-09-22T08:00:00Z',
      updatedAt: '2026-09-23T11:00:00Z',
    }
  ];

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
    return [...this.orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public findOrder(query: string): OrderData | undefined {
    const q = query.trim().toLowerCase();
    return this.orders.find(o => 
      o.orderId.toLowerCase() === q || 
      (o.trackingNumber && o.trackingNumber.toLowerCase() === q) ||
      o._id === q
    );
  }

  public addOrder(data: Partial<OrderData>): OrderData {
    const newOrderId = this.getNextOrderId();
    const now = new Date().toISOString();
    const newOrder: OrderData = {
      _id: `ord_${Date.now()}`,
      orderId: newOrderId,
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
      totalPrice: (Number(data.quantity) || 1) * (Number(data.productPrice) || 0) + (Number(data.shippingFee) || 0),
      currency: data.currency || 'USD',
      originCountry: data.originCountry || 'China',
      destinationCountry: data.destinationCountry || 'Iraq',
      shippingMethod: data.shippingMethod || 'Express Air',
      trackingNumber: data.trackingNumber || '',
      estimatedDelivery: data.estimatedDelivery || '',
      status: data.status || 'Purchased',
      statusHistory: [
        {
          status: data.status || 'Purchased',
          date: now,
          note: 'Order manually created in admin dashboard'
        }
      ],
      notes: data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  public updateOrder(orderId: string, updates: Partial<OrderData>): OrderData | null {
    const index = this.orders.findIndex(o => o.orderId.toLowerCase() === orderId.toLowerCase() || o._id === orderId);
    if (index === -1) return null;

    const ord = this.orders[index];
    const now = new Date().toISOString();

    if (updates.status && updates.status !== ord.status) {
      ord.statusHistory.push({
        status: updates.status,
        date: now,
        note: updates.statusHistory?.[updates.statusHistory.length - 1]?.note || `Status updated to ${updates.status}`
      });
      ord.status = updates.status;
    }

    Object.assign(ord, updates, { updatedAt: now });
    this.orders[index] = ord;
    return ord;
  }

  public updateOrderStatus(orderId: string, status: string, note?: string): OrderData | null {
    const index = this.orders.findIndex(o => o.orderId.toLowerCase() === orderId.toLowerCase() || o._id === orderId);
    if (index === -1) return null;

    const ord = this.orders[index];
    const now = new Date().toISOString();
    ord.status = status;
    ord.statusHistory.push({
      status,
      date: now,
      note: note || `Status updated to ${status}`
    });
    ord.updatedAt = now;
    this.orders[index] = ord;
    return ord;
  }

  public deleteOrder(orderId: string): boolean {
    const initialLen = this.orders.length;
    this.orders = this.orders.filter(o => o.orderId.toLowerCase() !== orderId.toLowerCase() && o._id !== orderId);
    return this.orders.length < initialLen;
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
    return cust;
  }

  public deleteCustomer(idOrCustomerId: string): boolean {
    const initialLen = this.customers.length;
    this.customers = this.customers.filter(
      c => c.customerId.toLowerCase() !== idOrCustomerId.toLowerCase() && c._id !== idOrCustomerId
    );
    return this.customers.length < initialLen;
  }

  public findUserByEmail(email: string): UserData | null {
    const clean = email.trim().toLowerCase();
    return this.users.find(u => u.email.toLowerCase() === clean) || null;
  }

  public addUser(user: Omit<UserData, '_id' | 'createdAt'>): UserData {
    const newUser: UserData = {
      ...user,
      _id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }
}

export const memoryStore = new MemoryStore();

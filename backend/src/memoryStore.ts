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
  createdAt: string;
  updatedAt: string;
}

class MemoryStore {
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

  public getNextOrderId(): string {
    const year = new Date().getFullYear();
    const prefix = `HB-${year}-`;
    let maxNum = 0;

    for (const ord of this.orders) {
      if (ord.orderId.startsWith(prefix)) {
        const parts = ord.orderId.split('-');
        if (parts.length === 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      }
    }

    const nextNum = (maxNum + 1).toString().padStart(5, '0');
    return `${prefix}${nextNum}`;
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
      productImage: data.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
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
      status: data.status || 'Order Received',
      statusHistory: [
        {
          status: data.status || 'Order Received',
          date: now,
          note: 'Order manually created in admin dashboard'
        }
      ],
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
}

export const memoryStore = new MemoryStore();

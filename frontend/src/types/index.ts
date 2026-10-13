// Language types
export type Language = 'en' | 'ku' | 'ar';
export type Direction = 'ltr' | 'rtl';

export interface LanguageConfig {
  code: Language;
  name: string;
  nativeName: string;
  dir: Direction;
  flag: string;
}

// Order Status Enum
export type OrderStatus =
  | 'Purchased'
  | 'In Office'
  | 'Arrived';

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Purchased',
  'In Office',
  'Arrived'
];

export interface StatusHistoryItem {
  status: OrderStatus;
  date: string;
  note?: string;
}

export interface AdminOrder {
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
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PublicTrackingData {
  orderId: string;
  customerName?: string;
  productName: string;
  productImage?: string;
  quantity: number;
  currency: string;
  totalPrice: number;
  originCountry: string;
  destinationCountry: string;
  shippingMethod: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryItem[];
  updatedAt?: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'customer' | string;
  isCustomer?: boolean;
  customerId?: string;
}

export type AdminUser = AppUser;

export interface Customer {
  _id?: string;
  customerId: string;
  name: string;
  phone: string;
  secondaryPhone?: string;
  email?: string;
  address: string;
  notes?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Legacy Tracking types
export interface TrackingStep {
  id: string;
  label: string;
  labelKu: string;
  labelAr: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
  description?: string;
}

export interface TrackingInfo {
  orderNumber: string;
  status: string;
  product: string;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  lastUpdated: string;
  steps: TrackingStep[];
}

export interface SearchResult {
  id: string;
  type: 'service' | 'offer' | 'page' | 'info';
  title: string;
  description: string;
  url: string;
}

export interface Service {
  id: string;
  icon: string;
  title: string;
  titleKu: string;
  titleAr: string;
  description: string;
  descriptionKu: string;
  descriptionAr: string;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discount: string;
  validity: string;
  tag: string;
  featured?: boolean;
  color?: string;
}

export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

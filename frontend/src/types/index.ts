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

// Tracking types
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

// Search types
export interface SearchResult {
  id: string;
  type: 'service' | 'offer' | 'page' | 'info';
  title: string;
  description: string;
  url: string;
}

// Service types
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

// Offer types
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

// Contact types
export interface ContactForm {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

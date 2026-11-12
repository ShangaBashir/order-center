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
  | 'Received in Warehouse'
  | 'Dispatched from Warehouse'
  | 'Arrived'
  | 'Done'
  | 'Canceled'
  | 'In Office'; // backwards compat

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Purchased',
  'Received in Warehouse',
  'Dispatched from Warehouse',
  'Arrived',
  'Done',
  'Canceled'
];

export interface StatusHistoryItem {
  status: OrderStatus;
  date: string;
  note?: string;
}

export interface AdminOrder {
  _id?: string;
  orderId: string;
  customerId?: string;
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
  approximateDeliveryDate?: string;
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
  approximateDeliveryDate?: string;
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

export type MultilingualText = {
  en: string;
  ku: string;
  ar: string;
};

export interface AboutStatItem {
  id: string;
  value: string;
  label: MultilingualText;
}

export interface WhatWeDoItem {
  id: string;
  icon: string;
  title: MultilingualText;
  description: MultilingualText;
  image?: string;
}

export interface ValueItem {
  id: string;
  icon: string;
  title: MultilingualText;
  description: MultilingualText;
  image?: string;
}

export interface ProcessStepItem {
  id: string;
  stepNumber: number;
  label: MultilingualText;
  description?: MultilingualText;
  icon: string;
  color?: string;
}

export interface AboutPictureItem {
  id: string;
  category: string;
  title: MultilingualText;
  imageUrl: string;
  caption?: MultilingualText;
}

export interface AboutPageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    description: MultilingualText;
    bannerImage: string;
    bannerImages?: string[];
    carouselInterval?: number;
  };
  whoWeAre: {
    label: MultilingualText;
    title: MultilingualText;
    paragraph1: MultilingualText;
    paragraph2: MultilingualText;
    cardTitle: MultilingualText;
    cardHighlight: MultilingualText;
    cardDescription: MultilingualText;
    image: string;
    stats: AboutStatItem[];
  };
  whatWeDo: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: WhatWeDoItem[];
  };
  missionVision: {
    missionTitle: MultilingualText;
    missionDescription: MultilingualText;
    visionTitle: MultilingualText;
    visionDescription: MultilingualText;
  };
  values: {
    label: MultilingualText;
    title: MultilingualText;
    items: ValueItem[];
  };
  process: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: ProcessStepItem[];
  };
  pictures: AboutPictureItem[];
  cta: {
    title: MultilingualText;
    subtitle: MultilingualText;
    primaryBtn: MultilingualText;
    secondaryBtn: MultilingualText;
  };
}

export interface GeneralWebsiteContent {
  companyName: MultilingualText;
  tagline: MultilingualText;
  footerDescription?: MultilingualText;
  phone: string;
  whatsapp: string;
  email: string;
  location: MultilingualText;
  secondaryPhone?: string;
  googleMapsUrl?: string;
}

// ─── Home Page Content ──────────────────────────────────────────────
export interface HomeFeatureItem {
  id: string;
  icon: string;
  title: MultilingualText;
  description: MultilingualText;
}

export interface HomeStepItem {
  id: string;
  stepNumber: string;
  title: MultilingualText;
  description: MultilingualText;
  icon: string;
}

export interface HomeStatItem {
  id: string;
  value: string;
  label: MultilingualText;
  icon?: string;
}

export interface GlobalWebsiteItem {
  id: string;
  name: string;
  abbr?: string;
  url: string;
  logo?: string;
  color?: string;
  bg?: string;
  border?: string;
}

export interface HomeGlobalWebsitesSection {
  label: MultilingualText;
  title: MultilingualText;
  subtitle: MultilingualText;
  bottomNote?: MultilingualText;
  items: GlobalWebsiteItem[];
}

export interface HomePageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    description: MultilingualText;
    primaryBtn: MultilingualText;
    secondaryBtn: MultilingualText;
    bannerImage: string;
    bannerImages?: string[];
    carouselInterval?: number;
  };
  features: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: HomeFeatureItem[];
  };
  howItWorks: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: HomeStepItem[];
  };
  globalWebsites?: HomeGlobalWebsitesSection;
  stats: {
    items: HomeStatItem[];
  };
  cta: {
    title: MultilingualText;
    subtitle: MultilingualText;
    primaryBtn: MultilingualText;
  };
}

// ─── Services Page Content ──────────────────────────────────────────
export interface ServiceCardItem {
  id: string;
  icon: string;
  title: MultilingualText;
  description: MultilingualText;
  tags: string[];
  featured?: boolean;
}

export interface ServiceAdvantageItem {
  id: string;
  icon: string;
  title: MultilingualText;
  description: MultilingualText;
}

export interface ServicesPageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    description: MultilingualText;
    bannerImage: string;
  };
  servicesList: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: ServiceCardItem[];
  };
  whyChoose: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: ServiceAdvantageItem[];
  };
  cta: {
    title: MultilingualText;
    subtitle: MultilingualText;
    primaryBtn: MultilingualText;
    secondaryBtn: MultilingualText;
  };
}

// ─── Offers Page Content ────────────────────────────────────────────
export interface FeaturedDealItem {
  id: string;
  badge: MultilingualText;
  title: MultilingualText;
  description: MultilingualText;
  discount: string;
  validUntil: MultilingualText;
  image?: string;
  code?: string;
}

export interface PartnerStoreDealItem {
  id: string;
  storeName: string;
  discount: string;
  code: string;
  category: MultilingualText;
  description: MultilingualText;
}

export interface OffersPageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    description: MultilingualText;
    bannerImage: string;
  };
  featuredDeals: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: FeaturedDealItem[];
  };
  storeDeals: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: PartnerStoreDealItem[];
  };
  cta: {
    title: MultilingualText;
    subtitle: MultilingualText;
    primaryBtn: MultilingualText;
  };
}

// ─── Contact Page Content ───────────────────────────────────────────
export interface OfficeLocationItem {
  id: string;
  city: MultilingualText;
  name: MultilingualText;
  address: MultilingualText;
  district?: MultilingualText;
  landmark?: MultilingualText;
  phone: string;
  workingHours: MultilingualText;
  mapCoordinates?: string;
  googleMapsUrl?: string;
}

export interface ContactFaqItem {
  id: string;
  question: MultilingualText;
  answer: MultilingualText;
}

export interface ContactPageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    description: MultilingualText;
    bannerImage: string;
  };
  directChannels: {
    phone: string;
    secondaryPhone?: string;
    whatsapp: string;
    email: string;
    workingHours: MultilingualText;
    supportNote: MultilingualText;
  };
  inquiryForm?: {
    badge?: MultilingualText;
    title?: MultilingualText;
    description?: MultilingualText;
    submitButtonText?: MultilingualText;
    successTitle?: MultilingualText;
    successMessage?: MultilingualText;
  };
  officeLocations: {
    label: MultilingualText;
    title: MultilingualText;
    description?: MultilingualText;
    items: OfficeLocationItem[];
  };
  faq: {
    label: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    items: ContactFaqItem[];
  };
  cta?: {
    title: MultilingualText;
    subtitle: MultilingualText;
    primaryBtn: MultilingualText;
  };
}

export interface ProductItem {
  id: string;
  title: MultilingualText;
  description: MultilingualText;
  price: number;
  originalPrice?: number;
  currency?: string;
  category: string;
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  badge?: string;
  rating?: number;
  whatsappNumber?: string;
  externalUrl?: string;
  tags?: string[];
  createdAt?: string;
}

export interface ComingSoonFeatureItem {
  id: string;
  icon?: string;
  title: MultilingualText;
  description: MultilingualText;
}

export interface ProductsPageContent {
  hero: {
    badge: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    bannerImage?: string;
  };
  comingSoon: {
    badge: MultilingualText;
    title: MultilingualText;
    subtitle: MultilingualText;
    notice: MultilingualText;
    features?: ComingSoonFeatureItem[];
  };
  items: ProductItem[];
}

export interface WebsiteContent {
  home: HomePageContent;
  about: AboutPageContent;
  services: ServicesPageContent;
  offers: OffersPageContent;
  contact: ContactPageContent;
  general: GeneralWebsiteContent;
  products?: ProductsPageContent;
}


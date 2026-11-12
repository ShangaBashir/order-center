import React, { useState, useEffect, useRef } from 'react';
import {
  ShoppingBag,
  Search,
  Sparkles,
  ShieldCheck,
  Truck,
  MessageCircle,
  CheckCircle2,
  Eye,
  X,
  Globe,
  Award,
  Package,
  Star,
  Heart,
  Clock,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useSettings } from '../context/SettingsContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, ProductItem, MultilingualText, ComingSoonFeatureItem } from '../types';

const renderFeatureCardIcon = (iconName?: string) => {
  if (!iconName) return <ShoppingBag className="w-7 h-7" />;
  if (iconName.startsWith('data:image') || iconName.startsWith('http') || iconName.startsWith('/')) {
    return <img src={iconName} alt="icon" className="w-7 h-7 object-contain" />;
  }
  switch (iconName) {
    case 'ShoppingBag': return <ShoppingBag className="w-7 h-7" />;
    case 'Truck': return <Truck className="w-7 h-7" />;
    case 'ShieldCheck': return <ShieldCheck className="w-7 h-7" />;
    case 'Globe': return <Globe className="w-7 h-7" />;
    case 'Award': return <Award className="w-7 h-7" />;
    case 'Sparkles': return <Sparkles className="w-7 h-7" />;
    case 'Package': return <Package className="w-7 h-7" />;
    case 'Star': return <Star className="w-7 h-7" />;
    case 'Heart': return <Heart className="w-7 h-7" />;
    case 'Clock': return <Clock className="w-7 h-7" />;
    case 'Tag': return <Tag className="w-7 h-7" />;
    default: return <Sparkles className="w-7 h-7" />;
  }
};

const DEFAULT_COMING_SOON_CARDS: ComingSoonFeatureItem[] = [
  {
    id: 'cs-feat-1',
    icon: 'ShoppingBag',
    title: {
      en: 'Curated Global Brands',
      ku: 'براندە جیهانییە هەڵبژێردراوەکان',
      ar: 'ماركات عالمية مختارة',
    },
    description: {
      en: 'Direct procurement from top verified stores across USA, UK, Turkey, China & UAE. No replicas, only authentic guaranteed stock.',
      ku: 'کڕینی ڕاستەوخۆ لە فرۆشگا باوەڕپێکراوەکانی ئەمریکا، بەریتانیا، تورکیا، چین و ئیمارات. بەبێ هیچ کۆپییەک، تەنها کاڵای ئەسڵی گەرەنتیکراو.',
      ar: 'شراء مباشر من أفضل المتاجر المعتمدة في أمريكا وبريطانيا وتركيا والصين والإمارات. بدون تقليد، منتجات أصلية ومضمونة فقط.',
    },
  },
  {
    id: 'cs-feat-2',
    icon: 'Truck',
    title: {
      en: 'Local Stock, 24h Express',
      ku: 'کۆگای ناوخۆیی، گەیاندنی ٢٤ کاتژمێری',
      ar: 'مخزون محلي، شحن سريع خلال ٢٤ ساعة',
    },
    description: {
      en: 'No international wait times. Items in our catalog are pre-stocked in our Kurdistan and Baghdad dispatch hubs for immediate delivery.',
      ku: 'بەبێ چاوەڕوانی درێژخایەنی نێودەوڵەتی. کاڵاکان لە کۆگاکانمان لە کوردستان و بەغدا ئامادەن بۆ گەیاندنی دەستبەجێ.',
      ar: 'بدون أوقات انتظار دولية. المنتجات مخزنة مسبقاً في مراكز التوزيع بكوردستان وبغداد للتسليم الفوري.',
    },
  },
  {
    id: 'cs-feat-3',
    icon: 'ShieldCheck',
    title: {
      en: 'Pay on Delivery (COD)',
      ku: 'پارەدان لە کاتی وەرگرتن',
      ar: 'الدفع عند الاستلام',
    },
    description: {
      en: 'Complete peace of mind. Inspect your parcel upon arrival and pay cash on delivery directly to our courier.',
      ku: 'دڵنیایی تەواو. کاڵاکەت لە کاتی گەیشتن بپشکنە و پارەکەی بە کاش ڕاستەوخۆ بدە بە دەست گەیەنەرەکە.',
      ar: 'راحة بال كاملة. عاين طلبيتك فور وصولها وادفع نقداً عند الاستلام مباشرة إلى مندوب التوصيل.',
    },
  },
];

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const ProductsPage: React.FC = () => {
  const { language, direction } = useLanguage();
  const isRtl = direction === 'rtl';
  const { formatPriceWithIqd } = useSettings();
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Storefront Catalog state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  // Coming Soon interactive custom order link state
  const [customLink, setCustomLink] = useState('');

  useEffect(() => {
    let isMounted = true;
    websiteContentApi
      .getContent()
      .then((data) => {
        if (isMounted && data) {
          setContent(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load website content for products', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const txt = (field?: MultilingualText, fallback = ''): string => {
    if (!field) return fallback;
    const currentLang = language as 'en' | 'ku' | 'ar';
    return field[currentLang] || field.en || fallback;
  };

  const prods = content?.products;
  const gen = content?.general;
  const rawItems = (prods?.items || []).filter((p) => p && p.title);
  const isComingSoon = rawItems.length === 0;

  const whatsappNum = gen?.whatsapp || gen?.phone || '+964 750 000 0000';
  const cleanWhatsapp = whatsappNum.replace(/\D/g, '');

  // Extract unique categories
  const categories = Array.from(new Set(rawItems.map((p) => p.category).filter(Boolean)));

  // Filter & Sort Products
  const filteredProducts = rawItems.filter((item) => {
    if (inStockOnly && !item.inStock) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = txt(item.title).toLowerCase();
      const desc = txt(item.description).toLowerCase();
      const cat = (item.category || '').toLowerCase();
      if (!title.includes(q) && !desc.includes(q) && !cat.includes(q)) {
        return false;
      }
    }
    return true;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'newest') {
      return (new Date(b.createdAt || '').getTime() || 0) - (new Date(a.createdAt || '').getTime() || 0);
    }
    return 0; // featured default
  });

  const handleCustomOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLink.trim()) return;
    const message = encodeURIComponent(
      `*Custom Product Order Request*\n\nHello Order Center, I would like to order this item:\n${customLink.trim()}\n\nPlease quote me the total price with express shipping to Iraq.`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${message}`, '_blank');
    setCustomLink('');
  };

  const handleWhatsAppOrder = (prod: ProductItem) => {
    const prodTitle = txt(prod.title);
    const prodPrice = prod.price;
    const prodUrl = window.location.href;
    const waText = encodeURIComponent(
      `*Order Inquiry from Website*\n\n` +
      `Product: *${prodTitle}*\n` +
      `Price: $${prodPrice} USD\n` +
      `Category: ${prod.category}\n` +
      `Store Link: ${prodUrl}\n\n` +
      `Hello Order Center, I would like to purchase this product. Please confirm availability and delivery time to my address.`
    );
    window.open(`https://wa.me/${cleanWhatsapp}?text=${waText}`, '_blank');
  };

  if (loading) {
    return (
      <div className="pt-24 min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-burgundy border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading products...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // UI 1: "COMING SOON" MODE (When items.length === 0)
  // =========================================================================
  if (isComingSoon) {
    const cs = prods?.comingSoon;
    return (
      <div className={`pt-16 lg:pt-20 overflow-x-hidden min-h-screen bg-slate-50 ${isRtl ? 'rtl' : 'ltr'}`}>
        {/* Teaser Hero Section */}
        <section className="relative py-28 lg:py-36 hero-gradient overflow-hidden text-white">
          {/* Ambient Lighting Orbs */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 30% 30%, rgba(212,175,55,0.4) 0%, transparent 60%), radial-gradient(circle at 75% 70%, rgba(113,22,18,0.7) 0%, transparent 60%)`,
            }}
          />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-burgundy/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Launching Soon Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8 backdrop-blur-md shadow-inner animate-pulse">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                {cs ? txt(cs.badge, 'EXCLUSIVE STORE • LAUNCHING SOON') : 'EXCLUSIVE STORE • LAUNCHING SOON'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6">
              {cs ? txt(cs.title, 'Our Global Store Is Arriving Soon') : 'Our Global Store Is Arriving Soon'}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 font-normal leading-relaxed max-w-3xl mx-auto mb-4">
              {cs
                ? txt(
                    cs.subtitle,
                    'We are preparing an exclusive collection of verified international products available for immediate purchase with fast local delivery.'
                  )
                : 'We are preparing an exclusive collection of verified international products available for immediate purchase with fast local delivery.'}
            </p>
          </div>
        </section>

        {/* 3 Pillars Value Cards */}
        <section className="relative -mt-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(cs?.features && cs.features.length > 0 ? cs.features : DEFAULT_COMING_SOON_CARDS).map((feat, idx) => {
              const theme = [
                { bg: 'bg-burgundy/10', text: 'text-burgundy' },
                { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
                { bg: 'bg-gold/15', text: 'text-gold-dark' },
                { bg: 'bg-blue-500/10', text: 'text-blue-600' },
                { bg: 'bg-purple-500/10', text: 'text-purple-600' },
              ][idx % 5];
              return (
                <div
                  key={feat.id || idx}
                  className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-900/5 space-y-4 hover:-translate-y-1 transition duration-300"
                >
                  <div className={`w-14 h-14 rounded-2xl ${theme.bg} ${theme.text} flex items-center justify-center`}>
                    {renderFeatureCardIcon(feat.icon)}
                  </div>
                  <h3 className="font-display font-bold text-xl text-charcoal">
                    {txt(feat.title)}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {txt(feat.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Custom Order Concierge Banner */}
        <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <div className="bg-gradient-to-br from-charcoal to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-gold text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personal Shopping Concierge</span>
                </div>

                <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl">
                  Can't wait? Order any international product today!
                </h2>

                <p className="text-sm text-white/80 leading-relaxed">
                  {cs
                    ? txt(
                        cs.notice,
                        'Want to order from Amazon, SHEIN or AliExpress right now? Send us any link and we will purchase and deliver it for you today!'
                      )
                    : 'Want to order from Amazon, SHEIN or AliExpress right now? Send us any link and we will purchase and deliver it for you today!'}
                </p>

                <form onSubmit={handleCustomOrderSubmit} className="pt-4 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Paste link from Amazon, SHEIN, Zara, etc..."
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                    className="flex-1 px-4 py-3.5 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold backdrop-blur-sm"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3.5 rounded-2xl bg-gold text-charcoal font-bold text-sm hover:bg-gold-light hover:shadow-xl transition-all flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-burgundy fill-burgundy" />
                    <span>Order via WhatsApp</span>
                  </button>
                </form>
              </div>
            </div>
          </FadeSection>
        </section>
      </div>
    );
  }

  // =========================================================================
  // UI 2: "STORE CATALOG" MODE (When items.length > 0)
  // =========================================================================
  return (
    <div className={`pt-16 lg:pt-20 overflow-x-hidden min-h-screen bg-slate-50/50 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* 1. STOREFRONT HERO */}
      <section className="relative py-20 lg:py-28 hero-gradient overflow-hidden text-white">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 40%, rgba(212,175,55,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(113,22,18,0.6) 0%, transparent 60%)`,
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md">
              <ShoppingBag className="w-4 h-4 text-gold" />
              <span className="text-white text-xs font-bold tracking-wider uppercase">
                {prods ? txt(prods.hero.badge, 'GLOBAL STORE') : 'GLOBAL STORE'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6">
              {prods ? txt(prods.hero.title, 'Curated International Products') : 'Curated International Products'}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 font-normal leading-relaxed mb-6">
              {prods
                ? txt(
                    prods.hero.subtitle,
                    'Ready in stock for express door-to-door delivery across Kurdistan & Iraq.'
                  )
                : 'Ready in stock for express door-to-door delivery across Kurdistan & Iraq.'}
            </p>

            <div className="flex flex-wrap items-center gap-5 text-xs text-white/90 pt-3 border-t border-white/15">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-gold" />
                <span>100% Genuine Guaranteed</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold" />
                <span>Express Doorstep Delivery</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold" />
                <span>Cash on Delivery (COD)</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTER CONTROLS BAR */}
      <section className="sticky top-16 lg:top-20 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 py-4 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title, category, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:border-burgundy transition bg-slate-50/50 hover:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Controls Right */}
            <div className="flex items-center gap-3">
              {/* In-Stock Toggle */}
              <button
                type="button"
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border ${
                  inStockOnly
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>In Stock Only</span>
              </button>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-burgundy/20"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Category Chips Bar */}
          {categories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-burgundy text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Products ({rawItems.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-burgundy text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. PRODUCT CATALOG GRID */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-lg text-charcoal">
              No products found matching your search
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your search keywords or switching category filters to view all available products.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setInStockOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-burgundy text-white font-bold text-xs hover:bg-burgundy-700 transition"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map((prod) => {
              const title = txt(prod.title);
              const desc = txt(prod.description);
              const hasDiscount = prod.originalPrice && prod.originalPrice > prod.price;

              return (
                <div
                  key={prod.id}
                  className="group bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:border-burgundy/30 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Product Image Area */}
                    <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                      {prod.image ? (
                        <img
                          src={prod.image}
                          alt={title}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag className="w-16 h-16" />
                        </div>
                      )}

                      {/* Promo Badge */}
                      {prod.badge && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-burgundy text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                          {prod.badge}
                        </div>
                      )}

                      {/* Stock Status Badge */}
                      <div className="absolute top-3 right-3">
                        {prod.inStock ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            In Stock
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-slate-800/80 text-white text-[10px] font-bold backdrop-blur-xs">
                            Sold Out
                          </span>
                        )}
                      </div>

                      {/* Quick View Hover Button */}
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(prod)}
                        className="absolute bottom-3 right-3 p-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        title="Quick Preview"
                      >
                        <Eye className="w-4 h-4 text-charcoal" />
                      </button>
                    </div>

                    {/* Details Container */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        <span>{prod.category}</span>
                        {hasDiscount && (
                          <span className="text-red-600 font-bold">
                            Save ${(prod.originalPrice! - prod.price).toFixed(0)}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setQuickViewProduct(prod)}
                        className="font-display font-bold text-base text-charcoal group-hover:text-burgundy transition-colors line-clamp-2 cursor-pointer leading-snug"
                        title={title}
                      >
                        {title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Order Action Bar */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 space-y-3">
                    <div className="pt-3 flex items-baseline justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="font-display font-black text-xl text-charcoal">
                            ${prod.price.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-slate-400 line-through">
                              ${prod.originalPrice?.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 block">
                          ≈ {formatPriceWithIqd(prod.price).iqdStr}
                        </span>
                      </div>
                    </div>

                    {/* Order via WhatsApp Action Button */}
                    <button
                      type="button"
                      disabled={!prod.inStock}
                      onClick={() => handleWhatsAppOrder(prod)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 shadow-xs ${
                        prod.inStock
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{prod.inStock ? 'Order via WhatsApp' : 'Out of Stock'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. CUSTOM INQUIRY CONCIERGE FOOTER BANNER */}
      <section className="py-16 bg-gradient-to-r from-burgundy via-burgundy-900 to-charcoal text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <span className="text-gold text-xs font-bold uppercase tracking-wider block mb-1">
                Custom International Purchasing
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl">
                Looking for a specific product from abroad?
              </h3>
              <p className="text-white/70 text-sm mt-1 max-w-xl">
                Send us any item link from Amazon, eBay, Nike, or AliExpress and our concierge team will purchase, inspect, and ship it to you.
              </p>
            </div>
            <a
              href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                'Hello Order Center, I want to request a custom international product purchase.'
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gold text-charcoal font-bold text-sm hover:bg-gold-light hover:shadow-xl hover:scale-105 transition-all duration-200 flex-shrink-0 shadow-lg"
            >
              <MessageCircle className="w-5 h-5 text-burgundy fill-burgundy" />
              <span>Request Custom Product</span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative border border-slate-200 animate-scale-up">
            <button
              type="button"
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Modal Image */}
              <div className="relative bg-slate-100 aspect-square sm:aspect-auto sm:h-full">
                {quickViewProduct.image ? (
                  <img
                    src={quickViewProduct.image}
                    alt={txt(quickViewProduct.title)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-16 h-16" />
                  </div>
                )}
                {quickViewProduct.badge && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-burgundy text-white text-xs font-bold uppercase tracking-wider">
                    {quickViewProduct.badge}
                  </span>
                )}
              </div>

              {/* Modal Specs */}
              <div className="p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {quickViewProduct.category}
                  </span>

                  <h3 className="font-display font-bold text-xl text-charcoal leading-snug">
                    {txt(quickViewProduct.title)}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display font-black text-2xl text-charcoal">
                        ${quickViewProduct.price.toFixed(2)} USD
                      </span>
                      {quickViewProduct.originalPrice && quickViewProduct.originalPrice > quickViewProduct.price && (
                        <span className="text-sm text-slate-400 line-through">
                          ${quickViewProduct.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      ≈ {formatPriceWithIqd(quickViewProduct.price).iqdStr}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Description & Specifications:
                    </h5>
                    <p className="text-xs text-slate-600 leading-relaxed max-h-48 overflow-y-auto">
                      {txt(quickViewProduct.description)}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    type="button"
                    disabled={!quickViewProduct.inStock}
                    onClick={() => {
                      handleWhatsAppOrder(quickViewProduct);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Order via WhatsApp Now</span>
                  </button>
                  <p className="text-[11px] text-center text-slate-400">
                    Pay upon arrival • Fast courier delivery to your doorstep
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

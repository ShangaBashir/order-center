import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronRight,
  ShoppingBag,
  DollarSign,
  Tag,
  CheckCircle,
  XCircle,
  Clock,
  Layers
} from 'lucide-react';
import { ProductsPageContent, ProductItem, ComingSoonFeatureItem } from '../../types';
import {
  PageSaveBar,
  ConfirmDeleteModal,
  TrilingualInput,
  ImageUploadZone,
  IconSelector,
  renderIcon,
  scrollToNewItem
} from './CMSComponents';

export const DEFAULT_COMING_SOON_FEATURES: ComingSoonFeatureItem[] = [
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

export type ProductsSubTab = 'hero' | 'catalog';

export const PRODUCTS_SUB_TABS: { id: ProductsSubTab; label: string }[] = [
  { id: 'hero', label: '1. Store & Teaser Settings' },
  { id: 'catalog', label: '2. Products to Sell' },
];

const DEFAULT_CATEGORIES = [
  'Electronics & Gadgets',
  'Fashion & Apparel',
  'Watches & Jewelry',
  'Home & Kitchen',
  'Beauty & Personal Care',
  'Perfumes & Fragrances',
  'Sports & Outdoors',
  'Accessories',
  'Other',
];

export const ProductsCMS: React.FC<{
  data?: ProductsPageContent;
  onChange: (updated: ProductsPageContent) => void;
  activeSubTab: ProductsSubTab;
  onSelectSubTab: (tab: ProductsSubTab) => void;
  onSave?: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({
  data = {
    hero: {
      badge: { en: 'GLOBAL STORE', ku: 'فرۆشگای جیهانی', ar: 'المتجر العالمي' },
      title: {
        en: 'Curated International Products',
        ku: 'بەرهەمە نێودەوڵەتییە هەڵبژێردراوەکان',
        ar: 'منتجات عالمية مختارة',
      },
      subtitle: {
        en: 'Ready in stock for express door-to-door delivery across Kurdistan & Iraq.',
        ku: 'ئامادەیە لە کۆگا بۆ گەیاندنی خێرا بۆ هەموو کوردستان و عێراق.',
        ar: 'جاهزة في المخزن للتوصيل السريع إلى باب منزلك في كافة أنحاء العراق وكوردستان.',
      },
      bannerImage: '',
    },
    comingSoon: {
      badge: {
        en: 'EXCLUSIVE STORE • LAUNCHING SOON',
        ku: 'فرۆشگای تایبەت • بەمزووانە',
        ar: 'متجر حصري • قريباً جداً',
      },
      title: {
        en: 'Our Global Store Is Arriving Soon',
        ku: 'فرۆشگاکەمان بەمزووانە بەردەست دەبێت',
        ar: 'متجرنا العالمي قادم قريباً',
      },
      subtitle: {
        en: 'We are preparing an exclusive collection of verified international products available for immediate purchase with fast local delivery.',
        ku: 'ئێمە سەرقاڵی ئامادەکردنی کۆمەڵێک بەرهەمی تایبەتی نێودەوڵەتین کە ڕاستەوخۆ دەتوانن بیکڕن بە گەیاندنی خێرا.',
        ar: 'نعمل على تجهيز تشكيلة حصرية من المنتجات العالمية المعتمدة للشراء الفوري مع التوصيل المحلي السريع.',
      },
      notice: {
        en: 'Want to order from Amazon, SHEIN or AliExpress right now? Send us any link and we will purchase and deliver it for you today!',
        ku: 'دەتەوێت ئێستا لە ئەمازۆن یان شین بکڕیت؟ هەر لینکێکت هەیە بۆمان بنێرە و ئەمڕۆ بۆت دەکڕین و دەهێنین!',
        ar: 'هل ترغب في الشراء من أمازون أو شي إن أو علي إكسبرس الآن؟ أرسل لنا أي رابط وسنقوم بشرائه وتوصيله لك فوراً!',
      },
    },
    items: [],
  },
  onChange,
  activeSubTab,
  onSelectSubTab,
  onSave,
  saving,
  hasUnsavedChanges,
}) => {
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const update = (partial: Partial<ProductsPageContent>) => {
    onChange({ ...data, ...partial });
  };

  const items = data.items || [];

  const handleAddProduct = () => {
    const newItem: ProductItem = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: { en: '', ku: '', ar: '' },
      description: { en: '', ku: '', ar: '' },
      price: 0,
      originalPrice: 0,
      category: 'Electronics & Gadgets',
      image: '',
      inStock: true,
      badge: 'New Arrival',
      rating: 5,
      createdAt: new Date().toISOString(),
    };
    const updated = [newItem, ...items];
    update({ items: updated });
    scrollToNewItem(newItem.id);
  };

  const handleUpdateItem = (id: string, partial: Partial<ProductItem>) => {
    const updated = items.map((it) => (it.id === id ? { ...it, ...partial } : it));
    update({ items: updated });
  };

  const handleDeleteItem = (id: string, name: string) => {
    triggerDeleteConfirm(
      'Delete Product',
      `Are you sure you want to remove "${name || 'this product'}" from your store? This cannot be undone.`,
      () => {
        const updated = items.filter((it) => it.id !== id);
        update({ items: updated });
      }
    );
  };

  const comingSoonFeatures =
    data.comingSoon?.features && data.comingSoon.features.length > 0
      ? data.comingSoon.features
      : DEFAULT_COMING_SOON_FEATURES;

  const handleUpdateFeature = (id: string, partial: Partial<ComingSoonFeatureItem>) => {
    const currentList = data.comingSoon?.features || DEFAULT_COMING_SOON_FEATURES;
    const updated = currentList.map((f) => (f.id === id ? { ...f, ...partial } : f));
    update({ comingSoon: { ...data.comingSoon, features: updated } });
  };

  const handleAddFeature = () => {
    const currentList = data.comingSoon?.features || DEFAULT_COMING_SOON_FEATURES;
    const newFeat: ComingSoonFeatureItem = {
      id: `cs-feat-${Date.now()}`,
      icon: 'ShoppingBag',
      title: { en: '', ku: '', ar: '' },
      description: { en: '', ku: '', ar: '' },
    };
    const updated = [...currentList, newFeat];
    update({ comingSoon: { ...data.comingSoon, features: updated } });
    scrollToNewItem(newFeat.id);
  };

  const handleDeleteFeature = (id: string, name: string) => {
    triggerDeleteConfirm(
      'Delete Highlight Card',
      `Are you sure you want to remove "${name || 'this card'}" from the Coming Soon page? This cannot be undone.`,
      () => {
        const currentList = data.comingSoon?.features || DEFAULT_COMING_SOON_FEATURES;
        const updated = currentList.filter((f) => f.id !== id);
        update({ comingSoon: { ...data.comingSoon, features: updated } });
      }
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sub-tabs Sidebar */}
      <div className="lg:col-span-1 space-y-2">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Store Management
        </div>
        {PRODUCTS_SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSubTab(tab.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-gradient-to-r from-[#711612] to-[#94201C] text-white shadow-md shadow-[#711612]/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{tab.label}</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'text-[#D4AF37] translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}

        {/* Live UI State Status Card */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 bg-white/70 text-xs space-y-2">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#711612]" />
            <span>Website Display Mode:</span>
          </div>
          {items.length === 0 ? (
            <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 space-y-1">
              <div className="font-bold flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>"Coming Soon" Active</span>
              </div>
              <p className="text-[10px] text-amber-700 leading-normal">
                No products have been added yet. Visitors viewing <code>/products</code> will see the elegant "Coming Soon" teaser with order inquiry options.
              </p>
            </div>
          ) : (
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
              <div className="font-bold flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>"Store Catalog" LIVE ({items.length} items)</span>
              </div>
              <p className="text-[10px] text-emerald-700 leading-normal">
                Visitors viewing <code>/products</code> see the full interactive product catalog with search, category filtering, and direct WhatsApp ordering.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* SUBTAB 1: HERO & COMING SOON SETTINGS */}
        {activeSubTab === 'hero' && (
          <div className="space-y-8 animate-fade-in">
            {/* Storefront Hero Settings */}
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> Storefront Hero Header (When Products Exist)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top headline and banner shown above the products catalog.
                </p>
              </div>

              <TrilingualInput
                label="Store Badge"
                value={data.hero?.badge}
                onChange={(badge) => update({ hero: { ...data.hero, badge } })}
              />

              <TrilingualInput
                label="Store Main Title"
                value={data.hero?.title}
                onChange={(title) => update({ hero: { ...data.hero, title } })}
              />

              <TrilingualInput
                label="Store Subtitle"
                value={data.hero?.subtitle}
                onChange={(subtitle) => update({ hero: { ...data.hero, subtitle } })}
              />

              <div className="space-y-2">
                <ImageUploadZone
                  label="Store Banner Background Image (Optional)"
                  imageValue={data.hero?.bannerImage || ''}
                  onImageChange={(bannerImage: string) => update({ hero: { ...data.hero, bannerImage } })}
                  aspectHint="16:9 banner"
                />
              </div>
            </div>

            {/* Coming Soon Teaser Settings */}
            <div className="pt-6 border-t border-slate-200 space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-amber-600">→</span> "Coming Soon" Teaser (When 0 Products)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Displayed automatically whenever there are 0 products in the store catalog.
                </p>
              </div>

              <TrilingualInput
                label="Teaser Badge"
                value={data.comingSoon?.badge}
                onChange={(badge) => update({ comingSoon: { ...data.comingSoon, badge } })}
              />

              <TrilingualInput
                label="Teaser Title"
                value={data.comingSoon?.title}
                onChange={(title) => update({ comingSoon: { ...data.comingSoon, title } })}
              />

              <TrilingualInput
                label="Teaser Subtitle"
                value={data.comingSoon?.subtitle}
                onChange={(subtitle) => update({ comingSoon: { ...data.comingSoon, subtitle } })}
              />

              <TrilingualInput
                label="Bottom Concierge Notice / Prompt"
                value={data.comingSoon?.notice}
                onChange={(notice) => update({ comingSoon: { ...data.comingSoon, notice } })}
              />

              {/* Coming Soon Highlight Cards (3 Trust Pillars) */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                      <span>Feature Highlight Cards ({comingSoonFeatures.length})</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                        Coming Soon Screen
                      </span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      The highlight cards shown below the headline (e.g. Curated Global Brands, Local Stock 24h, Pay on Delivery COD).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] text-white text-xs font-bold shadow-sm hover:opacity-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Highlight Card</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {comingSoonFeatures.map((feat, idx) => {
                    const cardTitle = feat.title?.en || feat.title?.ku || feat.title?.ar;
                    return (
                      <div
                        key={feat.id}
                        id={`item-${feat.id}`}
                        className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all space-y-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#711612]/10 text-[#711612] flex items-center justify-center font-bold text-xs">
                              {renderIcon(feat.icon || 'ShoppingBag', 'w-5 h-5')}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900">
                                Card #{idx + 1}: {cardTitle || 'Untitled Card'}
                              </span>
                              <span className="text-[10px] text-slate-400 block font-mono">
                                ID: {feat.id}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteFeature(feat.id, cardTitle)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete this highlight card"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Icon Selection */}
                        <div className="space-y-2">
                          <IconSelector
                            selectedIcon={feat.icon || 'ShoppingBag'}
                            onSelectIcon={(icon) => handleUpdateFeature(feat.id, { icon })}
                          />
                        </div>

                        {/* Card Title */}
                        <TrilingualInput
                          label="Card Title"
                          value={feat.title}
                          onChange={(title) => handleUpdateFeature(feat.id, { title })}
                        />

                        {/* Card Description */}
                        <TrilingualInput
                          label="Card Description"
                          value={feat.description}
                          onChange={(description) => handleUpdateFeature(feat.id, { description })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: PRODUCT CATALOG */}
        {activeSubTab === 'catalog' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> Products to Sell ({items.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add verified products ready for purchase and immediate delivery.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddProduct}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] hover:from-[#94201C] hover:to-[#711612] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product to Sell</span>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Products in Store Yet</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your store is currently showing the <strong>"Coming Soon"</strong> teaser on the website. Click below to add your first product to activate the Storefront catalog.
                </p>
                <button
                  type="button"
                  onClick={handleAddProduct}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#711612] text-white font-bold text-xs hover:bg-[#94201C] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Product</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((prod, idx) => {
                  const titlePreview = prod.title?.en || prod.title?.ku || prod.title?.ar || `Product #${idx + 1}`;
                  return (
                    <div
                      key={prod.id}
                      id={`cms-item-${prod.id}`}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all space-y-5 shadow-2xs"
                    >
                      {/* Item Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-[#711612] text-white text-xs font-bold flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 truncate max-w-xs sm:max-w-md">
                              {titlePreview}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                              <span className="font-semibold text-emerald-700">${prod.price || 0} USD</span>
                              <span>•</span>
                              <span>{prod.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Stock Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleUpdateItem(prod.id, { inStock: !prod.inStock })}
                            className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition ${
                              prod.inStock
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {prod.inStock ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>In Stock</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Out of Stock</span>
                              </>
                            )}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(prod.id, titlePreview)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete this product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <TrilingualInput
                        label="Product Title"
                        value={prod.title}
                        onChange={(title) => handleUpdateItem(prod.id, { title })}
                      />

                      {/* Description */}
                      <TrilingualInput
                        label="Product Description / Specs"
                        value={prod.description}
                        onChange={(description) => handleUpdateItem(prod.id, { description })}
                      />

                      {/* Pricing & Category Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Selling Price */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Price (USD) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={prod.price === 0 ? '' : prod.price}
                              onChange={(e) =>
                                handleUpdateItem(prod.id, { price: parseFloat(e.target.value) || 0 })
                              }
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#711612]/20 focus:border-[#711612] bg-white"
                            />
                          </div>
                        </div>

                        {/* Original / Regular Price */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Original Price (USD) <span className="text-slate-400 font-normal">(Optional)</span>
                          </label>
                          <div className="relative">
                            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={prod.originalPrice === 0 ? '' : prod.originalPrice || ''}
                              onChange={(e) =>
                                handleUpdateItem(prod.id, {
                                  originalPrice: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#711612]/20 focus:border-[#711612] bg-white"
                            />
                          </div>
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={prod.category || 'Electronics & Gadgets'}
                            onChange={(e) => handleUpdateItem(prod.id, { category: e.target.value })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#711612]/20 focus:border-[#711612] bg-white font-medium"
                          >
                            {DEFAULT_CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Promo Badge */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Promo Badge <span className="text-slate-400 font-normal">(e.g. Hot Deal)</span>
                          </label>
                          <div className="relative">
                            <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              placeholder="Hot Deal, Best Seller, etc."
                              value={prod.badge || ''}
                              onChange={(e) => handleUpdateItem(prod.id, { badge: e.target.value })}
                              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#711612]/20 focus:border-[#711612] bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Product Image */}
                      <div className="space-y-2">
                        <ImageUploadZone
                          label="Product Main Image *"
                          imageValue={prod.image || ''}
                          onImageChange={(image: string) => handleUpdateItem(prod.id, { image })}
                          aspectHint="Square product photo (1:1)"
                          aspectRatio="square"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Bottom Save Bar */}
        <PageSaveBar
          pageName="Products"
          onSave={onSave}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        title={deleteModal.title}
        message={deleteModal.message}
        onConfirm={() => {
          deleteModal.onConfirm();
          setDeleteModal({ ...deleteModal, open: false });
        }}
        onCancel={() => setDeleteModal({ ...deleteModal, open: false })}
      />
    </div>
  );
};

export default ProductsCMS;

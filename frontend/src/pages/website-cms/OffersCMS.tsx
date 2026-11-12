import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, Tag } from 'lucide-react';
import { OffersPageContent, FeaturedDealItem, PartnerStoreDealItem } from '../../types';
import { PageSaveBar, ConfirmDeleteModal, TrilingualInput, ImageUploadZone , scrollToNewItem } from './CMSComponents';

export type OffersSubTab = 'hero' | 'featuredDeals' | 'storeDeals' | 'cta';

export const OFFERS_SUB_TABS: { id: OffersSubTab; label: string }[] = [
  { id: 'hero', label: '1. Hero & Header' },
  { id: 'featuredDeals', label: '2. Featured Deals & Promos' },
  { id: 'storeDeals', label: '3. Store Coupon Codes' },
  { id: 'cta', label: '4. Call To Action (CTA)' },
];

export const OffersCMS: React.FC<{
  data: OffersPageContent;
  onChange: (updated: OffersPageContent) => void;
  activeSubTab: OffersSubTab;
  onSelectSubTab: (tab: OffersSubTab) => void;
  onSave?: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ data, onChange, activeSubTab, onSelectSubTab, onSave, saving, hasUnsavedChanges }) => {
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

  const update = (partial: Partial<OffersPageContent>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Offers Sub-Pages
        </div>
        {OFFERS_SUB_TABS.map((tab) => {
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

        </div>

      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {activeSubTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 1. Hero & Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Top banner and page headline for seasonal deals.</p>
            </div>
            <TrilingualInput
              label="Page Badge"
              value={data.hero.badge}
              onChange={(badge) => update({ hero: { ...data.hero, badge } })}
            />
            <TrilingualInput
              label="Page Title"
              value={data.hero.title}
              onChange={(title) => update({ hero: { ...data.hero, title } })}
            />
            <TrilingualInput
              label="Page Subtitle / Description"
              value={data.hero.description}
              onChange={(description) => update({ hero: { ...data.hero, description } })}
              isTextarea
              rows={2}
            />
            <ImageUploadZone
              label="Banner Image"
              imageValue={data.hero.bannerImage}
              onImageChange={(bannerImage) => update({ hero: { ...data.hero, bannerImage } })}
            />
          </div>
        )}

        {activeSubTab === 'featuredDeals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 2. Featured Deals & Promos
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">High-profile discounts and seasonal promotions.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: FeaturedDealItem = {
                    id: `deal-${Date.now()}`,
                    badge: { en: '', ku: '', ar: '' },
                    title: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                    discount: '',
                    validUntil: { en: '', ku: '', ar: '' },
                    code: '',
                  };
                  update({ featuredDeals: { ...data.featuredDeals, items: [...data.featuredDeals.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Deal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.featuredDeals.label}
                onChange={(label) => update({ featuredDeals: { ...data.featuredDeals, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.featuredDeals.title}
                onChange={(title) => update({ featuredDeals: { ...data.featuredDeals, title } })}
              />
            </div>

            <div className="space-y-4 pt-2">
              {data.featuredDeals.items.map((deal) => (
                <div key={deal.id} id={deal.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Deal Card</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Featured Deal',
                          `Are you sure you want to delete "${deal.title?.en || 'this deal'}"? This action cannot be undone.`,
                          () => {
                            update({
                              featuredDeals: {
                                ...data.featuredDeals,
                                items: data.featuredDeals.items.filter((d) => d.id !== deal.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Discount Highlight (e.g. 20% OFF, FREE DELIVERY)
                      </label>
                      <input
                        type="text"
                        value={deal.discount}
                        onChange={(e) => {
                          const updated = data.featuredDeals.items.map((d) =>
                            d.id === deal.id ? { ...d, discount: e.target.value } : d
                          );
                          update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-black bg-white text-[#711612]"
                        placeholder="20% OFF"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Promo Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={deal.code || ''}
                        onChange={(e) => {
                          const updated = data.featuredDeals.items.map((d) =>
                            d.id === deal.id ? { ...d, code: e.target.value } : d
                          );
                          update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold bg-white text-slate-800"
                        placeholder="WELCOME2026"
                      />
                    </div>
                  </div>

                  <TrilingualInput
                    label="Deal Badge"
                    value={deal.badge}
                    onChange={(badge) => {
                      const updated = data.featuredDeals.items.map((d) => (d.id === deal.id ? { ...d, badge } : d));
                      update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Deal Title"
                    value={deal.title}
                    onChange={(title) => {
                      const updated = data.featuredDeals.items.map((d) => (d.id === deal.id ? { ...d, title } : d));
                      update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Deal Description"
                    value={deal.description}
                    onChange={(description) => {
                      const updated = data.featuredDeals.items.map((d) =>
                        d.id === deal.id ? { ...d, description } : d
                      );
                      update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />

                  <TrilingualInput
                    label="Validity Note"
                    value={deal.validUntil}
                    onChange={(validUntil) => {
                      const updated = data.featuredDeals.items.map((d) =>
                        d.id === deal.id ? { ...d, validUntil } : d
                      );
                      update({ featuredDeals: { ...data.featuredDeals, items: updated } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'storeDeals' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 3. Store Coupon Codes
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Verified partner discount codes for international stores.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: PartnerStoreDealItem = {
                    id: `store-${Date.now()}`,
                    storeName: '',
                    discount: '',
                    code: '',
                    category: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                  };
                  update({ storeDeals: { ...data.storeDeals, items: [...data.storeDeals.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Store Code</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {data.storeDeals.items.map((code) => (
                <div key={code.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-[#711612]" />
                      <span>{code.storeName || 'Store Code'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Store Deal',
                          `Are you sure you want to delete the store deal for "${code.storeName || 'this store'}"? This action cannot be undone.`,
                          () => {
                            update({
                              storeDeals: {
                                ...data.storeDeals,
                                items: data.storeDeals.items.filter((c) => c.id !== code.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Store Name (e.g. Trendyol, SHEIN)
                      </label>
                      <input
                        type="text"
                        value={code.storeName}
                        onChange={(e) => {
                          const updated = data.storeDeals.items.map((c) =>
                            c.id === code.id ? { ...c, storeName: e.target.value } : c
                          );
                          update({ storeDeals: { ...data.storeDeals, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-bold bg-white"
                        placeholder="Trendyol"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Discount Text
                      </label>
                      <input
                        type="text"
                        value={code.discount}
                        onChange={(e) => {
                          const updated = data.storeDeals.items.map((c) =>
                            c.id === code.id ? { ...c, discount: e.target.value } : c
                          );
                          update({ storeDeals: { ...data.storeDeals, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-black bg-white text-[#711612]"
                        placeholder="Up to 50% Off"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        value={code.code}
                        onChange={(e) => {
                          const updated = data.storeDeals.items.map((c) =>
                            c.id === code.id ? { ...c, code: e.target.value } : c
                          );
                          update({ storeDeals: { ...data.storeDeals, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono font-bold bg-white text-slate-800"
                        placeholder="TREND50"
                      />
                    </div>
                  </div>

                  <TrilingualInput
                    label="Store Category"
                    value={code.category}
                    onChange={(category) => {
                      const updated = data.storeDeals.items.map((c) => (c.id === code.id ? { ...c, category } : c));
                      update({ storeDeals: { ...data.storeDeals, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Deal Description"
                    value={code.description}
                    onChange={(description) => {
                      const updated = data.storeDeals.items.map((c) => (c.id === code.id ? { ...c, description } : c));
                      update({ storeDeals: { ...data.storeDeals, items: updated } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'cta' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 4. Bottom Call To Action (CTA)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">The closing banner on the offers page.</p>
            </div>
            <TrilingualInput
              label="CTA Title"
              value={data.cta.title}
              onChange={(title) => update({ cta: { ...data.cta, title } })}
            />
            <TrilingualInput
              label="CTA Subtitle"
              value={data.cta.subtitle}
              onChange={(subtitle) => update({ cta: { ...data.cta, subtitle } })}
              isTextarea
              rows={2}
            />
            <TrilingualInput
              label="Button Text"
              value={data.cta.primaryBtn}
              onChange={(primaryBtn) => update({ cta: { ...data.cta, primaryBtn } })}
            />
          </div>
        )}

        <PageSaveBar onSave={onSave} saving={saving} hasUnsavedChanges={hasUnsavedChanges} pageName="Offers" />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        title={deleteModal.title}
        message={deleteModal.message}
        onCancel={() => setDeleteModal({ open: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={() => {
          deleteModal.onConfirm();
          setDeleteModal({ open: false, title: '', message: '', onConfirm: () => {} });
        }}
      />
      </div>
    </div>
  );
};

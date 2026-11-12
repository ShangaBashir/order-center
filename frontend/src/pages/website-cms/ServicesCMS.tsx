import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { ServicesPageContent, ServiceCardItem, ServiceAdvantageItem } from '../../types';
import { PageSaveBar, ConfirmDeleteModal, TrilingualInput, ImageUploadZone, IconSelector , scrollToNewItem } from './CMSComponents';

export type ServicesSubTab = 'hero' | 'servicesList' | 'whyChoose' | 'cta';

export const SERVICES_SUB_TABS: { id: ServicesSubTab; label: string }[] = [
  { id: 'hero', label: '1. Hero & Header' },
  { id: 'servicesList', label: '2. Services Offered (Cards)' },
  { id: 'whyChoose', label: '3. Why Choose Our Shipping' },
  { id: 'cta', label: '4. Call To Action (CTA)' },
];

export const ServicesCMS: React.FC<{
  data: ServicesPageContent;
  onChange: (updated: ServicesPageContent) => void;
  activeSubTab: ServicesSubTab;
  onSelectSubTab: (tab: ServicesSubTab) => void;
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

  const update = (partial: Partial<ServicesPageContent>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Services Sub-Pages
        </div>
        {SERVICES_SUB_TABS.map((tab) => {
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
              <p className="text-xs text-slate-500 mt-0.5">Top banner and page headline for the services page.</p>
            </div>
            <TrilingualInput
              label="Page Badge"
              value={data.hero.badge}
              onChange={(badge) => update({ hero: { ...data.hero, badge } })}
            />
            <TrilingualInput
              label="Page Headline / Title"
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

        {activeSubTab === 'servicesList' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 2. Services Offered (Cards)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Manage services, descriptions, and feature tag pills.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ServiceCardItem = {
                    id: `srv-${Date.now()}`,
                    icon: 'Sparkles',
                    title: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                    tags: [],
                    featured: false,
                  };
                  update({ servicesList: { ...data.servicesList, items: [...data.servicesList.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.servicesList.label}
                onChange={(label) => update({ servicesList: { ...data.servicesList, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.servicesList.title}
                onChange={(title) => update({ servicesList: { ...data.servicesList, title } })}
              />
            </div>

            <TrilingualInput
              label="Section Subtitle"
              value={data.servicesList.subtitle}
              onChange={(subtitle) => update({ servicesList: { ...data.servicesList, subtitle } })}
              isTextarea
              rows={2}
            />

            <div className="space-y-4 pt-2">
              {data.servicesList.items.map((srv, idx) => (
                <div key={srv.id} id={srv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#711612]/10 text-[#711612] flex items-center justify-center text-[10px] font-black">
                        {idx + 1}
                      </span>
                      Service #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Service',
                          `Are you sure you want to delete "${srv.title?.en || 'this service'}"? This action cannot be undone.`,
                          () => {
                            update({
                              servicesList: {
                                ...data.servicesList,
                                items: data.servicesList.items.filter((s) => s.id !== srv.id),
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
                    <div className="md:col-span-2">
                      <IconSelector
                        selectedIcon={srv.icon}
                        onSelectIcon={(icon) => {
                          const updated = data.servicesList.items.map((s) =>
                            s.id === srv.id ? { ...s, icon } : s
                          );
                          update({ servicesList: { ...data.servicesList, items: updated } });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={srv.tags.join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                          const updated = data.servicesList.items.map((s) =>
                            s.id === srv.id ? { ...s, tags } : s
                          );
                          update({ servicesList: { ...data.servicesList, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="Amazon, SHEIN, Fast"
                      />
                    </div>
                  </div>

                  <TrilingualInput
                    label="Service Title"
                    value={srv.title}
                    onChange={(title) => {
                      const updated = data.servicesList.items.map((s) =>
                        s.id === srv.id ? { ...s, title } : s
                      );
                      update({ servicesList: { ...data.servicesList, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Service Description"
                    value={srv.description}
                    onChange={(description) => {
                      const updated = data.servicesList.items.map((s) =>
                        s.id === srv.id ? { ...s, description } : s
                      );
                      update({ servicesList: { ...data.servicesList, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'whyChoose' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 3. Why Choose Our Shipping
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Key advantages and guarantees highlighted for shoppers.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ServiceAdvantageItem = {
                    id: `adv-${Date.now()}`,
                    icon: 'Sparkles',
                    title: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                  };
                  update({ whyChoose: { ...data.whyChoose, items: [...data.whyChoose.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Advantage</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.whyChoose.label}
                onChange={(label) => update({ whyChoose: { ...data.whyChoose, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.whyChoose.title}
                onChange={(title) => update({ whyChoose: { ...data.whyChoose, title } })}
              />
            </div>

            <div className="space-y-4 pt-2">
              {data.whyChoose.items.map((adv) => (
                <div key={adv.id} id={adv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Advantage Card</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Advantage Card',
                          `Are you sure you want to delete "${adv.title?.en || 'this advantage card'}"? This action cannot be undone.`,
                          () => {
                            update({
                              whyChoose: {
                                ...data.whyChoose,
                                items: data.whyChoose.items.filter((a) => a.id !== adv.id),
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
                  <IconSelector
                    selectedIcon={adv.icon}
                    onSelectIcon={(icon) => {
                      const updated = data.whyChoose.items.map((a) => (a.id === adv.id ? { ...a, icon } : a));
                      update({ whyChoose: { ...data.whyChoose, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Title"
                    value={adv.title}
                    onChange={(title) => {
                      const updated = data.whyChoose.items.map((a) => (a.id === adv.id ? { ...a, title } : a));
                      update({ whyChoose: { ...data.whyChoose, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Description"
                    value={adv.description}
                    onChange={(description) => {
                      const updated = data.whyChoose.items.map((a) => (a.id === adv.id ? { ...a, description } : a));
                      update({ whyChoose: { ...data.whyChoose, items: updated } });
                    }}
                    isTextarea
                    rows={2}
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
              <p className="text-xs text-slate-500 mt-0.5">The closing banner on the services page.</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Primary Button Text"
                value={data.cta.primaryBtn}
                onChange={(primaryBtn) => update({ cta: { ...data.cta, primaryBtn } })}
              />
              <TrilingualInput
                label="Secondary Button Text"
                value={data.cta.secondaryBtn}
                onChange={(secondaryBtn) => update({ cta: { ...data.cta, secondaryBtn } })}
              />
            </div>
          </div>
        )}

        <PageSaveBar onSave={onSave} saving={saving} hasUnsavedChanges={hasUnsavedChanges} pageName="Services" />

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

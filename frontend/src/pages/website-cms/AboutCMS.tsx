import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { AboutPageContent, WhatWeDoItem, ValueItem, ProcessStepItem } from '../../types';
import { PageSaveBar, ConfirmDeleteModal, TrilingualInput, ImageUploadZone, IconSelector , scrollToNewItem } from './CMSComponents';

export type AboutSubTab = 'hero' | 'who' | 'what' | 'mission' | 'values' | 'process' | 'cta';

export const ABOUT_SUB_TABS: { id: AboutSubTab; label: string; num: string }[] = [
  { id: 'hero', label: '1. Hero & Header', num: '1' },
  { id: 'who', label: '2. Who We Are & Stats', num: '2' },
  { id: 'what', label: '3. What We Do (Cards)', num: '3' },
  { id: 'mission', label: '4. Mission & Vision', num: '4' },
  { id: 'values', label: '5. Our Values', num: '5' },
  { id: 'process', label: '6. Our Process', num: '6' },
  { id: 'cta', label: '7. Call To Action', num: '7' },
];

export const AboutCMS: React.FC<{
  data: AboutPageContent;
  onChange: (updated: AboutPageContent) => void;
  activeSubTab: AboutSubTab;
  onSelectSubTab: (tab: AboutSubTab) => void;
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

  const update = (partial: Partial<AboutPageContent>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          About Sub-Pages
        </div>
        {ABOUT_SUB_TABS.map((tab) => {
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
        {/* 1. Hero & Header */}
        {activeSubTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 1. Hero & Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Top banner and page headline in all 3 languages.</p>
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
              label="Hero Subtitle / Description"
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

        {/* 2. Who We Are */}
        {activeSubTab === 'who' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 2. Who We Are & Stats
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Company overview story, highlighted quote, image and key metrics.</p>
            </div>
            <TrilingualInput
              label="Section Badge"
              value={data.whoWeAre.label}
              onChange={(label) => update({ whoWeAre: { ...data.whoWeAre, label } })}
            />
            <TrilingualInput
              label="Section Title"
              value={data.whoWeAre.title}
              onChange={(title) => update({ whoWeAre: { ...data.whoWeAre, title } })}
            />
            <TrilingualInput
              label="First Paragraph"
              value={data.whoWeAre.paragraph1}
              onChange={(paragraph1) => update({ whoWeAre: { ...data.whoWeAre, paragraph1 } })}
              isTextarea
              rows={3}
            />
            <TrilingualInput
              label="Second Paragraph"
              value={data.whoWeAre.paragraph2}
              onChange={(paragraph2) => update({ whoWeAre: { ...data.whoWeAre, paragraph2 } })}
              isTextarea
              rows={3}
            />
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Highlight Box</div>
              <TrilingualInput
                label="Card Title"
                value={data.whoWeAre.cardTitle}
                onChange={(cardTitle) => update({ whoWeAre: { ...data.whoWeAre, cardTitle } })}
              />
              <TrilingualInput
                label="Card Highlight (Golden Pill)"
                value={data.whoWeAre.cardHighlight}
                onChange={(cardHighlight) => update({ whoWeAre: { ...data.whoWeAre, cardHighlight } })}
              />
              <TrilingualInput
                label="Card Description"
                value={data.whoWeAre.cardDescription}
                onChange={(cardDescription) => update({ whoWeAre: { ...data.whoWeAre, cardDescription } })}
                isTextarea
                rows={2}
              />
            </div>
            <ImageUploadZone
              label="Who We Are Featured Image"
              imageValue={data.whoWeAre.image}
              onImageChange={(image) => update({ whoWeAre: { ...data.whoWeAre, image } })}
            />
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Key Statistics</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.whoWeAre.stats.map((st) => (
                  <div key={st.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Stat Value
                      </label>
                      <input
                        type="text"
                        value={st.value}
                        onChange={(e) => {
                          const updated = data.whoWeAre.stats.map((s) =>
                            s.id === st.id ? { ...s, value: e.target.value } : s
                          );
                          update({ whoWeAre: { ...data.whoWeAre, stats: updated } });
                        }}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black bg-white text-[#711612]"
                      />
                    </div>
                    <TrilingualInput
                      label="Stat Label"
                      value={st.label}
                      onChange={(label) => {
                        const updated = data.whoWeAre.stats.map((s) => (s.id === st.id ? { ...s, label } : s));
                        update({ whoWeAre: { ...data.whoWeAre, stats: updated } });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. What We Do */}
        {activeSubTab === 'what' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 3. What We Do (Cards)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Core operations cards describing our capabilities.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: WhatWeDoItem = {
                    id: `what-${Date.now()}`,
                    icon: 'Sparkles',
                    title: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                  };
                  update({ whatWeDo: { ...data.whatWeDo, items: [...data.whatWeDo.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.whatWeDo.label}
                onChange={(label) => update({ whatWeDo: { ...data.whatWeDo, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.whatWeDo.title}
                onChange={(title) => update({ whatWeDo: { ...data.whatWeDo, title } })}
              />
            </div>
            <TrilingualInput
              label="Section Subtitle"
              value={data.whatWeDo.subtitle}
              onChange={(subtitle) => update({ whatWeDo: { ...data.whatWeDo, subtitle } })}
              isTextarea
              rows={2}
            />
            <div className="space-y-4 pt-2">
              {data.whatWeDo.items.map((item, idx) => (
                <div key={item.id} id={item.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Service Card',
                          `Are you sure you want to delete "${item.title?.en || 'this card'}"? This action cannot be undone.`,
                          () => {
                            update({
                              whatWeDo: {
                                ...data.whatWeDo,
                                items: data.whatWeDo.items.filter((i) => i.id !== item.id),
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
                    selectedIcon={item.icon}
                    onSelectIcon={(icon) => {
                      const updated = data.whatWeDo.items.map((i) => (i.id === item.id ? { ...i, icon } : i));
                      update({ whatWeDo: { ...data.whatWeDo, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Title"
                    value={item.title}
                    onChange={(title) => {
                      const updated = data.whatWeDo.items.map((i) => (i.id === item.id ? { ...i, title } : i));
                      update({ whatWeDo: { ...data.whatWeDo, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Description"
                    value={item.description}
                    onChange={(description) => {
                      const updated = data.whatWeDo.items.map((i) => (i.id === item.id ? { ...i, description } : i));
                      update({ whatWeDo: { ...data.whatWeDo, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Mission & Vision */}
        {activeSubTab === 'mission' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 4. Mission & Vision
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Core organizational mission and future vision statements.</p>
            </div>
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Mission Statement</div>
              <TrilingualInput
                label="Mission Title"
                value={data.missionVision.missionTitle}
                onChange={(missionTitle) => update({ missionVision: { ...data.missionVision, missionTitle } })}
              />
              <TrilingualInput
                label="Mission Description"
                value={data.missionVision.missionDescription}
                onChange={(missionDescription) =>
                  update({ missionVision: { ...data.missionVision, missionDescription } })
                }
                isTextarea
                rows={3}
              />
            </div>
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Vision Statement</div>
              <TrilingualInput
                label="Vision Title"
                value={data.missionVision.visionTitle}
                onChange={(visionTitle) => update({ missionVision: { ...data.missionVision, visionTitle } })}
              />
              <TrilingualInput
                label="Vision Description"
                value={data.missionVision.visionDescription}
                onChange={(visionDescription) =>
                  update({ missionVision: { ...data.missionVision, visionDescription } })
                }
                isTextarea
                rows={3}
              />
            </div>
          </div>
        )}

        {/* 5. Values */}
        {activeSubTab === 'values' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 5. Our Values
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Foundational company values and customer promises.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ValueItem = {
                    id: `val-${Date.now()}`,
                    icon: 'Sparkles',
                    title: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                  };
                  update({ values: { ...data.values, items: [...data.values.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Value</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.values.label}
                onChange={(label) => update({ values: { ...data.values, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.values.title}
                onChange={(title) => update({ values: { ...data.values, title } })}
              />
            </div>
            <div className="space-y-4 pt-2">
              {data.values.items.map((val, idx) => (
                <div key={val.id} id={val.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Value #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Value Card',
                          `Are you sure you want to delete "${val.title?.en || 'this value card'}"? This action cannot be undone.`,
                          () => {
                            update({
                              values: {
                                ...data.values,
                                items: data.values.items.filter((v) => v.id !== val.id),
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
                    selectedIcon={val.icon}
                    onSelectIcon={(icon) => {
                      const updated = data.values.items.map((v) => (v.id === val.id ? { ...v, icon } : v));
                      update({ values: { ...data.values, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Title"
                    value={val.title}
                    onChange={(title) => {
                      const updated = data.values.items.map((v) => (v.id === val.id ? { ...v, title } : v));
                      update({ values: { ...data.values, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Description"
                    value={val.description}
                    onChange={(description) => {
                      const updated = data.values.items.map((v) => (v.id === val.id ? { ...v, description } : v));
                      update({ values: { ...data.values, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Process */}
        {activeSubTab === 'process' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 6. Our Process
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Step-by-step lifecycle from order link to delivery.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ProcessStepItem = {
                    id: `prc-${Date.now()}`,
                    stepNumber: data.process.items.length + 1,
                    label: { en: '', ku: '', ar: '' },
                    description: { en: '', ku: '', ar: '' },
                    icon: 'ArrowRight',
                  };
                  update({ process: { ...data.process, items: [...data.process.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.process.label}
                onChange={(label) => update({ process: { ...data.process, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.process.title}
                onChange={(title) => update({ process: { ...data.process, title } })}
              />
            </div>
            <div className="space-y-4 pt-2">
              {data.process.items.map((prc, idx) => (
                <div key={prc.id} id={prc.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Step #{prc.stepNumber || idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Process Step',
                          `Are you sure you want to delete step "${prc.label?.en || 'this step'}"? This action cannot be undone.`,
                          () => {
                            update({
                              process: {
                                ...data.process,
                                items: data.process.items.filter((p) => p.id !== prc.id),
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
                    selectedIcon={prc.icon}
                    onSelectIcon={(icon) => {
                      const updated = data.process.items.map((p) => (p.id === prc.id ? { ...p, icon } : p));
                      update({ process: { ...data.process, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Step Label"
                    value={prc.label}
                    onChange={(label) => {
                      const updated = data.process.items.map((p) => (p.id === prc.id ? { ...p, label } : p));
                      update({ process: { ...data.process, items: updated } });
                    }}
                  />
                  <TrilingualInput
                    label="Step Description"
                    value={prc.description || { en: '', ku: '', ar: '' }}
                    onChange={(description) => {
                      const updated = data.process.items.map((p) => (p.id === prc.id ? { ...p, description } : p));
                      update({ process: { ...data.process, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. CTA */}
        {activeSubTab === 'cta' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 7. Bottom Call To Action (CTA)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Footer banner call to action buttons and text in all 3 languages.</p>
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

        <PageSaveBar onSave={onSave} saving={saving} hasUnsavedChanges={hasUnsavedChanges} pageName="About" />

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

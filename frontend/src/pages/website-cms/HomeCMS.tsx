import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, Upload, Clock, Image as ImageIcon, ExternalLink, ArrowUp, ArrowDown, Globe, Sparkles, Link as LinkIcon } from 'lucide-react';
import { HomePageContent, HomeFeatureItem, HomeStepItem, HomeStatItem, GlobalWebsiteItem } from '../../types';
import { PageSaveBar, TrilingualInput, scrollToNewItem, IconSelector, ConfirmDeleteModal } from './CMSComponents';

export type HomeSubTab = 'hero' | 'howItWorks' | 'globalWebsites' | 'stats' | 'features' | 'cta';

export const HOME_SUB_TABS: { id: HomeSubTab; label: string; num: string }[] = [
  { id: 'hero', label: '1. Hero & Header', num: '1' },
  { id: 'howItWorks', label: '2. How It Works (Steps)', num: '2' },
  { id: 'globalWebsites', label: '3. Global Websites', num: '3' },
  { id: 'stats', label: '4. Performance Stats', num: '4' },
  { id: 'features', label: '5. Why Choose Us (Features)', num: '5' },
  { id: 'cta', label: '6. Call To Action (CTA)', num: '6' },
];

export const BRAND_PRESETS = [
  { name: 'Amazon', abbr: 'Amazon', url: 'https://www.amazon.com', color: '#FF9900', bg: '#fff8ee', border: '#ffe5b0' },
  { name: 'SHEIN', abbr: 'SHEIN', url: 'https://www.shein.com', color: '#111111', bg: '#ffffff', border: '#e0e0e0' },
  { name: 'Alibaba', abbr: 'Alibaba', url: 'https://www.alibaba.com', color: '#FF6A00', bg: '#fff5ee', border: '#ffe4cc' },
  { name: 'AliExpress', abbr: 'AliEx', url: 'https://www.aliexpress.com', color: '#e62e04', bg: '#fff0ee', border: '#ffc5bb' },
  { name: 'Temu', abbr: 'Temu', url: 'https://www.temu.com', color: '#fb5c02', bg: '#fff2ee', border: '#ffd0bb' },
  { name: 'eBay', abbr: 'eBay', url: 'https://www.ebay.com', color: '#86b817', bg: '#f5fff0', border: '#c8f0a0' },
  { name: 'Trendyol', abbr: 'Trendyol', url: 'https://www.trendyol.com', color: '#f27a1a', bg: '#fff8f2', border: '#fedec7' },
  { name: 'Zara', abbr: 'ZARA', url: 'https://www.zara.com', color: '#000000', bg: '#ffffff', border: '#e5e7eb' },
  { name: 'H&M', abbr: 'H&M', url: 'https://www2.hm.com', color: '#cf102d', bg: '#fdf2f2', border: '#fecaca' },
  { name: 'Nike', abbr: 'NIKE', url: 'https://www.nike.com', color: '#111111', bg: '#f9fafb', border: '#e5e7eb' },
  { name: 'Apple', abbr: 'Apple', url: 'https://www.apple.com', color: '#555555', bg: '#f8fafc', border: '#e2e8f0' },
  { name: 'ASOS', abbr: 'ASOS', url: 'https://www.asos.com', color: '#2d2d2d', bg: '#f9fafb', border: '#e5e7eb' },
  { name: 'Sephora', abbr: 'SEPHORA', url: 'https://www.sephora.com', color: '#000000', bg: '#ffffff', border: '#e5e7eb' },
  { name: 'iHerb', abbr: 'iHerb', url: 'https://www.iherb.com', color: '#458500', bg: '#f7fee7', border: '#d9f99d' },
];

export const HomeCMS: React.FC<{
  data: HomePageContent;
  onChange: (updated: HomePageContent) => void;
  activeSubTab: HomeSubTab;
  onSelectSubTab: (tab: HomeSubTab) => void;
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

  const update = (partial: Partial<HomePageContent>) => {
    onChange({ ...data, ...partial });
  };

  const triggerDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleAddFeature = () => {
    const newItem: HomeFeatureItem = {
      id: 'feat-' + Date.now(),
      icon: 'Sparkles',
      title: { en: '', ku: '', ar: '' },
      description: { en: '', ku: '', ar: '' },
    };
    update({
      features: {
        ...data.features,
        items: [...data.features.items, newItem],
      },
    });
    scrollToNewItem(newItem.id);
  };

  const handleAddStep = () => {
    const newStep: HomeStepItem = {
      id: 'step-' + Date.now(),
      stepNumber: '',
      icon: 'Sparkles',
      title: { en: '', ku: '', ar: '' },
      description: { en: '', ku: '', ar: '' },
    };
    update({
      howItWorks: {
        ...data.howItWorks,
        items: [...data.howItWorks.items, newStep],
      },
    });
    scrollToNewItem(newStep.id);
  };

  const handleAddGlobalWebsite = () => {
    const newSite: GlobalWebsiteItem = {
      id: 'site-' + Date.now(),
      name: '',
      abbr: '',
      url: 'https://',
      logo: '',
      color: '#111827',
      bg: '#ffffff',
      border: '#e2e8f0',
    };
    const current = data.globalWebsites || {
      label: { en: 'GLOBAL WEBSITES WE SHOP FROM', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
      title: { en: 'Global Websites We Shop From', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
      subtitle: { en: 'We purchase from all major international platforms on your behalf.', ku: 'ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.', ar: 'نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك.' },
      bottomNote: { en: "And many more international websites — if it's online, we can get it for you.", ku: 'و چەندین وێبسایتی نێودەوڵەتی تر — ئەگەر لە ئۆنلاین بێت، دەتوانین بۆت بهێنین.', ar: 'والعديد من المواقع العالمية الأخرى — إذا كان متوفراً عبر الإنترنت، يمكننا توفيره لك.' },
      items: [],
    };
    update({
      globalWebsites: {
        ...current,
        items: [...(current.items || []), newSite],
      },
    });
    scrollToNewItem(newSite.id);
  };

  const handleAddPresetWebsite = (preset: typeof BRAND_PRESETS[0]) => {
    const newSite: GlobalWebsiteItem = {
      id: 'site-' + Date.now(),
      name: preset.name,
      abbr: preset.abbr,
      url: preset.url,
      logo: '',
      color: preset.color,
      bg: preset.bg,
      border: preset.border,
    };
    const current = data.globalWebsites || {
      label: { en: 'GLOBAL WEBSITES WE SHOP FROM', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
      title: { en: 'Global Websites We Shop From', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
      subtitle: { en: 'We purchase from all major international platforms on your behalf.', ku: 'ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.', ar: 'نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك.' },
      bottomNote: { en: "And many more international websites — if it's online, we can get it for you.", ku: 'و چەندین وێبسایتی نێودەوڵەتی تر — ئەگەر لە ئۆنلاین بێت، دەتوانین بۆت بهێنین.', ar: 'والعديد من المواقع العالمية الأخرى — إذا كان متوفراً عبر الإنترنت، يمكننا توفيره لك.' },
      items: [],
    };
    update({
      globalWebsites: {
        ...current,
        items: [...(current.items || []), newSite],
      },
    });
    scrollToNewItem(newSite.id);
  };

  const handleLogoUpload = (siteId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        const current = data.globalWebsites || {
          label: { en: 'GLOBAL WEBSITES WE SHOP FROM', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
          title: { en: 'Global Websites We Shop From', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
          subtitle: { en: 'We purchase from all major international platforms on your behalf.', ku: 'ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.', ar: 'نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك.' },
          items: [],
        };
        const updated = (current.items || []).map((s) => (s.id === siteId ? { ...s, logo: base64 } : s));
        update({ globalWebsites: { ...current, items: updated } });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddStat = () => {
    const newStat: HomeStatItem = {
      id: 'stat-' + Date.now(),
      icon: 'Sparkles',
      value: '',
      label: { en: '', ku: '', ar: '' },
    };
    update({
      stats: {
        ...data.stats,
        items: [...data.stats.items, newStat],
      },
    });
    scrollToNewItem(newStat.id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sub-tabs Sidebar */}
      <div className="lg:col-span-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Home Sub-Pages
        </div>
        {HOME_SUB_TABS.map((tab) => {
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

      {/* Editor Content Area */}
      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {/* 1. Hero & Header */}
        {activeSubTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 1. Hero & Search Banner
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Main landing headline, search banner, primary call-to-action buttons, and header carousel photos.
              </p>
            </div>

            <TrilingualInput
              label="Hero Badge / Tagline"
              value={data.hero.badge}
              onChange={(badge) => update({ hero: { ...data.hero, badge } })}
            />

            <TrilingualInput
              label="Main Hero Title (Headline)"
              value={data.hero.title}
              onChange={(title) => update({ hero: { ...data.hero, title } })}
            />

            <TrilingualInput
              label="Hero Subtitle / Description"
              value={data.hero.description}
              onChange={(description) => update({ hero: { ...data.hero, description } })}
              isTextarea
              rows={3}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Primary Button Text"
                value={data.hero.primaryBtn}
                onChange={(primaryBtn) => update({ hero: { ...data.hero, primaryBtn } })}
              />
              <TrilingualInput
                label="Secondary Button Text"
                value={data.hero.secondaryBtn}
                onChange={(secondaryBtn) => update({ hero: { ...data.hero, secondaryBtn } })}
              />
            </div>

            {/* Hero Carousel Images & Animation Timing Section */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#711612]" />
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                      Hero Carousel Images (Website Header)
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#711612]/10 text-[#711612] text-[10px] font-black">
                      {((data.hero.bannerImages && data.hero.bannerImages.length > 0)
                        ? data.hero.bannerImages
                        : (data.hero.bannerImage ? [data.hero.bannerImage] : [])).length} Images
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload multiple images to display as an animated rotating carousel on the public website header.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="hero-carousel-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const files = e.target.files;
                      if (!files || files.length === 0) return;
                      const currentImages: string[] = (data.hero.bannerImages && data.hero.bannerImages.length > 0)
                        ? [...data.hero.bannerImages]
                        : (data.hero.bannerImage ? [data.hero.bannerImage] : []);

                      const newUrls: string[] = [];
                      let remaining = files.length;
                      for (let i = 0; i < files.length; i++) {
                        const file = files[i];
                        if (file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              newUrls.push(event.target.result as string);
                            }
                            remaining--;
                            if (remaining === 0) {
                              const updated = [...currentImages, ...newUrls];
                              update({
                                hero: {
                                  ...data.hero,
                                  bannerImages: updated,
                                  bannerImage: updated[0] || '',
                                },
                              });
                            }
                          };
                          reader.readAsDataURL(file);
                        } else {
                          remaining--;
                        }
                      }
                      e.target.value = '';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('hero-carousel-file-input')?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] hover:from-[#5A0E0B] hover:to-[#7E1A16] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ Add More Images</span>
                  </button>
                </div>
              </div>

              {/* Carousel Animation Time Control */}
              <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Carousel Slide Animation Duration (Amount of Time)
                    </label>
                  </div>
                  <span className="text-[11px] font-bold text-[#711612] bg-[#711612]/10 px-2.5 py-1 rounded-lg">
                    Current: {data.hero.carouselInterval || 4} Seconds per Slide
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <div className="flex items-center gap-1.5 mr-2">
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={data.hero.carouselInterval || 4}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const val = parseInt(e.target.value, 10) || 4;
                        update({
                          hero: {
                            ...data.hero,
                            carouselInterval: Math.max(1, Math.min(60, val)),
                          },
                        });
                      }}
                      className="w-16 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-center bg-white text-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                    />
                    <span className="text-xs font-bold text-slate-600">sec</span>
                  </div>

                  {/* Preset timing chips */}
                  {[
                    { label: '3s (Fast)', sec: 3 },
                    { label: '4s (Recommended)', sec: 4 },
                    { label: '5s (Standard)', sec: 5 },
                    { label: '7s (Relaxed)', sec: 7 },
                    { label: '10s (Slow)', sec: 10 },
                  ].map((preset) => {
                    const isSelected = (data.hero.carouselInterval || 4) === preset.sec;
                    return (
                      <button
                        key={preset.sec}
                        type="button"
                        onClick={() =>
                          update({
                            hero: {
                              ...data.hero,
                              carouselInterval: preset.sec,
                            },
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#711612] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500">
                  Controls the amount of time each image stays on screen before executing a smooth cross-fade and Ken Burns zoom animation to the next image.
                </p>
              </div>

              {/* Uploaded Carousel Images Gallery List */}
              <div className="space-y-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Carousel Slides Gallery
                </div>

                {(() => {
                  const currentImages: string[] = (data.hero.bannerImages && data.hero.bannerImages.length > 0)
                    ? data.hero.bannerImages
                    : (data.hero.bannerImage ? [data.hero.bannerImage] : []);

                  if (currentImages.length === 0) {
                    return (
                      <div
                        onClick={() => document.getElementById('hero-carousel-file-input')?.click()}
                        className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center cursor-pointer hover:border-[#711612] hover:bg-slate-50/80 transition"
                      >
                        <Upload className="w-8 h-8 text-[#711612] mx-auto mb-2 opacity-80" />
                        <p className="text-xs font-bold text-slate-700">No images in hero carousel yet</p>
                        <p className="text-[11px] text-slate-400 mt-1">Click to upload your first image or photos</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentImages.map((imgUrl: string, idx: number) => (
                        <div
                          key={idx}
                          className="group relative rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                        >
                          <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
                            <img
                              src={imgUrl}
                              alt={`Hero Carousel Slide ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-extrabold border border-white/20">
                                Slide #{idx + 1}
                              </span>
                              {idx === 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-[#D4AF37] text-slate-950 text-[10px] font-black shadow-xs">
                                  Cover
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                triggerDeleteConfirm(
                                  `Remove Slide #${idx + 1}`,
                                  'Are you sure you want to remove this photo from the hero carousel?',
                                  () => {
                                    const updated = currentImages.filter((_: string, i: number) => i !== idx);
                                    update({
                                      hero: {
                                        ...data.hero,
                                        bannerImages: updated,
                                        bannerImage: updated[0] || '',
                                      },
                                    });
                                  }
                                )
                              }
                              className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-md transition"
                              title="Delete this image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="p-3 bg-white flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-semibold truncate max-w-[140px]">
                              {imgUrl.startsWith('data:') ? 'Custom Upload' : 'Web Image'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Index {idx + 1}/{currentImages.length}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Append Extra Card Button */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('hero-carousel-file-input')?.click()}
                        className="rounded-xl border-2 border-dashed border-slate-300 hover:border-[#711612] bg-white hover:bg-slate-50 p-6 flex flex-col items-center justify-center text-center transition group min-h-[160px]"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#711612]/10 text-[#711612] flex items-center justify-center mb-2 group-hover:scale-110 transition">
                          <Plus className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">+ Add Another Image</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP</span>
                      </button>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* 2. How It Works (Steps) */}
        {activeSubTab === 'howItWorks' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 2. How It Works (Steps)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The step-by-step customer ordering process.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] hover:from-[#5A0E0B] hover:to-[#7E1A16] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.howItWorks.label}
                onChange={(label) => update({ howItWorks: { ...data.howItWorks, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.howItWorks.title}
                onChange={(title) => update({ howItWorks: { ...data.howItWorks, title } })}
              />
            </div>

            <TrilingualInput
              label="Section Subtitle"
              value={data.howItWorks.subtitle}
              onChange={(subtitle) => update({ howItWorks: { ...data.howItWorks, subtitle } })}
              isTextarea
              rows={2}
            />

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Ordering Steps ({data.howItWorks.items.length})
              </div>
              {data.howItWorks.items.map((step, idx) => (
                <div
                  key={step.id}
                  id={step.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#711612] text-white text-xs font-bold flex items-center justify-center">
                        {step.stepNumber || idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-700">Step #{idx + 1}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Step #' + (step.stepNumber || idx + 1),
                          'Are you sure you want to delete this ordering step? This action cannot be undone.',
                          () => {
                            update({
                              howItWorks: {
                                ...data.howItWorks,
                                items: data.howItWorks.items.filter((s) => s.id !== step.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Step Number Label
                      </label>
                      <input
                        type="text"
                        value={step.stepNumber}
                        onChange={(e) => {
                          const updated = data.howItWorks.items.map((s) =>
                            s.id === step.id ? { ...s, stepNumber: e.target.value } : s
                          );
                          update({ howItWorks: { ...data.howItWorks, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                        placeholder="01"
                      />
                    </div>
                    <IconSelector
                      selectedIcon={step.icon}
                      onSelectIcon={(icon) => {
                        const updated = data.howItWorks.items.map((s) =>
                          s.id === step.id ? { ...s, icon } : s
                        );
                        update({ howItWorks: { ...data.howItWorks, items: updated } });
                      }}
                    />
                  </div>

                  <TrilingualInput
                    label="Step Title"
                    value={step.title}
                    onChange={(title) => {
                      const updated = data.howItWorks.items.map((s) =>
                        s.id === step.id ? { ...s, title } : s
                      );
                      update({ howItWorks: { ...data.howItWorks, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Step Description"
                    value={step.description}
                    onChange={(description) => {
                      const updated = data.howItWorks.items.map((s) =>
                        s.id === step.id ? { ...s, description } : s
                      );
                      update({ howItWorks: { ...data.howItWorks, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Global Websites Section */}
        {activeSubTab === 'globalWebsites' && (() => {
          const gw = data.globalWebsites || {
            label: { en: 'GLOBAL WEBSITES WE SHOP FROM', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
            title: { en: 'Global Websites We Shop From', ku: 'وێبسایتە جیهانییەکانی کڕینمان', ar: 'المواقع العالمية التي نتسوق منها' },
            subtitle: { en: 'We purchase from all major international platforms on your behalf.', ku: 'ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.', ar: 'نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك.' },
            bottomNote: { en: "And many more international websites — if it's online, we can get it for you.", ku: 'و چەندین وێبسایتی نێودەوڵەتی تر — ئەگەر لە ئۆنلاین بێت، دەتوانین بۆت بهێنین.', ar: 'والعديد من المواقع العالمية الأخرى — إذا كان متوفراً عبر الإنترنت، يمكننا توفيره لك.' },
            items: [],
          };
          const sites = gw.items || [];

          return (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <span className="text-[#711612]">→</span> 3. Global Websites We Shop From
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage international shopping websites, customize logos/images, and set clickable destination URLs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddGlobalWebsite}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-[#711612] hover:bg-[#5a120e] text-white transition flex items-center gap-1.5 shadow-sm shadow-[#711612]/20"
                >
                  <Plus className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add Website</span>
                </button>
              </div>

              {/* Section Header Text Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <TrilingualInput
                  label="Section Badge"
                  value={gw.label}
                  onChange={(label) => update({ globalWebsites: { ...gw, label } })}
                />
                <TrilingualInput
                  label="Section Title"
                  value={gw.title}
                  onChange={(title) => update({ globalWebsites: { ...gw, title } })}
                />
                <div className="md:col-span-2">
                  <TrilingualInput
                    label="Section Subtitle"
                    value={gw.subtitle}
                    onChange={(subtitle) => update({ globalWebsites: { ...gw, subtitle } })}
                  />
                </div>
                <div className="md:col-span-2">
                  <TrilingualInput
                    label="Bottom Note"
                    value={gw.bottomNote || { en: '', ku: '', ar: '' }}
                    onChange={(bottomNote) => update({ globalWebsites: { ...gw, bottomNote } })}
                  />
                </div>
              </div>

              {/* Quick Brand Presets Toolbar */}
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Quick Add Brand Preset / Popular Store</span>
                  </span>
                  <span className="text-[11px] text-amber-700">Click to instantly add pre-configured website</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {BRAND_PRESETS.map((bp) => (
                    <button
                      key={bp.name}
                      type="button"
                      onClick={() => handleAddPresetWebsite(bp)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white hover:bg-amber-100/60 text-slate-700 border border-amber-200 shadow-2xs hover:scale-105 transition-all flex items-center gap-1"
                      title={`Add ${bp.name} to website list`}
                    >
                      <Plus className="w-3 h-3 text-[#711612]" />
                      <span>{bp.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Websites List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Websites Display List ({sites.length} Active)</span>
                  <span className="text-[11px] text-slate-400 font-normal">All cards open destination URLs in a new browser tab</span>
                </div>

                {sites.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <Globe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">No websites in list yet</p>
                    <p className="text-[11px] text-slate-400 mt-1 mb-3">Click below or choose a brand preset above</p>
                    <button
                      type="button"
                      onClick={handleAddGlobalWebsite}
                      className="px-4 py-2 rounded-xl text-xs font-extrabold bg-[#711612] text-white hover:bg-[#5a120e] transition inline-flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Add First Website</span>
                    </button>
                  </div>
                )}

                {sites.map((site, index) => {
                  return (
                    <div
                      key={site.id}
                      id={site.id}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4 relative group hover:border-slate-300 transition-all"
                    >
                      {/* Top Bar */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-extrabold text-xs flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-extrabold text-slate-800">
                            {site.name || 'Untitled Website'}
                          </span>
                          {site.url && (
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-[#711612] hover:underline flex items-center gap-1 font-medium bg-red-50 px-2 py-0.5 rounded-md"
                              title="Test link"
                            >
                              <span>{site.url.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Reorder Up / Down */}
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => {
                              const updated = [...sites];
                              const temp = updated[index - 1];
                              updated[index - 1] = updated[index];
                              updated[index] = temp;
                              update({ globalWebsites: { ...gw, items: updated } });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === sites.length - 1}
                            onClick={() => {
                              const updated = [...sites];
                              const temp = updated[index + 1];
                              updated[index + 1] = updated[index];
                              updated[index] = temp;
                              update({ globalWebsites: { ...gw, items: updated } });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() =>
                              triggerDeleteConfirm(
                                'Delete Website',
                                `Are you sure you want to remove "${site.name || 'this website'}" from the global shopping list?`,
                                () => {
                                  const updated = sites.filter((s) => s.id !== site.id);
                                  update({ globalWebsites: { ...gw, items: updated } });
                                }
                              )
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                            title="Delete Website"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Card Content & Live Preview Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Left 2 Cols: Form Inputs */}
                        <div className="lg:col-span-2 space-y-3.5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Website Name
                              </label>
                              <input
                                type="text"
                                value={site.name}
                                onChange={(e) => {
                                  const updated = sites.map((s) =>
                                    s.id === site.id ? { ...s, name: e.target.value } : s
                                  );
                                  update({ globalWebsites: { ...gw, items: updated } });
                                }}
                                placeholder="e.g. Amazon"
                                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-[#711612] focus:ring-1 focus:ring-[#711612] outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                Display Text / Abbreviation
                              </label>
                              <input
                                type="text"
                                value={site.abbr || ''}
                                onChange={(e) => {
                                  const updated = sites.map((s) =>
                                    s.id === site.id ? { ...s, abbr: e.target.value } : s
                                  );
                                  update({ globalWebsites: { ...gw, items: updated } });
                                }}
                                placeholder="e.g. Amazon or AliEx"
                                className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 focus:border-[#711612] focus:ring-1 focus:ring-[#711612] outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1 flex items-center justify-between">
                              <span>Destination Website URL (Real Website)</span>
                              {site.url && (
                                <a
                                  href={site.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#711612] hover:underline flex items-center gap-0.5 normal-case font-normal text-[11px]"
                                >
                                  <span>Test Opening</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </label>
                            <div className="relative">
                              <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="url"
                                value={site.url || ''}
                                onChange={(e) => {
                                  const updated = sites.map((s) =>
                                    s.id === site.id ? { ...s, url: e.target.value } : s
                                  );
                                  update({ globalWebsites: { ...gw, items: updated } });
                                }}
                                placeholder="https://www.example.com"
                                className="w-full text-xs font-semibold pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-[#711612] focus:ring-1 focus:ring-[#711612] outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* Logo Management */}
                          <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-700 uppercase">
                                Logo Image / Brand Graphic
                              </span>
                              {site.logo && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    triggerDeleteConfirm(
                                      'Remove Website Logo',
                                      `Are you sure you want to remove the logo for "${site.name || 'this website'}"?`,
                                      () => {
                                        const updated = sites.map((s) =>
                                          s.id === site.id ? { ...s, logo: '' } : s
                                        );
                                        update({ globalWebsites: { ...gw, items: updated } });
                                      }
                                    )
                                  }
                                  className="text-[10px] text-red-600 hover:underline font-bold"
                                >
                                  Remove Logo Image
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Hidden file input */}
                              <input
                                type="file"
                                id={`logo-file-${site.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleLogoUpload(site.id, file);
                                }}
                              />

                              <button
                                type="button"
                                onClick={() => document.getElementById(`logo-file-${site.id}`)?.click()}
                                className="px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-dashed border-slate-300 hover:border-[#711612] transition flex items-center gap-1.5 shadow-2xs"
                              >
                                <Upload className="w-3.5 h-3.5 text-[#711612]" />
                                <span>{site.logo ? 'Change Logo Image' : 'Upload Logo Image'}</span>
                              </button>

                              <span className="text-[11px] text-slate-400">or enter image URL:</span>
                              <input
                                type="text"
                                value={site.logo || ''}
                                onChange={(e) => {
                                  const updated = sites.map((s) =>
                                    s.id === site.id ? { ...s, logo: e.target.value } : s
                                  );
                                  update({ globalWebsites: { ...gw, items: updated } });
                                }}
                                placeholder="https://.../logo.png"
                                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:border-[#711612] outline-none font-mono"
                              />
                            </div>
                          </div>

                          {/* Color Palette Controls */}
                          <div className="grid grid-cols-3 gap-3 pt-1">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Text Color
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={site.color || '#111827'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, color: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5"
                                />
                                <input
                                  type="text"
                                  value={site.color || '#111827'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, color: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-full text-[11px] font-mono px-2 py-1 rounded border border-slate-200"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Card Background
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={site.bg || '#ffffff'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, bg: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5"
                                />
                                <input
                                  type="text"
                                  value={site.bg || '#ffffff'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, bg: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-full text-[11px] font-mono px-2 py-1 rounded border border-slate-200"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                Border Color
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={site.border || '#e2e8f0'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, border: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-7 h-7 rounded border border-slate-300 cursor-pointer p-0.5"
                                />
                                <input
                                  type="text"
                                  value={site.border || '#e2e8f0'}
                                  onChange={(e) => {
                                    const updated = sites.map((s) =>
                                      s.id === site.id ? { ...s, border: e.target.value } : s
                                    );
                                    update({ globalWebsites: { ...gw, items: updated } });
                                  }}
                                  className="w-full text-[11px] font-mono px-2 py-1 rounded border border-slate-200"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right 1 Col: Live Website Card Preview */}
                        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200/70">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                            Customer Website Preview
                          </span>

                          <a
                            href={site.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full max-w-[180px] group flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                            style={{
                              background: site.bg || '#ffffff',
                              borderColor: site.border || '#e2e8f0',
                            }}
                          >
                            {site.logo ? (
                              <div className="h-8 flex items-center justify-center">
                                <img
                                  src={site.logo}
                                  alt={site.name}
                                  className="max-h-8 max-w-[100px] object-contain group-hover:scale-105 transition-transform"
                                />
                              </div>
                            ) : (
                              <div
                                className="font-display font-bold text-lg tracking-tight"
                                style={{ color: site.color || '#111827' }}
                              >
                                {site.abbr || site.name || 'Brand'}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                              <span>{site.name || 'Website'}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </div>
                          </a>

                          <p className="text-[10px] text-slate-400 text-center mt-2.5">
                            Click card to test opening real website in new tab
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sites.length > 0 && (
                  <button
                    type="button"
                    onClick={handleAddGlobalWebsite}
                    className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#711612] text-xs font-bold text-slate-600 hover:text-[#711612] hover:bg-slate-50 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4 text-[#D4AF37]" />
                    <span>Add Another Website</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* 4. Performance Stats */}
        {activeSubTab === 'stats' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 4. Performance Stats
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The achievement metrics counters and icons displayed on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddStat}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] hover:from-[#5A0E0B] hover:to-[#7E1A16] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Performance Stat</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.stats.items.map((st, idx) => (
                <div key={st.id} id={st.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Metric #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Metric #' + (idx + 1),
                          'Are you sure you want to delete this performance stat? This action cannot be undone.',
                          () => {
                            update({
                              stats: {
                                ...data.stats,
                                items: data.stats.items.filter((s) => s.id !== st.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition"
                      title="Delete metric"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {/* Icon Selector for each stat */}
                  <IconSelector
                    selectedIcon={st.icon || 'Star'}
                    onSelectIcon={(icon) => {
                      const updated = data.stats.items.map((s) => (s.id === st.id ? { ...s, icon } : s));
                      update({ stats: { ...data.stats, items: updated } });
                    }}
                  />

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Stat Number / Value (e.g. 50K+, 99.8%)
                    </label>
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => {
                        const updated = data.stats.items.map((s) => (s.id === st.id ? { ...s, value: e.target.value } : s));
                        update({ stats: { ...data.stats, items: updated } });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-black bg-white text-[#711612]"
                      placeholder="50K+"
                    />
                  </div>

                  <TrilingualInput
                    label="Metric Label"
                    value={st.label}
                    onChange={(label) => {
                      const updated = data.stats.items.map((s) => (s.id === st.id ? { ...s, label } : s));
                      update({ stats: { ...data.stats, items: updated } });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Why Choose Us (Features & Advantages) */}
        {activeSubTab === 'features' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 4. Why Choose Us (Features & Advantages)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core advantages and selling points displayed on the homepage.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#711612] to-[#94201C] hover:from-[#5A0E0B] hover:to-[#7E1A16] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Advantage</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.features.label}
                onChange={(label) => update({ features: { ...data.features, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.features.title}
                onChange={(title) => update({ features: { ...data.features, title } })}
              />
            </div>

            <TrilingualInput
              label="Section Subtitle"
              value={data.features.subtitle}
              onChange={(subtitle) => update({ features: { ...data.features, subtitle } })}
              isTextarea
              rows={2}
            />

            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Advantage Cards ({data.features.items.length})
              </div>
              {data.features.items.map((item, idx) => (
                <div
                  key={item.id}
                  id={item.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Feature #' + (idx + 1),
                          'Are you sure you want to delete this feature card? This action cannot be undone.',
                          () => {
                            update({
                              features: {
                                ...data.features,
                                items: data.features.items.filter((i) => i.id !== item.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 p-1 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  <IconSelector
                    selectedIcon={item.icon}
                    onSelectIcon={(icon) => {
                      const updated = data.features.items.map((i) =>
                        i.id === item.id ? { ...i, icon } : i
                      );
                      update({ features: { ...data.features, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Feature Title"
                    value={item.title}
                    onChange={(title) => {
                      const updated = data.features.items.map((i) =>
                        i.id === item.id ? { ...i, title } : i
                      );
                      update({ features: { ...data.features, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Feature Description"
                    value={item.description}
                    onChange={(description) => {
                      const updated = data.features.items.map((i) =>
                        i.id === item.id ? { ...i, description } : i
                      );
                      update({ features: { ...data.features, items: updated } });
                    }}
                    isTextarea
                    rows={2}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. CTA */}
        {activeSubTab === 'cta' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 6. Bottom Call To Action (CTA)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Closing conversion prompt and buttons at the bottom of the home page.
              </p>
            </div>

            <TrilingualInput
              label="CTA Headline"
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

        <PageSaveBar
          onSave={onSave}
          saving={saving}
          hasUnsavedChanges={hasUnsavedChanges}
          pageName="Home"
        />
      </div>

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
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  Globe, Save, ShieldCheck, Star, Heart, ArrowRight, Truck, Users, Plane, Search,
  Compass, Award, Sparkles, Upload, Trash2, Package, Tag, Clock, Phone, Mail, MapPin,
  AlertTriangle, Link2, ShoppingBag
} from 'lucide-react';
import { MultilingualText } from '../../types';
import { ValidationError } from '../../utils/contentValidator';

export const AVAILABLE_ICONS = [
  'ShoppingBag', 'Truck', 'ShieldCheck', 'Globe', 'Star', 'Heart', 'ArrowRight', 'Users',
  'Plane', 'Search', 'Compass', 'Award', 'Sparkles', 'Package', 'Tag', 'Clock', 'Phone', 'Mail', 'MapPin'
];

export const renderIcon = (nameOrUrl: string, className = 'w-4 h-4') => {
  if (!nameOrUrl) return <Sparkles className={className} />;
  
  // Support custom uploaded icon (base64 image or web image URL)
  if (nameOrUrl.startsWith('data:image') || nameOrUrl.startsWith('http') || nameOrUrl.startsWith('/')) {
    return (
      <img
        src={nameOrUrl}
        alt="icon"
        className={`${className} object-contain`}
      />
    );
  }

  switch (nameOrUrl) {
    case 'ShoppingBag': return <ShoppingBag className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'ArrowRight': return <ArrowRight className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'Search': return <Search className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'Award': return <Award className={className} />;
    case 'Package': return <Package className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'Clock': return <Clock className={className} />;
    case 'Phone': return <Phone className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'Sparkles':
    default: return <Sparkles className={className} />;
  }
};

export const AutoResizeTextarea: React.FC<{
  dir: 'ltr' | 'rtl';
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  minRows?: number;
  disallowEnglish?: boolean;
}> = ({ dir, value, onChange, placeholder, minRows = 1, disallowEnglish = false }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [showWarning, setShowWarning] = useState(false);

  const adjustHeight = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const minHeight = minRows === 1 ? 42 : minRows * 24 + 18;
    const computedHeight = Math.max(el.scrollHeight, minHeight);
    el.style.height = `${computedHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value, minRows]);

  useEffect(() => {
    window.addEventListener('resize', adjustHeight);
    return () => window.removeEventListener('resize', adjustHeight);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let nextVal = e.target.value;
    if (disallowEnglish && /[a-zA-Z]/.test(nextVal)) {
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
      nextVal = nextVal.replace(/[a-zA-Z]/g, '');
    }
    onChange(nextVal);
    adjustHeight();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      disallowEnglish &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey &&
      e.key.length === 1 &&
      /[a-zA-Z]/.test(e.key)
    ) {
      e.preventDefault();
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 3000);
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={ref}
        rows={minRows}
        dir={dir}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full px-3 py-2 rounded-lg border text-sm bg-white transition-all leading-relaxed ${
          showWarning
            ? 'border-red-500 ring-2 ring-red-400/30'
            : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#711612]/30'
        }`}
        style={{ overflow: 'hidden', resize: 'vertical' }}
      />
      {showWarning && (
        <div className="absolute -top-7 right-0 z-20 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold shadow-md animate-fade-in flex items-center gap-1 pointer-events-none">
          <span>❌ English letters not allowed!</span>
        </div>
      )}
    </div>
  );
};

export const TrilingualInput: React.FC<{
  label: string;
  value: MultilingualText;
  onChange: (val: MultilingualText) => void;
  isTextarea?: boolean;
  rows?: number;
  placeholder?: string;
  required?: boolean;
}> = ({ label, value, onChange, isTextarea = false, rows = 3, placeholder = '', required = true }) => {
  const minRows = isTextarea ? (rows || 3) : 1;

  const isEnFilled = !!value?.en?.trim();
  const kuVal = value?.ku || '';
  const arVal = value?.ar || '';

  const kuHasEnglish = /[a-zA-Z]/.test(kuVal);
  const arHasEnglish = /[a-zA-Z]/.test(arVal);

  const isKuFilled = !!kuVal.trim() && !kuHasEnglish;
  const isArFilled = !!arVal.trim() && !arHasEnglish;
  const anyHasEnglish = kuHasEnglish || arHasEnglish;
  const allFilled = isEnFilled && isKuFilled && isArFilled && !anyHasEnglish;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        {required && (
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors ${
              anyHasEnglish
                ? 'bg-red-50 text-red-700 border border-red-300'
                : allFilled
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {anyHasEnglish
              ? '❌ Kurdish & Arabic must not contain English letters'
              : allFilled
              ? '✓ All 3 Languages Filled'
              : '* Fill all 3 languages (EN, KU, AR)'}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* English (EN) */}
        <div className={`p-3 rounded-xl border transition-colors flex flex-col justify-start ${
          isEnFilled
            ? 'bg-slate-50/70 border-slate-200 focus-within:border-slate-400'
            : 'bg-amber-50/20 border-amber-200 focus-within:border-amber-400'
        }`}>
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>🇬🇧</span> English
            </span>
            <span className={`text-[10px] font-bold uppercase ${isEnFilled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isEnFilled ? '✓ EN' : '* Required'}
            </span>
          </div>
          <AutoResizeTextarea
            dir="ltr"
            value={value?.en || ''}
            onChange={(val) => onChange({ ...value, en: val })}
            placeholder={placeholder ? `${placeholder} (English)` : 'Type in English...'}
            minRows={minRows}
          />
        </div>

        {/* Kurdish (KU) */}
        <div className={`p-3 rounded-xl border transition-colors flex flex-col justify-start ${
          kuHasEnglish
            ? 'bg-red-50/30 border-red-400 focus-within:border-red-500'
            : isKuFilled
            ? 'bg-slate-50/70 border-slate-200 focus-within:border-slate-400'
            : 'bg-amber-50/20 border-amber-200 focus-within:border-amber-400'
        }`}>
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>☀️</span> کوردی (Kurdish)
            </span>
            <span className={`text-[10px] font-bold uppercase ${
              kuHasEnglish
                ? 'text-red-600 font-extrabold'
                : isKuFilled
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}>
              {kuHasEnglish ? '❌ No English Letters' : isKuFilled ? '✓ KU' : '* Required'}
            </span>
          </div>
          <AutoResizeTextarea
            dir="rtl"
            value={value?.ku || ''}
            onChange={(val) => onChange({ ...value, ku: val })}
            placeholder={placeholder ? `${placeholder} (Kurdish)` : 'بە کوردی بنووسە...'}
            minRows={minRows}
            disallowEnglish={true}
          />
          {kuHasEnglish && (
            <p className="text-[10px] font-bold text-red-600 mt-1">
              ⚠️ Kurdish input must only contain Kurdish text (no English letters).
            </p>
          )}
        </div>

        {/* Arabic (AR) */}
        <div className={`p-3 rounded-xl border transition-colors flex flex-col justify-start ${
          arHasEnglish
            ? 'bg-red-50/30 border-red-400 focus-within:border-red-500'
            : isArFilled
            ? 'bg-slate-50/70 border-slate-200 focus-within:border-slate-400'
            : 'bg-amber-50/20 border-amber-200 focus-within:border-amber-400'
        }`}>
          <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
              <span>🟢</span> العربية (Arabic)
            </span>
            <span className={`text-[10px] font-bold uppercase ${
              arHasEnglish
                ? 'text-red-600 font-extrabold'
                : isArFilled
                ? 'text-emerald-600'
                : 'text-amber-600'
            }`}>
              {arHasEnglish ? '❌ No English Letters' : isArFilled ? '✓ AR' : '* Required'}
            </span>
          </div>
          <AutoResizeTextarea
            dir="rtl"
            value={value?.ar || ''}
            onChange={(val) => onChange({ ...value, ar: val })}
            placeholder={placeholder ? `${placeholder} (Arabic)` : 'اكتب بالعربية...'}
            minRows={minRows}
            disallowEnglish={true}
          />
          {arHasEnglish && (
            <p className="text-[10px] font-bold text-red-600 mt-1">
              ⚠️ Arabic input must only contain Arabic text (no English letters).
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ImageUploadZone: React.FC<{
  label: string;
  imageValue: string;
  onImageChange: (base64OrUrl: string) => void;
  aspectHint?: string;
  aspectRatio?: 'banner' | 'square' | 'auto';
  onRequestRemove?: () => void;
}> = ({
  label,
  imageValue,
  onImageChange,
  aspectHint = 'PNG, JPG, WEBP or SVG up to 10MB',
  aspectRatio = 'banner',
  onRequestRemove,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [fitMode, setFitMode] = useState<'contain' | 'cover'>(
    aspectRatio === 'square' ? 'contain' : 'cover'
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, etc.)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlDraft.trim()) {
      onImageChange(urlDraft.trim());
      setUrlDraft('');
    }
  };

  const isSquare = aspectRatio === 'square';

  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`px-2.5 py-1 rounded-md transition ${
                inputMode === 'upload'
                  ? 'bg-white text-[#711612] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`px-2.5 py-1 rounded-md transition ${
                inputMode === 'url'
                  ? 'bg-white text-[#711612] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Image URL
            </button>
          </div>

          {imageValue && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[11px] font-semibold text-red-500 hover:text-red-700 hover:underline flex items-center gap-1 ml-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Image</span>
            </button>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* URL Input Bar if in URL mode */}
      {inputMode === 'url' && (
        <div className="flex items-center gap-2 max-w-md">
          <div className="relative flex-1">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="Paste direct image link (https://...)"
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleApplyUrl();
                }
              }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#711612]/20 focus:border-[#711612]"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3.5 py-2 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#8B1E1A] transition shadow-xs"
          >
            Apply
          </button>
        </div>
      )}

      {/* Image Preview or Dropzone */}
      {imageValue ? (
        <div className="space-y-1.5">
          <div
            className={`relative group rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm flex items-center justify-center ${
              isSquare ? 'w-56 h-56 sm:w-64 sm:h-64 aspect-square p-2 bg-slate-50/50' : 'w-full h-48 max-w-md bg-slate-100'
            }`}
          >
            <img
              src={imageValue}
              alt="Uploaded Preview"
              className={`w-full h-full transition-transform duration-300 group-hover:scale-105 ${
                fitMode === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-md hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#711612]" />
                <span>Change Image</span>
              </button>
              <button
                type="button"
                onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
                className="px-3 py-1 rounded-lg bg-black/60 text-white font-semibold text-[11px] hover:bg-black/80 flex items-center gap-1"
                title="Toggle fit mode"
              >
                <span>Fit: {fitMode === 'contain' ? 'Fit (Contain)' : 'Fill (Cover)'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <button
              type="button"
              onClick={() => setFitMode(fitMode === 'contain' ? 'cover' : 'contain')}
              className="text-[#711612] hover:underline font-bold"
            >
              Switch to {fitMode === 'contain' ? 'Fill Image' : 'Fit Entire Product'}
            </button>
            <span>•</span>
            <span className="text-slate-400">
              {imageValue.startsWith('data:image') ? 'Uploaded from device' : 'Web Image Link'}
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
            isSquare
              ? 'w-56 h-56 sm:w-64 sm:h-64 aspect-square p-4'
              : 'max-w-md w-full p-6'
          } ${
            dragActive
              ? 'border-[#711612] bg-[#711612]/5'
              : 'border-slate-300 hover:border-[#711612] bg-slate-50/70 hover:bg-slate-50'
          }`}
        >
          <div className="w-11 h-11 rounded-full bg-[#711612]/10 text-[#711612] flex items-center justify-center mb-2.5">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-xs font-bold text-slate-700">Click to upload from device or drag & drop</p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">{aspectHint}</p>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        title={`Remove ${label}`}
        message={`Are you sure you want to remove this ${label.toLowerCase()} image? This action cannot be undone.`}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => {
          if (onRequestRemove) {
            onRequestRemove();
          } else {
            onImageChange('');
          }
          setShowDeleteConfirm(false);
        }}
      />
    </div>
  );
};

export const scrollToNewItem = (id: string) => {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-[#711612]', 'ring-offset-2', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-[#711612]', 'ring-offset-2');
      }, 2500);
    }
  }, 120);
};

export const IconSelector: React.FC<{
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}> = ({ selectedIcon, onSelectIcon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid icon image (SVG, PNG, WEBP, or JPG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onSelectIcon(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const isCustom = selectedIcon && (selectedIcon.startsWith('data:image') || selectedIcon.startsWith('http') || selectedIcon.startsWith('/'));

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Icon
        </label>
        {isCustom && (
          <span className="text-[10px] font-bold text-[#711612] bg-[#711612]/10 px-2 py-0.5 rounded">
            Custom Icon Selected
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {AVAILABLE_ICONS.map((iconName) => (
          <button
            key={iconName}
            type="button"
            onClick={() => onSelectIcon(iconName)}
            className={`p-2 rounded-lg border text-sm flex items-center justify-center transition-all ${
              selectedIcon === iconName
                ? 'bg-[#711612] text-white border-[#711612] shadow-sm scale-105'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
            }`}
            title={iconName}
          >
            {renderIcon(iconName, 'w-4 h-4')}
          </button>
        ))}

        {/* Upload Custom Icon Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCustomUpload}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isCustom
              ? 'bg-[#711612] text-white border-[#711612] shadow-sm scale-105'
              : 'bg-white text-slate-700 border-dashed border-slate-300 hover:border-[#711612] hover:bg-slate-50'
          }`}
          title="Upload custom icon (SVG, PNG, WEBP, etc.)"
        >
          {isCustom ? (
            <div className="w-4 h-4 flex items-center justify-center overflow-hidden rounded">
              <img src={selectedIcon} alt="Custom Icon" className="w-4 h-4 object-contain" />
            </div>
          ) : (
            <Upload className="w-3.5 h-3.5 text-[#711612]" />
          )}
          <span>{isCustom ? 'Custom Icon' : 'Upload Icon'}</span>
        </button>
      </div>
    </div>
  );
};

export const PageSaveBar: React.FC<{
  onSave?: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
  pageName: string;
}> = ({ onSave, saving, hasUnsavedChanges, pageName }) => {
  if (!onSave) return null;
  return (
    <div className="pt-6 border-t border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="text-xs">
        {hasUnsavedChanges ? (
          <span className="inline-flex items-center gap-2 font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-300 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsaved changes on this page</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300/80 shadow-xs">
            <span className="text-emerald-600 font-extrabold text-sm">✓</span>
            <span>All changes saved on this page</span>
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={saving || !hasUnsavedChanges}
        className={`px-6 py-3 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
          hasUnsavedChanges
            ? 'bg-[#3A0808] hover:bg-[#200404] active:bg-[#120202] text-white shadow-xl shadow-[#3A0808]/40 border border-[#200404] ring-2 ring-[#711612]/30 scale-[1.02] cursor-pointer'
            : 'bg-slate-100 hover:bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
        }`}
      >
        {saving ? (
          <>
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Saving {pageName}...</span>
          </>
        ) : (
          <>
            <Save className={`w-4 h-4 ${hasUnsavedChanges ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
            <span>Save {pageName} Changes</span>
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping ml-1" />
            )}
          </>
        )}
      </button>
    </div>
  );
};

export const ConfirmDeleteModal: React.FC<{
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  isOpen,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this? This action cannot be undone.',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-extrabold text-slate-900">{title}</h4>
            <p className="text-xs text-slate-500">Please confirm your action.</p>
          </div>
        </div>

        <div className="bg-red-50/70 border border-red-200 p-3.5 rounded-xl text-xs text-red-900 font-medium leading-relaxed">
          {message}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition shadow-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const ValidationAlertModal: React.FC<{
  isOpen: boolean;
  errors: ValidationError[];
  onClose: () => void;
  onGoToError?: (error: ValidationError) => void;
}> = ({ isOpen, errors, onClose, onGoToError }) => {
  if (!isOpen || errors.length === 0) return null;

  const firstError = errors[0];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-red-200 overflow-hidden animate-scale-in flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#60100C] p-6 text-white flex items-center gap-4 flex-shrink-0 border-b border-[#D4AF37]/30">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 text-amber-300 shadow-md">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight">You have to fill all the inputs</h3>
            <p className="text-xs text-white/80 mt-0.5">
              Cannot save changes until all required inputs are filled.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 text-xs font-medium leading-relaxed">
            All fields (including English, Kurdish, and Arabic text) must be completed before saving. Please fill in the missing inputs below or delete any incomplete cards.
          </div>

          <div className="space-y-3">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
              <span>Incomplete Items ({errors.length})</span>
              <span className="text-[10px] text-red-600 font-semibold font-mono">Action Required</span>
            </div>
            {errors.map((err, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-red-200 bg-red-50/50 space-y-2 hover:bg-red-50 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-red-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span>{err.itemTitle}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200 flex-shrink-0">
                    {err.sectionName}
                  </span>
                </div>
                <div className="text-[11px] text-red-900 space-y-1.5 pl-3 border-l-2 border-red-300">
                  <div className="font-semibold text-[11px] text-red-900">Missing empty inputs:</div>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {err.missingFields.map((f, fi) => (
                      <span
                        key={fi}
                        className="px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-bold border border-red-200/80"
                      >
                        ✕ {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>
          {onGoToError && firstError && (
            <button
              type="button"
              onClick={() => onGoToError(firstError)}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#711612] hover:bg-[#8B1E1A] text-white transition shadow-md flex items-center gap-2"
            >
              <span>Go & Fill Inputs</span>
              <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

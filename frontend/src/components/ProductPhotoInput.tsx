import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link2, X, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ProductPhotoInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

export const ProductPhotoInput: React.FC<ProductPhotoInputProps> = ({
  value,
  onChange,
  label = 'Product Photo',
  required = true,
}) => {
  // Determine if current value is uploaded base64 data URL
  const isUploadedBase64 = value ? value.startsWith('data:image') : false;

  // Active mode: either 'link' or 'upload'
  const [mode, setMode] = useState<'link' | 'upload'>(() => {
    return isUploadedBase64 ? 'upload' : 'link';
  });

  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [linkInput, setLinkInput] = useState(() => (isUploadedBase64 ? '' : value || ''));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setImageError(false);
    if (value && value.startsWith('data:image')) {
      setMode('upload');
      setLinkInput('');
    } else if (value) {
      setMode('link');
      setLinkInput(value);
    } else {
      setLinkInput('');
    }
  }, [value]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, or SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageError(false);
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLinkChange = (url: string) => {
    setImageError(false);
    setLinkInput(url);
    onChange(url.trim());
  };

  const handleClear = () => {
    setLinkInput('');
    setImageError(false);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasPhoto = !!value && value.trim().length > 0;

  return (
    <div className="sm:col-span-2 space-y-2.5">
      {/* Header with Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="block text-xs font-bold text-slate-700">
            {label} {required && <span className="text-red-500 font-bold">*</span>}
          </label>
          <span className="text-[11px] text-slate-500">
            Choose 1 option: provide a photo by web link or by uploading.
          </span>
        </div>

        {/* 2-Option Selector: By Link vs By Upload */}
        <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setMode('link')}
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'link'
                ? 'bg-white text-[#711612] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>By Link</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all ${
              mode === 'upload'
                ? 'bg-white text-[#711612] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>By Upload</span>
          </button>
        </div>
      </div>

      {/* Option 1: By Link */}
      {mode === 'link' && (
        <div className="space-y-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={linkInput}
              onChange={(e) => handleLinkChange(e.target.value)}
              placeholder="Paste image web address (https://...)"
              className="w-full text-sm border border-slate-300 rounded-md py-2 pl-9 pr-9 focus:border-[#711612] focus:ring-1 focus:ring-[#711612]/30 shadow-sm font-mono text-xs placeholder:font-sans placeholder:text-slate-400"
            />
            {linkInput && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-red-500 transition-colors"
                title="Clear photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            Paste a direct URL to the product picture from the manufacturer or store.
          </p>
        </div>
      )}

      {/* Option 2: By Upload */}
      {mode === 'upload' && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
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
            className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-[#711612] bg-[#711612]/5'
                : hasPhoto && isUploadedBase64
                ? 'border-emerald-300 bg-emerald-50/20 hover:border-emerald-400'
                : 'border-slate-300 hover:border-[#711612] bg-slate-50/70 hover:bg-slate-50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-[#711612]/10 text-[#711612] flex items-center justify-center mx-auto mb-2">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-700">
              {hasPhoto && isUploadedBase64 ? 'Click or drag to replace uploaded photo' : 'Click to upload product photo or drag & drop'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP, or SVG up to 10MB</p>
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      {hasPhoto && (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 flex items-center justify-center relative">
            {imageError ? (
              <div className="text-center p-1 text-[9px] text-red-500 font-bold flex flex-col items-center">
                <ImageIcon className="w-4 h-4 mb-0.5" />
                <span>Invalid Image</span>
              </div>
            ) : (
              <img
                src={value}
                alt="Product Preview"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Product photo attached</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700 uppercase">
                {isUploadedBase64 ? 'Uploaded File' : 'Web Link'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
              {isUploadedBase64 ? 'Image stored with order' : value}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
};

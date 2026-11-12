import React from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { GeneralWebsiteContent } from '../../types';
import { TrilingualInput } from './CMSComponents';

export const GeneralCMS: React.FC<{
  data: GeneralWebsiteContent;
  onChange: (updated: GeneralWebsiteContent) => void;
  onSave?: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ data, onChange, onSave, saving, hasUnsavedChanges }) => {
  const update = (partial: Partial<GeneralWebsiteContent>) => {
    onChange({ ...data, ...partial });
  };

  const defaultFooterDesc = {
    en: "Your trusted partner for international shopping and shipping. We bring the world's best products to your doorstep.",
    ku: "هاوبەشی باوەڕپێکراوت بۆ کڕین و گەیاندنی نێودەوڵەتی. باشترین بەرهەمەکانی جیهان دەهێنینە بەردەرگاکەت.",
    ar: "شريكك الموثوق للتسوق والشحن الدولي. نجلب أفضل منتجات العالم إلى بابك."
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <span className="text-[#711612]">→</span> Footer & Brand Settings
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Footer brand identity, text under Order Center logo, primary phone, WhatsApp hotline, and office headquarters.
        </p>
      </div>

      <TrilingualInput
        label="Company Brand Name"
        value={data.companyName}
        onChange={(companyName) => update({ companyName })}
      />

      <TrilingualInput
        label="Global Brand Tagline"
        value={data.tagline}
        onChange={(tagline) => update({ tagline })}
      />

      {/* Text under Order Center in the footer (3 languages) */}
      <TrilingualInput
        label="Text Under Order Center In Footer (Description / Bio)"
        isTextarea
        rows={2}
        value={data.footerDescription || defaultFooterDesc}
        onChange={(footerDescription) => update({ footerDescription })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Primary Phone Number
          </label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
            placeholder="+964 750 000 0000"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            WhatsApp Hotline
          </label>
          <input
            type="text"
            value={data.whatsapp}
            onChange={(e) => update({ whatsapp: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
            placeholder="+964 750 000 0000"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Main Support Email
          </label>
          <input
            type="text"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
            placeholder="info@ordercenter.iq"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Secondary Phone Number (Optional)
          </label>
          <input
            type="text"
            value={data.secondaryPhone || ''}
            onChange={(e) => update({ secondaryPhone: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
            placeholder="0751 194 6651"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Google Maps Target Link (View Map)
          </label>
          <input
            type="text"
            value={data.googleMapsUrl || ''}
            onChange={(e) => update({ googleMapsUrl: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono bg-white"
            placeholder="https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297"
          />
        </div>
      </div>

      <TrilingualInput
        label="Headquarters Location Label"
        value={data.location}
        onChange={(location) => update({ location })}
      />

      {/* Bottom Save Bar */}
      {onSave && (
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs">
            {hasUnsavedChanges ? (
              <span className="inline-flex items-center gap-2 font-bold text-amber-800 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-300 shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes in Footer</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300/80 shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Footer settings are up to date</span>
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
                <span>Saving Footer Changes...</span>
              </>
            ) : (
              <>
                <Save className={`w-4 h-4 ${hasUnsavedChanges ? 'text-[#D4AF37]' : 'text-slate-400'}`} />
                <span>Save Footer Changes</span>
                {hasUnsavedChanges && (
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping ml-1" />
                )}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Save, ShieldCheck, CheckCircle2, DollarSign, Calculator } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useSettings } from '../context/SettingsContext';

export const AdminSettings: React.FC = () => {
  const { usdToIqdRate, idPrefix, defaultCurrency, saveSettings } = useSettings();

  const [rateInput, setRateInput] = useState<number>(usdToIqdRate);
  const [prefixInput, setPrefixInput] = useState<string>(idPrefix);
  const [currencyInput, setCurrencyInput] = useState<string>(defaultCurrency);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validRate = Number(rateInput) > 0 ? Number(rateInput) : 1500;
    saveSettings(validRate, prefixInput, currencyInput);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sampleUsd = 100;
  const sampleIqd = Math.round(sampleUsd * (Number(rateInput) || 1500));

  return (
    <AdminLayout title="Admin Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System & Admin Settings</h2>
          <p className="text-xs text-slate-500">Configure USD to IQD exchange rates, order ID format, and billing rules.</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Exchange rate and system settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          
          {/* CURRENCY & EXCHANGE RATE SECTION */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#711612] uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
              <span>Currency & Exchange Rate (USD / IQD)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Exchange Rate (1 USD = ? IQD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={rateInput}
                    onChange={e => setRateInput(parseFloat(e.target.value) || 0)}
                    className="w-full text-base font-bold text-slate-900 border-slate-300 rounded-md py-2.5 px-3 border shadow-sm focus:border-[#711612] focus:ring-[#711612]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-xs text-slate-400">IQD</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Changing this rate dynamically updates calculated order prices in Dinar across all pages.
                </p>
              </div>

              {/* Live Preview Box */}
              <div className="bg-[#EBEAE8]/70 p-4 rounded-md border border-slate-200 flex flex-col justify-center space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <Calculator className="w-3.5 h-3.5 text-[#711612]" />
                  <span>Live Conversion Preview</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  ${sampleUsd}.00 USD = <span className="text-[#711612] text-base">{sampleIqd.toLocaleString()} IQD</span>
                </div>
                <div className="text-[10px] text-slate-400">Rate: 1 USD = {rateInput} IQD</div>
              </div>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs font-semibold text-slate-500">Quick Rate Presets:</span>
              {[1500, 1510, 1520, 1530, 1550].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRateInput(r)}
                  className={`px-2.5 py-1 text-xs font-bold rounded border transition ${
                    rateInput === r
                      ? 'bg-[#711612] text-white border-[#711612]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {r.toLocaleString()} IQD
                </button>
              ))}
            </div>
          </div>

          {/* ORDER ID GENERATION RULES */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-[#711612] uppercase tracking-wider flex items-center gap-2 border-b pb-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Order ID Generation Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ID Format Prefix</label>
                <input
                  type="text"
                  value={prefixInput}
                  onChange={e => setPrefixInput(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border font-mono shadow-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">Example generated ID: <code className="font-bold text-[#711612]">{prefixInput}00001</code></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Base Currency</label>
                <select
                  value={currencyInput}
                  onChange={e => setCurrencyInput(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm bg-white font-medium text-slate-800"
                >
                  <option value="USD">USD ($)</option>
                  <option value="IQD">IQD (د.ع)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 border border-[#D4AF37]/30 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

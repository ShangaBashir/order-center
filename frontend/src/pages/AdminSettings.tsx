import React, { useState } from 'react';
import { Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';

export const AdminSettings: React.FC = () => {
  const [prefix, setPrefix] = useState('HB-2026-');
  const [currency, setCurrency] = useState('USD');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <AdminLayout title="Admin Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System & Admin Settings</h2>
          <p className="text-xs text-slate-500">Configure order ID generation format, currency preferences, and logistics rules.</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
          
          <div>
            <h3 className="text-sm font-bold text-[#711612] uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Order ID Generation Rules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ID Format Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={e => setPrefix(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border font-mono shadow-sm"
                />
                <p className="text-[10px] text-slate-400 mt-1">Example: <code className="font-bold text-[#711612]">{prefix}00001</code></p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Billing Currency</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm bg-white font-medium"
                >
                  <option value="USD">USD ($)</option>
                  <option value="IQD">IQD (د.ع)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 transition"
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

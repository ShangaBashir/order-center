import React, { useState } from 'react';
import { Save, CheckCircle2, DollarSign, Calculator, Database, Download, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { useSettings } from '../context/SettingsContext';
import axios from 'axios';

export const AdminSettings: React.FC = () => {
  const { usdToIqdRate, saveSettings, idPrefix, defaultCurrency } = useSettings();

  const [rateInput, setRateInput] = useState<number>(usdToIqdRate);
  const [saved, setSaved] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState<string | null>(null);
  const [backupError, setBackupError] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const validRate = Number(rateInput) > 0 ? Number(rateInput) : 1500;
    saveSettings(validRate, idPrefix, defaultCurrency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadBackup = async () => {
    try {
      setIsBackingUp(true);
      setBackupError(null);
      setBackupSuccess(null);

      // Attempt fetch from backend
      // Admin-only endpoint: send the admin token, and use the same API base as the rest of the app
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('ordercenter_admin_token');
      const res = await axios.get(`${apiBase}/backup`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const backupData = res.data.backup || res.data;

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      a.href = url;
      a.download = `ordercenter_full_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const countMsg = `${backupData.ordersCount || 0} orders and ${backupData.customersCount || 0} customers`;
      setBackupSuccess(`Backup generated & downloaded successfully! (${countMsg})`);
      setTimeout(() => setBackupSuccess(null), 5000);
    } catch (err: any) {
      console.error('Backup error:', err);
      setBackupError(err?.response?.data?.message || err?.response?.data?.error || 'Backup failed. Please sign in again as admin and retry.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const sampleUsd = 100;
  const sampleIqd = Math.round(sampleUsd * (Number(rateInput) || 1500));

  return (
    <AdminLayout title="Admin Settings">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">System & Admin Settings</h2>
          <p className="text-xs text-slate-500">Configure USD to IQD exchange rates, billing rules, and manage data backups.</p>
        </div>

        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Exchange rate and system settings saved successfully.</span>
          </div>
        )}

        {/* CURRENCY & EXCHANGE RATE FORM */}
        <form onSubmit={handleSave} className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
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

        {/* SYSTEM BACKUP & DATA RECOVERY CARD */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span>System Backup & Data Recovery</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Download a full backup of all customer orders, client records, and website content into a secure JSON snapshot.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Database Active
            </span>
          </div>

          {backupSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-md flex items-center gap-2 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{backupSuccess}</span>
            </div>
          )}

          {backupError && (
            <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs font-bold rounded-md flex items-center gap-2 shadow-sm animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span>{backupError}</span>
            </div>
          )}

          <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/30 p-5 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Export Full System Backup (JSON)</span>
              </div>
              <p className="text-xs text-slate-600 max-w-md leading-relaxed">
                Creates an immediate offline backup containing all recent orders, tracking histories, customer profiles, and custom website CMS configuration.
              </p>
            </div>

            <button
              type="button"
              disabled={isBackingUp}
              onClick={handleDownloadBackup}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 disabled:opacity-50 flex-shrink-0"
            >
              {isBackingUp ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating Backup...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Backup All Data</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

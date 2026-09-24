import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  usdToIqdRate: number;
  setUsdToIqdRate: (rate: number) => void;
  idPrefix: string;
  setIdPrefix: (prefix: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (curr: string) => void;
  saveSettings: (newRate: number, newPrefix: string, newCurr: string) => void;
  formatPriceWithIqd: (priceUsd: number) => { usdStr: string; iqdStr: string; combinedStr: string };
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const STORAGE_KEY_RATE = 'ordercenter_setting_iqd_rate';
const STORAGE_KEY_PREFIX = 'ordercenter_setting_id_prefix';
const STORAGE_KEY_CURR = 'ordercenter_setting_default_curr';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usdToIqdRate, setUsdToIqdRateState] = useState<number>(1500);
  const [idPrefix, setIdPrefixState] = useState<string>('HB-2026-');
  const [defaultCurrency, setDefaultCurrencyState] = useState<string>('USD');

  useEffect(() => {
    const savedRate = localStorage.getItem(STORAGE_KEY_RATE);
    const savedPrefix = localStorage.getItem(STORAGE_KEY_PREFIX);
    const savedCurr = localStorage.getItem(STORAGE_KEY_CURR);

    if (savedRate) {
      const parsed = parseFloat(savedRate);
      if (!isNaN(parsed) && parsed > 0) setUsdToIqdRateState(parsed);
    }
    if (savedPrefix) setIdPrefixState(savedPrefix);
    if (savedCurr) setDefaultCurrencyState(savedCurr);
  }, []);

  const saveSettings = (newRate: number, newPrefix: string, newCurr: string) => {
    setUsdToIqdRateState(newRate);
    setIdPrefixState(newPrefix);
    setDefaultCurrencyState(newCurr);

    localStorage.setItem(STORAGE_KEY_RATE, newRate.toString());
    localStorage.setItem(STORAGE_KEY_PREFIX, newPrefix);
    localStorage.setItem(STORAGE_KEY_CURR, newCurr);
  };

  const formatPriceWithIqd = (priceUsd: number) => {
    const usd = Number(priceUsd) || 0;
    const iqd = Math.round(usd * usdToIqdRate);
    const usdStr = `$${usd.toFixed(2)}`;
    const iqdStr = `${iqd.toLocaleString()} IQD`;
    const combinedStr = `${usdStr} (${iqdStr})`;
    return { usdStr, iqdStr, combinedStr };
  };

  return (
    <SettingsContext.Provider
      value={{
        usdToIqdRate,
        setUsdToIqdRate: (r) => setUsdToIqdRateState(r),
        idPrefix,
        setIdPrefix: (p) => setIdPrefixState(p),
        defaultCurrency,
        setDefaultCurrency: (c) => setDefaultCurrencyState(c),
        saveSettings,
        formatPriceWithIqd,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

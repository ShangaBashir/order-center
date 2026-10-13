import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Search, Package, AlertCircle, ArrowLeft
} from 'lucide-react';
import { orderApi } from '../api';
import { PublicTrackingData } from '../types';
import { StatusTimeline } from '../components/StatusTimeline';
import { useSettings } from '../context/SettingsContext';
import { useRealtimeTracking } from '../utils/realtime';

export const PublicTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const { formatPriceWithIqd } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('q') || 'HB-2026-00001';

  const [orderIdInput, setOrderIdInput] = useState(initialId);
  const [trackingData, setTrackingData] = useState<PublicTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const fetchTracking = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMsg('');
    setTrackingData(null);
    try {
      const data = await orderApi.trackOrder(idToSearch.trim());
      setTrackingData(data);
      if (searchParams.get('id') !== idToSearch.trim()) {
        setSearchParams({ id: idToSearch.trim() }, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Order not found. Please verify your Order ID.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrackingSilent = useCallback(async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    try {
      const data = await orderApi.trackOrder(idToSearch.trim());
      setTrackingData(data);
      setErrorMsg('');
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('not found')) {
        setErrorMsg('Order not found.');
      }
    }
  }, []);

  const activeLookupId = trackingData?.orderId || orderIdInput || initialId;

  // Real-time SSE / Broadcast listener
  const { isLivePulse } = useRealtimeTracking(activeLookupId, (event) => {
    if (event.type === 'ORDER_DELETED') {
      setErrorMsg('This order has been cancelled or deleted.');
      setTrackingData(null);
    } else {
      fetchTrackingSilent(activeLookupId);
    }
  });

  // Real-time live polling fallback every 3 seconds for guaranteed freshness
  useEffect(() => {
    if (!activeLookupId) return;
    const interval = setInterval(() => {
      fetchTrackingSilent(activeLookupId);
    }, 3000);
    return () => clearInterval(interval);
  }, [activeLookupId, fetchTrackingSilent]);

  useEffect(() => {
    if (initialId) {
      fetchTracking(initialId);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking(orderIdInput);
  };

  return (
    <div className="min-h-screen bg-[#EBEAE8] text-[#2C2C2C] flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <header className="bg-[#711612] text-white py-6 px-4 sm:px-8 border-b border-[#D4AF37]/40 shadow-md">
          <div className="max-w-5xl mx-auto flex items-center justify-center">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
              <img src="/logo.png" alt="Order Center Logo" className="h-10 w-auto object-contain" />
              <div className="text-left">
                <div className="font-display font-bold text-white text-lg">Order Center</div>
                <div className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase">Global Shopping & Shipping</div>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Back to Previous Page Link */}
          <div>
            <button
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#711612] transition bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#711612]" />
              <span>Back to Previous Page</span>
            </button>
          </div>
          
          {/* Tracking Search Card */}
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#711612]/10 text-[#711612]">
                <Package className="w-3.5 h-3.5" />
                Customer Shipment Tracking
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-[#711612]">
                Track Your Order
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Enter your unique Order ID to get live status updates and shipping progress.
              </p>
            </div>

            <form onSubmit={handleSearch} className="max-w-xl mx-auto space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 text-center">
                  Enter your Order ID
                </label>
                <div className="relative">
                  <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={orderIdInput}
                    onChange={e => setOrderIdInput(e.target.value)}
                    placeholder="e.g. HB-2026-00001"
                    className="w-full pl-12 pr-4 py-3 text-base border-2 border-slate-300 rounded-lg focus:border-[#711612] font-mono font-bold tracking-wide shadow-sm text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !orderIdInput.trim()}
                className="w-full py-3.5 bg-[#711612] hover:bg-[#57100d] text-white text-sm font-bold uppercase tracking-wider rounded-lg shadow-lg transition-all duration-200 border border-[#D4AF37]/30 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tracking Result View */}
          {trackingData && (
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 animate-fade-in">
              
              {/* Header Info Banner */}
              <div className="bg-[#711612] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/40">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">
                    Order ID: {trackingData.orderId}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold">{trackingData.productName}</h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-white/80">
                    <span>Quantity: {trackingData.quantity}</span>
                    <span>•</span>
                    <span className="font-bold text-[#D4AF37]">Total: {formatPriceWithIqd(trackingData.totalPrice).combinedStr}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border text-right sm:min-w-[200px] transition-all duration-300 ${
                  isLivePulse 
                    ? 'bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-400' 
                    : 'bg-white/10 backdrop-blur border-white/20'
                }`}>
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                      Live Real-Time
                    </span>
                  </div>
                  <span className="text-[10px] text-white/70 uppercase tracking-wider block">Current Status</span>
                  <span className="text-base sm:text-lg font-extrabold text-[#D4AF37] block mt-0.5">{trackingData.status}</span>
                  <span className="text-[10px] text-white/60 block mt-1">
                    Updated: {new Date(trackingData.updatedAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Shipping Overview Cards */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50/70">
                <div className="bg-white p-3.5 rounded-md border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Origin</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{trackingData.originCountry}</span>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destination</span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">{trackingData.destinationCountry}</span>
                </div>
                <div className="bg-white p-3.5 rounded-md border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Delivery</span>
                  <span className="text-xs font-bold text-[#711612] block mt-0.5">{trackingData.estimatedDelivery || 'Pending schedule'}</span>
                </div>
              </div>

              {/* Visual Order Timeline */}
              <div className="p-6 sm:p-8 space-y-4">
                <h3 className="text-sm font-bold text-[#711612] uppercase tracking-wider border-b pb-2">
                  Shipment Progress Timeline
                </h3>

                <StatusTimeline
                  currentStatus={trackingData.status}
                  statusHistory={trackingData.statusHistory}
                  showNotes={false}
                />
              </div>

            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white/50 text-xs py-6 text-center border-t border-white/10 mt-12">
        <p>© {new Date().getFullYear()} OrderCenter. Global Shopping & Shipping. All rights reserved.</p>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder } from '../types';
import { StatusTimeline } from '../components/StatusTimeline';

export const AdminTracking: React.FC = () => {
  const [query, setQuery] = useState('HB-2026-00001');
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const data = await orderApi.getOrder(query.trim());
      setOrder(data);
    } catch (err: any) {
      setError('Order not found. Please verify the Order ID or Tracking Number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Tracking Lookup">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Admin Order Tracking Lookup</h2>
          <p className="text-xs text-slate-500">Search any order by unique Order ID (e.g. HB-2026-00001) or carrier tracking number.</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter Order ID (HB-2026-XXXXX) or Tracking Number..."
              className="w-full pl-11 pr-4 py-2.5 text-sm border-slate-300 rounded-md border font-mono font-medium focus:border-[#711612] shadow-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow transition disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Order'}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details Card */}
        {order && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200 animate-fade-in">
            <div className="p-6 bg-[#711612] text-white flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block">Order Found</span>
                <h3 className="text-xl font-mono font-extrabold">{order.orderId}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-white/70 block">Current Status</span>
                <span className="text-sm font-bold bg-white/10 px-2.5 py-1 rounded inline-block mt-0.5">{order.status}</span>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div><span className="font-bold text-slate-900 block">Customer:</span> {order.customerName} ({order.phone})</div>
              <div><span className="font-bold text-slate-900 block">Product:</span> {order.productName}</div>
              <div><span className="font-bold text-slate-900 block">Origin → Destination:</span> {order.originCountry} → {order.destinationCountry}</div>
              <div><span className="font-bold text-slate-900 block">Carrier Tracking #:</span> <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded">{order.trackingNumber || 'Unassigned'}</span></div>
              <div><span className="font-bold text-slate-900 block">Est. Delivery:</span> {order.estimatedDelivery || 'Unscheduled'}</div>
              <div><span className="font-bold text-slate-900 block">Total Amount:</span> ${order.totalPrice.toFixed(2)} {order.currency}</div>
            </div>

            <div className="p-6">
              <h4 className="text-xs font-bold text-[#711612] uppercase tracking-wider mb-4">Complete Status History Timeline</h4>
              <StatusTimeline currentStatus={order.status} statusHistory={order.statusHistory} showNotes={true} />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

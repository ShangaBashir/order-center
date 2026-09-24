import React, { useState } from 'react';
import {
  X, ExternalLink, Truck, User, Package, Edit, Trash2, CheckCircle2, RefreshCw
} from 'lucide-react';
import { AdminOrder, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { StatusTimeline } from './StatusTimeline';
import { useSettings } from '../context/SettingsContext';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusUpdate: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onEditOrder: (order: AdminOrder) => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onStatusUpdate,
  onEditOrder,
  onDeleteOrder
}) => {
  const { formatPriceWithIqd } = useSettings();
  if (!order) return null;

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order.status);
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateStatus = async () => {
    setUpdating(true);
    setSuccessMsg('');
    try {
      await onStatusUpdate(order.orderId, selectedStatus, statusNote);
      setSuccessMsg(`Status updated to "${selectedStatus}"`);
      setStatusNote('');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete order ${order.orderId}? This cannot be undone.`)) {
      await onDeleteOrder(order.orderId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#711612] text-white px-6 py-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-md font-mono font-bold text-sm border border-[#D4AF37]/40">
              {order.orderId}
            </div>
            <div>
              <h2 className="text-lg font-bold">Order Details</h2>
              <p className="text-xs text-white/70">Created: {new Date(order.createdAt || '').toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditOrder(order)}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto bg-slate-50/50">

          {successMsg && (
            <div className="p-3.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Current Status</div>
              <div className="text-sm font-bold text-[#711612] mt-0.5">{order.status}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Price</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{formatPriceWithIqd(order.totalPrice).combinedStr}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Tracking Number</div>
              <div className="text-sm font-mono font-semibold text-slate-700 mt-0.5 truncate">{order.trackingNumber || 'Not assigned'}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Est. Delivery</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{order.estimatedDelivery || 'Pending'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CUSTOMER INFORMATION */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2 text-[#711612] font-bold text-sm">
                <User className="w-4 h-4" />
                <span>CUSTOMER INFORMATION</span>
              </div>
              <div className="text-sm space-y-2 text-slate-700">
                <div><span className="font-semibold text-slate-900">Name:</span> {order.customerName}</div>
                <div><span className="font-semibold text-slate-900">Phone:</span> {order.phone}</div>
                <div><span className="font-semibold text-slate-900">Email:</span> {order.email || 'N/A'}</div>
                <div><span className="font-semibold text-slate-900">Delivery Address:</span> {order.address}</div>
              </div>
            </div>

            {/* SHIPPING INFORMATION */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2 text-[#711612] font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>SHIPPING INFORMATION</span>
              </div>
              <div className="text-sm space-y-2 text-slate-700">
                <div><span className="font-semibold text-slate-900">Origin:</span> {order.originCountry}</div>
                <div><span className="font-semibold text-slate-900">Destination:</span> {order.destinationCountry}</div>
                <div><span className="font-semibold text-slate-900">Shipping Method:</span> {order.shippingMethod}</div>
                <div><span className="font-semibold text-slate-900">Tracking Number:</span> <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{order.trackingNumber || 'Unassigned'}</span></div>
                <div><span className="font-semibold text-slate-900">Est. Delivery:</span> {order.estimatedDelivery || 'Unscheduled'}</div>
              </div>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2 text-[#711612] font-bold text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>PRODUCT INFORMATION</span>
              </div>
              {order.productUrl && (
                <a
                  href={order.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#711612] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Supplier URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
              {order.productImage ? (
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="w-24 h-24 object-cover rounded-md border border-slate-200 shadow-sm flex-shrink-0"
                />
              ) : (
                <div className="w-24 h-24 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
                  <Package className="w-8 h-8" />
                </div>
              )}

              <div className="flex-1 space-y-2 text-sm text-slate-700">
                <h4 className="font-bold text-slate-900 text-base">{order.productName}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-400 block">Quantity</span> <span className="font-bold text-slate-800">{order.quantity}</span></div>
                  <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-400 block">Unit Price</span> <span className="font-bold text-slate-800">${order.productPrice.toFixed(2)}</span></div>
                  <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-400 block">Shipping Fee</span> <span className="font-bold text-slate-800">${order.shippingFee.toFixed(2)}</span></div>
                  <div className="bg-slate-50 p-2 rounded border"><span className="text-slate-400 block">Total</span> <span className="font-bold text-[#711612]">{formatPriceWithIqd(order.totalPrice).combinedStr}</span></div>
                </div>
              </div>
            </div>
          </div>

          {/* UPDATE STATUS CONTROLS */}
          <div className="bg-white p-5 rounded-lg border border-[#D4AF37]/40 shadow-sm space-y-4">
            <div className="text-[#711612] font-bold text-sm flex items-center justify-between border-b pb-2">
              <span>UPDATE ORDER STATUS</span>
              <span className="text-xs text-slate-400">Current: {order.status}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value as OrderStatus)}
                  className="w-full text-sm border-slate-300 rounded-md shadow-sm focus:border-[#711612] focus:ring-[#711612] py-2 px-3 bg-white border"
                >
                  {ALL_ORDER_STATUSES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Note (Optional)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={statusNote}
                    onChange={e => setStatusNote(e.target.value)}
                    placeholder="e.g. Cleared customs at Erbil Airport"
                    className="flex-1 text-sm border-slate-300 rounded-md shadow-sm focus:border-[#711612] focus:ring-[#711612] py-2 px-3 border"
                  />
                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="px-4 py-2 rounded-md bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Status'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* VISUAL STATUS TIMELINE */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="text-[#711612] font-bold text-sm border-b pb-2">
              ORDER STATUS TIMELINE & HISTORY
            </div>
            <StatusTimeline
              currentStatus={order.status}
              statusHistory={order.statusHistory}
              showNotes={true}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { AdminOrder } from '../types';

interface EditOrderModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onSave: (orderId: string, updates: Partial<AdminOrder>) => Promise<void>;
}

export const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, onClose, onSave }) => {
  if (!order) return null;

  const [formData, setFormData] = useState<Partial<AdminOrder>>({
    customerName: order.customerName,
    phone: order.phone,
    email: order.email || '',
    address: order.address,
    productName: order.productName,
    productUrl: order.productUrl || '',
    productImage: order.productImage || '',
    quantity: order.quantity,
    productPrice: order.productPrice,
    shippingFee: order.shippingFee,
    currency: order.currency || 'USD',
    originCountry: order.originCountry || 'China',
    destinationCountry: order.destinationCountry || 'Iraq',
    shippingMethod: order.shippingMethod || 'Express Air',
    trackingNumber: order.trackingNumber || '',
    estimatedDelivery: order.estimatedDelivery || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(order.orderId, formData);
      onClose();
    } catch (err) {
      alert('Failed to save order changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200">
        <div className="bg-[#711612] text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-base">Edit Order ({order.orderId})</h3>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Info */}
          <div>
            <h4 className="text-xs font-bold text-[#711612] uppercase tracking-wider mb-3">Customer Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h4 className="text-xs font-bold text-[#711612] uppercase tracking-wider mb-3">Product Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={e => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Product Price *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.productPrice}
                  onChange={e => setFormData({ ...formData, productPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shipping Fee</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.shippingFee}
                  onChange={e => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Currency</label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm bg-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="IQD">IQD (د.ع)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div>
            <h4 className="text-xs font-bold text-[#711612] uppercase tracking-wider mb-3">Shipping & Tracking Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber}
                  onChange={e => setFormData({ ...formData, trackingNumber: e.target.value })}
                  placeholder="e.g. OC-984210-CN"
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Delivery Date</label>
                <input
                  type="text"
                  value={formData.estimatedDelivery}
                  onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  placeholder="e.g. Oct 02, 2026"
                  className="w-full text-sm border-slate-300 rounded-md py-2 px-3 border shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-[#711612] hover:bg-[#57100d] text-white font-bold text-xs rounded-md shadow flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

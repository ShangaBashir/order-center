import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, CheckCircle2, Copy, RefreshCw, User, Package, Truck, ArrowLeft
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { useSettings } from '../context/SettingsContext';

export const AdminAddOrder: React.FC = () => {
  const navigate = useNavigate();
  const { usdToIqdRate, formatPriceWithIqd } = useSettings();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',

    productName: '',
    productUrl: '',
    productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80',
    quantity: 1,
    productPrice: 50.00,
    shippingFee: 10.00,
    currency: 'USD',

    originCountry: 'China',
    destinationCountry: 'Iraq',
    shippingMethod: 'Express Air',
    trackingNumber: '',
    estimatedDelivery: '',

    status: 'Order Received' as OrderStatus,
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ orderId: string; customerName: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const totalPrice = (Number(formData.quantity) || 1) * (Number(formData.productPrice) || 0) + (Number(formData.shippingFee) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    try {
      const res = await orderApi.createOrder(formData);
      setCreatedResult({
        orderId: res.orderId,
        customerName: formData.customerName
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create order.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyOrderId = () => {
    if (createdResult?.orderId) {
      navigator.clipboard.writeText(createdResult.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AdminLayout title="Add New Order">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Customer Order</h2>
            <p className="text-xs text-slate-500">System will automatically assign a unique HB-2026-XXXXX Order ID.</p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-3.5 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Orders</span>
          </button>
        </div>

        {/* Success Banner */}
        {createdResult && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-6 text-emerald-900 shadow-md animate-fade-in space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-full">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-800">Order created successfully.</h3>
                <p className="text-xs text-emerald-700 mt-0.5">
                  Order registered for <span className="font-semibold">{createdResult.customerName}</span>. Share the generated ID with the customer to allow order tracking.
                </p>

                {/* Big Order ID Card */}
                <div className="mt-4 p-4 bg-white rounded-md border border-emerald-300 flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Generated Unique Order ID</span>
                    <span className="text-2xl font-mono font-extrabold text-[#711612] tracking-wider">{createdResult.orderId}</span>
                  </div>

                  <button
                    onClick={copyOrderId}
                    className="px-4 py-2 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold rounded-md shadow flex items-center gap-1.5 transition"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{copied ? 'Copied!' : 'Copy Order ID'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCreatedResult(null)}
                className="px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 rounded-md"
              >
                Create Another Order
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-md shadow"
              >
                Go to Orders Management
              </button>
            </div>
          </div>
        )}

        {/* Create Order Form */}
        {!createdResult && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* 1. CUSTOMER INFORMATION */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                <User className="w-4 h-4" />
                <span>CUSTOMER INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Shanga Bashir"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 07701566233"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. customer@example.com"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Salim Street, Sulaimanyiah, Iraq"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 2. ORDER INFORMATION */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                <Package className="w-4 h-4" />
                <span>ORDER INFORMATION</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={e => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. SHEIN Floral Satin Dress"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Link / URL</label>
                  <input
                    type="text"
                    value={formData.productUrl}
                    onChange={e => setFormData({ ...formData, productUrl: e.target.value })}
                    placeholder="e.g. https://shein.com/product/..."
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Image URL</label>
                  <input
                    type="text"
                    value={formData.productImage}
                    onChange={e => setFormData({ ...formData, productImage: e.target.value })}
                    placeholder="https://..."
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Product Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.productPrice}
                    onChange={e => setFormData({ ...formData, productPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Fee ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shippingFee}
                    onChange={e => setFormData({ ...formData, shippingFee: parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] bg-white shadow-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (د.ع)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Total Price Display */}
                <div className="sm:col-span-2 p-4 bg-[#EBEAE8]/80 border border-[#D4AF37]/50 rounded-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Calculated Total Price</span>
                    <span className="text-[10px] text-slate-500 block">Exchange rate: 1 USD = {usdToIqdRate.toLocaleString()} IQD</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-extrabold text-[#711612] block">
                      {formatPriceWithIqd(totalPrice).combinedStr}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SHIPPING & STATUS INFORMATION */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>SHIPPING & INITIAL STATUS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Country</label>
                  <input
                    type="text"
                    value={formData.originCountry}
                    onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                    placeholder="e.g. China"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Country</label>
                  <input
                    type="text"
                    value={formData.destinationCountry}
                    onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })}
                    placeholder="e.g. Iraq"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Method</label>
                  <input
                    type="text"
                    value={formData.shippingMethod}
                    onChange={e => setFormData({ ...formData, shippingMethod: e.target.value })}
                    placeholder="e.g. Express Air"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tracking Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={e => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="e.g. OC-984210-CN"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Delivery Date</label>
                  <input
                    type="text"
                    value={formData.estimatedDelivery}
                    onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                    placeholder="e.g. Oct 05, 2026"
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Order Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] bg-white shadow-sm font-medium"
                  >
                    {ALL_ORDER_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button Bar */}
            <div className="p-6 bg-slate-50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/orders')}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 border border-[#D4AF37]/30 transition disabled:opacity-60"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                <span>Generate Order & Save</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </AdminLayout>
  );
};

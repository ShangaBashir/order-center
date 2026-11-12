import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Save, RefreshCw, User, Package, Truck, ExternalLink } from 'lucide-react';
import { AdminOrder, Customer, OrderStatus } from '../types';
import { customerApi } from '../api';
import { useSettings } from '../context/SettingsContext';
import { formatPhoneNumber } from '../utils/formatters';
import { ProductPhotoInput } from './ProductPhotoInput';

interface EditOrderModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onSave: (orderId: string, updates: Partial<AdminOrder>) => Promise<void>;
}

const toDateInputValue = (val?: string): string => {
  if (!val) return '';
  const trimmed = val.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const timestamp = Date.parse(trimmed);
  if (!isNaN(timestamp)) {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

export const EditOrderModal: React.FC<EditOrderModalProps> = ({ order, onClose, onSave }) => {
  if (!order) return null;

  const { usdToIqdRate } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [formData, setFormData] = useState({
    status: (order.status || 'Purchased') as OrderStatus,
    customerName: order.customerName || '',
    phone: order.phone || '',
    email: order.email || '',
    address: order.address || '',
    productName: order.productName || '',
    productUrl: order.productUrl || '',
    productImage: order.productImage || '',
    quantity: order.quantity || 1,
    productPrice: order.productPrice || 0,
    productCurrency: 'USD',
    shippingFee: order.shippingFee || 0,
    shippingCurrency: 'USD',
    currency: order.currency || 'USD',
    originCountry: order.originCountry || '',
    destinationCountry: order.destinationCountry || '',
    shippingMethod: order.shippingMethod || '',
    estimatedDelivery: toDateInputValue(order.estimatedDelivery),
    approximateDeliveryDate: toDateInputValue(order.approximateDeliveryDate),
    notes: order.notes || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setFormData({
        status: (order.status || 'Purchased') as OrderStatus,
        customerName: order.customerName || '',
        phone: order.phone || '',
        email: order.email || '',
        address: order.address || '',
        productName: order.productName || '',
        productUrl: order.productUrl || '',
        productImage: order.productImage || '',
        quantity: order.quantity || 1,
        productPrice: order.productPrice || 0,
        productCurrency: 'USD',
        shippingFee: order.shippingFee || 0,
        shippingCurrency: 'USD',
        currency: order.currency || 'USD',
        originCountry: order.originCountry || '',
        destinationCountry: order.destinationCountry || '',
        shippingMethod: order.shippingMethod || '',
        estimatedDelivery: toDateInputValue(order.estimatedDelivery),
        approximateDeliveryDate: toDateInputValue(order.approximateDeliveryDate),
        notes: order.notes || '',
      });
    }

    const fetchCustomers = async () => {
      try {
        const custs = await customerApi.getCustomers();
        setCustomers(custs);
        // Pre-select matching customer if exists
        const match = custs.find(c => c.name.toLowerCase() === order.customerName.toLowerCase() || c.phone === order.phone);
        if (match) {
          setSelectedCustomerId(match.customerId || match._id || '');
        }
      } catch (err) {
        console.error('Failed to load customers list for edit modal:', err);
      }
    };
    fetchCustomers();
  }, [order]);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);

    if (!custId) {
      return;
    }

    const selectedCust = customers.find(c => c.customerId === custId || c._id === custId);
    if (selectedCust) {
      setFormData(prev => ({
        ...prev,
        customerName: selectedCust.name || '',
        phone: formatPhoneNumber(selectedCust.phone || ''),
        email: selectedCust.email || '',
        address: selectedCust.address || '',
      }));
    }
  };

  const qty = Number(formData.quantity) || 0;
  const rawProdPrice = Number(formData.productPrice) || 0;
  const rawShipFee = Number(formData.shippingFee) || 0;

  const productTotalUsd = formData.productCurrency === 'IQD'
    ? (qty * rawProdPrice) / usdToIqdRate
    : qty * rawProdPrice;

  const shippingTotalUsd = formData.shippingCurrency === 'IQD'
    ? rawShipFee / usdToIqdRate
    : rawShipFee;

  const totalPriceUsd = productTotalUsd + shippingTotalUsd;
  const totalPriceIqd = Math.round(totalPriceUsd * usdToIqdRate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    if (!formData.customerName.trim()) {
      setError('Please enter Customer Name.');
      setSaving(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter Phone Number.');
      setSaving(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Please enter Delivery Address.');
      setSaving(false);
      return;
    }
    if (!formData.productName.trim()) {
      setError('Please enter Product Name.');
      setSaving(false);
      return;
    }
    if (!formData.productUrl.trim()) {
      setError('Please enter Product Link / URL (Product link is required).');
      setSaving(false);
      return;
    }
    if (!formData.productImage?.trim()) {
      setError('Product Photo is required. Please provide a photo either by Link or by Upload.');
      setSaving(false);
      return;
    }
    if (qty <= 0) {
      setError('Please enter a valid Quantity (must be greater than 0).');
      setSaving(false);
      return;
    }
    if (rawProdPrice <= 0) {
      setError('Please enter a valid Product Price (must be greater than 0).');
      setSaving(false);
      return;
    }
    if (rawShipFee < 0) {
      setError('Shipping Fee cannot be negative.');
      setSaving(false);
      return;
    }
    if (!formData.originCountry.trim()) {
      setError('Please enter Origin Country.');
      setSaving(false);
      return;
    }
    if (!formData.destinationCountry.trim()) {
      setError('Please enter Destination Country.');
      setSaving(false);
      return;
    }
    if (!formData.shippingMethod.trim()) {
      setError('Please enter Shipping Method.');
      setSaving(false);
      return;
    }
    if (!formData.estimatedDelivery.trim()) {
      setError('Please enter Estimated Delivery Date.');
      setSaving(false);
      return;
    }

    try {
      const convertedProductPrice = formData.productCurrency === 'IQD' ? rawProdPrice / usdToIqdRate : rawProdPrice;
      const convertedShippingFee = formData.shippingCurrency === 'IQD' ? rawShipFee / usdToIqdRate : rawShipFee;

      const updates: Partial<AdminOrder> = {
        ...formData,
        productUrl: formData.productUrl.trim(),
        productImage: formData.productImage?.trim() || '',
        productPrice: convertedProductPrice,
        shippingFee: convertedShippingFee,
        totalPrice: totalPriceUsd,
        currency: 'USD'
      };

      await onSave(order.orderId, updates);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save order changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#711612] text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base">Edit Order Details</h3>
            <span className="text-xs text-amber-200 font-mono">Order ID: {order.orderId}</span>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 text-white/80 hover:text-white"
            title="Close editor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* 1. CUSTOMER INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                <User className="w-4 h-4" />
                <span>CUSTOMER INFORMATION</span>
              </div>
              {formData.customerName && (
                <Link
                  to={`/admin/customers?search=${encodeURIComponent(formData.customerName)}&phone=${encodeURIComponent(formData.phone || '')}`}
                  target="_blank"
                  className="text-xs text-[#711612] hover:text-[#94201C] hover:underline font-bold inline-flex items-center gap-1 transition"
                  title="Open customer profile in Customers Directory"
                >
                  <span>View Customer Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Customer Directory Dropdown */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-[#D4AF37]/40 space-y-1.5">
              <label className="block text-xs font-bold text-[#711612] uppercase tracking-wider">
                Select Customer from Directory
              </label>
              <select
                value={selectedCustomerId}
                onChange={handleSelectCustomer}
                className="w-full text-sm border border-slate-300 rounded-lg py-2 px-3 focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 bg-white font-medium text-slate-800 shadow-sm"
              >
                <option value="">Select Customer</option>
                {customers.map(c => (
                  <option key={c._id || c.customerId} value={c.customerId || c._id}>
                    {c.name} ({c.customerId}) - {formatPhoneNumber(c.phone)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Customer Name *</label>
                  {formData.customerName && (
                    <Link
                      to={`/admin/customers?search=${encodeURIComponent(formData.customerName)}&phone=${encodeURIComponent(formData.phone || '')}`}
                      target="_blank"
                      className="text-[11px] text-[#711612] hover:underline font-bold inline-flex items-center gap-1"
                      title="Open customer profile in Customers Directory"
                    >
                      <span>View in Directory</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
                <input
                  type="text"
                  required
                  disabled={!!selectedCustomerId}
                  value={formData.customerName}
                  onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                  className={`w-full text-sm border rounded-md py-2 px-3 focus:border-[#711612] shadow-sm ${
                    selectedCustomerId ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedCustomerId}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  className={`w-full text-sm border rounded-md py-2 px-3 focus:border-[#711612] shadow-sm font-mono ${
                    selectedCustomerId ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled={!!selectedCustomerId}
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full text-sm border rounded-md py-2 px-3 focus:border-[#711612] shadow-sm ${
                    selectedCustomerId ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300' : 'bg-white border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address *</label>
                <input
                  type="text"
                  required
                  disabled={!!selectedCustomerId}
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full text-sm border rounded-md py-2 px-3 focus:border-[#711612] shadow-sm ${
                    selectedCustomerId ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300' : 'bg-white border-slate-300'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 2. PRODUCT INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#711612] font-bold text-sm border-b pb-2">
              <Package className="w-4 h-4" />
              <span>PRODUCT INFORMATION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={e => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Link / URL *</label>
                <input
                  type="text"
                  required
                  value={formData.productUrl}
                  onChange={e => setFormData({ ...formData, productUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                />
              </div>

              {/* Product Photo with 2 options: By Link and By Upload */}
              <ProductPhotoInput
                value={formData.productImage}
                onChange={(productImage) => setFormData({ ...formData, productImage })}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity === 0 ? '' : formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Product Price *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.productPrice === 0 ? '' : formData.productPrice}
                    onChange={e => setFormData({ ...formData, productPrice: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm font-mono"
                  />
                  <select
                    value={formData.productCurrency}
                    onChange={e => setFormData({ ...formData, productCurrency: e.target.value })}
                    className="text-xs border border-slate-300 rounded-md px-2 bg-white font-medium focus:border-[#711612] shadow-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (د.ع)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Fee</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.shippingFee === 0 ? '' : formData.shippingFee}
                    onChange={e => setFormData({ ...formData, shippingFee: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm font-mono"
                  />
                  <select
                    value={formData.shippingCurrency}
                    onChange={e => setFormData({ ...formData, shippingCurrency: e.target.value })}
                    className="text-xs border border-slate-300 rounded-md px-2 bg-white font-medium focus:border-[#711612] shadow-sm"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="IQD">IQD (د.ع)</option>
                  </select>
                </div>
              </div>

              {/* Total Price Display */}
              <div className="sm:col-span-2 p-4 bg-[#EBEAE8]/80 border border-[#D4AF37]/50 rounded-md space-y-3 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-300/60 pb-2">
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">Calculated Price Summary</span>
                    <span className="text-[10px] text-slate-500 block">Exchange rate: 1 USD = {usdToIqdRate.toLocaleString()} IQD</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="bg-white/70 p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium">Product Subtotal ({qty}x)</span>
                    <span className="font-bold text-slate-800 text-xs block">
                      {formData.productCurrency === 'IQD'
                        ? `${(qty * rawProdPrice).toLocaleString()} IQD ($${productTotalUsd.toFixed(2)})`
                        : `$${productTotalUsd.toFixed(2)} (${Math.round(productTotalUsd * usdToIqdRate).toLocaleString()} IQD)`
                      }
                    </span>
                  </div>

                  <div className="bg-white/70 p-2.5 rounded border border-slate-200">
                    <span className="text-slate-500 block text-[11px] font-medium">Shipping Fee</span>
                    <span className="font-bold text-slate-800 text-xs block">
                      {formData.shippingCurrency === 'IQD'
                        ? `${rawShipFee.toLocaleString()} IQD ($${shippingTotalUsd.toFixed(2)})`
                        : `$${shippingTotalUsd.toFixed(2)} (${Math.round(shippingTotalUsd * usdToIqdRate).toLocaleString()} IQD)`
                      }
                    </span>
                  </div>

                  <div className="bg-white/90 p-2.5 rounded border border-[#D4AF37]">
                    <span className="text-slate-600 block text-[11px] font-bold">Grand Total</span>
                    <span className="font-extrabold text-[#711612] text-sm block">
                      ${totalPriceUsd.toFixed(2)} ({totalPriceIqd.toLocaleString()} IQD)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. SHIPPING & ORDER STATUS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#711612] font-bold text-sm border-b pb-2">
              <Truck className="w-4 h-4" />
              <span>SHIPPING & ORDER STATUS</span>
            </div>

            {/* Order Status Dropdown */}
            <div className="bg-amber-50/60 p-4 sm:p-5 rounded-2xl border border-[#D4AF37]/50 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold text-[#711612] uppercase tracking-wider">
                  Order Status *
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Active: <strong className="text-[#711612] font-extrabold">{formData.status}</strong>
                </span>
              </div>

              {/* Status Select with Grouping */}
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as OrderStatus })}
                className="w-full text-sm font-semibold border border-slate-300 rounded-xl py-2.5 px-3 bg-white focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 shadow-sm text-slate-800"
              >
                <optgroup label="── In-Progress Milestones ──">
                  <option value="Purchased">1. Purchased</option>
                  <option value="Received in Warehouse">2. Received in Warehouse</option>
                  <option value="Dispatched from Warehouse">3. Dispatched from Warehouse</option>
                  <option value="Arrived">4. Arrived</option>
                </optgroup>
                <optgroup label="── Final Resolution (Choose One) ──">
                  <option value="Done">5. Done (Completed & Delivered)</option>
                  <option value="Canceled">5. Canceled (Order Canceled)</option>
                </optgroup>
              </select>

              {/* Sequential Milestones Buttons (Steps 1 to 4) */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Milestone Progress (Steps 1–4):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'Purchased', label: 'Purchased', num: '01' },
                    { id: 'Received in Warehouse', label: 'In Warehouse', num: '02' },
                    { id: 'Dispatched from Warehouse', label: 'Dispatched', num: '03' },
                    { id: 'Arrived', label: 'Arrived', num: '04' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, status: st.id as OrderStatus })}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                        formData.status === st.id
                          ? 'bg-[#711612] text-white border-[#711612] shadow-sm ring-2 ring-[#D4AF37]/40'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-[9px] text-[#D4AF37] uppercase font-mono">Step {st.num}</div>
                      <div className="truncate">{st.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Final Step Outcome: Done or Canceled */}
              <div className="space-y-1.5 pt-1 border-t border-slate-200/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Final Step Outcome (Choose Done or Canceled):
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Done' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                      formData.status === 'Done'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-md ring-2 ring-emerald-300'
                        : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    <span>✓ Done (Completed & Delivered)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: 'Canceled' })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all flex items-center justify-center gap-1.5 ${
                      formData.status === 'Canceled'
                        ? 'bg-red-600 text-white border-red-700 shadow-md ring-2 ring-red-300'
                        : 'bg-white text-red-700 border-red-200 hover:bg-red-50'
                    }`}
                  >
                    <span>✕ Canceled (Order Canceled)</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Origin Country *</label>
                <input
                  type="text"
                  required
                  value={formData.originCountry}
                  onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                  placeholder="e.g. China, USA"
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Country *</label>
                <input
                  type="text"
                  required
                  value={formData.destinationCountry}
                  onChange={e => setFormData({ ...formData, destinationCountry: e.target.value })}
                  placeholder="e.g. Iraq"
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shipping Method *</label>
                <input
                  type="text"
                  required
                  value={formData.shippingMethod}
                  onChange={e => setFormData({ ...formData, shippingMethod: e.target.value })}
                  placeholder="e.g. Express Air"
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Delivery Date *</label>
                <input
                  type="date"
                  required
                  value={formData.estimatedDelivery}
                  onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm bg-white font-medium text-slate-800"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Approximate Close Date to Get Order
                  <span className="text-[10px] text-slate-400 font-normal ml-1">(Target Close Date)</span>
                </label>
                <input
                  type="date"
                  value={formData.approximateDeliveryDate}
                  onChange={e => setFormData({ ...formData, approximateDeliveryDate: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm bg-white font-medium text-slate-800"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder=""
                  className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] bg-white shadow-sm"
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

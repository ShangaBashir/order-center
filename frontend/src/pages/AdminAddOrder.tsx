import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle, CheckCircle2, Copy, RefreshCw, User, Package, Truck, ArrowLeft, UserCheck, Hash
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi, customerApi } from '../api';
import { Customer, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { useSettings } from '../context/SettingsContext';
import { formatPhoneNumber } from '../utils/formatters';

export const AdminAddOrder: React.FC = () => {
  const navigate = useNavigate();
  const { usdToIqdRate } = useSettings();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [nextOrderId, setNextOrderId] = useState<string>('');

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',

    productName: '',
    productUrl: '',
    productImage: '',
    quantity: 0,
    productPrice: 0,
    productCurrency: 'USD',
    shippingFee: 0,
    shippingCurrency: 'USD',
    currency: 'USD',

    originCountry: '',
    destinationCountry: '',
    shippingMethod: '',
    trackingNumber: '',
    estimatedDelivery: '',

    status: 'Purchased' as OrderStatus,
    notes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ orderId: string; customerName: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custs, id] = await Promise.all([
          customerApi.getCustomers(),
          orderApi.getNextOrderId()
        ]);
        setCustomers(custs);
        setNextOrderId(id);
      } catch (err) {
        console.error('Failed to load initial order data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSelectCustomer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const custId = e.target.value;
    setSelectedCustomerId(custId);
    if (!custId) {
      setFormData(prev => ({
        ...prev,
        customerName: '',
        phone: '',
        email: '',
        address: '',
      }));
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
    setErrorMsg('');

    if (!formData.customerName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      setErrorMsg('Please enter all required customer details (Name, Phone, Address).');
      return;
    }
    if (!formData.productName.trim()) {
      setErrorMsg('Please enter a Product Name.');
      return;
    }
    if (!formData.productUrl.trim()) {
      setErrorMsg('Product Link / URL is required and cannot be empty.');
      return;
    }
    if (Number(formData.quantity) <= 0) {
      setErrorMsg('Please enter a valid Quantity (must be greater than 0).');
      return;
    }
    if (Number(formData.productPrice) <= 0) {
      setErrorMsg('Please enter a valid Product Price (must be greater than 0).');
      return;
    }
    if (!formData.originCountry.trim() || !formData.destinationCountry.trim() || !formData.shippingMethod.trim() || !formData.estimatedDelivery.trim()) {
      setErrorMsg('Please fill in all shipping details (Origin Country, Destination Country, Shipping Method, Estimated Delivery Date).');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        productUrl: formData.productUrl.trim(),
        productPrice: formData.productCurrency === 'IQD' ? rawProdPrice / usdToIqdRate : rawProdPrice,
        shippingFee: formData.shippingCurrency === 'IQD' ? rawShipFee / usdToIqdRate : rawShipFee,
        currency: 'USD',
        productImage: ''
      };
      const res = await orderApi.createOrder(payload);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-800">Create New Customer Order</h2>
              {nextOrderId && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 text-[#711612] border border-[#D4AF37]/50 text-xs font-mono font-bold shadow-sm">
                  <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Auto Order ID: {nextOrderId}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">System will automatically assign the unique ID {nextOrderId || 'HB-2026-XXXXX'} upon saving.</p>
          </div>
          <button
            onClick={() => navigate('/admin/orders')}
            className="px-3.5 py-2 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition self-start sm:self-auto"
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
          <form onSubmit={handleSubmit} autoComplete="off" className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-200">
            
            {errorMsg && (
              <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            {/* 1. CUSTOMER INFORMATION */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                  <User className="w-4 h-4" />
                  <span>CUSTOMER INFORMATION</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-[#711612]" />
                  <span>Select existing customer or enter details manually</span>
                </div>
              </div>

              {/* Customer Dropdown Selection */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!!selectedCustomerId}
                    value={formData.customerName}
                    onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
                    className={`w-full text-sm border rounded-md py-2 px-3 focus:border-[#711612] shadow-sm ${
                      selectedCustomerId ? 'bg-slate-100 text-slate-700 font-semibold cursor-not-allowed border-slate-300' : 'bg-white border-slate-300'
                    }`}
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
                    placeholder=""
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
                    placeholder=""
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.quantity === 0 ? '' : formData.quantity}
                    onChange={e => setFormData({ ...formData, quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                    placeholder="0"
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
                      placeholder="0"
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
                      placeholder="0"
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

            {/* 3. SHIPPING & STATUS INFORMATION */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>SHIPPING & INITIAL STATUS</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Origin Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.originCountry}
                    onChange={e => setFormData({ ...formData, originCountry: e.target.value })}
                    placeholder=""
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
                    placeholder=""
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
                    placeholder=""
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm"
                  />
                </div>


                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Delivery Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.estimatedDelivery}
                    onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                    className="w-full text-sm border border-slate-300 rounded-md py-2 px-3 focus:border-[#711612] shadow-sm bg-white font-medium text-slate-800"
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

                <div className="sm:col-span-2">
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


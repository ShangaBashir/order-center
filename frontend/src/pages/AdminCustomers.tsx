import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone, Mail, MapPin, Search, UserPlus, Trash2, Hash, Tag, Eye, Edit3, X, Save,
  ShoppingBag, CheckCircle, ChevronLeft, ChevronRight, ExternalLink, ArrowRight, Package
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { customerApi, orderApi } from '../api';
import { Customer, AdminOrder } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSettings } from '../context/SettingsContext';
import { formatPhoneNumber } from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

export const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { formatPriceWithIqd } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modals state
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);
  const [secondConfirmCust, setSecondConfirmCust] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    secondaryPhone: '',
    email: '',
    address: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const [custData, ordData] = await Promise.all([
        customerApi.getCustomers(),
        orderApi.getOrders()
      ]);
      setCustomers(custData);
      setOrders(ordData);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Reset pagination on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleDeleteCustomer = async (cust: Customer) => {
    setIsDeleting(true);
    try {
      if (cust._id) await customerApi.deleteCustomer(cust._id);
      if (cust.customerId) await customerApi.deleteCustomer(cust.customerId);
      await loadCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
    } finally {
      setIsDeleting(false);
      setSecondConfirmCust(null);
    }
  };

  const handleOpenEdit = (cust: Customer) => {
    setEditCustomer(cust);
    setEditForm({
      name: cust.name || '',
      phone: formatPhoneNumber(cust.phone || ''),
      secondaryPhone: formatPhoneNumber(cust.secondaryPhone || ''),
      email: cust.email || '',
      address: cust.address || '',
      notes: cust.notes || '',
    });
    setSaveSuccess('');
  };

  const isEditDuplicatePhone = () => {
    const p1 = editForm.phone.replace(/\D/g, '');
    const p2 = editForm.secondaryPhone.replace(/\D/g, '');
    return !!(p1 && p2 && p1 === p2);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer || isEditDuplicatePhone()) return;

    setIsSaving(true);
    try {
      const targetId = editCustomer._id || editCustomer.customerId;
      await customerApi.updateCustomer(targetId, editForm);
      setSaveSuccess('Customer details updated successfully!');
      await loadCustomers();
      setTimeout(() => {
        setEditCustomer(null);
        setSaveSuccess('');
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update customer:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getCustomerOrders = (cust: Customer | null): AdminOrder[] => {
    if (!cust) return [];
    const clean = (s?: string) => (s || '').replace(/\D/g, '');
    const custPhone = clean(cust.phone);
    const custSecPhone = clean(cust.secondaryPhone);
    const custName = (cust.name || '').trim().toLowerCase();
    const custEmail = (cust.email || '').trim().toLowerCase();

    return orders.filter(o => {
      const oName = (o.customerName || '').trim().toLowerCase();
      const oPhone = clean(o.phone);
      const oEmail = (o.email || '').trim().toLowerCase();

      if (custName && oName && (oName === custName || oName.includes(custName) || custName.includes(oName))) return true;
      if (custPhone && oPhone && (custPhone === oPhone || custPhone.endsWith(oPhone) || oPhone.endsWith(custPhone))) return true;
      if (custSecPhone && oPhone && (custSecPhone === oPhone || custSecPhone.endsWith(oPhone) || oPhone.endsWith(custSecPhone))) return true;
      if (custEmail && oEmail && custEmail === oEmail) return true;
      return false;
    });
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.customerId && c.customerId.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.secondaryPhone && c.secondaryPhone.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    );
  });

  // Pagination calculation
  const totalCustomers = filteredCustomers.length;
  const totalPages = Math.ceil(totalCustomers / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalCustomers);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return (
    <AdminLayout title="Customers Directory">
      <div className="space-y-6">
        
        {/* Header Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Customers Directory ({customers.length})</h1>
            <p className="text-xs text-slate-500 mt-1">
              Registered customers directory with auto-generated unique Customer IDs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/add-customer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#711612] to-[#8B1E1A] text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:from-[#8B1E1A] hover:to-[#711612] transition shadow-md border border-[#D4AF37]/30"
            >
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Filter / Search Bar without white box wrapper */}
        <div className="flex items-center justify-end">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 bg-white text-slate-800 shadow-sm"
            />
          </div>
        </div>

        {/* Table View Matching Orders Page */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  <th className="py-4 px-5">Customer ID</th>
                  <th className="py-4 px-5">Customer Name</th>
                  <th className="py-4 px-5">Phone</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Orders</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-semibold">
                      <div className="w-7 h-7 border-2 border-[#711612] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading customer directory...
                    </td>
                  </tr>
                ) : paginatedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 text-sm font-semibold">
                      No customer profiles match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedCustomers.map(cust => (
                    <tr key={cust._id || cust.customerId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-[#711612] border border-[#D4AF37]/40 text-xs font-mono font-bold">
                          <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>{cust.customerId}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#711612] to-[#8B1E1A] text-white font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                            {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm sm:text-base block leading-tight">{cust.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-900 text-sm">
                        <a href={`tel:${cust.phone}`} className="block hover:underline text-slate-900 font-bold">
                          {formatPhoneNumber(cust.phone)}
                        </a>
                        {cust.secondaryPhone && (
                          <a href={`tel:${cust.secondaryPhone}`} className="block hover:underline text-slate-900 font-bold mt-1">
                            {formatPhoneNumber(cust.secondaryPhone)}
                          </a>
                        )}
                      </td>
                      <td className="py-4 px-5 font-medium text-slate-800 text-sm truncate max-w-[220px]">
                        {cust.email || 'N/A'}
                      </td>
                      <td className="py-4 px-5 font-semibold text-slate-800">
                        {(() => {
                          const custOrds = getCustomerOrders(cust);
                          const count = Math.max(cust.totalOrders ?? 0, custOrds.length);
                          return (
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/orders?search=${encodeURIComponent(cust.name || cust.customerId)}`)}
                              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-[#711612]/10 hover:border-[#711612]/30 text-slate-900 hover:text-[#711612] text-xs font-mono font-bold border border-slate-200 transition inline-flex items-center gap-1.5 group cursor-pointer"
                              title="Click to view all orders for this customer"
                            >
                              <span>{count} Orders</span>
                              <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100 transition" />
                            </button>
                          );
                        })()}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewCustomer(cust)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-[#711612] text-slate-700 hover:text-white transition"
                            title="View Customer Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(cust)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-[#711612] text-slate-700 hover:text-white transition"
                            title="Edit Customer Info"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmCust(cust)}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{totalCustomers > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-[#711612] font-mono">{totalCustomers}</span> Registered Customers
              <span className="ml-2 text-slate-400">(Page {currentPage} of {totalPages})</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 font-semibold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                      currentPage === page
                        ? 'bg-[#711612] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW CUSTOMER DETAILS MODAL */}
      {viewCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setViewCustomer(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 transform transition-all max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] text-white relative flex-shrink-0">
              <button
                onClick={() => setViewCustomer(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white text-[#711612] font-extrabold text-2xl flex items-center justify-center shadow-lg border border-amber-300/40">
                  {viewCustomer.name ? viewCustomer.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-display leading-snug">
                    {viewCustomer.name}
                  </h2>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-md bg-[#D4AF37] text-slate-950 text-xs font-mono font-bold shadow-sm">
                    <Hash className="w-3.5 h-3.5" />
                    <span>{viewCustomer.customerId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Contact Info Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#711612] flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Phone Number</div>
                    <div className="space-y-1 mt-0.5">
                      <a href={`tel:${viewCustomer.phone}`} className="font-bold text-slate-900 font-mono text-base block hover:underline">
                        {formatPhoneNumber(viewCustomer.phone)}
                      </a>
                      {viewCustomer.secondaryPhone && (
                        <a href={`tel:${viewCustomer.secondaryPhone}`} className="font-bold text-slate-900 font-mono text-base block hover:underline">
                          {formatPhoneNumber(viewCustomer.secondaryPhone)}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-slate-200/60 pt-2.5">
                  <Mail className="w-4 h-4 text-[#711612] flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Email Address</div>
                    <div className="font-medium text-slate-800">{viewCustomer.email || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-200/60 pt-2.5">
                  <MapPin className="w-4 h-4 text-[#711612] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Delivery Address</div>
                    <div className="font-medium text-slate-800 leading-snug">{viewCustomer.address}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewCustomer.notes && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-slate-800 flex items-start gap-2.5">
                  <Tag className="w-4 h-4 text-[#711612] flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#711612] block text-[11px] uppercase tracking-wide">Customer Notes</span>
                    <p className="mt-0.5 text-slate-700">{viewCustomer.notes}</p>
                  </div>
                </div>
              )}

              {/* Activity Stats & Orders List */}
              {(() => {
                const custOrds = getCustomerOrders(viewCustomer);
                const totalCount = Math.max(viewCustomer.totalOrders ?? 0, custOrds.length);
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          const targetName = viewCustomer.name || viewCustomer.customerId;
                          setViewCustomer(null);
                          navigate(`/admin/orders?search=${encodeURIComponent(targetName)}`);
                        }}
                        className="bg-slate-50 hover:bg-amber-50/70 p-3.5 rounded-xl border border-slate-200 hover:border-[#711612]/40 text-center transition group shadow-sm hover:shadow cursor-pointer block w-full text-left sm:text-center"
                        title="Click to view all orders for this customer in Orders page"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-[#711612] mb-1">
                          <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-lg font-bold text-slate-900 font-mono text-center group-hover:text-[#711612]">
                          {totalCount}
                        </div>
                        <div className="text-[11px] text-slate-600 font-bold uppercase group-hover:text-[#711612] flex items-center justify-center gap-1">
                          <span>Total Orders</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <div className="text-[10px] text-amber-800 font-semibold mt-0.5 text-center">Click to view all →</div>
                      </button>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center">
                        <span className="text-base font-bold text-[#711612] block mb-1">$</span>
                        <div className="text-sm font-bold text-[#711612] font-mono">
                          {formatPriceWithIqd(viewCustomer.totalSpent || 0).combinedStr}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium uppercase mt-0.5">Total Spent</div>
                      </div>
                    </div>

                    {/* Customer Orders Section */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#711612]" />
                          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Orders for {viewCustomer.name} ({custOrds.length})
                          </span>
                        </div>
                        {custOrds.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const targetName = viewCustomer.name || viewCustomer.customerId;
                              setViewCustomer(null);
                              navigate(`/admin/orders?search=${encodeURIComponent(targetName)}`);
                            }}
                            className="text-xs font-bold text-[#711612] hover:underline flex items-center gap-1"
                          >
                            <span>View All in Orders</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {custOrds.length > 0 ? (
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {custOrds.map(order => (
                            <div
                              key={order._id || order.orderId}
                              onClick={() => {
                                setViewCustomer(null);
                                navigate(`/admin/orders?orderId=${encodeURIComponent(order.orderId)}`);
                              }}
                              className="p-3 bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-[#711612]/40 transition shadow-sm hover:shadow flex items-center justify-between gap-3 cursor-pointer group"
                              title={`Click to open order details for #${order.orderId}`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-[#711612] group-hover:underline">
                                    #{order.orderId}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    order.status === 'Arrived'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : order.status === 'In Office'
                                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                                  }`}>
                                    {order.status}
                                  </span>
                                </div>
                                <div className="text-xs font-semibold text-slate-800 truncate mt-1">
                                  {order.productName}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'} • Qty: {order.quantity}
                                </div>
                              </div>

                              <div className="text-right flex-shrink-0 flex items-center gap-2.5">
                                <div className="text-xs font-bold text-slate-900 font-mono">
                                  {formatPriceWithIqd(order.totalPrice || 0).combinedStr}
                                </div>
                                <div className="p-1.5 rounded-lg bg-slate-100 group-hover:bg-[#711612] text-slate-600 group-hover:text-white transition">
                                  <Eye className="w-3.5 h-3.5" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500 space-y-1">
                          <p className="font-medium text-slate-700">No registered orders found for this customer.</p>
                          <button
                            type="button"
                            onClick={() => {
                              setViewCustomer(null);
                              navigate(`/admin/add-order`);
                            }}
                            className="text-xs font-bold text-[#711612] hover:underline"
                          >
                            + Create order for {viewCustomer.name}
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = viewCustomer;
                  setViewCustomer(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition inline-flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
              <button
                type="button"
                onClick={() => setViewCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CUSTOMER MODAL */}
      {editCustomer && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setEditCustomer(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Edit3 className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold text-white font-display">Edit Customer Profile</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/30 text-xs font-mono font-bold rounded">
                  {editCustomer.customerId}
                </span>
              </div>
              <button
                onClick={() => setEditCustomer(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="p-8 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-bold text-slate-800">{saveSuccess}</h3>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                    placeholder=""
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editForm.phone}
                      onChange={e => setEditForm({ ...editForm, phone: formatPhoneNumber(e.target.value) })}
                      className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-[#711612]/20 font-mono ${
                        isEditDuplicatePhone() ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-[#711612]'
                      }`}
                      placeholder="0770 111 1111"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                      placeholder=""
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Second Phone Number <span className="text-xs font-normal text-slate-400">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.secondaryPhone}
                    onChange={e => setEditForm({ ...editForm, secondaryPhone: formatPhoneNumber(e.target.value) })}
                    className={`w-full px-3.5 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-[#711612]/20 font-mono ${
                      isEditDuplicatePhone() ? 'border-red-500 bg-red-50/30' : 'border-slate-300 focus:border-[#711612]'
                    }`}
                    placeholder="0770 111 1111"
                  />
                  {isEditDuplicatePhone() && (
                    <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                      <span>⚠️ Primary and secondary phone numbers cannot be the same.</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={editForm.address}
                    onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                    placeholder=""
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Notes & Tags
                  </label>
                  <input
                    type="text"
                    value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                    placeholder="e.g. VIP Customer, Regular Buyer"
                  />
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditCustomer(null)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isEditDuplicatePhone()}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] transition shadow flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* First Step Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={!!deleteConfirmCust}
        title="Delete Customer Profile"
        message={deleteConfirmCust ? `Are you sure you want to delete customer ${deleteConfirmCust.name} (${deleteConfirmCust.customerId})?` : ''}
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          const target = deleteConfirmCust;
          setDeleteConfirmCust(null);
          setSecondConfirmCust(target);
        }}
        onCancel={() => setDeleteConfirmCust(null)}
      />

      {/* Second Step Final Confirmation Modal */}
      <ConfirmModal
        isOpen={!!secondConfirmCust}
        title="⚠️ Final Confirmation Required"
        message={secondConfirmCust ? `Are you REALLY sure you want to delete customer ${secondConfirmCust.name} (${secondConfirmCust.customerId})? This profile and all associated record links will be permanently deleted. This action CANNOT be undone.` : ''}
        confirmText="Yes, Permanently Delete"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={() => secondConfirmCust && handleDeleteCustomer(secondConfirmCust)}
        onCancel={() => setSecondConfirmCust(null)}
      />
    </AdminLayout>
  );
};



import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Hash, Package, ShieldCheck,
  LogOut, ArrowRight, Check, Copy, Sparkles,
  Clock, Truck, AlertCircle, CheckCircle2,
  X, MapPin, Search, ExternalLink,
  MessageCircle, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { orderApi, customerApi } from '../api';
import { AdminOrder, Customer } from '../types';
import { formatPhoneNumber, formatDateTime, formatDisplayDate } from '../utils/formatters';
import { LogoutModal } from '../components/LogoutModal';
import { useRealtimeOrders } from '../utils/realtime';

export const UserAccountPage: React.FC = () => {
  const { user, isAuthenticated, logout, linkCustomerId } = useAuth();
  const { formatPriceWithIqd } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Customer Linking Modal & State
  const [showBecomeCustomerModal, setShowBecomeCustomerModal] = useState(false);
  const [inputCustomerId, setInputCustomerId] = useState('');
  const [linkingLoading, setLinkingLoading] = useState(false);
  const [linkError, setLinkError] = useState('');
  const [linkSuccess, setLinkSuccess] = useState('');
  const [linkedCustomer, setLinkedCustomer] = useState<Customer | null>(null);

  // Orders Filter & Search: Support all 5 approved lifecycle statuses
  type CustomerOrderStatusTab = 'All' | 'Purchased' | 'Received in Warehouse' | 'Dispatched from Warehouse' | 'Arrived' | 'Done';
  const [statusFilter, setStatusFilter] = useState<CustomerOrderStatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<AdminOrder | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load customer profile if customerId is present
  const fetchCustomerDetails = useCallback(async () => {
    if (!user?.customerId) {
      setLinkedCustomer(null);
      return;
    }
    try {
      const customers = await customerApi.getCustomers();
      const match = customers.find(
        c => c.customerId?.trim().toUpperCase() === user.customerId?.trim().toUpperCase()
      );
      if (match) {
        setLinkedCustomer(match);
      }
    } catch (e) {
      console.warn('Could not fetch linked customer details:', e);
    }
  }, [user?.customerId]);

  useEffect(() => {
    if (user?.customerId) {
      fetchCustomerDetails();
    }
  }, [user?.customerId, fetchCustomerDetails]);

  // Load user orders: ONLY for verified customers with an active Customer ID
  const fetchUserOrders = useCallback(async (silent = false) => {
    // Standard Users have NO access to orders or order statuses
    if (!user || !user.isCustomer || !user.customerId) {
      setOrders([]);
      setLoadingOrders(false);
      return;
    }

    try {
      if (!silent) setLoadingOrders(true);
      const allOrders = await orderApi.getOrders();

      const userCustIdClean = (user.customerId || '').trim().toUpperCase();

      // Strictly match by verified Customer ID - no fuzzy name matching to prevent other customers' orders from appearing
      const userOrders = allOrders.filter(ord => {
        const ordCustIdClean = (ord.customerId || '').trim().toUpperCase();
        return ordCustIdClean && ordCustIdClean === userCustIdClean;
      });

      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user?.isCustomer && user?.customerId) {
      fetchUserOrders(false);
    } else {
      setOrders([]);
      setLoadingOrders(false);
    }
  }, [isAuthenticated, user?.isCustomer, user?.customerId, fetchUserOrders]);

  // Real-time event listener for live order changes from admin dashboard (only for verified customers)
  useRealtimeOrders(() => {
    if (user?.isCustomer && user?.customerId) {
      fetchUserOrders(true);
    }
  });

  // Background fallback polling every 4 seconds for live updates (only for verified customers)
  useEffect(() => {
    if (!isAuthenticated || !user?.isCustomer || !user?.customerId) return;
    const interval = setInterval(() => {
      fetchUserOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user?.isCustomer, user?.customerId, fetchUserOrders]);

  const handleCopyId = () => {
    if (user?.customerId) {
      navigator.clipboard.writeText(user.customerId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    navigate('/');
  };

  // Submit Customer ID
  const handleLinkCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = inputCustomerId.trim().toUpperCase();
    if (!cleanId) {
      setLinkError('Please enter your Customer ID.');
      return;
    }

    setLinkingLoading(true);
    setLinkError('');
    setLinkSuccess('');

    try {
      const res = await linkCustomerId(cleanId);
      if (res.customer) {
        setLinkedCustomer(res.customer);
      }
      setLinkSuccess(`Successfully connected Customer ID: ${cleanId}!`);
      fetchUserOrders(true);

      setTimeout(() => {
        setShowBecomeCustomerModal(false);
        setLinkSuccess('');
        setInputCustomerId('');
      }, 1000);
    } catch (err: any) {
      setLinkError(err.message || `Customer ID "${cleanId}" was not found. Please verify the ID provided by Order Center.`);
    } finally {
      setLinkingLoading(false);
    }
  };

  // Filtered & Searched Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(ord => {
      // Status filter
      if (statusFilter !== 'All') {
        const s = (ord.status || '') as string;
        if (statusFilter === 'Purchased' && s !== 'Purchased') return false;
        if (statusFilter === 'Received in Warehouse' && s !== 'Received in Warehouse' && s !== 'In Office') return false;
        if (statusFilter === 'Dispatched from Warehouse' && s !== 'Dispatched from Warehouse') return false;
        if (statusFilter === 'Arrived' && s !== 'Arrived') return false;
        if (statusFilter === 'Done' && s !== 'Done') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesOrderId = (ord.orderId || '').toLowerCase().includes(q);
        const matchesTracking = (ord.trackingNumber || '').toLowerCase().includes(q);
        const matchesProduct = (ord.productName || '').toLowerCase().includes(q);
        return matchesOrderId || matchesTracking || matchesProduct;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Status counts for all 5 lifecycle statuses
  const orderCounts = useMemo(() => {
    return {
      all: orders.length,
      purchased: orders.filter(o => o.status === 'Purchased').length,
      received: orders.filter(o => o.status === 'Received in Warehouse' || o.status === 'In Office').length,
      dispatched: orders.filter(o => o.status === 'Dispatched from Warehouse').length,
      arrived: orders.filter(o => o.status === 'Arrived').length,
      done: orders.filter(o => o.status === 'Done').length,
    };
  }, [orders]);

  if (!user) {
    return null;
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const isVerifiedCustomer = Boolean(user.isCustomer && user.customerId);

  const getOrderStep = (st: string): number => {
    const lower = (st || '').toLowerCase().trim();
    if (lower === 'purchased') return 1;
    if (lower === 'received in warehouse' || lower === 'in office') return 2;
    if (lower === 'dispatched from warehouse' || lower === 'dispatched' || lower === 'in transit') return 3;
    if (lower === 'arrived') return 4;
    if (lower === 'done' || lower === 'delivered' || lower === 'completed') return 5;
    return 1;
  };

  const getCustomerBadgeClass = (status: string) => {
    const lower = (status || '').toLowerCase().trim();
    if (lower === 'purchased') return 'bg-amber-50 text-amber-800 border border-amber-200';
    if (lower === 'received in warehouse' || lower === 'in office') return 'bg-sky-50 text-sky-800 border border-sky-200';
    if (lower === 'dispatched from warehouse' || lower === 'dispatched' || lower === 'in transit') return 'bg-[#711612]/10 text-[#711612] border border-[#711612]/30 font-bold';
    if (lower === 'arrived') return 'bg-indigo-50 text-indigo-800 border border-indigo-200';
    if (lower === 'done' || lower === 'delivered' || lower === 'completed') return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    if (lower === 'canceled') return 'bg-rose-50 text-rose-800 border border-rose-200';
    return 'bg-slate-100 text-slate-700 border border-slate-200';
  };

  return (
    <div className="min-h-screen bg-[#F7F6F4] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ─── Page Title & Header ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
              My Account
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your profile, track shipments, and access customer services.
            </p>
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-red-200 bg-red-50/80 hover:bg-red-100 text-red-700 text-xs font-bold transition shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ─── Profile Header Banner ──────────────────────────────────── */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] text-white p-6 sm:p-8 shadow-xl overflow-hidden border border-[#D4AF37]/30">
          {/* Subtle Ambient Shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-black/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-amber-400 to-[#D4AF37] p-1 shadow-lg shadow-black/30">
                <div className="w-full h-full rounded-[14px] bg-[#711612] flex items-center justify-center text-white text-3xl font-display font-black tracking-wider">
                  {userInitial}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow">
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              </div>
            </div>

            {/* User Meta */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-wide truncate">
                  {user.name}
                </h1>
                
                {/* Role / Customer Badge */}
                {user.role === 'admin' ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#D4AF37] text-black shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Admin
                  </span>
                ) : isVerifiedCustomer ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400/25 to-amber-500/30 text-amber-200 border border-amber-300/50 shadow-sm backdrop-blur-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
                    Verified Customer
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-white/90">
                    Member
                  </span>
                )}
              </div>

              <p className="text-sm text-white/80 mt-1 truncate">
                {user.email}
              </p>

              {(user.phone || linkedCustomer?.phone) && (
                <p className="text-xs text-white/70 font-mono mt-0.5">
                  {formatPhoneNumber(user.phone || linkedCustomer?.phone || '')}
                </p>
              )}

              {/* Quick actions inside banner */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4 pt-4 border-t border-white/15">
                {/* Track Orders Button */}
                <Link
                  to="/track"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition border border-white/15 shadow-sm"
                >
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Track Orders</span>
                </Link>

                {/* Become Customer Button (Banner shortcut if not linked) */}
                {!isVerifiedCustomer ? (
                  <button
                    onClick={() => {
                      setShowBecomeCustomerModal(true);
                      setLinkError('');
                      setLinkSuccess('');
                      setInputCustomerId('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#D4AF37] to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold transition shadow-md border border-amber-300"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                    <span>Become a Customer</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 text-amber-200 text-xs font-mono border border-amber-400/30">
                    <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>ID: {user.customerId}</span>
                  </div>
                )}

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold transition shadow-sm"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Grid: Customer Card + Account Information ──────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Customer ID / Card */}
          <div className="md:col-span-1 space-y-6">
            {isVerifiedCustomer ? (
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-100/40 p-5 border border-[#D4AF37]/60 shadow-sm relative overflow-hidden space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Customer ID
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#711612] text-white flex items-center gap-1 shadow-sm">
                    <Check className="w-3 h-3 text-[#D4AF37]" />
                    Verified
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-inner flex items-center justify-between">
                  <span className="text-base font-mono font-bold text-[#711612] tracking-wider select-all">
                    {user.customerId}
                  </span>
                  <button
                    onClick={handleCopyId}
                    title="Copy Customer ID"
                    className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-500 hover:text-[#711612] transition flex items-center gap-1 text-xs font-semibold"
                  >
                    {copiedId ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700 text-[10px]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-[10px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {linkedCustomer?.address && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-700 space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#711612]" />
                      Saved Delivery Address
                    </div>
                    <p className="line-clamp-2 text-slate-800 font-medium">
                      {linkedCustomer.address}
                    </p>
                  </div>
                )}

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Use your Customer ID whenever ordering with Order Center or contacting customer service to automatically assign your packages.
                </p>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-end text-xs">
                  <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
                    Active Customer
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-5 border-2 border-dashed border-[#D4AF37]/70 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <User className="w-4 h-4 text-slate-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Account Type</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    Standard User
                  </span>
                </div>

                <div className="p-3.5 bg-gradient-to-br from-amber-50 to-orange-50/40 rounded-xl border border-amber-200/70 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Become a Customer</span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 leading-relaxed">
                    Have you been added from the dashboard or received a Customer ID? Enter your ID to link your shipments, access verified tracking, and unlock full customer features.
                  </p>
                </div>

                <button
                  id="become-customer-btn"
                  onClick={() => {
                    setShowBecomeCustomerModal(true);
                    setLinkError('');
                    setLinkSuccess('');
                    setInputCustomerId('');
                  }}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#711612] hover:from-[#5c110e] hover:to-[#711612] text-amber-300 hover:text-white font-bold text-xs shadow-md shadow-[#711612]/20 hover:shadow-lg transition-all duration-200 border border-[#D4AF37]/40 group"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                  <span>Become a Customer</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* Quick Customer Support & WhatsApp Card */}
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-800">
                <MessageCircle className="w-4 h-4 text-[#711612]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Customer Helpdesk</h3>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Need to place an order from SHEIN, Amazon, or Alibaba? Message our team directly with your Customer ID.
              </p>
              <a
                href={`https://wa.me/9647701566233?text=${encodeURIComponent(
                  isVerifiedCustomer
                    ? `Hello Order Center, I am customer ID: ${user.customerId} (${user.name}). I would like to place an order.`
                    : `Hello Order Center, my name is ${user.name}. I would like to register as a customer and get a Customer ID.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Contact via WhatsApp</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          </div>

          {/* Right Column: Account Details & Recent Shipments */}
          <div className="md:col-span-2 space-y-6">

            {/* Personal Details Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4 text-[#711612]" />
                  <span>Personal Details</span>
                </h2>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Full Name</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{user.name}</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Email Address</div>
                  <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">{user.email}</div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Phone Number</div>
                  <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                    {user.phone || linkedCustomer?.phone
                      ? formatPhoneNumber(user.phone || linkedCustomer?.phone || '')
                      : 'Not specified'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Account Role</div>
                  <div className="text-sm font-bold text-slate-800 capitalize mt-0.5">
                    {isVerifiedCustomer ? 'Verified Customer' : user.role || 'User'}
                  </div>
                </div>

                {linkedCustomer?.address && (
                  <div className="sm:col-span-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#711612]" />
                      <span>Delivery Address</span>
                    </div>
                    <div className="text-xs font-medium text-slate-800 mt-0.5">
                      {linkedCustomer.address}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ─── ORDERS SECTION: Strictly for Verified Customers ─── */}
            {isVerifiedCustomer ? (
            <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
              {/* Header: Title + Search Bar + Track by Number */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#711612]" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    My Orders & Shipments
                  </h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {orders.length}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                  {/* Order Search moved UP into header */}
                  <div className="relative w-full sm:w-56">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search orders..."
                      className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-none focus:border-[#711612]"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <Link
                    to="/track"
                    className="text-xs font-bold text-[#711612] hover:underline flex items-center gap-1 whitespace-nowrap flex-shrink-0"
                  >
                    <span>Track by Number</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Status Filter Tabs: All fully visible with flex-wrap, no scrollbar */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {([
                  { id: 'All', label: 'All', count: orderCounts.all },
                  { id: 'Purchased', label: 'Purchased', count: orderCounts.purchased },
                  { id: 'Received in Warehouse', label: 'Received in Warehouse', count: orderCounts.received },
                  { id: 'Dispatched from Warehouse', label: 'Dispatched from Warehouse', count: orderCounts.dispatched },
                  { id: 'Arrived', label: 'Arrived', count: orderCounts.arrived },
                  { id: 'Done', label: 'Done', count: orderCounts.done },
                ] as const).map(tab => {
                  const isActive = statusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStatusFilter(tab.id as CustomerOrderStatusTab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                        isActive
                          ? 'bg-[#711612] text-white shadow-[#711612]/20'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Order List */}
              {loadingOrders ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-[#711612] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading your orders...
                </div>
              ) : filteredOrders.length > 0 ? (
                <div className="space-y-3">
                  {filteredOrders.map(order => {
                    const step = getOrderStep(order.status);
                    return (
                      <div
                        key={order._id || order.orderId}
                        className="p-4 rounded-xl border border-slate-200 hover:border-[#711612]/30 hover:shadow-md transition bg-white space-y-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-900">
                              #{order.orderId}
                            </span>
                            {order.trackingNumber && (
                              <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {order.trackingNumber}
                              </span>
                            )}
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getCustomerBadgeClass(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Product Info & Pricing */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 pt-1">
                          <div className="flex items-center gap-2">
                            {order.productImage ? (
                              <img
                                src={order.productImage}
                                alt={order.productName}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                <Package className="w-5 h-5 text-slate-400" />
                              </div>
                            )}
                            <div>
                              <span className="font-semibold text-slate-900 line-clamp-1">
                                {order.productName || 'Order Package'}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                Qty: {order.quantity || 1} • {order.originCountry || 'China'} → {order.destinationCountry || 'Iraq'}
                              </span>
                            </div>
                          </div>

                          <span className="font-bold text-slate-900 text-sm sm:text-right">
                            {formatPriceWithIqd(order.totalPrice || 0).combinedStr}
                          </span>
                        </div>

                        {/* Status Progress Bar: 5-Stage Lifecycle */}
                        <div className="pt-2">
                          <div className="grid grid-cols-5 text-[9px] sm:text-[10px] text-slate-500 font-medium mb-1.5 gap-1">
                            <span className={step >= 1 ? 'text-[#711612] font-bold text-left' : 'text-slate-400 text-left'}>
                              1. Purchased
                            </span>
                            <span className={step >= 2 ? 'text-[#711612] font-bold text-center' : 'text-slate-400 text-center'}>
                              2. In Warehouse
                            </span>
                            <span className={step >= 3 ? 'text-[#711612] font-bold text-center' : 'text-slate-400 text-center'}>
                              3. Dispatched
                            </span>
                            <span className={step >= 4 ? 'text-[#711612] font-bold text-center' : 'text-slate-400 text-center'}>
                              4. Arrived
                            </span>
                            <span className={step >= 5 ? 'text-emerald-700 font-bold text-right' : 'text-slate-400 text-right'}>
                              5. Done
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              className={`h-full transition-all duration-500 ${
                                step === 5
                                  ? 'w-full bg-emerald-500'
                                  : step === 4
                                  ? 'w-4/5 bg-indigo-600'
                                  : step === 3
                                  ? 'w-3/5 bg-[#711612]'
                                  : step === 2
                                  ? 'w-2/5 bg-sky-500'
                                  : 'w-1/5 bg-amber-500'
                              }`}
                            />
                          </div>
                        </div>

                        {/* Bottom Actions with Dates */}
                        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400 gap-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{order.createdAt ? formatDateTime(order.createdAt) : 'Recent'}</span>
                            </span>
                            {order.estimatedDelivery && (
                              <span className="flex items-center gap-1 text-slate-600 font-medium">
                                <span>Est: {formatDisplayDate(order.estimatedDelivery)}</span>
                                {order.approximateDeliveryDate && (
                                  <span className="text-[#711612] font-bold">
                                    (Close: {formatDisplayDate(order.approximateDeliveryDate)})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setSelectedOrderDetails(order)}
                              className="font-semibold text-slate-600 hover:text-slate-900"
                            >
                              Details
                            </button>
                            <Link
                              to={`/track?q=${order.trackingNumber || order.orderId}`}
                              className="font-bold text-[#711612] hover:underline flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Live</span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">
                    {searchQuery ? 'No Orders Match Your Search' : 'No Orders Linked Yet'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? 'Try clearing your search terms or status filters.'
                      : isVerifiedCustomer
                      ? `Your account is connected with Customer ID ${user.customerId}. Any new orders assigned to your customer profile will appear here automatically.`
                      : 'Have you received a Customer ID from Order Center? Click "Become a Customer" above to connect your account and view all your shipments.'}
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link
                      to="/track"
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      Track by Number
                    </Link>
                  </div>
                </div>
              )}
            </div>
            ) : (
              /* Standard User Card: Orders & Status Tracking Locked */
              <div className="rounded-2xl bg-white p-8 border border-slate-200 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-[#711612] shadow-sm">
                  <Lock className="w-7 h-7 text-[#711612]" />
                </div>
                <div className="max-w-md mx-auto space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Standard User Account</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Orders & Shipment Lifecycles
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Standard users cannot view orders or shipment statuses. Order tracking and status lifecycles are reserved exclusively for verified customers with an assigned Customer ID.
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    If you have received a Customer ID from our dashboard team, click below to link it and unlock your orders, 5-stage progress tracking, and package details.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setShowBecomeCustomerModal(true);
                      setLinkError('');
                      setLinkSuccess('');
                      setInputCustomerId('');
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#711612] hover:from-[#5a110e] hover:to-[#711612] text-amber-300 hover:text-white font-bold text-xs shadow-md transition border border-[#D4AF37]/40"
                  >
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <span>Become a Customer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`https://wa.me/9647701566233?text=${encodeURIComponent(
                      `Hello Order Center, my name is ${user.name} (${user.email}). I would like to get a Customer ID.`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Request Customer ID</span>
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ─── Modal: Become a Customer / Link Customer ID ────────────── */}
      {showBecomeCustomerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] p-6 text-white border-b border-[#D4AF37]/30 relative">
              <button
                onClick={() => setShowBecomeCustomerModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/10 border border-[#D4AF37]/40 text-[#D4AF37]">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display tracking-wide">
                    {isVerifiedCustomer ? 'Update Customer ID' : 'Become a Verified Customer'}
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Connect your account to your Order Center Customer ID
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleLinkCustomerSubmit} className="p-6 space-y-4">
              {linkError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <span>{linkError}</span>
                </div>
              )}

              {linkSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>{linkSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Enter Customer ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={inputCustomerId}
                    onChange={(e) => setInputCustomerId(e.target.value.toUpperCase())}
                    placeholder=""
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 font-mono text-sm tracking-wider uppercase focus:outline-none focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                  When you register with our team or get added in the dashboard, you receive a Customer ID. Entering it connects your user login directly to your customer profile and orders.
                </p>
              </div>

              {/* Helpful instructions / WhatsApp contact */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <span>Don't have a Customer ID yet?</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Our customer service team can generate an official Customer ID for you on WhatsApp within minutes.
                </p>
                <a
                  href={`https://wa.me/9647701566233?text=${encodeURIComponent(
                    `Hello Order Center, my name is ${user.name} (${user.email}). I would like to be registered as an official customer and receive my Customer ID.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#711612] hover:underline pt-0.5"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Request Customer ID on WhatsApp &rarr;</span>
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBecomeCustomerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkingLoading || !inputCustomerId.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#5a110e] hover:to-[#711612] text-amber-300 font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {linkingLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Link & Activate Customer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal: Single Order Details ─────────────────────────────── */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-[#711612] p-5 text-white flex items-center justify-between border-b border-[#D4AF37]/40">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-bold text-base font-display">
                  Order #{selectedOrderDetails.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Status</span>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {selectedOrderDetails.status}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-semibold uppercase">Total Price</span>
                  <div className="text-sm font-bold text-[#711612] mt-0.5">
                    {formatPriceWithIqd(selectedOrderDetails.totalPrice || 0).combinedStr}
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Product</span>
                <p className="text-sm font-semibold text-slate-800 mt-0.5">
                  {selectedOrderDetails.productName}
                </p>
                {selectedOrderDetails.productUrl && (
                  <a
                    href={selectedOrderDetails.productUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#711612] hover:underline inline-flex items-center gap-1 mt-1 font-medium"
                  >
                    <span>View Product Store Page</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Origin</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedOrderDetails.originCountry || 'China'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Destination</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedOrderDetails.destinationCountry || 'Iraq'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Shipping Method</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedOrderDetails.shippingMethod || 'Express Air'}</p>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold">Est. Delivery</span>
                  <p className="font-bold text-slate-700 mt-0.5">{selectedOrderDetails.estimatedDelivery ? formatDisplayDate(selectedOrderDetails.estimatedDelivery) : 'Pending'}</p>
                  {selectedOrderDetails.approximateDeliveryDate && (
                    <p className="text-[10px] font-bold text-amber-800 mt-0.5">
                      Target: {formatDisplayDate(selectedOrderDetails.approximateDeliveryDate)}
                    </p>
                  )}
                </div>
              </div>

              {selectedOrderDetails.statusHistory && selectedOrderDetails.statusHistory.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Status Timeline
                  </span>
                  <div className="space-y-2.5">
                    {selectedOrderDetails.statusHistory.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#711612] mt-1.5 flex-shrink-0" />
                        <div>
                          <div className="font-bold text-slate-800">{step.status}</div>
                          {step.note && <p className="text-[11px] text-slate-500">{step.note}</p>}
                          <span className="text-[10px] text-slate-400">
                            {formatDateTime(step.date)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  to={`/track?q=${selectedOrderDetails.trackingNumber || selectedOrderDetails.orderId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#711612] hover:bg-[#5a110e] text-white text-xs font-bold transition shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Open Public Live Tracking</span>
                </Link>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Logout Confirmation Modal ───────────────────────────────── */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

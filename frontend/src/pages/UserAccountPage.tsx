import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User, Hash, Package, ShieldCheck,
  LogOut, ArrowRight, Check, Copy, Sparkles,
  Clock, Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { orderApi } from '../api';
import { AdminOrder } from '../types';
import { formatPhoneNumber } from '../utils/formatters';
import { LogoutModal } from '../components/LogoutModal';
import { useRealtimeOrders } from '../utils/realtime';

export const UserAccountPage: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { formatPriceWithIqd } = useSettings();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Load user orders (silent reload prevents loading spinner flickers)
  const fetchUserOrders = useCallback(async (silent = false) => {
    if (!user) return;
    try {
      if (!silent) setLoadingOrders(true);
      const allOrders = await orderApi.getOrders();
      
      // Match orders by phone, email, customer name, or customerId
      const userPhoneClean = (user.phone || '').replace(/\D/g, '');
      const userEmailClean = (user.email || '').toLowerCase().trim();
      const userNameClean = (user.name || '').toLowerCase().trim();

      const userOrders = allOrders.filter(ord => {
        const ordPhoneClean = (ord.phone || '').replace(/\D/g, '');
        const ordEmailClean = (ord.email || '').toLowerCase().trim();
        const ordNameClean = (ord.customerName || '').toLowerCase().trim();

        const matchesPhone = userPhoneClean && ordPhoneClean && ordPhoneClean.includes(userPhoneClean);
        const matchesEmail = userEmailClean && ordEmailClean && ordEmailClean === userEmailClean;
        const matchesName = userNameClean && ordNameClean && ordNameClean.includes(userNameClean);

        return matchesPhone || matchesEmail || matchesName;
      });

      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      if (!silent) setLoadingOrders(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserOrders(false);
    }
  }, [isAuthenticated, fetchUserOrders]);

  // Real-time event listener for live order changes from admin dashboard
  useRealtimeOrders(() => {
    fetchUserOrders(true);
  });

  // Background fallback polling every 4 seconds for live updates
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      fetchUserOrders(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUserOrders]);

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

  if (!user) {
    return null;
  }

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-[#F7F6F4] pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ─── Page Title & Header ───────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 tracking-tight">
            My Account
          </h1>

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
                ) : user.isCustomer ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/40">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
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

              {user.phone && (
                <p className="text-xs text-white/70 font-mono mt-0.5">
                  {formatPhoneNumber(user.phone)}
                </p>
              )}

              {/* Quick actions inside banner */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4 pt-4 border-t border-white/15">
                <Link
                  to="/track"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition border border-white/15"
                >
                  <Package className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Track Orders</span>
                </Link>

                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-black text-xs font-bold transition shadow-sm"
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
            {user.isCustomer && user.customerId ? (
              <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 border border-[#D4AF37]/50 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Customer ID
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#711612] text-white">
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

                <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                  Use this Customer ID when ordering or communicating with customer service to automatically track and assign your packages.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Account Type</h3>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-700">Standard User</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    You have an active Order Center account for tracking shipments and requesting services.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Account Details & Recent Shipments */}
          <div className="md:col-span-2 space-y-6">

            {/* Personal Details Card */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Personal Details
                </h2>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
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
                    {user.phone ? formatPhoneNumber(user.phone) : 'Not specified'}
                  </div>
                </div>

                <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-400 uppercase font-semibold">Account Role</div>
                  <div className="text-sm font-bold text-slate-800 capitalize mt-0.5">{user.role || 'User'}</div>
                </div>
              </div>
            </div>

            {/* My Shipments & Orders */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#711612]" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    My Orders & Shipments
                  </h2>
                </div>

                <Link
                  to="/track"
                  className="text-xs font-bold text-[#711612] hover:underline flex items-center gap-1"
                >
                  <span>Track by Number</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {loadingOrders ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <div className="w-6 h-6 border-2 border-[#711612] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  Loading your orders...
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div
                      key={order._id || order.orderId}
                      className="p-4 rounded-xl border border-slate-200 hover:border-[#711612]/30 hover:shadow-md transition bg-white space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">
                            #{order.orderId}
                          </span>
                          {order.trackingNumber && (
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {order.trackingNumber}
                            </span>
                          )}
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          order.status === 'Arrived'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.status === 'In Office'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-1 pt-1">
                        <span className="font-semibold text-slate-800 line-clamp-1">
                          {order.productName || 'Order Package'}
                        </span>
                        <span className="font-bold text-slate-900">
                          {formatPriceWithIqd(order.totalPrice || 0).combinedStr}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}</span>
                        </span>

                        <Link
                          to={`/track?q=${order.trackingNumber || order.orderId}`}
                          className="font-bold text-[#711612] hover:underline flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Track Live</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700">No Orders Linked Yet</h4>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    When you order through Order Center using your customer ID, email, or phone number, your shipments will appear here automatically.
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <Link
                      to="/track"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#711612] to-[#8B1E1A] text-white text-xs font-bold shadow-sm"
                    >
                      Track Shipment
                    </Link>
                    <Link
                      to="/"
                      className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                    >
                      Start Shopping
                    </Link>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ─── Logout Confirmation Modal ───────────────────────────────── */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </div>
  );
};

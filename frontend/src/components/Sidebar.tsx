import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Search, Users, Settings, LogOut, ShieldCheck, X, Github
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/add-order', label: 'Add Order', icon: PlusCircle },
    { path: '/admin/tracking', label: 'Tracking', icon: Search },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1E1E24] via-[#18181B] to-[#111113] text-white select-none border-r border-white/10 shadow-2xl">
      {/* Brand Header */}
      <div className="p-5 relative overflow-hidden bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] border-b border-[#D4AF37]/30 shadow-md">
        <div className="flex items-center gap-3.5 relative z-10">
          <img src="/logo.png" alt="Order Center Logo" className="h-10 w-auto object-contain drop-shadow-md" />
          <div>
            <div className="font-display font-bold text-white text-base leading-tight tracking-wide">
              Order Center
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
        {/* Subtle gold accent divider line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3.5 py-6 space-y-2 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Main Menu
        </div>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#711612] to-[#8B1E1A] text-white shadow-lg shadow-[#711612]/30 border-l-4 border-[#D4AF37] font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10 hover:translate-x-0.5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-[#D4AF37]' : 'text-slate-400 group-hover:text-white'
                  }`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Action */}
      <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md space-y-2">
        <a
          href="https://github.com/ShangaBashir/order-center"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 transition border border-white/10 group"
          title="Open GitHub Repository"
        >
          <Github className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span>GitHub Repository</span>
        </a>

        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-400 hover:text-white hover:bg-red-600/80 transition-all duration-200 border border-red-500/30 hover:border-red-500 shadow-sm hover:shadow-red-900/30"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Fixed Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen fixed top-0 bottom-0 left-0 flex-shrink-0 shadow-2xl z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#18181B] h-full shadow-2xl z-50 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-[#1E1E24] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative text-white transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowLogoutModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 flex-shrink-0">
                <LogOut className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Confirm Logout</h3>
                <p className="text-xs text-slate-400 mt-0.5">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-6 bg-white/5 p-3.5 rounded-xl border border-white/5">
              You will be logged out of your session and returned to the admin login page.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 transition-all duration-200 shadow-lg shadow-red-900/40 border border-red-500/30"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};



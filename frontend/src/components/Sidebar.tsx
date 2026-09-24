import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, PlusCircle, Search, Users, Settings, LogOut, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
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
    <div className="h-full flex flex-col bg-[#2C2C2C] text-white select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 bg-[#711612] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Order Center Logo" className="h-10 w-auto object-contain" />
          <div>
            <div className="font-display font-bold text-white text-base leading-tight">Order Center</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              <span className="text-[10px] text-[#D4AF37] font-semibold tracking-wider uppercase">
                Admin Panel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin User Badge */}
      {user && (
        <div className="px-6 py-4 bg-black/20 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#711612] text-white font-bold flex items-center justify-center text-xs border border-[#D4AF37]">
            {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">{user.name || 'Admin'}</div>
            <div className="text-[10px] text-white/50 truncate">{user.email || 'admin@ordercenter.iq'}</div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setMobileOpen && setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#711612] text-white shadow-md border-l-4 border-[#D4AF37]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform duration-200" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Footer Action */}
      <div className="p-4 border-t border-white/10 bg-black/30">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-md text-sm font-semibold text-red-400 hover:text-white hover:bg-red-600/80 transition-all duration-200 border border-red-500/30"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 flex-shrink-0 shadow-xl z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-[#2C2C2C] h-full shadow-2xl z-50 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Menu, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Dashboard' }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBEAE8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#711612] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#2C2C2C]">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#EBEAE8] flex flex-col lg:flex-row text-[#2C2C2C]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-md hover:bg-slate-100 text-slate-700"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-xl sm:text-2xl font-display font-bold text-[#711612]">
                {title}
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              to="/track"
              target="_blank"
              className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold bg-slate-100 hover:bg-[#711612] text-[#711612] hover:text-white transition-all duration-200 border border-slate-200"
              title="Open public tracking page in new tab"
            >
              <Globe className="w-4 h-4" />
              <span>Customer Track Portal</span>
            </Link>

            <div className="w-px h-6 bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#711612] text-white flex items-center justify-center font-bold text-sm shadow-sm border border-[#D4AF37]">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <span className="text-sm font-semibold hidden md:inline text-slate-800">
                {user?.name || 'Admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

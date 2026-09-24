import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ServicesPage from './pages/ServicesPage';
import OffersPage from './pages/OffersPage';
import ContactPage from './pages/ContactPage';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';

// Admin & Tracking pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrders } from './pages/AdminOrders';
import { AdminAddOrder } from './pages/AdminAddOrder';
import { AdminTracking } from './pages/AdminTracking';
import { AdminCustomers } from './pages/AdminCustomers';
import { AddCustomerPage } from './pages/AddCustomerPage';
import { AdminSettings } from './pages/AdminSettings';
import { PublicTrackingPage } from './pages/PublicTrackingPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

function MainLayout() {
  const location = useLocation();
  const isAdminOrTrackRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/track');

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <ScrollToTop />
      
      {/* Show client header only on public store routes */}
      {!isAdminOrTrackRoute && <Header />}

      <main className="flex-grow">
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Public Customer Tracking Route */}
          <Route path="/track" element={<PublicTrackingPage />} />
          <Route path="/tracking" element={<PublicTrackingPage />} />

          {/* Admin Dashboard Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/add-order" element={<AdminAddOrder />} />
          <Route path="/admin/tracking" element={<AdminTracking />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/add-customer" element={<AddCustomerPage />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      {/* Show client footer only on public store routes */}
      {!isAdminOrTrackRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <MainLayout />
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;

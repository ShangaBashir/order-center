import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Search, Package, Globe, X, Menu, ChevronDown, MapPin,
  ArrowRight, Clock, CheckCircle, Truck, AlertCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';

// ─── Language Config ────────────────────────────────────────────────────────
const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ku', name: 'Kurdish', nativeName: 'کوردی', flag: '🏳️' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
];

// ─── Mock search data ────────────────────────────────────────────────────────
const SEARCH_DATA = [
  { id: '1', title: 'International Shopping', desc: 'Shop from SHEIN, Amazon, AliExpress and more', url: '/services', type: 'service' },
  { id: '2', title: 'International Shipping', desc: 'Fast and reliable worldwide shipping', url: '/services', type: 'service' },
  { id: '3', title: 'Product Sourcing', desc: 'We source any product from global websites', url: '/services', type: 'service' },
  { id: '4', title: 'Order Tracking', desc: 'Real-time tracking for all your orders', url: '/services', type: 'service' },
  { id: '5', title: 'New Customer Offer', desc: '10% off your first order', url: '/offers', type: 'offer' },
  { id: '6', title: 'Wholesale Discount', desc: 'Special rates for bulk orders', url: '/offers', type: 'offer' },
  { id: '7', title: 'About Us', desc: 'Learn about our company and values', url: '/about', type: 'page' },
  { id: '8', title: 'Contact', desc: 'Get in touch with our team', url: '/contact', type: 'page' },
  { id: '9', title: 'SHEIN Shopping', desc: 'Order from SHEIN and we deliver to you', url: '/services', type: 'service' },
  { id: '10', title: 'Alibaba Purchasing', desc: 'Wholesale from Alibaba made easy', url: '/services', type: 'service' },
];

const SUGGESTIONS = ['International Shipping', 'SHEIN Shopping', 'Track Order', 'Offers', 'About Us'];

// ─── Tracking mock data ───────────────────────────────────────────────────────
const TRACKING_STEPS = [
  { id: 's1', key: 'tracking.s1', icon: CheckCircle },
  { id: 's2', key: 'tracking.s2', icon: CheckCircle },
  { id: 's3', key: 'tracking.s3', icon: CheckCircle },
  { id: 's4', key: 'tracking.s4', icon: CheckCircle },
  { id: 's5', key: 'tracking.s5', icon: Truck },
  { id: 's6', key: 'tracking.s6', icon: Truck },
  { id: 's7', key: 'tracking.s7', icon: MapPin },
  { id: 's8', key: 'tracking.s8', icon: MapPin },
  { id: 's9', key: 'tracking.s9', icon: CheckCircle },
];

// ─── Header Component ─────────────────────────────────────────────────────────
const Header: React.FC = () => {
  const { t, language, setLanguage, direction } = useLanguage();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [trackingOpen, setTrackingOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<null | 'found' | 'notfound'>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const trackingInputRef = useRef<HTMLInputElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close lang dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [searchOpen]);

  // Focus tracking input when opened
  useEffect(() => {
    if (trackingOpen) setTimeout(() => trackingInputRef.current?.focus(), 100);
  }, [trackingOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Body scroll lock when overlays open
  useEffect(() => {
    if (searchOpen || trackingOpen || mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen, trackingOpen, mobileMenuOpen]);

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/about', label: t('nav.about') },
    { path: '/services', label: t('nav.services') },
    { path: '/offers', label: t('nav.offers') },
    { path: '/contact', label: t('nav.contact') },
  ];

  // Search filtering
  const searchResults = searchQuery.length > 1
    ? SEARCH_DATA.filter(
        item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Tracking submit
  const handleTrack = () => {
    if (!trackingNumber.trim()) return;
    setTrackingLoading(true);
    setTrackingResult(null);
    setTimeout(() => {
      setTrackingLoading(false);
      // Demo: any 6+ char number shows result
      setTrackingResult(trackingNumber.trim().length >= 4 ? 'found' : 'notfound');
    }, 1500);
  };

  const activeStep = 5; // 0-indexed, currently "Shipped"

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      {/* ─── HEADER ─────────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-premium'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src="/logo.png"
                alt="OrderCenter Logo"
                className="h-12 lg:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="hidden sm:block">
                <div className="font-display font-bold text-brand text-lg lg:text-xl leading-none tracking-tight">
                  Order Center
                </div>
                <div className="text-[10px] text-charcoal-lighter font-medium tracking-[0.15em] uppercase leading-none mt-0.5">
                  Global Shopping & Shipping
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`nav-link px-4 py-2 rounded-sm ${isActive(link.path) ? 'active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Icons */}
            <div className="flex items-center gap-1">
              {/* Search */}
              <button
                id="header-search-btn"
                onClick={() => setSearchOpen(true)}
                title="Search"
                className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-sm text-charcoal-light hover:text-brand hover:bg-brand/8 transition-all duration-200"
              >
                <Search className="w-[18px] h-[18px]" />
              </button>

              {/* Tracking */}
              <button
                id="header-tracking-btn"
                onClick={() => setTrackingOpen(true)}
                title="Track Order"
                className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-sm text-charcoal-light hover:text-brand hover:bg-brand/8 transition-all duration-200"
              >
                <Package className="w-[18px] h-[18px]" />
              </button>

              {/* Language */}
              <div ref={langRef} className="relative">
                <button
                  id="header-lang-btn"
                  onClick={() => setLangOpen(!langOpen)}
                  title="Language"
                  className="w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-sm text-charcoal-light hover:text-brand hover:bg-brand/8 transition-all duration-200"
                >
                  <Globe className="w-[18px] h-[18px]" />
                </button>

                {langOpen && (
                  <div className="dropdown right-0 top-full mt-2 w-44 py-1">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-bg transition-colors duration-150 ${
                          language === lang.code ? 'text-brand font-semibold bg-brand/5' : 'text-charcoal'
                        }`}
                      >
                        <span className="text-base">{lang.flag}</span>
                        <span>{lang.nativeName}</span>
                        {language === lang.code && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Hamburger (mobile) */}
              <button
                id="mobile-menu-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-sm text-charcoal-light hover:text-brand hover:bg-brand/8 transition-all duration-200 ml-1"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-bg-dark bg-white shadow-card animate-slide-down">
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-3 rounded-sm text-sm font-medium transition-colors duration-200 ${
                    isActive(link.path)
                      ? 'bg-brand/8 text-brand'
                      : 'text-charcoal-light hover:bg-bg hover:text-brand'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* ─── SEARCH OVERLAY ──────────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="overlay" onClick={() => setSearchOpen(false)}>
          <div
            className="modal w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-5 border-b border-bg-dark">
              <Search className="w-5 h-5 text-charcoal-lighter flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                className="flex-1 text-base text-charcoal placeholder-charcoal-lighter/60 outline-none bg-transparent"
                dir={direction}
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 hover:text-brand transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results / Suggestions */}
            <div className="p-5 max-h-96 overflow-y-auto">
              {searchQuery.length <= 1 ? (
                <>
                  <p className="text-xs text-charcoal-lighter font-semibold tracking-widest uppercase mb-3">
                    {t('search.suggestions')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map(s => (
                      <button
                        key={s}
                        onClick={() => setSearchQuery(s)}
                        className="px-4 py-2 rounded-full bg-bg border border-bg-dark text-sm text-charcoal-light hover:bg-brand hover:text-white hover:border-brand transition-all duration-200"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {searchResults.map(result => (
                    <Link
                      key={result.id}
                      to={result.url}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-sm hover:bg-bg transition-colors duration-150 group"
                    >
                      <div className={`mt-0.5 w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0 ${
                        result.type === 'service' ? 'bg-brand/10 text-brand' :
                        result.type === 'offer' ? 'bg-gold/20 text-gold-dark' :
                        'bg-charcoal/10 text-charcoal'
                      }`}>
                        {result.type === 'service' ? <Package className="w-3.5 h-3.5" /> :
                         result.type === 'offer' ? <span className="text-[10px] font-bold">%</span> :
                         <Globe className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-charcoal group-hover:text-brand transition-colors">
                          {result.title}
                        </div>
                        <div className="text-xs text-charcoal-lighter">{result.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-charcoal-lighter ml-auto self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-charcoal-lighter">
                  <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{t('search.noresult')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TRACKING OVERLAY ────────────────────────────────────────────────── */}
      {trackingOpen && (
        <div className="overlay" onClick={() => { setTrackingOpen(false); setTrackingResult(null); setTrackingNumber(''); }}>
          <div
            className="modal w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-bg-dark">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-sm bg-brand/10 flex items-center justify-center">
                  <Package className="w-4 h-4 text-brand" />
                </div>
                <h2 className="font-display font-bold text-charcoal text-lg">
                  {t('tracking.title')}
                </h2>
              </div>
              <button
                onClick={() => { setTrackingOpen(false); setTrackingResult(null); setTrackingNumber(''); }}
                className="p-1.5 hover:text-brand transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tracking Input */}
            <div className="p-5">
              <div className="flex gap-3">
                <input
                  ref={trackingInputRef}
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTrack()}
                  placeholder={t('tracking.placeholder')}
                  className="input-field flex-1"
                  dir={direction}
                />
                <button
                  onClick={handleTrack}
                  disabled={trackingLoading || !trackingNumber.trim()}
                  className="btn-primary whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {trackingLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Tracking...
                    </span>
                  ) : t('tracking.btn')}
                </button>
              </div>

              {/* Result: Not Found */}
              {trackingResult === 'notfound' && (
                <div className="mt-4 p-4 rounded-sm bg-red-50 border border-red-200 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">Order not found</p>
                    <p className="text-xs text-red-500">Please check your tracking number and try again.</p>
                  </div>
                </div>
              )}

              {/* Result: Found */}
              {trackingResult === 'found' && (
                <div className="mt-5 animate-fade-in">
                  {/* Order Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                    {[
                      { label: t('tracking.order'), value: trackingNumber.toUpperCase() },
                      { label: t('tracking.status'), value: 'In Transit', highlight: true },
                      { label: t('tracking.product'), value: 'SHEIN Women\'s Dress' },
                      { label: t('tracking.origin'), value: 'Shanghai, China' },
                      { label: t('tracking.destination'), value: 'Erbil, Iraq' },
                      { label: t('tracking.estimated'), value: 'Sep 30, 2026' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-sm bg-bg border border-bg-dark">
                        <div className="text-[10px] font-semibold text-charcoal-lighter tracking-widest uppercase mb-1">
                          {item.label}
                        </div>
                        <div className={`text-sm font-semibold ${item.highlight ? 'text-gold-dark' : 'text-charcoal'}`}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Timeline */}
                  <div className="border border-bg-dark rounded-sm p-4">
                    <h3 className="text-sm font-semibold text-charcoal mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-brand" />
                      Order Timeline
                    </h3>
                    <div className="flex flex-col gap-0">
                      {TRACKING_STEPS.map((step, i) => {
                        const isCompleted = i < activeStep;
                        const isCurrentStep = i === activeStep;
                        const isPending = i > activeStep;
                        return (
                          <div key={step.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-colors ${
                                isCompleted ? 'bg-brand border-brand' :
                                isCurrentStep ? 'bg-gold border-gold' :
                                'bg-white border-bg-dark'
                              }`} />
                              {i < TRACKING_STEPS.length - 1 && (
                                <div className={`w-0.5 h-6 ${isCompleted ? 'bg-brand' : 'bg-bg-dark'}`} />
                              )}
                            </div>
                            <div className="pb-4">
                              <p className={`text-sm font-medium leading-none ${
                                isCurrentStep ? 'text-gold-dark' :
                                isCompleted ? 'text-brand' :
                                'text-charcoal-lighter'
                              }`}>
                                {t(step.key)}
                              </p>
                              {isCurrentStep && (
                                <p className="text-xs text-charcoal-lighter mt-1">Sep 24, 2026 · 10:30 AM</p>
                              )}
                              {isCompleted && (
                                <p className="text-xs text-charcoal-lighter/70 mt-1">
                                  Sep {18 + i}, 2026
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-xs text-charcoal-lighter mt-3 text-right">
                    {t('tracking.updated')}: Sep 24, 2026 · 12:00 PM
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

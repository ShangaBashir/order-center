import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Clock, Calculator, Zap } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, MultilingualText, ServiceCardItem } from '../types';
import { renderIcon } from './website-cms/CMSComponents';

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setVisible(true);
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className = '', delay = 0
}) => {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const ServicesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [calcCountry, setCalcCountry] = useState<string>('usa');
  const [calcWeight, setCalcWeight] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;
    websiteContentApi.getContent().then((data) => {
      if (isMounted && data) {
        setContent(data);
      }
    }).catch((err) => {
      console.warn('Could not load dynamic website content', err);
    });
    return () => { isMounted = false; };
  }, []);

  const txt = (field?: MultilingualText, fallback = ''): string => {
    if (!field) return fallback;
    const currentLang = language as 'en' | 'ku' | 'ar';
    return field[currentLang] || field.en || fallback;
  };

  const srv = content?.services;

  // Rate calculator estimations
  const countryRates: Record<string, { name: string; flag: string; ratePerKg: number; baseFee: number; days: string }> = {
    usa: { name: 'USA', flag: '🇺🇸', ratePerKg: 12, baseFee: 5, days: '5–8 Days' },
    uk: { name: 'UK', flag: '🇬🇧', ratePerKg: 11, baseFee: 5, days: '4–7 Days' },
    turkey: { name: 'Turkey', flag: '🇹🇷', ratePerKg: 7, baseFee: 4, days: '2–4 Days' },
    china: { name: 'China', flag: '🇨🇳', ratePerKg: 9, baseFee: 5, days: '6–10 Days' },
    uae: { name: 'UAE', flag: '🇦🇪', ratePerKg: 8, baseFee: 4, days: '3–5 Days' },
    europe: { name: 'Europe', flag: '🇪🇺', ratePerKg: 11, baseFee: 5, days: '5–8 Days' },
  };

  const currentCountry = countryRates[calcCountry] || countryRates.usa;
  const estimatedUsd = Math.round(currentCountry.baseFee + currentCountry.ratePerKg * calcWeight);
  const estimatedIqd = (estimatedUsd * 1480).toLocaleString();

  // Filter services if category selected (defensively exclude incomplete/empty cards)
  const allServices: ServiceCardItem[] = (srv?.servicesList?.items || []).filter(
    s => (s.title?.en?.trim() || s.title?.ku?.trim() || s.title?.ar?.trim()) &&
         (s.description?.en?.trim() || s.description?.ku?.trim() || s.description?.ar?.trim())
  );
  const filteredServices = selectedCategory === 'all'
    ? allServices
    : allServices.filter(s =>
        s.tags?.some(tag => tag.toLowerCase().includes(selectedCategory.toLowerCase())) ||
        txt(s.title).toLowerCase().includes(selectedCategory.toLowerCase())
      );

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden bg-[#FAF8F5]">
      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 hero-gradient overflow-hidden text-white">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,175,55,0.22),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(148,32,28,0.45),transparent_55%)]" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md shadow-lg">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                {srv ? txt(srv.hero.badge, 'Global Freight & Shopping Services') : 'Global Freight & Shopping Services'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] mb-6">
              {srv ? txt(srv.hero.title, t('services.title')) : t('services.title')}
            </h1>

            <p className="text-base sm:text-lg text-white/85 font-normal leading-relaxed mb-8 max-w-2xl">
              {srv ? txt(srv.hero.description, t('services.subtitle')) : t('services.subtitle')}
            </p>

            {/* Quick Stats Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-xl">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">100% Insured</div>
                  <div className="text-[10px] text-white/60">Full damage guarantee</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                <Truck className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Doorstep Transit</div>
                  <div className="text-[10px] text-white/60">All Iraqi governorates</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <Zap className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Direct Flights</div>
                  <div className="text-[10px] text-white/60">Fast regular routes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-8 text-[#FAF8F5] preserve-3d">
            <path d="M0,60 C320,10 440,55 720,30 C1000,5 1160,50 1440,60 L1440,60 L0,60 Z" fill="currentColor" />
          </svg>
        </div>
      </section>

      {/* ── 2. SERVICES SHOWCASE ─────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#711612] bg-[#711612]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              {srv ? txt(srv.servicesList.label, 'What We Offer') : 'What We Offer'}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {srv ? txt(srv.servicesList.title, 'Complete Shopping & Shipping Solutions') : 'Complete Shopping & Shipping Solutions'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {srv ? txt(srv.servicesList.subtitle, 'Everything you need to buy and receive goods overseas delivered right to your hands in Iraq.') : 'Everything you need to buy and receive goods overseas delivered right to your hands in Iraq.'}
            </p>
          </FadeSection>

          {/* Service Category Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            {[
              { id: 'all', label: 'All Services' },
              { id: 'express', label: 'Express Shipping' },
              { id: 'shopper', label: 'Personal Shopper' },
              { id: 'customs', label: 'Customs & Clearance' },
              { id: 'door', label: 'Door Delivery' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#711612] text-white shadow-md shadow-[#711612]/25 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredServices.map((item, i) => (
              <FadeSection key={item.id} delay={i * 60}>
                <div
                  className={`h-full p-7 rounded-2xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 relative flex flex-col justify-between group bg-white ${
                    item.featured
                      ? 'border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30'
                      : 'border-slate-200/80 hover:border-[#711612]/40'
                  }`}
                >
                  {/* Top Header */}
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-[#711612]/10 text-[#711612] flex items-center justify-center group-hover:bg-[#711612] group-hover:text-white transition-all duration-300 shadow-xs">
                        {renderIcon(item.icon, 'w-7 h-7')}
                      </div>
                      {item.featured && (
                        <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-gradient-to-r from-[#D4AF37] to-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                          <Sparkles className="w-3 h-3 fill-current" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-900 mb-3 group-hover:text-[#711612] transition-colors leading-snug">
                      {txt(item.title)}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                      {txt(item.description)}
                    </p>
                  </div>

                  {/* Bottom Footer & Tags */}
                  <div className="pt-5 border-t border-slate-100 space-y-4">
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Action link */}
                    <div className="pt-2 flex items-center justify-between">
                      <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#711612] group-hover:text-[#94201C] transition-colors"
                      >
                        <span>Request Service</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                      </Link>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Active 24/7
                      </span>
                    </div>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE LIVE SHIPPING ESTIMATOR ─────────────────────────────── */}
      <section className="py-20 bg-gradient-to-b from-white to-[#FAF8F5] border-y border-slate-200/70">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200/90 shadow-xl relative overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#711612] via-[#D4AF37] to-[#711612]" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Controls */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#711612] uppercase tracking-wider mb-2">
                    <Calculator className="w-4 h-4" />
                    <span>Instant Rate Estimator</span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                    Estimate Shipping to Iraq
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Calculate estimated air freight charges and transit timelines from international origins.
                  </p>
                </div>

                {/* Country Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    1. Select Origin Country
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.entries(countryRates).map(([k, c]) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setCalcCountry(k)}
                        className={`p-2.5 rounded-xl text-center border transition-all cursor-pointer ${
                          calcCountry === k
                            ? 'bg-[#711612] text-white border-[#711612] shadow-sm scale-105'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <div className="text-xl mb-0.5">{c.flag}</div>
                        <div className="text-[11px] font-bold truncate">{c.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      2. Package Weight (Kg)
                    </label>
                    <span className="text-xs font-black text-[#711612]">{calcWeight} Kilograms</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="20"
                    step="0.5"
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(parseFloat(e.target.value))}
                    className="w-full accent-[#711612] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                    <span>0.5 kg (Small Parcel)</span>
                    <span>5 kg</span>
                    <span>10 kg</span>
                    <span>20 kg (Bulk Freight)</span>
                  </div>
                </div>
              </div>

              {/* Right Output Box */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#711612] to-[#400B09] rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Origin → Destination</span>
                    <span className="text-xs font-extrabold text-[#D4AF37] flex items-center gap-1">
                      <span>{currentCountry.flag}</span>
                      <span>{currentCountry.name} → Iraq 🇮🇶</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-white/60 uppercase tracking-wider block mb-1">
                      Estimated Freight Fee
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-white flex items-baseline gap-2">
                      <span>${estimatedUsd}</span>
                      <span className="text-xs text-[#D4AF37] font-bold">USD</span>
                    </div>
                    <div className="text-xs text-white/70 mt-1 font-mono">
                      ≈ {estimatedIqd} IQD (all inclusive)
                    </div>
                  </div>

                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-white">Estimated Transit: {currentCountry.days}</div>
                      <div className="text-[10px] text-white/70">Fast regular flight schedule</div>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/15">
                  <Link
                    to="/"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Place Order for This Shipment</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ── 4. WHY CHOOSE OUR SHIPPING (ADVANTAGES) ─────────────────────────────── */}
      {srv?.whyChoose && (
        <section className="py-20 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-widest text-[#711612] bg-[#711612]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                {txt(srv.whyChoose.label, 'Our Shipping Advantages')}
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                {txt(srv.whyChoose.title, 'Why Thousands Trust Our Service')}
              </h2>
            </FadeSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {srv.whyChoose.items.map((adv, i) => (
                <FadeSection key={adv.id} delay={i * 70}>
                  <div className="p-6 rounded-2xl border border-slate-200/80 bg-[#FAF8F5] hover:bg-white hover:border-[#711612]/30 hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between group">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#711612]/10 text-[#711612] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        {renderIcon(adv.icon, 'w-6 h-6')}
                      </div>
                      <h4 className="font-display font-bold text-lg text-slate-900 mb-2 group-hover:text-[#711612] transition-colors">
                        {txt(adv.title)}
                      </h4>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {txt(adv.description)}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Guaranteed Standard</span>
                    </div>
                  </div>
                </FadeSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 5. CALL TO ACTION BANNER ────────────────────────────────────────────── */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(212,175,55,0.2),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white mb-4 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Ready to Order from Any Global Site?</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
              Get Your Exact Quote in Minutes
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              Paste your product link from Amazon, SHEIN, Trendyol, eBay or AliExpress and let our team handle everything.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-300 hover:from-amber-400 hover:to-amber-200 text-slate-950 font-extrabold text-sm shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <span>Shop with Link Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-sm border border-white/20 backdrop-blur-md transition-all"
              >
                <span>Talk to Support</span>
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;

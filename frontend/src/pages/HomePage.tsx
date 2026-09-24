import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Globe, Package, Truck, MapPin, ShieldCheck,
  Headphones, Search, Star, ChevronRight, Zap, Users, Award
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Data ──────────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { icon: Search, num: '01', key: 'hiw.step1', descKey: 'hiw.step1.desc', color: '#711612' },
  { icon: ArrowRight, num: '02', key: 'hiw.step2', descKey: 'hiw.step2.desc', color: '#D4AF37' },
  { icon: Star, num: '03', key: 'hiw.step3', descKey: 'hiw.step3.desc', color: '#711612' },
  { icon: ShieldCheck, num: '04', key: 'hiw.step4', descKey: 'hiw.step4.desc', color: '#D4AF37' },
  { icon: Truck, num: '05', key: 'hiw.step5', descKey: 'hiw.step5.desc', color: '#711612' },
  { icon: Package, num: '06', key: 'hiw.step6', descKey: 'hiw.step6.desc', color: '#D4AF37' },
];

const PARTNERS = [
  { name: 'SHEIN', abbr: 'SHEIN', color: '#111', bg: '#fff', border: '#e0e0e0' },
  { name: 'Alibaba', abbr: 'Alibaba', color: '#FF6A00', bg: '#fff5ee', border: '#ffe4cc' },
  { name: 'Amazon', abbr: 'Amazon', color: '#FF9900', bg: '#fff8ee', border: '#ffe5b0' },
  { name: 'AliExpress', abbr: 'AliEx', color: '#e62e04', bg: '#fff0ee', border: '#ffc5bb' },
  { name: 'Temu', abbr: 'Temu', color: '#fb5c02', bg: '#fff2ee', border: '#ffd0bb' },
  { name: 'eBay', abbr: 'eBay', color: '#86b817', bg: '#f5fff0', border: '#c8f0a0' },
  { name: '& More', abbr: '+More', color: '#711612', bg: '#fff0f0', border: '#f0cccc' },
];

const WHY_US = [
  { icon: Zap, key: 'why.1', descKey: 'why.1.desc' },
  { icon: Globe, key: 'why.2', descKey: 'why.2.desc' },
  { icon: Truck, key: 'why.3', descKey: 'why.3.desc' },
  { icon: MapPin, key: 'why.4', descKey: 'why.4.desc' },
  { icon: ShieldCheck, key: 'why.5', descKey: 'why.5.desc' },
  { icon: Headphones, key: 'why.6', descKey: 'why.6.desc' },
];

const STATS = [
  { value: '10,000+', label: 'Orders Delivered', icon: Package },
  { value: '50+', label: 'Global Websites', icon: Globe },
  { value: '98%', label: 'Customer Satisfaction', icon: Star },
  { value: '24/7', label: 'Customer Support', icon: Headphones },
];

// ─── Animated counter hook ─────────────────────────────────────────────────
function useIntersectionObserver(ref: React.RefObject<HTMLElement | null>, options?: IntersectionObserverInit) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsIntersecting(true);
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, options]);
  return isIntersecting;
}

// ─── Section Wrapper ───────────────────────────────────────────────────────
const FadeSection: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersectionObserver(ref as React.RefObject<HTMLElement | null>, { threshold: 0.1 });
  return (
    <div
      ref={ref}
      id={id}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
};

// ─── HomePage ──────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
          {/* Glow circles */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-light/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          {/* Floating dots */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/20 animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div className="animate-slide-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                <span className="text-white/80 text-xs font-medium tracking-wider uppercase">
                  International Shopping & Shipping
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-white font-bold leading-[1.05] mb-6">
                <span className="block" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
                  {t('hero.headline')}
                </span>
                <span
                  className="block text-gradient"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                >
                  {t('hero.headline2')}
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                {t('hero.desc')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/services" className="btn-gold text-base px-8 py-4">
                  {t('hero.cta1')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => document.getElementById('header-tracking-btn')?.click()}
                  className="flex items-center gap-2 px-8 py-4 rounded-sm border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                >
                  <Package className="w-4 h-4" />
                  {t('hero.cta2')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/10">
                {STATS.slice(0, 3).map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="font-display font-bold text-gold text-2xl">{stat.value}</div>
                    <div className="text-white/50 text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="hidden lg:flex items-center justify-center relative">
              {/* Central globe */}
              <div className="relative w-80 h-80 animate-float">
                {/* Orbit rings */}
                <div className="absolute inset-0 rounded-full border border-white/10 animate-spin" style={{ animationDuration: '20s' }} />
                <div className="absolute inset-6 rounded-full border border-gold/20 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
                <div className="absolute inset-12 rounded-full border border-white/15" />

                {/* Center globe */}
                <div className="absolute inset-16 rounded-full bg-gradient-to-br from-brand-light/60 to-brand/80 border-2 border-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <Globe className="w-16 h-16 text-white/80" />
                </div>

                {/* Orbiting icons */}
                {[
                  { icon: Package, angle: 0, color: 'bg-gold', label: 'Package' },
                  { icon: Truck, angle: 90, color: 'bg-white', label: 'Shipping' },
                  { icon: MapPin, angle: 180, color: 'bg-gold', label: 'Delivery' },
                  { icon: ShieldCheck, angle: 270, color: 'bg-white', label: 'Secure' },
                ].map(({ icon: Icon, angle, color, label }, i) => {
                  const rad = (angle * Math.PI) / 180;
                  const r = 140;
                  const x = 160 + r * Math.cos(rad) - 20;
                  const y = 160 + r * Math.sin(rad) - 20;
                  return (
                    <div
                      key={label}
                      className={`absolute w-10 h-10 rounded-sm ${color} flex items-center justify-center shadow-lg`}
                      style={{ left: x, top: y }}
                    >
                      <Icon className={`w-5 h-5 ${color === 'bg-gold' ? 'text-charcoal' : 'text-brand'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Floating cards */}
              <div className="absolute top-8 -left-4 glass-card p-3 animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm bg-brand/10 flex items-center justify-center">
                    <Package className="w-4 h-4 text-brand" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-charcoal">Order Shipped</div>
                    <div className="text-[10px] text-charcoal-lighter">Shanghai → Erbil</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 -right-4 glass-card p-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm bg-gold/15 flex items-center justify-center">
                    <Star className="w-4 h-4 text-gold-dark" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-charcoal">98% Satisfaction</div>
                    <div className="text-[10px] text-charcoal-lighter">Trusted by customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H0Z" fill="#EBEAE8"/>
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">{t('hiw.title')}</span>
            <h2 className="section-title">{t('hiw.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{t('hiw.subtitle')}</p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              const isGold = i % 2 === 1;
              return (
                <FadeSection key={step.num} style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}>
                  <div className="premium-card group p-7 relative overflow-hidden h-full">
                    {/* Step number background */}
                    <div className="absolute top-4 right-4 font-display font-bold text-7xl text-charcoal/[0.04] leading-none select-none">
                      {step.num}
                    </div>
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-5 transition-all duration-300 ${
                      isGold
                        ? 'bg-gold/15 text-gold-dark group-hover:bg-gold group-hover:text-white'
                        : 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {/* Step number badge */}
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 ${
                      isGold ? 'bg-gold/15 text-gold-dark' : 'bg-brand/10 text-brand'
                    }`}>
                      Step {step.num}
                    </div>
                    <h3 className="font-display font-bold text-charcoal text-lg mb-2">{t(step.key)}</h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">{t(step.descKey)}</p>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GLOBAL WEBSITES ──────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-14">
            <span className="section-label">{t('partners.title')}</span>
            <h2 className="section-title">{t('partners.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{t('partners.subtitle')}</p>
          </FadeSection>

          <FadeSection>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {PARTNERS.map((partner) => (
                <div
                  key={partner.name}
                  className="group flex flex-col items-center gap-3 p-5 rounded-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-card cursor-default"
                  style={{
                    background: partner.bg,
                    borderColor: partner.border,
                  }}
                >
                  <div
                    className="font-display font-bold text-xl tracking-tight"
                    style={{ color: partner.color }}
                  >
                    {partner.abbr}
                  </div>
                  <div className="text-xs text-charcoal-lighter font-medium">{partner.name}</div>
                </div>
              ))}
            </div>
          </FadeSection>

          {/* Scrolling partner marquee (mobile) */}
          <FadeSection className="mt-8 text-center">
            <p className="text-sm text-charcoal-lighter">
              And many more international websites — if it's online, we can get it for you.
            </p>
          </FadeSection>
        </div>
      </section>

      {/* ── STATS BAND ───────────────────────────────────────────────────── */}
      <section className="py-14 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <FadeSection key={i} className="text-center">
                  <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="font-display font-bold text-white text-3xl lg:text-4xl mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-bg bg-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">{t('why.title')}</span>
            <h2 className="section-title">{t('why.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{t('why.subtitle')}</p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {WHY_US.map((item, i) => {
              const Icon = item.icon;
              return (
                <FadeSection key={i} style={{ transitionDelay: `${i * 60}ms` } as React.CSSProperties}>
                  <div className="premium-card group p-7 h-full flex gap-5">
                    <div className="icon-box flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-charcoal text-base mb-2">
                        {t(item.key)}
                      </h3>
                      <p className="text-charcoal-lighter text-sm leading-relaxed">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeSection>
            <span className="section-label">{t('cta.title')}</span>
            <h2 className="section-title mb-4">{t('cta.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto mb-10">{t('cta.desc')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services" className="btn-primary text-base px-9 py-4">
                {t('cta.btn1')}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-outline text-base px-9 py-4">
                {t('cta.btn2')}
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 pt-8 border-t border-bg-dark">
              {[
                { icon: ShieldCheck, label: 'Secure Payments' },
                { icon: Truck, label: 'Fast Delivery' },
                { icon: Users, label: '10,000+ Customers' },
                { icon: Award, label: 'Quality Guaranteed' },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} className="flex items-center gap-2 text-charcoal-lighter text-sm">
                  <Icon className="w-4 h-4 text-gold" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

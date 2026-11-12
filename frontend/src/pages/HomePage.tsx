import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, ShieldCheck, Star, Users, Award, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, MultilingualText } from '../types';
import { renderIcon } from './website-cms/CMSComponents';

// ── Fallback Static Data ─────────────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { icon: 'Search', num: '01', key: 'hiw.step1', descKey: 'hiw.step1.desc', color: '#711612' },
  { icon: 'ArrowRight', num: '02', key: 'hiw.step2', descKey: 'hiw.step2.desc', color: '#D4AF37' },
  { icon: 'Star', num: '03', key: 'hiw.step3', descKey: 'hiw.step3.desc', color: '#711612' },
  { icon: 'ShieldCheck', num: '04', key: 'hiw.step4', descKey: 'hiw.step4.desc', color: '#D4AF37' },
  { icon: 'Truck', num: '05', key: 'hiw.step5', descKey: 'hiw.step5.desc', color: '#711612' },
  { icon: 'Package', num: '06', key: 'hiw.step6', descKey: 'hiw.step6.desc', color: '#D4AF37' },
];

const DEFAULT_PARTNERS = [
  { id: 'site-1', name: 'SHEIN', abbr: 'SHEIN', url: 'https://www.shein.com', color: '#111', bg: '#fff', border: '#e0e0e0', logo: '' },
  { id: 'site-2', name: 'Alibaba', abbr: 'Alibaba', url: 'https://www.alibaba.com', color: '#FF6A00', bg: '#fff5ee', border: '#ffe4cc', logo: '' },
  { id: 'site-3', name: 'Amazon', abbr: 'Amazon', url: 'https://www.amazon.com', color: '#FF9900', bg: '#fff8ee', border: '#ffe5b0', logo: '' },
  { id: 'site-4', name: 'AliExpress', abbr: 'AliEx', url: 'https://www.aliexpress.com', color: '#e62e04', bg: '#fff0ee', border: '#ffc5bb', logo: '' },
  { id: 'site-5', name: 'Temu', abbr: 'Temu', url: 'https://www.temu.com', color: '#fb5c02', bg: '#fff2ee', border: '#ffd0bb', logo: '' },
  { id: 'site-6', name: 'eBay', abbr: 'eBay', url: 'https://www.ebay.com', color: '#86b817', bg: '#f5fff0', border: '#c8f0a0', logo: '' },
];

const WHY_US = [
  { icon: 'Zap', key: 'why.1', descKey: 'why.1.desc' },
  { icon: 'Globe', key: 'why.2', descKey: 'why.2.desc' },
  { icon: 'Truck', key: 'why.3', descKey: 'why.3.desc' },
  { icon: 'MapPin', key: 'why.4', descKey: 'why.4.desc' },
  { icon: 'ShieldCheck', key: 'why.5', descKey: 'why.5.desc' },
  { icon: 'Headphones', key: 'why.6', descKey: 'why.6.desc' },
];

const STATS = [
  { value: '10,000+', label: 'Orders Delivered', icon: 'Package' },
  { value: '50+', label: 'Global Websites', icon: 'Globe' },
  { value: '98%', label: 'Customer Satisfaction', icon: 'Star' },
  { value: '24/7', label: 'Customer Support', icon: 'Headphones' },
];

// ── Animated counter hook ─────────────────────────────────────────────────────────────
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

// ── Section Wrapper ───────────────────────────────────────────────────────────────────
const FadeSection: React.FC<{ children: React.ReactNode; className?: string; id?: string; style?: React.CSSProperties }> = ({ children, className, id, style }) => {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useIntersectionObserver(ref as React.RefObject<HTMLElement | null>, { threshold: 0.1 });
  return (
    <div
      ref={ref}
      id={id}
      style={style}
      className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
    >
      {children}
    </div>
  );
};

// ── HomePage ──────────────────────────────────────────────────────────────────────────
const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const [content, setContent] = useState<WebsiteContent | null>(null);

  const loadContent = () => {
    websiteContentApi.getContent().then((data) => {
      if (data) {
        setContent(data);
      }
    }).catch((err) => {
      console.warn('Could not load dynamic website content', err);
    });
  };

  useEffect(() => {
    loadContent();

    // Automatically update in the website immediately when window is refocused or content updated
    const handleSync = () => loadContent();
    window.addEventListener('focus', handleSync);
    window.addEventListener('storage', handleSync);
    window.addEventListener('ordercenter_content_updated', handleSync);

    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('ordercenter_content_updated', handleSync);
    };
  }, []);

  const txt = (field?: MultilingualText, fallback = ''): string => {
    if (!field) return fallback;
    const currentLang = language as 'en' | 'ku' | 'ar';
    return field[currentLang] || field.en || fallback;
  };

  const home = content?.home;
  const heroImages: string[] = React.useMemo(() => {
    if (home?.hero?.bannerImages && home.hero.bannerImages.length > 0) {
      return home.hero.bannerImages.filter(Boolean);
    }
    if (home?.hero?.bannerImage) {
      return [home.hero.bannerImage];
    }
    return ['https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80'];
  }, [home?.hero?.bannerImages, home?.hero?.bannerImage]);

  const carouselInterval = (home?.hero?.carouselInterval && home.hero.carouselInterval > 0)
    ? home.hero.carouselInterval
    : 4;

  const [activeCarouselIdx, setActiveCarouselIdx] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveCarouselIdx((prev) => (prev + 1) % heroImages.length);
    }, carouselInterval * 1000);
    return () => clearInterval(timer);
  }, [heroImages.length, carouselInterval]);


  return (
    <div className="overflow-x-hidden">
      {/* ── HERO SECTION ───────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-light/20 blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
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
                  {home ? txt(home.hero.badge, 'International Shopping & Shipping') : 'International Shopping & Shipping'}
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-white font-bold leading-[1.05] mb-6">
                <span className="block" style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}>
                  {home ? txt(home.hero.title, t('hero.headline')) : t('hero.headline')}
                </span>
                <span
                  className="block text-gradient"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)' }}
                >
                  {home ? '' : t('hero.headline2')}
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-lg">
                {home ? txt(home.hero.description, t('hero.desc')) : t('hero.desc')}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Link to="/services" className="btn-gold text-base px-8 py-4">
                  {home ? txt(home.hero.primaryBtn, t('hero.cta1')) : t('hero.cta1')}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => document.getElementById('header-tracking-btn')?.click()}
                  className="flex items-center gap-2 px-8 py-4 rounded-sm border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                >
                  <Package className="w-4 h-4" />
                  {home ? txt(home.hero.secondaryBtn, t('hero.cta2')) : t('hero.cta2')}
                </button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/10">
                {(home?.stats?.items && home.stats.items.length > 0 ? home.stats.items : STATS).slice(0, 3).map((stat: any, i: number) => {
                  const val = stat.value;
                  const lbl = stat.label ? (typeof stat.label === 'string' ? stat.label : txt(stat.label)) : '';
                  return (
                    <div key={stat.id || i} className="text-center">
                      <div className="font-display font-bold text-gold text-2xl">{val}</div>
                      <div className="text-white/50 text-xs mt-0.5">{lbl}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Visual / Uploaded Hero Photo Carousel */}
            <div className="flex items-center justify-center relative">
              {heroImages.length > 0 ? (
                <div className="relative w-full max-w-lg animate-float">
                  {/* Glowing background halo */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-gold/25 via-brand-light/30 to-brand/40 rounded-3xl blur-2xl opacity-80" />

                  {/* Main Hero Photo Container with Carousel Animation */}
                  <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl bg-black/40 backdrop-blur-xs aspect-[4/3] group select-none">
                    {heroImages.map((img: string, idx: number) => {
                      const isActive = idx === activeCarouselIdx;
                      return (
                        <div
                          key={idx}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`Order Center Slide ${idx + 1}`}
                            className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                              isActive ? 'scale-105' : 'scale-100'
                            }`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent pointer-events-none" />
                        </div>
                      );
                    })}

                    {/* Navigation Dots & Indicators (if multiple images) */}
                    {heroImages.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/15 shadow-lg">
                        {heroImages.map((_: string, dotIdx: number) => (
                          <button
                            key={dotIdx}
                            type="button"
                            onClick={() => setActiveCarouselIdx(dotIdx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              dotIdx === activeCarouselIdx
                                ? 'w-6 bg-gradient-to-r from-[#D4AF37] to-amber-200 shadow-xs'
                                : 'w-1.5 bg-white/40 hover:bg-white/70'
                            }`}
                            aria-label={`Slide ${dotIdx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Left / Right Carousel Controls (visible on hover) */}
                    {heroImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCarouselIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length)
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm shadow-md"
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveCarouselIdx((prev) => (prev + 1) % heroImages.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 text-sm shadow-md"
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Floating badge 1 */}
                  <div className="absolute -bottom-4 -left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-[#711612]/10 text-[#711612] flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">Global Shipping</div>
                      <div className="text-[10px] text-slate-500 font-medium">Delivered to Kurdistan & Iraq</div>
                    </div>
                  </div>

                  {/* Floating badge 2 */}
                  <div className="absolute -top-4 -right-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-xl border border-slate-100 flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-gold/15 text-gold-dark flex items-center justify-center">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">98% Satisfaction</div>
                      <div className="text-[10px] text-slate-500 font-medium">Trusted by customers</div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path d="M0 80L60 69.3C120 58.7 240 37.3 360 32C480 26.7 600 37.3 720 42.7C840 48 960 48 1080 42.7C1200 37.3 1320 26.7 1380 21.3L1440 16V80H0Z" fill="#EBEAE8" />
          </svg>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">{home ? txt(home.howItWorks.title, t('hiw.title')) : t('hiw.title')}</span>
            <h2 className="section-title">{home ? txt(home.howItWorks.title, t('hiw.title')) : t('hiw.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{home ? txt(home.howItWorks.subtitle, t('hiw.subtitle')) : t('hiw.subtitle')}</p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {(home?.howItWorks?.items && home.howItWorks.items.length > 0
              ? home.howItWorks.items
              : HOW_IT_WORKS
            ).map((step: any, i: number) => {
              const numStr = step.stepNumber || step.num || String(i + 1).padStart(2, '0');
              const titleStr = step.title ? txt(step.title) : t(step.key);
              const descStr = step.description ? txt(step.description) : t(step.descKey);
              const isGold = i % 2 === 1;

              return (
                <FadeSection key={step.id || step.num || i} style={{ transitionDelay: `${i * 80}ms` } as React.CSSProperties}>
                  <div className="premium-card group p-7 relative overflow-hidden h-full">
                    <div className="absolute top-4 right-4 font-display font-bold text-7xl text-charcoal/[0.04] leading-none select-none">
                      {numStr}
                    </div>
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-5 transition-all duration-300 ${
                      isGold
                        ? 'bg-gold/15 text-gold-dark group-hover:bg-gold group-hover:text-white'
                        : 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                    }`}>
                      {renderIcon(step.icon || 'Sparkles', 'w-5 h-5')}
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-3 ${
                      isGold ? 'bg-gold/15 text-gold-dark' : 'bg-brand/10 text-brand'
                    }`}>
                      Step {numStr}
                    </div>
                    <h3 className="font-display font-bold text-charcoal text-lg mb-2">{titleStr}</h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">{descStr}</p>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── GLOBAL WEBSITES ─────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-14">
            <span className="section-label">
              {content?.home?.globalWebsites?.label?.[language] || t('partners.title')}
            </span>
            <h2 className="section-title">
              {content?.home?.globalWebsites?.title?.[language] || t('partners.title')}
            </h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">
              {content?.home?.globalWebsites?.subtitle?.[language] || t('partners.subtitle')}
            </p>
          </FadeSection>

          <FadeSection>
            {(() => {
              const rawItems = content?.home?.globalWebsites?.items;
              const websites = (rawItems && rawItems.length > 0)
                ? rawItems.filter((p: any) => p.abbr !== '+More' && p.name !== '& More')
                : DEFAULT_PARTNERS;

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
                  {websites.map((partner: any) => (
                    <a
                      key={partner.id || partner.name}
                      href={partner.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Visit ${partner.name} (Opens in new window)`}
                      className="group relative flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl cursor-pointer"
                      style={{
                        background: partner.bg || '#ffffff',
                        borderColor: partner.border || '#e2e8f0',
                      }}
                    >
                      {/* External Link Icon in top right */}
                      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 text-slate-400 group-hover:text-[#711612]">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </div>

                      {/* Logo: Image or Styled Text */}
                      {partner.logo && (partner.logo.startsWith('data:image') || partner.logo.startsWith('http') || partner.logo.startsWith('/')) ? (
                        <div className="h-8 flex items-center justify-center px-1">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="max-h-8 max-w-[110px] object-contain group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                      ) : (
                        <div
                          className="font-display font-bold text-xl tracking-tight group-hover:scale-105 transition-transform duration-200"
                          style={{ color: partner.color || '#111827' }}
                        >
                          {partner.abbr || partner.name}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 font-semibold group-hover:text-slate-900 transition-colors flex items-center gap-1">
                        <span>{partner.name}</span>
                      </div>
                    </a>
                  ))}
                </div>
              );
            })()}
          </FadeSection>

          <FadeSection className="mt-8 text-center">
            <p className="text-sm text-charcoal-lighter">
              {content?.home?.globalWebsites?.bottomNote?.[language] ||
                "And many more international websites — if it's online, we can get it for you."}
            </p>
          </FadeSection>
        </div>
      </section>

      {/* ── STATS BAND ──────────────────────────────────────────────────────────── */}
      <section className="py-14 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {(home?.stats?.items && home.stats.items.length > 0
              ? home.stats.items
              : STATS
            ).map((stat: any, i: number) => {
              const val = stat.value;
              const lbl = stat.label ? (typeof stat.label === 'string' ? stat.label : txt(stat.label)) : '';
              const iconName = stat.icon || 'Star';
              return (
                <FadeSection key={stat.id || i} className="text-center">
                  <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-3 text-gold">
                    {renderIcon(iconName, 'w-5 h-5 text-gold')}
                  </div>
                  <div className="font-display font-bold text-white text-3xl lg:text-4xl mb-1">
                    {val}
                  </div>
                  <div className="text-white/50 text-sm">{lbl}</div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US (FEATURES) ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-bg bg-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">{home ? txt(home.features.title, t('why.title')) : t('why.title')}</span>
            <h2 className="section-title">{home ? txt(home.features.title, t('why.title')) : t('why.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{home ? txt(home.features.subtitle, t('why.subtitle')) : t('why.subtitle')}</p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(home?.features?.items && home.features.items.length > 0
              ? home.features.items
              : WHY_US
            ).map((item: any, i: number) => {
              const titleStr = item.title ? txt(item.title) : t(item.key);
              const descStr = item.description ? txt(item.description) : t(item.descKey);
              const iconName = item.icon || 'Zap';
              return (
                <FadeSection key={item.id || i} style={{ transitionDelay: `${i * 60}ms` } as React.CSSProperties}>
                  <div className="premium-card group p-7 h-full flex gap-5">
                    <div className="icon-box flex-shrink-0 text-brand">
                      {renderIcon(iconName, 'w-5 h-5')}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-charcoal text-base mb-2">
                        {titleStr}
                      </h3>
                      <p className="text-charcoal-lighter text-sm leading-relaxed">
                        {descStr}
                      </p>
                    </div>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeSection>
            <span className="section-label">{home ? txt(home.cta.title, t('cta.title')) : t('cta.title')}</span>
            <h2 className="section-title mb-4">{home ? txt(home.cta.title, t('cta.title')) : t('cta.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto mb-10">{home ? txt(home.cta.subtitle, t('cta.desc')) : t('cta.desc')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services" className="btn-primary text-base px-9 py-4">
                {home ? txt(home.cta.primaryBtn, t('cta.btn1')) : t('cta.btn1')}
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

import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Copy, Check, ArrowRight, Flame, Gift, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, MultilingualText, FeaturedDealItem, PartnerStoreDealItem } from '../types';

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

export const OffersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

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

  const off = content?.offers;

  const handleCopyCode = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2200);
    }).catch(() => {
      // fallback
    });
  };

  // Filter deals
  const featuredDeals: FeaturedDealItem[] = off?.featuredDeals?.items || [];
  const storeDeals: PartnerStoreDealItem[] = off?.storeDeals?.items || [];

  const filteredDeals = selectedFilter === 'all'
    ? featuredDeals
    : featuredDeals.filter(d =>
        txt(d.title).toLowerCase().includes(selectedFilter.toLowerCase()) ||
        txt(d.badge).toLowerCase().includes(selectedFilter.toLowerCase()) ||
        d.discount.toLowerCase().includes(selectedFilter.toLowerCase())
      );

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden bg-[#FAF8F5]">
      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 lg:py-32 hero-gradient overflow-hidden text-white">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(212,175,55,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_65%,rgba(148,32,28,0.5),transparent_55%)]" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md shadow-lg">
              <Flame className="w-4 h-4 text-[#D4AF37] fill-current animate-pulse" />
              <span className="text-white text-xs font-bold tracking-widest uppercase">
                {off ? txt(off.hero.badge, 'Promotions & Special Discounts') : 'Promotions & Special Discounts'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12] mb-6">
              {off ? txt(off.hero.title, t('offers.title')) : t('offers.title')}
            </h1>

            <p className="text-base sm:text-lg text-white/85 font-normal leading-relaxed mb-8 max-w-2xl">
              {off ? txt(off.hero.description, t('offers.subtitle')) : t('offers.subtitle')}
            </p>

            {/* Trust Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 max-w-xl">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                <Check className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">100% Tested</div>
                  <div className="text-[10px] text-white/60">Verified working codes</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10">
                <Gift className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Exclusive Deals</div>
                  <div className="text-[10px] text-white/60">Global partner rates</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Updated Daily</div>
                  <div className="text-[10px] text-white/60">Fresh coupons added</div>
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

      {/* ── 2. FEATURED VOUCHER DEALS ────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#711612] bg-[#711612]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
              {off ? txt(off.featuredDeals.label, 'Active Promotions') : 'Active Promotions'}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              {off ? txt(off.featuredDeals.title, 'Special Discounts for You') : 'Special Discounts for You'}
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {off ? txt(off.featuredDeals.subtitle, 'Take advantage of limited-time discounts on international shipping and premier shopping.') : 'Take advantage of limited-time discounts on international shipping and premier shopping.'}
            </p>
          </FadeSection>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            {[
              { id: 'all', label: 'All Deals' },
              { id: 'shipping', label: 'Shipping Discounts' },
              { id: 'welcome', label: 'New Customer' },
              { id: 'special', label: 'Special Promos' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedFilter(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
                  selectedFilter === cat.id
                    ? 'bg-[#711612] text-white shadow-md shadow-[#711612]/25 scale-105'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Deals Grid - Modern Luxury Voucher Tickets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {filteredDeals.map((deal, i) => (
              <FadeSection key={deal.id} delay={i * 80}>
                <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
                  {/* Decorative Ticket Notch cutout */}
                  <div className="absolute -top-3 left-1/3 w-6 h-6 rounded-full bg-[#FAF8F5] border-b border-slate-200 hidden sm:block" />
                  <div className="absolute -bottom-3 left-1/3 w-6 h-6 rounded-full bg-[#FAF8F5] border-t border-slate-200 hidden sm:block" />

                  <div className="p-7 sm:p-8">
                    {/* Top Status */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#711612]/10 text-[#711612] uppercase tracking-wider">
                        {txt(deal.badge)}
                      </span>
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{txt(deal.validUntil)}</span>
                      </span>
                    </div>

                    {/* Discount Highlight */}
                    <div className="text-3xl sm:text-4xl font-black text-[#711612] tracking-tight mb-2">
                      {deal.discount}
                    </div>

                    <h3 className="font-display font-bold text-xl text-slate-900 mb-3 group-hover:text-[#711612] transition-colors leading-snug">
                      {txt(deal.title)}
                    </h3>

                    <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                      {txt(deal.description)}
                    </p>

                    {/* Promo Code Copy Bar */}
                    {deal.code && (
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-0.5">
                            Promo Voucher Code
                          </span>
                          <span className="font-mono font-black text-sm text-[#711612] tracking-wider">
                            {deal.code}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(deal.code!)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-xs cursor-pointer ${
                            copiedCode === deal.code
                              ? 'bg-emerald-600 text-white scale-105'
                              : 'bg-[#711612] hover:bg-[#5A0E0B] text-white'
                          }`}
                        >
                          {copiedCode === deal.code ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy Code</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Action Link */}
                  <div className="px-7 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Valid on international link orders</span>
                    <Link
                      to="/"
                      className="font-extrabold text-[#711612] hover:text-[#94201C] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Redeem Deal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>

          {/* ── 3. VERIFIED STORE COUPON CODES ─────────────────────────────────── */}
          {storeDeals.length > 0 && (
            <div className="pt-14 border-t border-slate-200/80">
              <FadeSection className="text-center max-w-2xl mx-auto mb-12">
                <span className="text-xs font-bold uppercase tracking-widest text-[#711612] bg-[#711612]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
                  {txt(off?.storeDeals?.label, 'Store Partner Codes')}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  {txt(off?.storeDeals?.title, 'Verified Partner Coupons')}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm">
                  Active verified discount codes for top global retailers.
                </p>
              </FadeSection>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeDeals.map((store, idx) => (
                  <FadeSection key={store.id} delay={idx * 60}>
                    <div className="p-6 rounded-2xl border border-slate-200/80 bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full group">
                      <div>
                        {/* Store Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#711612]/15 to-[#D4AF37]/20 text-[#711612] font-black flex items-center justify-center text-sm border border-[#711612]/10 shadow-xs">
                              {store.storeName ? store.storeName.slice(0, 2).toUpperCase() : 'ST'}
                            </div>
                            <div>
                              <h4 className="font-display font-extrabold text-base text-slate-900">
                                {store.storeName}
                              </h4>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                {txt(store.category, 'Global Retail')}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg text-xs font-black text-[#711612] bg-[#711612]/10 border border-[#711612]/20">
                            {store.discount}
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs leading-relaxed mb-4">
                          {txt(store.description, 'Save on your purchase by applying this code.')}
                        </p>
                      </div>

                      {/* Code copy bar */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                          {store.code}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyCode(store.code)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            copiedCode === store.code
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 hover:bg-[#711612] text-white'
                          }`}
                        >
                          {copiedCode === store.code ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </FadeSection>
                ))}
              </div>
            </div>
          )}

          {/* ── 4. HOW TO REDEEM STEP-BY-STEP ─────────────────────────────────── */}
          <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-white to-[#FAF8F5] border border-slate-200/90 shadow-lg">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#711612] block mb-1">
                How It Works
              </span>
              <h3 className="font-display font-extrabold text-2xl text-slate-900">
                Redeem Any Promo in 3 Simple Steps
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#711612]/10 text-[#711612] font-black text-sm flex items-center justify-center mx-auto">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-900">Copy Voucher Code</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click Copy Code on any deal above to save it to your clipboard.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#711612]/10 text-[#711612] font-black text-sm flex items-center justify-center mx-auto">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-900">Paste Product Link</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Go to our home page and paste your item URL in the order box.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#711612]/10 text-[#711612] font-black text-sm flex items-center justify-center mx-auto">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-900">Discount Applied</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our team automatically validates and applies your savings to your final invoice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. CALL TO ACTION BANNER ────────────────────────────────────────────── */}
      <section className="py-20 hero-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.22),transparent_50%)]" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <FadeSection>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-bold text-white mb-4 border border-white/20 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Have a Link with a Discount?</span>
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-4">
              Send Your Link & Save Today
            </h2>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-8">
              We purchase directly on international platforms and ensure all current sales and discount codes are honored.
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
                <span>Inquire About Deals</span>
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default OffersPage;

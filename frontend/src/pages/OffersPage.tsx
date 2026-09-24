import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag, ArrowRight, Star, Zap, Users, ShoppingBag, Truck, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
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
  children, className, delay = 0
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

interface OfferData {
  id: string;
  icon: typeof Tag;
  title: string;
  desc: string;
  discount: string;
  validity: string;
  tag: string;
  featured?: boolean;
  color: string;
  textColor: string;
}

const OFFERS: OfferData[] = [
  {
    id: '1',
    icon: Star,
    title: 'New Customer Welcome Offer',
    desc: 'New to OrderCenter? Get 10% off your first order — no minimum spend required. Start your international shopping journey with savings.',
    discount: '10% OFF',
    validity: 'Oct 31, 2026',
    tag: 'New Customers',
    featured: true,
    color: 'from-brand to-brand-dark',
    textColor: 'text-white',
  },
  {
    id: '2',
    icon: Truck,
    title: 'Free Shipping Weekend',
    desc: 'Every weekend, enjoy free shipping on orders over $150. No coupon needed — discount applied automatically.',
    discount: 'FREE SHIPPING',
    validity: 'Every Weekend',
    tag: 'Weekend Deal',
    featured: false,
    color: 'from-gold-dark to-gold',
    textColor: 'text-charcoal',
  },
  {
    id: '3',
    icon: Users,
    title: 'Wholesale Special Rate',
    desc: 'Ordering in bulk? Get exclusive wholesale pricing with reduced shipping rates. Perfect for businesses and resellers.',
    discount: 'UP TO 20% OFF',
    validity: 'Ongoing',
    tag: 'Wholesale',
    featured: false,
    color: 'from-charcoal to-charcoal-light',
    textColor: 'text-white',
  },
  {
    id: '4',
    icon: ShoppingBag,
    title: 'SHEIN Seasonal Sale',
    desc: 'Take advantage of SHEIN\'s seasonal discounts combined with our discounted shipping rates. Double the savings on fashion.',
    discount: 'Extra 5% OFF',
    validity: 'Sep 30, 2026',
    tag: 'SHEIN Special',
    featured: false,
    color: 'from-brand-light to-brand',
    textColor: 'text-white',
  },
  {
    id: '5',
    icon: Zap,
    title: 'Flash Deal — Express Shipping',
    desc: 'Limited time only: express international shipping at standard price. Your package arrives faster without extra cost.',
    discount: 'EXPRESS FREE',
    validity: 'Sep 28, 2026',
    tag: 'Limited Time',
    featured: true,
    color: 'from-gold to-gold-light',
    textColor: 'text-charcoal',
  },
  {
    id: '6',
    icon: Globe,
    title: 'Multi-Platform Bundle',
    desc: 'Order from 2+ different websites in one shipment and save on combined shipping costs. One delivery, multiple platforms.',
    discount: '15% OFF SHIPPING',
    validity: 'Dec 31, 2026',
    tag: 'Bundle Deal',
    featured: false,
    color: 'from-charcoal-light to-charcoal',
    textColor: 'text-white',
  },
];

const OffersPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden">
      {/* Page Hero */}
      <section className="relative py-20 lg:py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 rounded-full bg-brand-light/20 blur-2xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">Exclusive Deals</span>
            </div>
            <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t('offers.title')}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {t('offers.subtitle')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" style={{display:'block'}}>
            <path d="M0 60L1440 60V30C1320 10 1200 0 1080 5C960 10 840 30 720 35C600 40 480 30 360 20C240 10 120 5 60 7.5L0 10V60Z" fill="#EBEAE8"/>
          </svg>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">Current Promotions</span>
            <h2 className="section-title">{t('offers.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{t('offers.subtitle')}</p>
          </FadeSection>

          {/* Featured large cards */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {OFFERS.filter(o => o.featured).map((offer, i) => {
              const Icon = offer.icon;
              return (
                <FadeSection key={offer.id} delay={i * 100}>
                  <div className={`relative rounded-sm overflow-hidden offer-card-shine bg-gradient-to-br ${offer.color} p-8 h-full group`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-black/5 translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10">
                      {/* Tag */}
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase mb-4 bg-white/20 backdrop-blur-sm ${offer.textColor}`}>
                        <Tag className="w-3 h-3" />
                        {offer.tag}
                      </div>

                      {/* Discount badge */}
                      <div className={`font-display font-bold text-5xl lg:text-6xl mb-3 ${offer.textColor} leading-none`}>
                        {offer.discount}
                      </div>

                      <h3 className={`font-display font-bold text-xl mb-3 ${offer.textColor}`}>
                        {offer.title}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-6 ${offer.textColor === 'text-white' ? 'text-white/75' : 'text-charcoal/70'}`}>
                        {offer.desc}
                      </p>

                      {/* Validity & CTA */}
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className={`flex items-center gap-2 text-sm ${offer.textColor === 'text-white' ? 'text-white/70' : 'text-charcoal/60'}`}>
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t('offers.valid')}: {offer.validity}</span>
                        </div>
                        <Link
                          to="/contact"
                          className={`flex items-center gap-2 text-sm font-bold px-5 py-2.5 rounded-sm transition-all duration-300 hover:-translate-y-0.5 ${
                            offer.textColor === 'text-white'
                              ? 'bg-white text-brand hover:bg-gold hover:text-charcoal'
                              : 'bg-charcoal text-white hover:bg-brand'
                          }`}
                        >
                          {t('offers.cta')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              );
            })}
          </div>

          {/* Regular offer cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {OFFERS.filter(o => !o.featured).map((offer, i) => {
              const Icon = offer.icon;
              return (
                <FadeSection key={offer.id} delay={i * 80}>
                  <div className="premium-card group h-full flex flex-col overflow-hidden">
                    {/* Colored top bar */}
                    <div className={`h-1.5 bg-gradient-to-r ${offer.color}`} />

                    <div className="p-6 flex flex-col h-full">
                      {/* Icon + Tag */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-sm bg-brand/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-white transition-all duration-300">
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                        <span className="tag text-[10px]">{offer.tag}</span>
                      </div>

                      {/* Discount */}
                      <div className="text-gradient font-display font-bold text-2xl mb-2">
                        {offer.discount}
                      </div>

                      <h3 className="font-display font-bold text-charcoal text-base mb-2">
                        {offer.title}
                      </h3>
                      <p className="text-charcoal-lighter text-sm leading-relaxed flex-1 mb-4">
                        {offer.desc}
                      </p>

                      {/* Footer */}
                      <div className="pt-4 border-t border-bg-dark">
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-lighter mb-3">
                          <Clock className="w-3 h-3" />
                          {t('offers.valid')}: {offer.validity}
                        </div>
                        <Link
                          to="/contact"
                          className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors"
                        >
                          {t('offers.cta')}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Terms Note */}
      <section className="pb-8 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-bg-dark rounded-sm p-5 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-gold/15 flex items-center justify-center flex-shrink-0">
              <Tag className="w-4 h-4 text-gold-dark" />
            </div>
            <div>
              <h4 className="font-semibold text-charcoal text-sm mb-1">Terms & Conditions Apply</h4>
              <p className="text-charcoal-lighter text-xs leading-relaxed">
                Offers are subject to availability and may change without notice. Cannot be combined with other offers unless stated otherwise. Contact us for full terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeSection>
            <h2 className="section-title mb-4">Want a Custom Deal?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Contact us to discuss your specific needs. We offer custom pricing for regular customers and large orders.
            </p>
            <Link to="/contact" className="btn-primary">
              Get a Custom Quote <ArrowRight className="w-4 h-4" />
            </Link>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default OffersPage;

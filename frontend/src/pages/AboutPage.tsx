import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Globe, ShieldCheck, Heart, Eye, ArrowRight, ChevronRight, Users, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

// ─── Intersection observer hook ───────────────────────────────────────────
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

const PROCESS_STEPS = [
  { label: 'Global Website', icon: Globe, color: 'bg-brand text-white' },
  { label: 'Purchase', icon: ShieldCheck, color: 'bg-gold text-charcoal' },
  { label: 'International Shipping', icon: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ), color: 'bg-brand text-white' },
  { label: 'Tracking', icon: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="3"/><path d="M19.94 11A8 8 0 1 0 21 12"/><path d="M22 12l-3 3-3-3"/>
    </svg>
  ), color: 'bg-gold text-charcoal' },
  { label: 'Local Delivery', icon: () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ), color: 'bg-brand text-white' },
  { label: 'Customer', icon: Users, color: 'bg-gold text-charcoal' },
];

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Trust & Transparency',
    desc: 'We believe in honest pricing, clear communication, and no hidden fees. Every transaction is transparent from start to finish.',
  },
  {
    icon: Star,
    title: 'Quality Service',
    desc: 'We maintain the highest standards in every interaction, from handling your products with care to delivering them safely.',
  },
  {
    icon: Heart,
    title: 'Customer First',
    desc: 'Our customers are at the heart of everything we do. We go above and beyond to ensure complete satisfaction.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    desc: 'We connect you with the world\'s best products, breaking down geographical barriers to bring international shopping within reach.',
  },
];

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden">
      {/* Page Hero */}
      <section className="relative py-20 lg:py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(212,175,55,0.4) 0%, transparent 60%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)`
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">About OrderCenter</span>
            </div>
            <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t('about.title')}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              Your trusted bridge between global online marketplaces and your doorstep. We simplify international shopping and make it accessible to everyone.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none">
            <path d="M0 60L1440 60V30C1320 10 1200 0 1080 5C960 10 840 30 720 35C600 40 480 30 360 20C240 10 120 5 60 7.5L0 10V60Z" fill="#EBEAE8"/>
          </svg>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeSection>
              <span className="section-label">{t('about.who')}</span>
              <h2 className="section-title mb-4">{t('about.who')}</h2>
              <div className="w-12 h-0.5 bg-gold mb-6" />
              <p className="text-charcoal-lighter leading-relaxed mb-4">
                OrderCenter is a premier international shopping and shipping service dedicated to bridging the gap between global e-commerce and local customers. We were founded with a simple but powerful vision: make the world's best products accessible to everyone, regardless of geographical boundaries.
              </p>
              <p className="text-charcoal-lighter leading-relaxed mb-6">
                Based in the Kurdistan Region of Iraq, we serve customers across the region by purchasing products from leading international platforms including SHEIN, Amazon, Alibaba, AliExpress, Temu, eBay, and more — then handling all shipping logistics to deliver directly to your door.
              </p>
              <Link to="/contact" className="btn-primary">
                Get In Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeSection>

            {/* Visual Panel */}
            <FadeSection delay={150}>
              <div className="relative">
                <div className="aspect-square rounded-sm bg-gradient-to-br from-brand/10 to-gold/10 border border-bg-dark overflow-hidden p-8 flex flex-col justify-between">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/8 rounded-full translate-y-1/2 -translate-x-1/2" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-sm bg-brand flex items-center justify-center mb-6 shadow-premium">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-charcoal text-2xl mb-3">
                      Global Shopping, <span className="text-gradient-brand">Locally Delivered</span>
                    </h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">
                      We connect you with 50+ international platforms and handle every step of the journey.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-bg-dark">
                    {[
                      { value: '5+', label: 'Years' },
                      { value: '10K+', label: 'Orders' },
                      { value: '50+', label: 'Websites' },
                    ].map((s, i) => (
                      <div key={i} className="text-center">
                        <div className="font-display font-bold text-brand text-2xl">{s.value}</div>
                        <div className="text-charcoal-lighter text-xs mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-14">
            <span className="section-label">{t('about.what')}</span>
            <h2 className="section-title">{t('about.what')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">
              We act as your personal international shopping agent — handling everything from purchase to delivery.
            </p>
          </FadeSection>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                title: 'International Purchasing',
                desc: 'We buy products from any global website on your behalf, handling payment, communication, and all purchasing details.',
                icon: ShieldCheck,
              },
              {
                title: 'Customs & Logistics',
                desc: 'We manage all customs clearance, import documentation, and international logistics so you don\'t have to worry about a thing.',
                icon: Globe,
              },
              {
                title: 'Quality Control',
                desc: 'Before shipping, we inspect your products to ensure they match your order and meet our quality standards.',
                icon: Star,
              },
              {
                title: 'Last-Mile Delivery',
                desc: 'We deliver your package directly to your door with full tracking and customer notifications at every step.',
                icon: ArrowRight,
              },
            ].map((item, i) => (
              <FadeSection key={i} delay={i * 80}>
                <div className="premium-card group p-7 h-full flex gap-5">
                  <div className="icon-box flex-shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-charcoal text-lg mb-2">{item.title}</h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Mission */}
            <FadeSection>
              <div className="bg-white/10 border border-white/20 rounded-sm p-8 backdrop-blur-sm h-full">
                <div className="w-12 h-12 rounded-sm bg-gold/20 flex items-center justify-center mb-5">
                  <Eye className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">{t('about.mission')}</h3>
                <p className="text-white/70 leading-relaxed">
                  To simplify international shopping for our customers by providing a reliable, transparent, and affordable service that connects them with the world's best products. We are committed to removing barriers and making global e-commerce accessible to everyone in our region.
                </p>
              </div>
            </FadeSection>

            {/* Vision */}
            <FadeSection delay={150}>
              <div className="bg-white/10 border border-white/20 rounded-sm p-8 backdrop-blur-sm h-full">
                <div className="w-12 h-12 rounded-sm bg-brand-light/30 flex items-center justify-center mb-5">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">{t('about.vision')}</h3>
                <p className="text-white/70 leading-relaxed">
                  To become the leading international shopping and shipping service in the region, known for our excellence, reliability, and customer-first approach. We envision a future where every customer can access any product from anywhere in the world with complete ease and confidence.
                </p>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-14">
            <span className="section-label">{t('about.values')}</span>
            <h2 className="section-title">{t('about.values')}</h2>
            <div className="divider-gold" />
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <FadeSection key={i} delay={i * 80}>
                <div className="premium-card group p-7 text-center h-full">
                  <div className="icon-box mx-auto mb-5">
                    <val.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-charcoal text-lg mb-3">{val.title}</h3>
                  <p className="text-charcoal-lighter text-sm leading-relaxed">{val.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-14">
            <span className="section-label">{t('about.process')}</span>
            <h2 className="section-title">{t('about.process')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">
              The complete journey from your product discovery to your doorstep.
            </p>
          </FadeSection>

          <FadeSection>
            {/* Desktop: horizontal flow */}
            <div className="hidden lg:flex items-center justify-between gap-2">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === PROCESS_STEPS.length - 1;
                return (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center gap-3 flex-1">
                      <div className={`w-14 h-14 rounded-sm flex items-center justify-center shadow-card ${step.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-charcoal text-center leading-tight">{step.label}</span>
                    </div>
                    {!isLast && (
                      <ChevronRight className="w-5 h-5 text-gold flex-shrink-0" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Mobile: vertical */}
            <div className="lg:hidden flex flex-col gap-0 max-w-xs mx-auto">
              {PROCESS_STEPS.map((step, i) => {
                const Icon = step.icon;
                const isLast = i === PROCESS_STEPS.length - 1;
                return (
                  <div key={step.label} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-sm flex items-center justify-center shadow-card flex-shrink-0 ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      {!isLast && <div className="w-0.5 h-8 bg-bg-dark flex-shrink-0" />}
                    </div>
                    <div className="pt-3">
                      <span className="text-sm font-semibold text-charcoal">{step.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeSection>
            <h2 className="section-title mb-4">Ready to Start Shopping?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Join thousands of satisfied customers who trust us with their international shopping needs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services" className="btn-primary">
                Explore Services <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-outline">
                Contact Us
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

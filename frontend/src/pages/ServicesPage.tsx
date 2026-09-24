import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, Package, Search, Truck, MapPin, ShieldCheck,
  ShoppingBag, Users, ArrowRight, ChevronRight
} from 'lucide-react';
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

const SERVICES = [
  {
    icon: Globe,
    title: 'International Shopping',
    desc: 'We shop from any international website on your behalf. Just send us the product link and we handle everything — purchase, packaging, and shipping.',
    tags: ['SHEIN', 'Amazon', 'eBay'],
    featured: true,
  },
  {
    icon: Truck,
    title: 'International Shipping',
    desc: 'Fast and reliable shipping from global warehouses to your doorstep. We use trusted international carriers and provide full tracking.',
    tags: ['Air Freight', 'Express'],
    featured: false,
  },
  {
    icon: Search,
    title: 'Product Sourcing',
    desc: 'Can\'t find the right product? Our team will source it from the best international suppliers and get you the best price.',
    tags: ['Wholesale', 'Retail'],
    featured: false,
  },
  {
    icon: ShoppingBag,
    title: 'SHEIN Shopping',
    desc: 'Order from SHEIN with ease. We manage your SHEIN purchases and deliver all your fashion items to your location.',
    tags: ['Fashion', 'SHEIN'],
    featured: true,
  },
  {
    icon: Users,
    title: 'Alibaba Purchasing',
    desc: 'Access the world\'s largest B2B marketplace. We handle supplier communication, quality checks, and shipment from Alibaba.',
    tags: ['B2B', 'Wholesale'],
    featured: false,
  },
  {
    icon: Package,
    title: 'Wholesale Orders',
    desc: 'Special rates and dedicated service for bulk and wholesale orders. We handle large shipments with efficiency and care.',
    tags: ['Bulk', 'Discount'],
    featured: false,
  },
  {
    icon: MapPin,
    title: 'Package Tracking',
    desc: 'Real-time tracking for all your shipments. Stay informed at every stage with our advanced tracking system.',
    tags: ['Real-time', '24/7'],
    featured: false,
  },
  {
    icon: ShieldCheck,
    title: 'Local Delivery',
    desc: 'Final-mile delivery straight to your address. We ensure your package arrives safely, on time, and in perfect condition.',
    tags: ['Door-to-Door', 'Insured'],
    featured: false,
  },
];

const ServicesPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden">
      {/* Page Hero */}
      <section className="relative py-20 lg:py-28 hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle at 70% 50%, rgba(212,175,55,0.5) 0%, transparent 60%)`
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">What We Offer</span>
            </div>
            <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t('services.title')}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {t('services.subtitle')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" style={{display:'block'}}>
            <path d="M0 60L1440 60V30C1320 10 1200 0 1080 5C960 10 840 30 720 35C600 40 480 30 360 20C240 10 120 5 60 7.5L0 10V60Z" fill="#EBEAE8"/>
          </svg>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 lg:py-28 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center mb-16">
            <span className="section-label">Our Services</span>
            <h2 className="section-title">{t('services.title')}</h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">{t('services.subtitle')}</p>
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {SERVICES.map((service, i) => {
              const Icon = service.icon;
              return (
                <FadeSection key={i} delay={i * 60}>
                  <div className={`premium-card group p-6 h-full flex flex-col relative overflow-hidden ${
                    service.featured ? 'ring-1 ring-brand/20' : ''
                  }`}>
                    {service.featured && (
                      <div className="absolute top-3 right-3">
                        <span className="tag-gold text-[10px]">Popular</span>
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center mb-4 transition-all duration-300 ${
                      service.featured
                        ? 'bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white'
                        : 'bg-charcoal/8 text-charcoal-light group-hover:bg-brand group-hover:text-white'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <h3 className="font-display font-bold text-charcoal text-base mb-2">{service.title}</h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed flex-1 mb-4">{service.desc}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {service.tags.map(tag => (
                        <span key={tag} className="tag text-[10px]">{tag}</span>
                      ))}
                    </div>

                    {/* Learn More */}
                    <Link
                      to="/contact"
                      className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-dark transition-colors group/link"
                    >
                      {t('services.learn')}
                      <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
                    </Link>
                  </div>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Banner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-brand to-brand-dark rounded-sm p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="font-display font-bold text-white text-2xl lg:text-3xl mb-4">
                  Can't find what you're looking for?
                </h2>
                <p className="text-white/70 leading-relaxed mb-6">
                  We can source any product from any international website. Just tell us what you need and we'll handle the rest.
                </p>
                <Link to="/contact" className="btn-gold">
                  Request a Product <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <div className="grid grid-cols-3 gap-3 opacity-60">
                  {['SHEIN', 'Amazon', 'Alibaba', 'AliExpress', 'Temu', 'eBay'].map(name => (
                    <div key={name} className="px-3 py-2 rounded-sm bg-white/10 text-white text-xs font-bold text-center">
                      {name}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <FadeSection>
            <h2 className="section-title mb-4">Ready to Get Started?</h2>
            <p className="section-subtitle mx-auto mb-8">
              Contact us today and let us help you shop from any global website.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact" className="btn-primary">
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/offers" className="btn-outline">
                View Offers
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;

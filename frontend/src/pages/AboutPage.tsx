import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe, ShieldCheck, Heart, Eye, ArrowRight, ChevronRight,
  Users, Star, Truck, Plane, Search, Compass, Award, Sparkles
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, MultilingualText } from '../types';

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

export const AboutPage: React.FC = () => {
  const { language } = useLanguage();
  const [content, setContent] = useState<WebsiteContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    websiteContentApi.getContent().then(data => {
      if (isMounted && data) {
        setContent(data);
      }
    }).catch(err => {
      console.warn('Could not load dynamic website content', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Helper to extract language text safely
  const txt = (field?: MultilingualText, fallback = ''): string => {
    if (!field) return fallback;
    const currentLang = language as 'en' | 'ku' | 'ar';
    return field[currentLang] || field.en || fallback;
  };

  // Icon mapper helper
  const renderIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'Globe': return <Globe className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Star': return <Star className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'ArrowRight': return <ArrowRight className={className} />;
      case 'Truck': return <Truck className={className} />;
      case 'Users': return <Users className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'Search': return <Search className={className} />;
      case 'Compass': return <Compass className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Sparkles':
      default: return <Sparkles className={className} />;
    }
  };

  const about = content?.about;

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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">
                {about ? txt(about.hero.badge, 'About OrderCenter') : 'About OrderCenter'}
              </span>
            </div>
            <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {about ? txt(about.hero.title, 'About Us') : 'About Us'}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {about
                ? txt(about.hero.description, 'Your trusted bridge between global online marketplaces and your doorstep.')
                : 'Your trusted bridge between global online marketplaces and your doorstep. We simplify international shopping and make it accessible to everyone.'}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" style={{ display: 'block' }}>
            <path d="M0 60L1440 60V30C1320 10 1200 0 1080 5C960 10 840 30 720 35C600 40 480 30 360 20C240 10 120 5 60 7.5L0 10V60Z" fill="#EBEAE8" />
          </svg>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-20 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeSection>
              <span className="section-label">
                {about ? txt(about.whoWeAre.label, 'Who We Are') : 'Who We Are'}
              </span>
              <h2 className="section-title mb-4">
                {about ? txt(about.whoWeAre.title, 'Who We Are') : 'Who We Are'}
              </h2>
              <div className="w-12 h-0.5 bg-gold mb-6" />
              <p className="text-charcoal-lighter leading-relaxed mb-4">
                {about
                  ? txt(about.whoWeAre.paragraph1)
                  : "OrderCenter is a premier international shopping and shipping service dedicated to bridging the gap between global e-commerce and local customers."}
              </p>
              <p className="text-charcoal-lighter leading-relaxed mb-6">
                {about
                  ? txt(about.whoWeAre.paragraph2)
                  : "Based in the Kurdistan Region of Iraq, we serve customers across the region by purchasing products from leading international platforms."}
              </p>
              <Link to="/contact" className="btn-primary">
                Get In Touch <ArrowRight className="w-4 h-4" />
              </Link>
            </FadeSection>

            {/* Visual Panel */}
            <FadeSection delay={150}>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-brand/10 to-gold/10 border border-bg-dark overflow-hidden p-8 flex flex-col justify-between shadow-sm relative">
                  {/* Decorative background image if provided */}
                  {about?.whoWeAre.image && (
                    <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
                      <img
                        src={about.whoWeAre.image}
                        alt="Who We Are Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Decorative blobs */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold/8 rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-brand flex items-center justify-center mb-6 shadow-premium">
                      <Globe className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-display font-bold text-charcoal text-2xl mb-3">
                      {about ? txt(about.whoWeAre.cardTitle, 'Global Shopping, ') : 'Global Shopping, '}{' '}
                      <span className="text-gradient-brand">
                        {about ? txt(about.whoWeAre.cardHighlight, 'Locally Delivered') : 'Locally Delivered'}
                      </span>
                    </h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">
                      {about
                        ? txt(about.whoWeAre.cardDescription, 'We connect you with 50+ international platforms and handle every step of the journey.')
                        : 'We connect you with 50+ international platforms and handle every step of the journey.'}
                    </p>
                  </div>

                  {/* Dynamic Stats */}
                  <div className="relative z-10 grid grid-cols-3 gap-4 pt-6 border-t border-bg-dark">
                    {(about?.whoWeAre.stats || [
                      { id: '1', value: '5+', label: { en: 'Years', ku: 'ساڵ', ar: 'سنوات' } },
                      { id: '2', value: '10K+', label: { en: 'Orders', ku: 'داواکاری', ar: 'طلب' } },
                      { id: '3', value: '50+', label: { en: 'Websites', ku: 'ماڵپەڕ', ar: 'موقع' } },
                    ]).map((s) => (
                      <div key={s.id} className="text-center">
                        <div className="font-display font-bold text-brand text-2xl">{s.value}</div>
                        <div className="text-charcoal-lighter text-xs mt-0.5">{txt(s.label)}</div>
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
            <span className="section-label">
              {about ? txt(about.whatWeDo.label, 'What We Do') : 'What We Do'}
            </span>
            <h2 className="section-title">
              {about ? txt(about.whatWeDo.title, 'What We Do') : 'What We Do'}
            </h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">
              {about
                ? txt(about.whatWeDo.subtitle, 'We act as your personal international shopping agent — handling everything from purchase to delivery.')
                : 'We act as your personal international shopping agent — handling everything from purchase to delivery.'}
            </p>
          </FadeSection>

          <div className="grid md:grid-cols-2 gap-6">
            {(about?.whatWeDo.items || []).map((item, i) => (
              <FadeSection key={item.id || i} delay={i * 80}>
                <div className="premium-card group p-7 h-full flex gap-5 hover:-translate-y-1 transition-all">
                  <div className="icon-box flex-shrink-0">
                    {renderIcon(item.icon, 'w-5 h-5')}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-charcoal text-lg mb-2">
                      {txt(item.title)}
                    </h3>
                    <p className="text-charcoal-lighter text-sm leading-relaxed">
                      {txt(item.description)}
                    </p>
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
              <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm h-full shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-gold/20 flex items-center justify-center mb-5">
                  <Eye className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">
                  {about ? txt(about.missionVision.missionTitle, 'Our Mission') : 'Our Mission'}
                </h3>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  {about
                    ? txt(about.missionVision.missionDescription)
                    : "To simplify international shopping for our customers by providing a reliable, transparent, and affordable service that connects them with the world's best products."}
                </p>
              </div>
            </FadeSection>

            {/* Vision */}
            <FadeSection delay={150}>
              <div className="bg-white/10 border border-white/20 rounded-2xl p-8 backdrop-blur-sm h-full shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-brand-light/30 flex items-center justify-center mb-5">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-display font-bold text-white text-2xl mb-4">
                  {about ? txt(about.missionVision.visionTitle, 'Our Vision') : 'Our Vision'}
                </h3>
                <p className="text-white/70 leading-relaxed text-sm sm:text-base">
                  {about
                    ? txt(about.missionVision.visionDescription)
                    : "To become the leading international shopping and shipping service in the region, known for our excellence, reliability, and customer-first approach."}
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
            <span className="section-label">
              {about ? txt(about.values.label, 'Our Values') : 'Our Values'}
            </span>
            <h2 className="section-title">
              {about ? txt(about.values.title, 'Our Values') : 'Our Values'}
            </h2>
            <div className="divider-gold" />
          </FadeSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(about?.values.items || []).map((val, i) => (
              <FadeSection key={val.id || i} delay={i * 80}>
                <div className="premium-card group p-7 text-center h-full hover:-translate-y-1 transition-all">
                  <div className="icon-box mx-auto mb-5">
                    {renderIcon(val.icon, 'w-5 h-5')}
                  </div>
                  <h3 className="font-display font-bold text-charcoal text-lg mb-3">
                    {txt(val.title)}
                  </h3>
                  <p className="text-charcoal-lighter text-sm leading-relaxed">
                    {txt(val.description)}
                  </p>
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
            <span className="section-label">
              {about ? txt(about.process.label, 'Our Process') : 'Our Process'}
            </span>
            <h2 className="section-title">
              {about ? txt(about.process.title, 'Our Process') : 'Our Process'}
            </h2>
            <div className="divider-gold" />
            <p className="section-subtitle mx-auto">
              {about
                ? txt(about.process.subtitle, 'The complete journey from your product discovery to your doorstep.')
                : 'The complete journey from your product discovery to your doorstep.'}
            </p>
          </FadeSection>

          <FadeSection>
            {/* Desktop: horizontal flow */}
            <div className="hidden lg:flex items-center justify-between gap-2">
              {(about?.process.items || []).map((step, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <React.Fragment key={step.id || i}>
                    <div className="flex flex-col items-center gap-3 flex-1 text-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${i % 2 === 0 ? 'bg-brand text-white' : 'bg-gold text-charcoal'}`}>
                        {renderIcon(step.icon, 'w-6 h-6')}
                      </div>
                      <span className="text-xs font-bold text-charcoal leading-tight">
                        {txt(step.label)}
                      </span>
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
              {(about?.process.items || []).map((step, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <div key={step.id || i} className="flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-card flex-shrink-0 ${i % 2 === 0 ? 'bg-brand text-white' : 'bg-gold text-charcoal'}`}>
                        {renderIcon(step.icon, 'w-5 h-5')}
                      </div>
                      {!isLast && <div className="w-0.5 h-8 bg-bg-dark flex-shrink-0" />}
                    </div>
                    <div className="pt-3">
                      <span className="text-sm font-semibold text-charcoal">
                        {txt(step.label)}
                      </span>
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
            <h2 className="section-title mb-4">
              {about ? txt(about.cta.title, 'Ready to Start Shopping?') : 'Ready to Start Shopping?'}
            </h2>
            <p className="section-subtitle mx-auto mb-8">
              {about
                ? txt(about.cta.subtitle, 'Join thousands of satisfied customers who trust us with their international shopping needs.')
                : 'Join thousands of satisfied customers who trust us with their international shopping needs.'}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/services" className="btn-primary">
                {about ? txt(about.cta.primaryBtn, 'Explore Services') : 'Explore Services'} <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/contact" className="btn-outline">
                {about ? txt(about.cta.secondaryBtn, 'Contact Us') : 'Contact Us'}
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;

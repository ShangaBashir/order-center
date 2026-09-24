import React, { useRef, useState, useEffect } from 'react';
import {
  Phone, Mail, MessageCircle, MapPin, Clock, Instagram,
  Facebook, Twitter, Send, CheckCircle, AlertCircle, Link2
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

const ContactPage: React.FC = () => {
  const { t, direction } = useLanguage();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Simulate submission
    setTimeout(() => {
      setStatus('success');
      setForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    }, 1800);
  };

  const contactItems = [
    {
      icon: Phone,
      label: 'Phone',
      value: '+964 750 123 4567',
      href: 'tel:+9647501234567',
      color: 'bg-brand/10 text-brand hover:bg-brand hover:text-white',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'info@ordercenter.iq',
      href: 'mailto:info@ordercenter.iq',
      color: 'bg-brand/10 text-brand hover:bg-brand hover:text-white',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: '+964 750 123 4567',
      href: 'https://wa.me/9647501234567',
      color: 'bg-green-50 text-green-700 hover:bg-green-600 hover:text-white',
    },
    {
      icon: MapPin,
      label: 'Location',
      value: 'Erbil, Kurdistan Region, Iraq',
      href: '#',
      color: 'bg-gold/10 text-gold-dark hover:bg-gold hover:text-white',
    },
  ];

  return (
    <div className="pt-16 lg:pt-20 overflow-x-hidden">
      {/* Page Hero */}
      <section className="relative py-20 lg:py-24 hero-gradient overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
              <span className="w-2 h-2 rounded-full bg-gold" />
              <span className="text-white/80 text-xs font-medium tracking-wider uppercase">Get in Touch</span>
            </div>
            <h1 className="font-display font-bold text-white mb-5" style={{ fontSize: 'clamp(2rem, 4vw, 3.5rem)' }}>
              {t('contact.title')}
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" style={{display:'block'}}>
            <path d="M0 60L1440 60V30C1320 10 1200 0 1080 5C960 10 840 30 720 35C600 40 480 30 360 20C240 10 120 5 60 7.5L0 10V60Z" fill="#EBEAE8"/>
          </svg>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 lg:py-28 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">

            {/* Contact Form — left, 3 cols */}
            <div className="lg:col-span-3">
              <FadeSection>
                <div className="bg-white rounded-sm border border-bg-dark shadow-card p-8 lg:p-10">
                  <h2 className="font-display font-bold text-charcoal text-2xl mb-2">Send Us a Message</h2>
                  <p className="text-charcoal-lighter text-sm mb-8">
                    Fill out the form below and our team will get back to you within 24 hours.
                  </p>

                  {status === 'success' && (
                    <div className="flex items-start gap-3 p-4 rounded-sm bg-green-50 border border-green-200 mb-6 animate-fade-in">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-700">Message sent successfully!</p>
                        <p className="text-xs text-green-600 mt-0.5">We'll get back to you within 24 hours.</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5" dir={direction}>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                          {t('contact.name')} *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={form.fullName}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                          {t('contact.email')} *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="input-field"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                          {t('contact.phone')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={form.phone}
                          onChange={handleChange}
                          placeholder="+964 XXX XXX XXXX"
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                          {t('contact.subject')} *
                        </label>
                        <select
                          name="subject"
                          value={form.subject}
                          onChange={handleChange}
                          required
                          className="input-field"
                        >
                          <option value="">Select a subject</option>
                          <option value="order">Place an Order</option>
                          <option value="tracking">Order Tracking</option>
                          <option value="wholesale">Wholesale Inquiry</option>
                          <option value="quote">Get a Quote</option>
                          <option value="support">Customer Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                        {t('contact.message')} *
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your request..."
                        className="input-field resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {status === 'loading' ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        t('contact.send')
                      )}
                    </button>
                  </form>
                </div>
              </FadeSection>
            </div>

            {/* Contact Info — right, 2 cols */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Contact items */}
              <FadeSection delay={100}>
                <div className="bg-white rounded-sm border border-bg-dark shadow-card p-6">
                  <h3 className="font-display font-bold text-charcoal text-lg mb-5">Contact Information</h3>
                  <div className="flex flex-col gap-4">
                    {contactItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target={item.href.startsWith('http') ? '_blank' : undefined}
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 group"
                        >
                          <div className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-200 ${item.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] font-semibold text-charcoal-lighter uppercase tracking-wider">{item.label}</div>
                            <div className="text-sm font-medium text-charcoal group-hover:text-brand transition-colors">{item.value}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </FadeSection>

              {/* Business Hours */}
              <FadeSection delay={180}>
                <div className="bg-white rounded-sm border border-bg-dark shadow-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-brand" />
                    <h3 className="font-display font-bold text-charcoal text-base">{t('contact.hours')}</h3>
                  </div>
                  <div className="space-y-2">
                    {[
                      { day: 'Monday – Friday', hours: '9:00 AM – 8:00 PM' },
                      { day: 'Saturday', hours: '10:00 AM – 6:00 PM' },
                      { day: 'Sunday', hours: 'Closed' },
                    ].map((item) => (
                      <div key={item.day} className="flex justify-between items-center py-1.5 border-b border-bg-dark last:border-0">
                        <span className="text-sm text-charcoal-lighter">{item.day}</span>
                        <span className={`text-sm font-medium ${item.hours === 'Closed' ? 'text-red-500' : 'text-charcoal'}`}>
                          {item.hours}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeSection>

              {/* Social Media */}
              <FadeSection delay={260}>
                <div className="bg-white rounded-sm border border-bg-dark shadow-card p-6">
                  <h3 className="font-display font-bold text-charcoal text-base mb-4">Follow Us</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { icon: Instagram, label: 'Instagram', color: 'hover:bg-pink-600' },
                      { icon: Facebook, label: 'Facebook', color: 'hover:bg-blue-600' },
                      { icon: Twitter, label: 'X / Twitter', color: 'hover:bg-charcoal' },
                      { icon: Send, label: 'Telegram', color: 'hover:bg-sky-500' },
                    ].map(({ icon: Icon, label, color }) => (
                      <a
                        key={label}
                        href="#"
                        title={label}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-sm bg-bg border border-bg-dark text-charcoal-lighter hover:text-white ${color} transition-all duration-200`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </FadeSection>
            </div>
          </div>
        </div>
      </section>

      {/* Product Link Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-bg to-bg-dark rounded-sm border border-bg-dark p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-12 h-12 rounded-sm bg-gold/15 flex items-center justify-center mb-5">
                  <Link2 className="w-5 h-5 text-gold-dark" />
                </div>
                <h2 className="font-display font-bold text-charcoal text-2xl lg:text-3xl mb-3">
                  {t('contact.product')}
                </h2>
                <p className="text-charcoal-lighter leading-relaxed mb-6">
                  {t('contact.product.desc')}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://wa.me/9647501234567"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-sm bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send via WhatsApp
                  </a>
                  <a
                    href="mailto:info@ordercenter.iq"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-sm border-2 border-brand text-brand text-sm font-semibold hover:bg-brand hover:text-white transition-all duration-200"
                  >
                    <Mail className="w-4 h-4" />
                    Send via Email
                  </a>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="input-field flex items-center gap-3 bg-white/70">
                  <Link2 className="w-4 h-4 text-charcoal-lighter flex-shrink-0" />
                  <span className="text-charcoal-lighter text-sm">https://www.shein.com/...</span>
                </div>
                <p className="text-xs text-charcoal-lighter mt-2">
                  Paste any product link and send it to us — we'll get back to you with a quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;

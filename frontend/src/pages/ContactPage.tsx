import React, { useRef, useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Send,
  CheckCircle2,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent, MultilingualText } from '../types';

function useVisible(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = '',
  delay = 0,
}) => {
  const { ref, visible } = useVisible();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { language, t, direction } = useLanguage();
  const isRtl = direction === 'rtl';
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Interactive Form State
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [sendingForm, setSendingForm] = useState(false);

  useEffect(() => {
    let isMounted = true;
    websiteContentApi
      .getContent()
      .then((data) => {
        if (isMounted && data) {
          setContent(data);
        }
      })
      .catch((err) => {
        console.warn('Could not load dynamic website content', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const txt = (field?: MultilingualText, fallback = ''): string => {
    if (!field) return fallback;
    const currentLang = language as 'en' | 'ku' | 'ar';
    return field[currentLang] || field.en || fallback;
  };

  const con = content?.contact;
  const gen = content?.general;

  // Branch selector state
  const offices = con?.officeLocations?.items || [];
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const activeOffice = offices.find((o) => o.id === selectedBranchId) || offices[0];

  // Real contact information
  const phoneNum1 =
    con?.directChannels?.phone && con.directChannels.phone.trim() && !con.directChannels.phone.includes('+964 750 000')
      ? con.directChannels.phone
      : gen?.phone && !gen.phone.includes('+964 750 000')
      ? gen.phone
      : '0770 156 6233';

  const phoneNum2 =
    con?.directChannels?.secondaryPhone && con.directChannels.secondaryPhone.trim() && !con.directChannels.secondaryPhone.includes('+964 770 000')
      ? con.directChannels.secondaryPhone
      : gen?.secondaryPhone || '0751 194 6651';

  const emailAddr =
    con?.directChannels?.email && con.directChannels.email.trim() && !con.directChannels.email.includes('support@ordercenter')
      ? con.directChannels.email
      : gen?.email && !gen.email.includes('support@ordercenter')
      ? gen.email
      : 'Wazhamyassin98@gmail.com';

  const whatsappNum =
    con?.directChannels?.whatsapp && con.directChannels.whatsapp.trim() && !con.directChannels.whatsapp.includes('+964 750 000')
      ? con.directChannels.whatsapp
      : gen?.whatsapp || '0770 156 6233';

  const cleanWhatsapp = whatsappNum.replace(/\D/g, '') || '9647701566233';

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formState.name.trim() ||
      !formState.phone.trim() ||
      !formState.email.trim() ||
      !formState.message.trim()
    ) {
      return;
    }

    setSendingForm(true);
    setTimeout(() => {
      setSendingForm(false);
      setFormSubmitted(true);

      // Also compose WhatsApp link for easy one-tap handoff
      const waText = encodeURIComponent(
        `*New Inquiry from Website*\n\n*Name:* ${formState.name}\n*Phone:* ${formState.phone}\n*Email:* ${formState.email}\n*Topic:* ${formState.subject || 'General'}\n*Message:* ${formState.message}`
      );
      window.open(`https://wa.me/${cleanWhatsapp}?text=${waText}`, '_blank');
    }, 600);
  };

  const faqItems = con?.faq?.items || [];

  return (
    <div className={`pt-16 lg:pt-20 overflow-x-hidden min-h-screen bg-slate-50/50 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* 1. HERO SECTION */}
      <section className="relative py-24 lg:py-32 hero-gradient overflow-hidden text-white">
        {/* Ambient background glows */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 40%, rgba(212,175,55,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(113,22,18,0.6) 0%, transparent 60%)`,
          }}
        />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-md shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-white/90 text-xs font-semibold tracking-wider uppercase">
                {con ? txt(con.hero.badge, 'Concierge Support • Open Daily') : 'Concierge Support • Open Daily'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.15] mb-6">
              {con ? txt(con.hero.title, t('contact.title')) : t('contact.title')}
            </h1>

            <p className="text-lg sm:text-xl text-white/80 font-normal leading-relaxed mb-8 max-w-2xl">
              {con ? txt(con.hero.description, t('contact.subtitle')) : t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* 2. DIRECT CONTACT CHANNELS - LUXURY 3-CARD GRID */}
      <section className="relative -mt-14 z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Primary Hotline */}
          <a
            href={`tel:${phoneNum1.replace(/\s+/g, '')}`}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-brand/50 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-inner">
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Primary Line
                </span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Direct Hotline
              </h4>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal group-hover:text-brand transition-colors font-sans tracking-tight">
                {phoneNum1}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Instant call & WhatsApp replies for orders and tracking.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
              <span>Call Hotline 1</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </div>
          </a>

          {/* Card 2: Secondary Phone */}
          <a
            href={`tel:${phoneNum2.replace(/\s+/g, '')}`}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-brand/50 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-inner">
                  <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Support Line
                </span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Secondary Hotline
              </h4>
              <div className="text-xl sm:text-2xl font-extrabold text-charcoal group-hover:text-brand transition-colors font-sans tracking-tight">
                {phoneNum2}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Direct voice support and cargo consultations.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
              <span>Call Hotline 2</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </div>
          </a>

          {/* Card 3: Email */}
          <a
            href={`mailto:${emailAddr}`}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 hover:border-brand/50 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all duration-300 shadow-inner">
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand/5 text-brand border border-brand/20">
                  Official Email
                </span>
              </div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                Customer Care Desk
              </h4>
              <div className="text-base sm:text-lg font-extrabold text-charcoal group-hover:text-brand transition-colors break-all tracking-tight leading-snug">
                {emailAddr}
              </div>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Send official inquiries, quotes, or documents anytime.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-brand group-hover:translate-x-0.5 transition-transform">
              <span>Send Email</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </div>
          </a>
        </div>
      </section>

      {/* 3. SEND US A DIRECT INQUIRY FORM */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-900/5 border border-slate-200/80 relative">
              {formSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-charcoal">
                    {txt(con?.inquiryForm?.successTitle, 'Message Sent Successfully!')}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {txt(con?.inquiryForm?.successMessage, 'Thank you for reaching out. A WhatsApp chat was initiated with our support desk, and one of our logistics specialists will assist you momentarily.')}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormState({ name: '', phone: '', email: '', subject: '', message: '' });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-brand text-white font-bold text-sm hover:bg-brand-dark transition cursor-pointer shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="text-center max-w-lg mx-auto pb-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand font-bold text-xs uppercase tracking-wider mb-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>{txt(con?.inquiryForm?.badge, 'Direct Assistance')}</span>
                    </div>
                    <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal mb-2">
                      {txt(con?.inquiryForm?.title, 'Send Us a Direct Inquiry')}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500">
                      {txt(con?.inquiryForm?.description, 'Fill in your details below and we will connect with you right away.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Inquiry Topic
                      </label>
                      <input
                        type="text"
                        value={formState.subject}
                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition shadow-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Tell us what you are looking for or paste product/tracking links..."
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition resize-none shadow-xs"
                    />
                  </div>

                  {/* Send Button - Distinct brand color with visible text */}
                  <button
                    type="submit"
                    disabled={sendingForm}
                    className="w-full py-4 px-6 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {sendingForm ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 text-gold" />
                        <span>{txt(con?.inquiryForm?.submitButtonText, 'Send Message')}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. OFFICE HEADQUARTERS & INTERACTIVE MAP */}
      <section id="location" className="py-20 bg-white border-t border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-brand block mb-2">
              {txt(con?.officeLocations?.label, 'Official Headquarters')}
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-charcoal">
              {txt(con?.officeLocations?.title, 'Visit Our Sulaymaniyah Center')}
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              {txt(con?.officeLocations?.description, 'Visit our physical office in Sulaymaniyah for parcel pick-up, local payment, or in-person logistics consultations.')}
            </p>
          </FadeSection>

          {/* Multiple branches selector tabs if more than 1 branch */}
          {offices.length > 1 && (
            <div className="flex items-center justify-center gap-2.5 mb-10 flex-wrap">
              {offices.map((branch) => {
                const isActive = (activeOffice?.id === branch.id);
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranchId(branch.id)}
                    className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-gold' : 'text-slate-400'}`} />
                    <span>{txt(branch.name, txt(branch.city, 'Branch'))}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Office Details & Map Card Grid */}
          {(() => {
            const branchName = txt(activeOffice?.name, 'Order Center — Sulaimany Hub');
            const branchAddress = txt(activeOffice?.address, 'Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq');
            const branchDistrict = txt(activeOffice?.district, 'Bakhtyari (بەختیاری)');
            const branchLandmark = txt(activeOffice?.landmark, 'Near Falafelo Fast Food');
            const branchCity = txt(activeOffice?.city, 'Sulaymaniyah, Iraq (سلێمانی)');
            const branchCoords = activeOffice?.mapCoordinates?.trim() || '35.5712825,45.3985297';
            const branchMapUrl =
              activeOffice?.googleMapsUrl?.trim() ||
              `https://www.google.com/maps/search/?api=1&query=${branchCoords}`;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Office Details Card - Matching Footer Location Exactly */}
                <div className="lg:col-span-5 rounded-3xl p-8 bg-slate-50 border border-slate-200/80 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 text-brand font-bold text-xs bg-brand/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                      <MapPin className="w-4 h-4 text-brand" />
                      <span>{txt(activeOffice?.city, 'Sulaymaniyah Location')}</span>
                    </div>

                    <h3 className="font-display font-bold text-2xl text-charcoal">
                      {branchName}
                    </h3>

                    <div className="pt-2 border-t border-slate-200/80 space-y-3.5 text-sm text-slate-700">
                      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Office Address
                        </span>
                        <div className="font-bold text-charcoal text-base leading-snug">
                          {branchAddress}
                        </div>
                      </div>

                      {branchDistrict && (
                        <div className="flex items-center justify-between px-1">
                          <span className="text-slate-500 font-medium">District:</span>
                          <span className="font-bold text-charcoal">{branchDistrict}</span>
                        </div>
                      )}

                      {branchLandmark && (
                        <div className="flex items-center justify-between px-1">
                          <span className="text-slate-500 font-medium">Landmark:</span>
                          <span className="font-bold text-charcoal">{branchLandmark}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between px-1">
                        <span className="text-slate-500 font-medium">City & Country:</span>
                        <span className="font-bold text-charcoal">{branchCity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <a
                      href={branchMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 px-6 rounded-2xl bg-brand hover:bg-brand-dark text-white font-bold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-gold" />
                      <span>Get Directions in Google Maps</span>
                    </a>
                  </div>
                </div>

                {/* Google Map Embed */}
                <div className="lg:col-span-7 rounded-3xl overflow-hidden border border-slate-200/80 shadow-xl min-h-[420px] bg-slate-100 relative group">
                  {/* Overlay for Google Map Top-Left Card */}
                  <div className="absolute top-3.5 left-3.5 z-10 bg-white/98 backdrop-blur-md rounded-xl p-3.5 shadow-md border border-slate-200/90 max-w-[250px] text-left">
                    <div className="font-bold text-sm text-charcoal flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand" />
                      <span>Order Center</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">
                      {branchAddress}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500 font-semibold">
                      <span>★ 5.0</span>
                      <span className="text-slate-400 font-normal">• Verified Logistics Hub</span>
                    </div>
                    <a
                      href={branchMapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                    >
                      <span>Open in Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Order Center Red Label next to Red Pin */}
                  <div
                    className="absolute z-10 pointer-events-none select-none flex items-center"
                    style={{
                      left: 'calc(66.8% + 12px)',
                      top: '47%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <span className="text-[13px] font-bold text-[#d93025] font-sans tracking-tight leading-none whitespace-nowrap drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                      Order Center
                    </span>
                  </div>

                  <iframe
                    title="Order Center Location Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(branchCoords)}&hl=en&z=17&output=embed`}
                    width="100%"
                    height="100%"
                    className="w-full h-full min-h-[420px] border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 5. INTERACTIVE FAQ ACCORDION (Without Search Bar) */}
      {con?.faq && (
        <section className="py-20 bg-slate-50/70 border-t border-slate-200/60">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeSection className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-brand block mb-2">
                {txt(con.faq.label, 'FAQ')}
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-charcoal">
                {txt(con.faq.title, 'Frequently Asked Questions')}
              </h2>
              <p className="text-slate-500 text-sm mt-3">
                Quick answers regarding shipping timelines, import duties, and customer ordering.
              </p>
            </FadeSection>

            <div className="space-y-3">
              {faqItems.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                      isOpen
                        ? 'border-brand/40 bg-white shadow-md'
                        : 'border-slate-200/80 bg-white/80 hover:bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="w-full p-5 text-left font-bold text-slate-900 text-sm sm:text-base flex items-center justify-between gap-4 transition"
                    >
                      <span className="font-display font-bold text-slate-800">{txt(faq.question)}</span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                          isOpen ? 'bg-brand text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/40">
                        {txt(faq.answer)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ContactPage;

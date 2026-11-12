import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { websiteContentApi } from '../api';
import { WebsiteContent } from '../types';

const Footer: React.FC = () => {
  const { language, t } = useLanguage();
  const currentLang = language as 'en' | 'ku' | 'ar';
  const currentYear = new Date().getFullYear();
  const [content, setContent] = useState<WebsiteContent | null>(null);

  useEffect(() => {
    let isMounted = true;
    websiteContentApi
      .getContent()
      .then((data) => {
        if (isMounted && data) {
          setContent(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const companyLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.services'), path: '/services' },
    { label: t('nav.offers'), path: '/offers' },
    { label: t('nav.products'), path: '/products' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const customerLinks = [
    { label: t('footer.track'), path: '#', onClick: () => { const btn = document.getElementById('header-tracking-btn'); btn?.click(); } },
    { label: t('footer.how'), path: '/#how-it-works' },
    { label: t('footer.faq'), path: '/contact' },
    { label: t('footer.support'), path: '/contact' },
  ];

  // Dynamic values with fallbacks
  const con = content?.contact;
  const gen = content?.general;
  const firstOffice = con?.officeLocations?.items?.[0];

  const phone1 = con?.directChannels?.phone || gen?.phone || '0770 156 6233';
  const phone2 = con?.directChannels?.secondaryPhone || gen?.secondaryPhone || '0751 194 6651';
  const emailAddr = con?.directChannels?.email || gen?.email || 'Wazhamyassin98@gmail.com';
  
  const locationText =
    firstOffice?.address?.[currentLang] ||
    firstOffice?.address?.en ||
    gen?.location?.[currentLang] ||
    gen?.location?.en ||
    'Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq';

  const mapTargetUrl =
    firstOffice?.googleMapsUrl ||
    (firstOffice?.mapCoordinates
      ? `https://www.google.com/maps/search/?api=1&query=${firstOffice.mapCoordinates}`
      : gen?.googleMapsUrl || 'https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297');

  const footerBio = gen?.footerDescription?.[currentLang] || gen?.footerDescription?.en || t('footer.desc');

  return (
    <footer className="bg-charcoal text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <img
                src="/logo.png"
                alt="Order Center Logo"
                className="h-14 w-auto object-contain"
              />
              <div>
                <div className="font-display font-bold text-white text-lg leading-none">Order Center</div>
                <div className="text-[10px] text-white/40 font-medium tracking-[0.15em] uppercase mt-0.5">
                  Global Shopping & Shipping
                </div>
              </div>
            </Link>

            <p className="text-white/50 text-sm leading-relaxed mb-6">
              {footerBio}
            </p>

          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5 pb-3 border-b border-white/10">
              {t('footer.company')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/50 hover:text-gold transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-3 h-0.5 bg-white/20 group-hover:bg-gold group-hover:w-4 transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5 pb-3 border-b border-white/10">
              {t('footer.customer')}
            </h4>
            <ul className="flex flex-col gap-2.5">
              {customerLinks.map((link, i) => (
                <li key={i}>
                  {link.onClick ? (
                    <button
                      onClick={link.onClick}
                      className="text-sm text-white/50 hover:text-gold transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-3 h-0.5 bg-white/20 group-hover:bg-gold group-hover:w-4 transition-all duration-200" />
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      to={link.path}
                      className="text-sm text-white/50 hover:text-gold transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className="w-3 h-0.5 bg-white/20 group-hover:bg-gold group-hover:w-4 transition-all duration-200" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display font-bold text-white text-base mb-5 pb-3 border-b border-white/10">
              {t('footer.contact')}
            </h4>
            <ul className="flex flex-col gap-4">
              <li>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-white/50" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Phone</div>
                    <a href={`tel:${phone1.replace(/\s+/g, '')}`} className="block text-sm text-white/60 hover:text-white transition-colors">{phone1}</a>
                    {phone2 && (
                      <a href={`tel:${phone2.replace(/\s+/g, '')}`} className="block text-sm text-white/60 hover:text-white transition-colors">{phone2}</a>
                    )}
                  </div>
                </div>
              </li>
              <li>
                <a href={`mailto:${emailAddr}`} className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-brand transition-colors">
                    <Mail className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Email</div>
                    <div className="text-sm text-white/60 group-hover:text-white transition-colors">{emailAddr}</div>
                  </div>
                </a>
              </li>

              <li>
                <a
                  href={mapTargetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 group"
                  title="Open exact location in Google Maps"
                >
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-white/50 group-hover:text-charcoal" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5 group-hover:text-gold transition-colors flex items-center gap-1.5">
                      <span>Location</span>
                      <span className="text-[9px] text-gold font-normal">↗ View Map</span>
                    </div>
                    <div className="text-sm text-white/60 group-hover:text-white transition-colors leading-snug">
                      {locationText}
                    </div>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Gold Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p className="text-center sm:text-left">
            © {currentYear} OrderCenter. {t('footer.rights')}
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default Footer;

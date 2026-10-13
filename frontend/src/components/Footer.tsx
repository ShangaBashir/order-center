import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Github } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const companyLinks = [
    { label: t('nav.home'), path: '/' },
    { label: t('nav.about'), path: '/about' },
    { label: t('nav.services'), path: '/services' },
    { label: t('nav.offers'), path: '/offers' },
    { label: t('nav.contact'), path: '/contact' },
  ];

  const customerLinks = [
    { label: t('footer.track'), path: '#', onClick: () => { const btn = document.getElementById('header-tracking-btn'); btn?.click(); } },
    { label: t('footer.how'), path: '/#how-it-works' },
    { label: t('footer.faq'), path: '/contact' },
    { label: t('footer.support'), path: '/contact' },
  ];

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
              {t('footer.desc')}
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
                    <a href="tel:+9647701566233" className="block text-sm text-white/60 hover:text-white transition-colors">0770 156 6233</a>
                    <a href="tel:+9647511946651" className="block text-sm text-white/60 hover:text-white transition-colors">0751 194 6651</a>
                  </div>
                </div>
              </li>
              <li>
                <a href="mailto:Wazhamyassin98@gmail.com" className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-brand transition-colors">
                    <Mail className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Email</div>
                    <div className="text-sm text-white/60 group-hover:text-white transition-colors">Wazhamyassin98@gmail.com</div>
                  </div>
                </a>
              </li>

              <li>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-white/50" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="text-sm text-white/60">Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq</div>
                  </div>
                </div>
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
          <a
            href="https://github.com/ShangaBashir/order-center"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-gold transition text-white/60 hover:underline"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MessageCircle, MapPin, Instagram, Facebook, Twitter, Send } from 'lucide-react';
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

            {/* Social */}
            <div className="flex gap-2">
              {[
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Send, href: '#', label: 'Telegram' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-sm bg-white/8 flex items-center justify-center text-white/50 hover:bg-brand hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
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
                    <a href="tel:07701566233" className="block text-sm text-white/60 hover:text-white transition-colors">07701566233</a>
                    <a href="tel:07511946651" className="block text-sm text-white/60 hover:text-white transition-colors">07511946651</a>
                  </div>
                </div>
              </li>
              <li>
                <a href="mailto:info@ordercenter.iq" className="flex items-start gap-3 group">
                  <div className="w-8 h-8 rounded-sm bg-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-brand transition-colors">
                    <Mail className="w-3.5 h-3.5 text-white/50 group-hover:text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] text-white/30 uppercase tracking-wider mb-0.5">Email</div>
                    <div className="text-sm text-white/60 group-hover:text-white transition-colors">info@ordercenter.iq</div>
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
                    <div className="text-sm text-white/60">Sulaimanyiah, Kurdistan Region, Iraq</div>
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
        <div className="flex items-center justify-center">
          <p className="text-sm text-white/30 text-center">
            © {currentYear} OrderCenter. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

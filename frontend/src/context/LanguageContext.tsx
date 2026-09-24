import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, Direction } from '../types';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.services': 'Services',
    'nav.offers': 'Offers',
    'nav.contact': 'Contact',

    // Hero
    'hero.headline': 'Shop From Global Websites.',
    'hero.headline2': 'We Bring It To You.',
    'hero.desc': 'Find what you want from international websites and let us handle the purchasing, shipping, and delivery.',
    'hero.cta1': 'Start Shopping',
    'hero.cta2': 'Track Your Order',

    // How it works
    'hiw.title': 'How It Works',
    'hiw.subtitle': 'Simple steps to get your international products delivered right to your door.',
    'hiw.step1': 'Find Your Product',
    'hiw.step1.desc': 'Browse any international website and find the product you want.',
    'hiw.step2': 'Send Us the Link',
    'hiw.step2.desc': 'Share the product link with us via WhatsApp or our contact form.',
    'hiw.step3': 'Get Your Quote',
    'hiw.step3.desc': 'We calculate the total cost including product price and shipping.',
    'hiw.step4': 'Confirm Your Order',
    'hiw.step4.desc': 'Approve the quote and make your payment securely.',
    'hiw.step5': 'We Purchase & Ship',
    'hiw.step5.desc': 'We buy the product on your behalf and ship it internationally.',
    'hiw.step6': 'Receive Your Package',
    'hiw.step6.desc': 'Your package is delivered to your door with full tracking.',

    // Partners
    'partners.title': 'Global Websites We Shop From',
    'partners.subtitle': 'We purchase from all major international platforms on your behalf.',

    // Why Choose Us
    'why.title': 'Why Choose Us',
    'why.subtitle': 'We make international shopping simple, safe, and reliable.',
    'why.1': 'Easy Ordering',
    'why.1.desc': 'Simple process — just send us the link and we handle everything.',
    'why.2': 'International Shopping',
    'why.2.desc': 'Access any global website, no matter where you are.',
    'why.3': 'Reliable Shipping',
    'why.3.desc': 'Fast and safe delivery of your packages worldwide.',
    'why.4': 'Order Tracking',
    'why.4.desc': 'Real-time updates on every stage of your shipment.',
    'why.5': 'Transparent Process',
    'why.5.desc': 'No hidden fees — full cost breakdown before you commit.',
    'why.6': 'Customer Support',
    'why.6.desc': '24/7 support to answer all your questions.',

    // CTA
    'cta.title': 'Ready to Shop Globally?',
    'cta.desc': 'Start your international shopping journey today. We handle everything — from purchase to delivery.',
    'cta.btn1': 'Get Started',
    'cta.btn2': 'Contact Us',

    // About
    'about.title': 'About Us',
    'about.who': 'Who We Are',
    'about.what': 'What We Do',
    'about.mission': 'Our Mission',
    'about.vision': 'Our Vision',
    'about.values': 'Our Values',
    'about.process': 'Our Process',

    // Services
    'services.title': 'Our Services',
    'services.subtitle': 'Comprehensive international shopping and shipping solutions.',
    'services.learn': 'Learn More',

    // Offers
    'offers.title': 'Special Offers',
    'offers.subtitle': 'Exclusive deals and promotions for our valued customers.',
    'offers.valid': 'Valid until',
    'offers.cta': 'Claim Offer',

    // Contact
    'contact.title': 'Contact Us',
    'contact.subtitle': 'We\'re here to help with all your international shopping needs.',
    'contact.name': 'Full Name',
    'contact.email': 'Email Address',
    'contact.phone': 'Phone Number',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.product': 'Have a product in mind?',
    'contact.product.desc': 'Send us the product link and we\'ll help you bring it to you.',
    'contact.hours': 'Business Hours',
    'contact.hours.desc': 'Mon–Sat: 9:00 AM – 8:00 PM',

    // Tracking
    'tracking.title': 'Track Your Order',
    'tracking.placeholder': 'Enter your order or tracking number',
    'tracking.btn': 'Track Order',
    'tracking.order': 'Order Number',
    'tracking.status': 'Current Status',
    'tracking.product': 'Product',
    'tracking.origin': 'Origin',
    'tracking.destination': 'Destination',
    'tracking.estimated': 'Estimated Delivery',
    'tracking.updated': 'Last Updated',
    'tracking.s1': 'Order Received',
    'tracking.s2': 'Order Confirmed',
    'tracking.s3': 'Purchased',
    'tracking.s4': 'Preparing for Shipment',
    'tracking.s5': 'Shipped',
    'tracking.s6': 'In Transit',
    'tracking.s7': 'Arrived',
    'tracking.s8': 'Out for Delivery',
    'tracking.s9': 'Delivered',

    // Search
    'search.placeholder': 'Search services, offers, and more...',
    'search.suggestions': 'Quick Searches',
    'search.noresult': 'No results found',

    // Footer
    'footer.company': 'Company',
    'footer.customer': 'Customer',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    'footer.track': 'Track Order',
    'footer.how': 'How It Works',
    'footer.faq': 'FAQ',
    'footer.support': 'Support',
    'footer.desc': 'Your trusted partner for international shopping and shipping. We bring the world\'s best products to your doorstep.',

    // Language
    'lang.en': 'English',
    'lang.ku': 'Kurdish',
    'lang.ar': 'Arabic',
  },

  ku: {
    'nav.home': 'سەرەکی',
    'nav.about': 'دەربارەی ئێمە',
    'nav.services': 'خزمەتگوزاریەکان',
    'nav.offers': 'پێشکەشکراوەکان',
    'nav.contact': 'پەیوەندی',

    'hero.headline': 'کاڵا بکڕە لە وێبسایتە جیهانییەکان.',
    'hero.headline2': 'ئێمە دەیهێنینەوە بۆت.',
    'hero.desc': 'ئەوەی دەتەوێت بدۆزەوە لە وێبسایتە نێودەوڵەتییەکان و بێڵە ئێمە کڕین، بارکردن، و گەیاندنەکەی بکەین.',
    'hero.cta1': 'دەست پێبکە بە کڕین',
    'hero.cta2': 'ئامێرۆزی داواکارییەکەت',

    'hiw.title': 'چۆن کار دەکات',
    'hiw.subtitle': 'هەنگاوە سادەکان بۆ گەیاندنی کاڵاکانی نێودەوڵەتی بۆ دەرگاکەت.',
    'hiw.step1': 'کاڵاکەت بدۆزەوە',
    'hiw.step1.desc': 'لە هەر وێبسایتێکی نێودەوڵەتی بگەڕێ و کاڵاکەی دەتەوێت بدۆزەوە.',
    'hiw.step2': 'لینکەکە بنێرە بۆمان',
    'hiw.step2.desc': 'لینکی کاڵاکە لەڕێگەی واتساپ یان فۆرمی پەیوەندییەوە پێمان بنێرە.',
    'hiw.step3': 'نرخەکەت وەربگرە',
    'hiw.step3.desc': 'ئێمە کۆی تەواوی تێچوو لەوانە نرخی کاڵا و گەیاندن دادەنێین.',
    'hiw.step4': 'داواکاریەکەت پشتڕاست بکەوە',
    'hiw.step4.desc': 'نرخەکە بپەسەندە و پارەی بدە بە شێوەیەکی پارێزراو.',
    'hiw.step5': 'ئێمە دەکڕین و دەنێرین',
    'hiw.step5.desc': 'ئێمە کاڵاکە لە لایەنی تۆوە دەکڕین و نێودەوڵەتی دەیبەین.',
    'hiw.step6': 'گیفتەکەت وەربگرە',
    'hiw.step6.desc': 'گیفتەکەت بۆ دەرگاکەت دەگات لەگەڵ شوێنکەوتنی تەواو.',

    'partners.title': 'وێبسایتە جیهانییەکانی کڕینمان',
    'partners.subtitle': 'ئێمە لە هەموو پلاتفۆرمە نێودەوڵەتییە گەورەکان لە لایەنی تۆوە دەکڕین.',

    'why.title': 'بۆچی ئێمە هەڵبژێریت',
    'why.subtitle': 'کڕینی نێودەوڵەتی سادە، پارێزراو، و پشتیوانیکراو دەکەین.',
    'why.1': 'داواکاری ئاسان',
    'why.1.desc': 'پرۆسەیەکی سادە — تەنها لینکەکە بنێرە و ئێمە هەمووی دەکەین.',
    'why.2': 'کڕینی نێودەوڵەتی',
    'why.2.desc': 'هەر وێبسایتێکی جیهانی بگەیشتە پێی، لەو شوێنەی تۆی.',
    'why.3': 'گەیاندنی پشتیوانیکراو',
    'why.3.desc': 'گەیاندنی خێرا و پارێزراوی گیفتەکانت لە سەرانسەری جیهان.',
    'why.4': 'شوێنکەوتنی داواکاری',
    'why.4.desc': 'نوێکاریی کاتی ڕاستەقینە لەسەر هەموو قۆناغی بارکردنەکەت.',
    'why.5': 'پرۆسەیەکی ڕوون',
    'why.5.desc': 'چی تێچووی شاراوە نییە — خشتەی تەواوی تێچوو پێش پشتڕاستکردنەوە.',
    'why.6': 'پشتگیری کڕیار',
    'why.6.desc': 'پشتگیری ٢٤/٧ بۆ وەڵامدانەوەی هەموو پرسیارەکانت.',

    'cta.title': 'ئامادەیت کڕین لە جیهان؟',
    'cta.desc': 'ئەمڕۆ گەشتی کڕینی نێودەوڵەتیت دەست پێبکە. ئێمە هەمووی دەکەین — لە کڕینەوە تا گەیاندن.',
    'cta.btn1': 'دەستت پێبکە',
    'cta.btn2': 'پەیوەندیمان پێوە بکە',

    'about.title': 'دەربارەی ئێمە',
    'about.who': 'ئێمە کێین',
    'about.what': 'چی دەکەین',
    'about.mission': 'ئەرکی ئێمە',
    'about.vision': 'ئامانجی ئێمە',
    'about.values': 'بەهاکانی ئێمە',
    'about.process': 'پرۆسەکەمان',

    'services.title': 'خزمەتگوزاریەکانمان',
    'services.subtitle': 'چارەسەرە تەواوەکان بۆ کڕین و بارکردنی نێودەوڵەتی.',
    'services.learn': 'زیاتر بزانە',

    'offers.title': 'پێشکەشکراوە تایبەتەکان',
    'offers.subtitle': 'ئامرازە تایبەت و پرۆمۆشنەکان بۆ کڕیارە بەهاوەکانمان.',
    'offers.valid': 'دەرفەتی دوایی',
    'offers.cta': 'پێشکەشکراوەکە وەربگرە',

    'contact.title': 'پەیوەندیمان پێوە بکە',
    'contact.subtitle': 'ئێمە ئاماده ین بۆ یاریدانت لە هەموو پرسیارەکانی کڕینی نێودەوڵەتی.',
    'contact.name': 'ناوی تەواو',
    'contact.email': 'ئیمەیل',
    'contact.phone': 'ژمارەی تەلەفۆن',
    'contact.subject': 'بابەت',
    'contact.message': 'پەیام',
    'contact.send': 'پەیامەکە بنێرە',
    'contact.product': 'کاڵایەکت لە بیرەوە؟',
    'contact.product.desc': 'لینکی کاڵاکە بنێرە و ئێمە یاریدەدەین بیهێنیتەوە.',
    'contact.hours': 'کاتی کاری',
    'contact.hours.desc': 'دووشەممە-شەممە: ٩:٠٠ بەیانی – ٨:٠٠ ئێوارە',

    'tracking.title': 'داواکاریەکەت شوێن بکەوە',
    'tracking.placeholder': 'ژمارەی داواکاری یان شوێنکەوتنەکەت بنووسە',
    'tracking.btn': 'شوێن بکەوە',
    'tracking.order': 'ژمارەی داواکاری',
    'tracking.status': 'دۆخی ئێستا',
    'tracking.product': 'کاڵا',
    'tracking.origin': 'ئەندازەی دەرکەوتن',
    'tracking.destination': 'مەوداگەی گەیشتن',
    'tracking.estimated': 'ئەندازەی گەیاندن',
    'tracking.updated': 'کاتی دوایین نوێکاری',
    'tracking.s1': 'داواکاری وەرگیرا',
    'tracking.s2': 'داواکاری پشتڕاستکرایەوە',
    'tracking.s3': 'کڕیرا',
    'tracking.s4': 'ئامادەکردن بۆ بارکردن',
    'tracking.s5': 'بارکرا',
    'tracking.s6': 'لە ڕێگایە',
    'tracking.s7': 'گەیشت',
    'tracking.s8': 'لەسەر ڕێگای گەیاندن',
    'tracking.s9': 'گەیەندرا',

    'search.placeholder': 'بگەڕێ لە خزمەتگوزاری، پێشکەشکراوە, و زیاتر...',
    'search.suggestions': 'گەڕانی خێرا',
    'search.noresult': 'ئەنجامێک نەدۆزرایەوە',

    'footer.company': 'کۆمپانیا',
    'footer.customer': 'کڕیار',
    'footer.contact': 'پەیوەندی',
    'footer.rights': 'هەموو مافەکان پارێزراون.',
    'footer.track': 'شوێن بکەوتنی داواکاری',
    'footer.how': 'چۆن کار دەکات',
    'footer.faq': 'پرسیاری بەربڵاو',
    'footer.support': 'پشتگیری',
    'footer.desc': 'هاوبەشی متمانەپێکراوت بۆ کڕین و بارکردنی نێودەوڵەتی. باشترین کاڵاکانی جیهان دەهێنینە دەرگاکەت.',

    'lang.en': 'English',
    'lang.ku': 'کوردی',
    'lang.ar': 'عربی',
  },

  ar: {
    'nav.home': 'الرئيسية',
    'nav.about': 'من نحن',
    'nav.services': 'خدماتنا',
    'nav.offers': 'العروض',
    'nav.contact': 'تواصل معنا',

    'hero.headline': 'تسوّق من المواقع العالمية.',
    'hero.headline2': 'نوصلها إليك.',
    'hero.desc': 'اعثر على ما تريد من المواقع الدولية ودعنا نتولى الشراء والشحن والتوصيل.',
    'hero.cta1': 'ابدأ التسوق',
    'hero.cta2': 'تتبع طلبك',

    'hiw.title': 'كيف يعمل',
    'hiw.subtitle': 'خطوات بسيطة لإيصال منتجاتك الدولية إلى بابك.',
    'hiw.step1': 'اعثر على منتجك',
    'hiw.step1.desc': 'تصفح أي موقع دولي وابحث عن المنتج الذي تريده.',
    'hiw.step2': 'أرسل لنا الرابط',
    'hiw.step2.desc': 'شاركنا رابط المنتج عبر واتساب أو نموذج التواصل.',
    'hiw.step3': 'احصل على عرض السعر',
    'hiw.step3.desc': 'نحسب التكلفة الإجمالية شاملة سعر المنتج والشحن.',
    'hiw.step4': 'أكد طلبك',
    'hiw.step4.desc': 'وافق على السعر وادفع بأمان.',
    'hiw.step5': 'نشتري ونشحن',
    'hiw.step5.desc': 'نشتري المنتج بالنيابة عنك ونشحنه دولياً.',
    'hiw.step6': 'استلم طردك',
    'hiw.step6.desc': 'يُسلَّم طردك إلى بابك مع تتبع كامل.',

    'partners.title': 'المواقع العالمية التي نتسوق منها',
    'partners.subtitle': 'نشتري من جميع المنصات الدولية الكبرى بالنيابة عنك.',

    'why.title': 'لماذا نحن',
    'why.subtitle': 'نجعل التسوق الدولي سهلاً وآمناً وموثوقاً.',
    'why.1': 'طلب سهل',
    'why.1.desc': 'عملية بسيطة — فقط أرسل الرابط ونحن نتولى كل شيء.',
    'why.2': 'تسوق دولي',
    'why.2.desc': 'الوصول إلى أي موقع عالمي، أينما كنت.',
    'why.3': 'شحن موثوق',
    'why.3.desc': 'توصيل سريع وآمن لطرودك في جميع أنحاء العالم.',
    'why.4': 'تتبع الطلبات',
    'why.4.desc': 'تحديثات فورية على كل مرحلة من مراحل شحنتك.',
    'why.5': 'عملية شفافة',
    'why.5.desc': 'لا رسوم خفية — تفصيل كامل للتكلفة قبل التأكيد.',
    'why.6': 'دعم العملاء',
    'why.6.desc': 'دعم على مدار الساعة للإجابة على جميع أسئلتك.',

    'cta.title': 'مستعد للتسوق عالمياً؟',
    'cta.desc': 'ابدأ رحلة التسوق الدولي اليوم. نتولى كل شيء — من الشراء حتى التوصيل.',
    'cta.btn1': 'ابدأ الآن',
    'cta.btn2': 'تواصل معنا',

    'about.title': 'من نحن',
    'about.who': 'من نحن',
    'about.what': 'ماذا نفعل',
    'about.mission': 'مهمتنا',
    'about.vision': 'رؤيتنا',
    'about.values': 'قيمنا',
    'about.process': 'عمليتنا',

    'services.title': 'خدماتنا',
    'services.subtitle': 'حلول شاملة للتسوق والشحن الدولي.',
    'services.learn': 'اعرف أكثر',

    'offers.title': 'عروض خاصة',
    'offers.subtitle': 'صفقات وعروض ترويجية حصرية لعملائنا الكرام.',
    'offers.valid': 'صالح حتى',
    'offers.cta': 'احصل على العرض',

    'contact.title': 'تواصل معنا',
    'contact.subtitle': 'نحن هنا للمساعدة في جميع احتياجات التسوق الدولي.',
    'contact.name': 'الاسم الكامل',
    'contact.email': 'البريد الإلكتروني',
    'contact.phone': 'رقم الهاتف',
    'contact.subject': 'الموضوع',
    'contact.message': 'الرسالة',
    'contact.send': 'إرسال الرسالة',
    'contact.product': 'لديك منتج في ذهنك؟',
    'contact.product.desc': 'أرسل لنا رابط المنتج وسنساعدك على إحضاره.',
    'contact.hours': 'ساعات العمل',
    'contact.hours.desc': 'الاثنين – السبت: 9:00 ص – 8:00 م',

    'tracking.title': 'تتبع طلبك',
    'tracking.placeholder': 'أدخل رقم الطلب أو رقم التتبع',
    'tracking.btn': 'تتبع الطلب',
    'tracking.order': 'رقم الطلب',
    'tracking.status': 'الحالة الحالية',
    'tracking.product': 'المنتج',
    'tracking.origin': 'المصدر',
    'tracking.destination': 'الوجهة',
    'tracking.estimated': 'التسليم المتوقع',
    'tracking.updated': 'آخر تحديث',
    'tracking.s1': 'تم استلام الطلب',
    'tracking.s2': 'تم تأكيد الطلب',
    'tracking.s3': 'تم الشراء',
    'tracking.s4': 'جاري التحضير للشحن',
    'tracking.s5': 'تم الشحن',
    'tracking.s6': 'في الطريق',
    'tracking.s7': 'وصل',
    'tracking.s8': 'خارج للتسليم',
    'tracking.s9': 'تم التسليم',

    'search.placeholder': 'ابحث عن الخدمات والعروض والمزيد...',
    'search.suggestions': 'بحث سريع',
    'search.noresult': 'لا توجد نتائج',

    'footer.company': 'الشركة',
    'footer.customer': 'العميل',
    'footer.contact': 'تواصل',
    'footer.rights': 'جميع الحقوق محفوظة.',
    'footer.track': 'تتبع الطلب',
    'footer.how': 'كيف يعمل',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.support': 'الدعم',
    'footer.desc': 'شريكك الموثوق للتسوق والشحن الدولي. نجلب أفضل منتجات العالم إلى بابك.',

    'lang.en': 'English',
    'lang.ku': 'Kurdish',
    'lang.ar': 'العربية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const direction: Direction = language === 'en' ? 'ltr' : 'rtl';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  useEffect(() => {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved && ['en', 'ku', 'ar'].includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

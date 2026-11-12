import { WebsiteContent, MultilingualText } from '../types';

export interface ValidationError {
  itemId?: string;
  itemTitle: string;
  sectionName: string;
  tab: 'home' | 'about' | 'services' | 'offers' | 'contact' | 'general' | 'products';
  subTab?: string;
  missingFields: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

function isBlank(str?: string): boolean {
  return !str || str.trim().length === 0;
}

function checkMultilingual(
  val: MultilingualText | undefined,
  fieldName: string
): string[] {
  const missing: string[] = [];
  if (isBlank(val?.en)) {
    missing.push(`${fieldName} (English)`);
  }
  if (isBlank(val?.ku)) {
    missing.push(`${fieldName} (Kurdish)`);
  } else if (/[a-zA-Z]/.test(val?.ku || '')) {
    missing.push(`${fieldName} (Kurdish cannot contain English letters)`);
  }
  if (isBlank(val?.ar)) {
    missing.push(`${fieldName} (Arabic)`);
  } else if (/[a-zA-Z]/.test(val?.ar || '')) {
    missing.push(`${fieldName} (Arabic cannot contain English letters)`);
  }
  return missing;
}

export function validateWebsiteContent(
  content: WebsiteContent,
  tab?: 'home' | 'about' | 'services' | 'offers' | 'contact' | 'general' | 'products'
): ValidationResult {
  const errors: ValidationError[] = [];

  // 1. SERVICES TAB VALIDATION
  if (!tab || tab === 'services') {
    const srv = content.services;
    if (srv) {
      // Services Offered List
      (srv.servicesList?.items || []).forEach((item, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(item.title, 'Service Title'));
        missing.push(...checkMultilingual(item.description, 'Service Description'));
        if (!item.tags || item.tags.length === 0 || item.tags.every((t) => isBlank(t))) {
          missing.push('Tags (comma separated)');
        }

        if (missing.length > 0) {
          const titlePreview = item.title?.en || item.title?.ku || item.title?.ar;
          errors.push({
            itemId: item.id,
            itemTitle: titlePreview ? `Service "${titlePreview}"` : `Service #${idx + 1}`,
            sectionName: '2. Services Offered (Cards)',
            tab: 'services',
            subTab: 'servicesList',
            missingFields: missing,
          });
        }
      });

      // Why Choose Us Advantages
      (srv.whyChoose?.items || []).forEach((adv, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(adv.title, 'Advantage Title'));
        missing.push(...checkMultilingual(adv.description, 'Advantage Description'));

        if (missing.length > 0) {
          const titlePreview = adv.title?.en || adv.title?.ku || adv.title?.ar;
          errors.push({
            itemId: adv.id,
            itemTitle: titlePreview ? `Advantage "${titlePreview}"` : `Advantage #${idx + 1}`,
            sectionName: '3. Why Choose Our Shipping',
            tab: 'services',
            subTab: 'whyChoose',
            missingFields: missing,
          });
        }
      });
    }
  }

  // 2. HOME TAB VALIDATION
  if (!tab || tab === 'home') {
    const home = content.home;
    if (home) {
      // How It Works Steps
      (home.howItWorks?.items || []).forEach((step, idx) => {
        const missing: string[] = [];
        if (isBlank(step.stepNumber)) missing.push('Step Number Label');
        missing.push(...checkMultilingual(step.title, 'Step Title'));
        missing.push(...checkMultilingual(step.description, 'Step Description'));

        if (missing.length > 0) {
          const titlePreview = step.title?.en || step.title?.ku || step.title?.ar;
          errors.push({
            itemId: step.id,
            itemTitle: titlePreview ? `Step "${titlePreview}"` : `Step #${idx + 1}`,
            sectionName: '2. How It Works (Steps)',
            tab: 'home',
            subTab: 'howItWorks',
            missingFields: missing,
          });
        }
      });

      // Global Websites
      (home.globalWebsites?.items || []).forEach((site, idx) => {
        const missing: string[] = [];
        if (isBlank(site.name)) missing.push('Website Name');
        if (isBlank(site.url)) missing.push('Destination Website URL');

        if (missing.length > 0) {
          errors.push({
            itemId: site.id,
            itemTitle: site.name ? `Website "${site.name}"` : `Website #${idx + 1}`,
            sectionName: '3. Global Websites',
            tab: 'home',
            subTab: 'globalWebsites',
            missingFields: missing,
          });
        }
      });

      // Stats
      (home.stats?.items || []).forEach((st, idx) => {
        const missing: string[] = [];
        if (isBlank(st.value)) missing.push('Stat Metric / Number');
        missing.push(...checkMultilingual(st.label, 'Metric Label'));

        if (missing.length > 0) {
          errors.push({
            itemId: st.id,
            itemTitle: st.value ? `Metric "${st.value}"` : `Metric #${idx + 1}`,
            sectionName: '4. Performance Stats',
            tab: 'home',
            subTab: 'stats',
            missingFields: missing,
          });
        }
      });

      // Why Choose Us Features
      (home.features?.items || []).forEach((feat, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(feat.title, 'Feature Title'));
        missing.push(...checkMultilingual(feat.description, 'Feature Description'));

        if (missing.length > 0) {
          const titlePreview = feat.title?.en || feat.title?.ku || feat.title?.ar;
          errors.push({
            itemId: feat.id,
            itemTitle: titlePreview ? `Feature "${titlePreview}"` : `Feature Card #${idx + 1}`,
            sectionName: '5. Why Choose Us (Features)',
            tab: 'home',
            subTab: 'features',
            missingFields: missing,
          });
        }
      });
    }
  }

  // 3. ABOUT TAB VALIDATION
  if (!tab || tab === 'about') {
    const about = content.about;
    if (about) {
      // What We Do
      (about.whatWeDo?.items || []).forEach((item, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(item.title, 'Card Title'));
        missing.push(...checkMultilingual(item.description, 'Card Description'));

        if (missing.length > 0) {
          const titlePreview = item.title?.en || item.title?.ku || item.title?.ar;
          errors.push({
            itemId: item.id,
            itemTitle: titlePreview ? `Card "${titlePreview}"` : `Card #${idx + 1}`,
            sectionName: '3. What We Do (Cards)',
            tab: 'about',
            subTab: 'what',
            missingFields: missing,
          });
        }
      });

      // Values
      (about.values?.items || []).forEach((val, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(val.title, 'Value Title'));
        missing.push(...checkMultilingual(val.description, 'Value Description'));

        if (missing.length > 0) {
          const titlePreview = val.title?.en || val.title?.ku || val.title?.ar;
          errors.push({
            itemId: val.id,
            itemTitle: titlePreview ? `Value "${titlePreview}"` : `Value #${idx + 1}`,
            sectionName: '5. Our Values',
            tab: 'about',
            subTab: 'values',
            missingFields: missing,
          });
        }
      });

      // Process
      (about.process?.items || []).forEach((prc, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(prc.label, 'Step Label'));
        missing.push(...checkMultilingual(prc.description, 'Step Description'));

        if (missing.length > 0) {
          const titlePreview = prc.label?.en || prc.label?.ku || prc.label?.ar;
          errors.push({
            itemId: prc.id,
            itemTitle: titlePreview ? `Process Step "${titlePreview}"` : `Process Step #${idx + 1}`,
            sectionName: '6. Our Process',
            tab: 'about',
            subTab: 'process',
            missingFields: missing,
          });
        }
      });
    }
  }

  // 4. OFFERS TAB VALIDATION
  if (!tab || tab === 'offers') {
    const offers = content.offers;
    if (offers) {
      // Featured Deals
      (offers.featuredDeals?.items || []).forEach((deal, idx) => {
        const missing: string[] = [];
        if (isBlank(deal.discount)) missing.push('Discount Highlight (e.g. 20% OFF)');
        missing.push(...checkMultilingual(deal.title, 'Deal Title'));
        missing.push(...checkMultilingual(deal.description, 'Deal Description'));

        if (missing.length > 0) {
          const titlePreview = deal.title?.en || deal.title?.ku || deal.title?.ar;
          errors.push({
            itemId: deal.id,
            itemTitle: titlePreview ? `Deal "${titlePreview}"` : `Deal Card #${idx + 1}`,
            sectionName: '2. Featured Deals & Promos',
            tab: 'offers',
            subTab: 'featuredDeals',
            missingFields: missing,
          });
        }
      });

      // Store Deals / Coupon Codes
      (offers.storeDeals?.items || []).forEach((code, idx) => {
        const missing: string[] = [];
        if (isBlank(code.storeName)) missing.push('Store Name');
        if (isBlank(code.code)) missing.push('Coupon Code');
        missing.push(...checkMultilingual(code.description, 'Deal Description'));

        if (missing.length > 0) {
          errors.push({
            itemId: code.id,
            itemTitle: code.storeName ? `Store Deal "${code.storeName}"` : `Store Deal #${idx + 1}`,
            sectionName: '3. Store Coupon Codes',
            tab: 'offers',
            subTab: 'storeDeals',
            missingFields: missing,
          });
        }
      });
    }
  }

  // 5. CONTACT TAB VALIDATION
  if (!tab || tab === 'contact') {
    const contact = content.contact;
    if (contact) {
      // Office Locations
      (contact.officeLocations?.items || []).forEach((loc, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(loc.city, 'City Name'));
        missing.push(...checkMultilingual(loc.address, 'Address'));
        if (isBlank(loc.phone)) missing.push('Office Phone Number');

        if (missing.length > 0) {
          const cityPreview = loc.city?.en || loc.city?.ku || loc.city?.ar;
          errors.push({
            itemId: loc.id,
            itemTitle: cityPreview ? `Office "${cityPreview}"` : `Office Location #${idx + 1}`,
            sectionName: '3. Office Locations & Branches',
            tab: 'contact',
            subTab: 'offices',
            missingFields: missing,
          });
        }
      });

      // FAQ
      (contact.faq?.items || []).forEach((f, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(f.question, 'Question'));
        missing.push(...checkMultilingual(f.answer, 'Answer'));

        if (missing.length > 0) {
          const qPreview = f.question?.en || f.question?.ku || f.question?.ar;
          errors.push({
            itemId: f.id,
            itemTitle: qPreview ? `FAQ "${qPreview}"` : `FAQ Item #${idx + 1}`,
            sectionName: '4. Frequently Asked Questions',
            tab: 'contact',
            subTab: 'faq',
            missingFields: missing,
          });
        }
      });
    }
  }

  // 6. GENERAL TAB VALIDATION
  if (!tab || tab === 'general') {
    const gen = content.general;
    if (gen) {
      const missing: string[] = [];
      missing.push(...checkMultilingual(gen.companyName, 'Company Brand Name'));
      missing.push(...checkMultilingual(gen.tagline, 'Global Brand Tagline'));
      if (isBlank(gen.phone)) missing.push('Primary Phone Number');
      if (isBlank(gen.whatsapp)) missing.push('WhatsApp Hotline');
      if (isBlank(gen.email)) missing.push('Support Email');

      if (missing.length > 0) {
        errors.push({
          itemTitle: 'Footer & Brand Identity',
          sectionName: 'Footer & Brand Settings',
          tab: 'general',
          missingFields: missing,
        });
      }
    }
  }

  // 7. PRODUCTS TAB VALIDATION
  if (!tab || tab === 'products') {
    const prods = content.products;
    if (prods) {
      // Validate Coming Soon highlight cards
      (prods.comingSoon?.features || []).forEach((feat, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(feat.title, 'Highlight Title'));
        missing.push(...checkMultilingual(feat.description, 'Highlight Description'));

        if (missing.length > 0) {
          const titlePreview = feat.title?.en || feat.title?.ku || feat.title?.ar;
          errors.push({
            itemId: feat.id,
            itemTitle: titlePreview ? `Highlight "${titlePreview}"` : `Highlight Card #${idx + 1}`,
            sectionName: '1. Coming Soon Highlight Cards',
            tab: 'products',
            subTab: 'hero',
            missingFields: missing,
          });
        }
      });

      // Validate Product items
      (prods.items || []).forEach((prod, idx) => {
        const missing: string[] = [];
        missing.push(...checkMultilingual(prod.title, 'Product Title'));
        missing.push(...checkMultilingual(prod.description, 'Product Description'));
        if (
          prod.price === undefined ||
          prod.price === null ||
          Number(prod.price) <= 0 ||
          isNaN(Number(prod.price))
        ) {
          missing.push('Price (USD, must be greater than 0)');
        }
        if (isBlank(prod.category)) missing.push('Category');
        if (isBlank(prod.image)) missing.push('Product Image URL');

        if (missing.length > 0) {
          const titlePreview = prod.title?.en || prod.title?.ku || prod.title?.ar;
          errors.push({
            itemId: prod.id,
            itemTitle: titlePreview ? `Product "${titlePreview}"` : `Product #${idx + 1}`,
            sectionName: '2. Product Catalog',
            tab: 'products',
            subTab: 'catalog',
            missingFields: missing,
          });
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

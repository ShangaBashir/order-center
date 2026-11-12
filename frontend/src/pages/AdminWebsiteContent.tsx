import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, Layers,
  CheckCircle2, AlertTriangle,
  Truck, Tag, Phone, Home, ShoppingBag
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { websiteContentApi } from '../api';
import { useNavigationGuard } from '../context/NavigationGuardContext';
import { WebsiteContent } from '../types';

import { HomeCMS, HomeSubTab } from './website-cms/HomeCMS';
import { AboutCMS, AboutSubTab } from './website-cms/AboutCMS';
import { ServicesCMS, ServicesSubTab } from './website-cms/ServicesCMS';
import { OffersCMS, OffersSubTab } from './website-cms/OffersCMS';
import { ContactCMS, ContactSubTab } from './website-cms/ContactCMS';
import { GeneralCMS } from './website-cms/GeneralCMS';
import { ProductsCMS, ProductsSubTab } from './website-cms/ProductsCMS';
import { ValidationAlertModal } from './website-cms/CMSComponents';
import { validateWebsiteContent, ValidationError } from '../utils/contentValidator';

type MainTab = 'home' | 'about' | 'services' | 'offers' | 'contact' | 'general' | 'products';

interface PendingNav {
  type: 'mainTab' | 'subTab' | 'route' | 'back';
  target: string;
}

export const AdminWebsiteContent: React.FC = () => {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [originalContent, setOriginalContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Tab State
  const [mainTab, setMainTab] = useState<MainTab>('home');
  const [homeSubTab, setHomeSubTab] = useState<HomeSubTab>('hero');
  const [aboutSubTab, setAboutSubTab] = useState<AboutSubTab>('hero');
  const [servicesSubTab, setServicesSubTab] = useState<ServicesSubTab>('hero');
  const [offersSubTab, setOffersSubTab] = useState<OffersSubTab>('hero');
  const [contactSubTab, setContactSubTab] = useState<ContactSubTab>('hero');
  const [productsSubTab, setProductsSubTab] = useState<ProductsSubTab>('catalog');
  const navigate = useNavigate();

  // Confirmation & Validation Modals
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNav, setPendingNav] = useState<PendingNav | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);

  // Navigation Guard Context
  const { registerGuard } = useNavigationGuard();

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const data = await websiteContentApi.getContent();
      if (data) {
        setContent(data);
        setOriginalContent(JSON.parse(JSON.stringify(data)));
      }
    } catch (err) {
      console.error('Failed to load website content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync Unsaved Changes status
  useEffect(() => {
    if (!content || !originalContent) {
      setHasUnsavedChanges(false);
      return;
    }
    const isDirty = JSON.stringify(content) !== JSON.stringify(originalContent);
    setHasUnsavedChanges(isDirty);
  }, [content, originalContent]);

  // Hook into Navigation Guard for Sidebar Clicks
  useEffect(() => {
    const unregister = registerGuard((targetPath: string) => {
      if (hasUnsavedChanges) {
        setPendingNav({ type: 'route', target: targetPath });
        setShowUnsavedModal(true);
        return false;
      }
      return true;
    });
    return () => {
      unregister();
    };
  }, [hasUnsavedChanges, registerGuard]);
  // Intercept browser back/forward buttons with custom modal instead of browser native dialog
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
        setPendingNav({ type: 'back', target: '' });
        setShowUnsavedModal(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [hasUnsavedChanges]);

  const handleSave = async () => {
    if (!content) return;

    // Validate the current page's inputs before saving
    const validation = validateWebsiteContent(content, mainTab);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setShowValidationModal(true);
      return;
    }

    setSaving(true);
    try {
      await websiteContentApi.updateContent(content);
      setOriginalContent(JSON.parse(JSON.stringify(content)));
      setHasUnsavedChanges(false);
      setToastMessage('Changes saved & published live successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch (err: any) {
      alert('Failed to save website content: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleGoToError = (error: ValidationError) => {
    setShowValidationModal(false);
    if (error.tab && error.tab !== mainTab) {
      setMainTab(error.tab);
    }
    if (error.tab === 'home' && error.subTab) {
      setHomeSubTab(error.subTab as any);
    } else if (error.tab === 'about' && error.subTab) {
      setAboutSubTab(error.subTab as any);
    } else if (error.tab === 'services' && error.subTab) {
      setServicesSubTab(error.subTab as any);
    } else if (error.tab === 'offers' && error.subTab) {
      setOffersSubTab(error.subTab as any);
    } else if (error.tab === 'contact' && error.subTab) {
      setContactSubTab(error.subTab as any);
    } else if (error.tab === 'products' && error.subTab) {
      setProductsSubTab(error.subTab as any);
    }

    if (error.itemId) {
      setTimeout(() => {
        const el = document.getElementById(error.itemId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-red-500', 'ring-offset-2', 'bg-red-50/40', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-red-500', 'ring-offset-2', 'bg-red-50/40');
          }, 4000);
        }
      }, 300);
    }
  };

  const handleMainTabClick = (tab: MainTab) => {
    if (tab === mainTab) return;
    if (hasUnsavedChanges) {
      setPendingNav({ type: 'mainTab', target: tab });
      setShowUnsavedModal(true);
    } else {
      setMainTab(tab);
    }
  };

  const handleSubTabClick = (page: MainTab, subTabId: string) => {
    let currentActive = '';
    if (page === 'home') currentActive = homeSubTab;
    else if (page === 'about') currentActive = aboutSubTab;
    else if (page === 'services') currentActive = servicesSubTab;
    else if (page === 'offers') currentActive = offersSubTab;
    else if (page === 'contact') currentActive = contactSubTab;
    else if (page === 'products') currentActive = productsSubTab;

    if (subTabId === currentActive) return;

    if (hasUnsavedChanges) {
      setPendingNav({ type: 'subTab', target: subTabId });
      setShowUnsavedModal(true);
    } else {
      applySubTabSwitch(page, subTabId);
    }
  };

  const applySubTabSwitch = (page: MainTab, subTabId: string) => {
    if (page === 'home') setHomeSubTab(subTabId as HomeSubTab);
    else if (page === 'about') setAboutSubTab(subTabId as AboutSubTab);
    else if (page === 'services') setServicesSubTab(subTabId as ServicesSubTab);
    else if (page === 'offers') setOffersSubTab(subTabId as OffersSubTab);
    else if (page === 'contact') setContactSubTab(subTabId as ContactSubTab);
    else if (page === 'products') setProductsSubTab(subTabId as ProductsSubTab);
  };
  const confirmPendingNavigation = () => {
    // Discard edits by reverting to originalContent
    if (originalContent) {
      setContent(JSON.parse(JSON.stringify(originalContent)));
      setHasUnsavedChanges(false);
    }
    const nav = pendingNav;
    setShowUnsavedModal(false);
    setPendingNav(null);

    if (nav) {
      if (nav.type === 'mainTab') {
        setMainTab(nav.target as MainTab);
      } else if (nav.type === 'subTab') {
        applySubTabSwitch(mainTab, nav.target);
      } else if (nav.type === 'route') {
        navigate(nav.target);
      } else if (nav.type === 'back') {
        navigate(-1);
      }
    }
  };

  const saveAndLeave = async () => {
    if (!content) return;

    // Validate before saving on leave
    const validation = validateWebsiteContent(content, mainTab);
    if (!validation.isValid) {
      setShowUnsavedModal(false);
      setValidationErrors(validation.errors);
      setShowValidationModal(true);
      return;
    }

    setSaving(true);
    try {
      await websiteContentApi.updateContent(content);
      setOriginalContent(JSON.parse(JSON.stringify(content)));
      setHasUnsavedChanges(false);
      setToastMessage('Changes saved & published successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      const nav = pendingNav;
      setShowUnsavedModal(false);
      setPendingNav(null);

      if (nav) {
        if (nav.type === 'mainTab') {
          setMainTab(nav.target as MainTab);
        } else if (nav.type === 'subTab') {
          applySubTabSwitch(mainTab, nav.target);
        } else if (nav.type === 'route') {
          navigate(nav.target);
        } else if (nav.type === 'back') {
          navigate(-1);
        }
      }
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading || !content) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#711612] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-500">Loading website dynamic content...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const MAIN_TABS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: Layers },
    { id: 'services', label: 'Services', icon: Truck },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'general', label: 'Footer', icon: Globe },
    { id: 'products', label: 'Products', icon: ShoppingBag },
  ] as const;

  return (
    <AdminLayout>
      <div className="space-y-6 pb-20 max-w-7xl mx-auto">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto border-b border-slate-200/80 bg-white px-4 pt-2.5 pb-2 rounded-2xl border shadow-xs">
          {MAIN_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = mainTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleMainTabClick(tab.id)}
                className={`pb-2.5 px-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#711612] text-[#711612]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Page Editor Content - Each page has its own Save button at the bottom */}
        {mainTab === 'home' && (
          <HomeCMS
            data={content.home}
            onChange={(home) => setContent({ ...content, home })}
            activeSubTab={homeSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('home', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'about' && (
          <AboutCMS
            data={content.about}
            onChange={(about) => setContent({ ...content, about })}
            activeSubTab={aboutSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('about', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'services' && (
          <ServicesCMS
            data={content.services}
            onChange={(services) => setContent({ ...content, services })}
            activeSubTab={servicesSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('services', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'offers' && (
          <OffersCMS
            data={content.offers}
            onChange={(offers) => setContent({ ...content, offers })}
            activeSubTab={offersSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('offers', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'contact' && (
          <ContactCMS
            data={content.contact}
            onChange={(contact) => setContent({ ...content, contact })}
            activeSubTab={contactSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('contact', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'general' && (
          <GeneralCMS
            data={content.general}
            onChange={(general) => setContent({ ...content, general })}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {mainTab === 'products' && (
          <ProductsCMS
            data={content.products}
            onChange={(products) => setContent({ ...content, products })}
            activeSubTab={productsSubTab}
            onSelectSubTab={(tab) => handleSubTabClick('products', tab)}
            onSave={handleSave}
            saving={saving}
            hasUnsavedChanges={hasUnsavedChanges}
          />
        )}

        {/* Success Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold animate-slide-left">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}

                {/* Unsaved Navigation Guard Modal (for main tabs, sub tabs, sidebar routes, and browser back) */}
        {showUnsavedModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 border border-slate-200/80 relative animate-scale-up">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200/60 text-amber-700 flex items-center justify-center flex-shrink-0 shadow-inner border border-amber-300/40">
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">Unsaved Changes</h4>
                  <p className="text-xs text-slate-500 font-medium">You have modified content on this page</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-amber-50/90 to-orange-50/50 border border-amber-200/80 p-4 rounded-2xl text-xs text-amber-950 font-semibold leading-relaxed shadow-xs">
                Are you sure to leave cuz your data won't be saved if you close this page?
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowUnsavedModal(false);
                    setPendingNav(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition"
                >
                  Stay on Page
                </button>
                <button
                  type="button"
                  onClick={confirmPendingNavigation}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition"
                >
                  Leave Without Saving
                </button>
                <button
                  type="button"
                  onClick={saveAndLeave}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#5E120F] hover:to-[#711612] text-white transition shadow-md shadow-[#711612]/30 flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : 'Save & Leave'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Incomplete Inputs Validation Modal */}
        <ValidationAlertModal
          isOpen={showValidationModal}
          errors={validationErrors}
          onClose={() => setShowValidationModal(false)}
          onGoToError={handleGoToError}
        />
      </div>
    </AdminLayout>
  );
};

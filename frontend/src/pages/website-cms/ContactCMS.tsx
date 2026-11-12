import React, { useState } from 'react';
import { Plus, Trash2, ChevronRight, MapPin } from 'lucide-react';
import { ContactPageContent, OfficeLocationItem, ContactFaqItem } from '../../types';
import { PageSaveBar, ConfirmDeleteModal, TrilingualInput, ImageUploadZone , scrollToNewItem } from './CMSComponents';

export type ContactSubTab = 'hero' | 'direct' | 'form' | 'offices' | 'faq' | 'cta';

export const CONTACT_SUB_TABS: { id: ContactSubTab; label: string }[] = [
  { id: 'hero', label: '1. Hero & Header' },
  { id: 'direct', label: '2. Phone & Direct Channels' },
  { id: 'form', label: '3. Direct Inquiry Form' },
  { id: 'offices', label: '4. Office Locations & Interactive Map' },
  { id: 'faq', label: '5. Frequently Asked Questions' },
  { id: 'cta', label: '6. Bottom Call To Action (CTA)' },
];

export const ContactCMS: React.FC<{
  data: ContactPageContent;
  onChange: (updated: ContactPageContent) => void;
  activeSubTab: ContactSubTab;
  onSelectSubTab: (tab: ContactSubTab) => void;
  onSave?: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ data, onChange, activeSubTab, onSelectSubTab, onSave, saving, hasUnsavedChanges }) => {
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const triggerDeleteConfirm = (title: string, message: string, onConfirm: () => void) => {
    setDeleteModal({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const update = (partial: Partial<ContactPageContent>) => {
    onChange({ ...data, ...partial });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1 space-y-1.5">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Contact Sub-Pages
        </div>
        {CONTACT_SUB_TABS.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSubTab(tab.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                isActive
                  ? 'bg-gradient-to-r from-[#711612] to-[#94201C] text-white shadow-md shadow-[#711612]/20'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              <span className="truncate">{tab.label}</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform ${
                  isActive ? 'text-[#D4AF37] translate-x-0.5' : 'text-slate-400 group-hover:translate-x-0.5'
                }`}
              />
            </button>
          );
        })}

        </div>

      <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        {activeSubTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 1. Hero & Header
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Top banner and page headline for the contact page.</p>
            </div>
            <TrilingualInput
              label="Page Badge"
              value={data.hero.badge}
              onChange={(badge) => update({ hero: { ...data.hero, badge } })}
            />
            <TrilingualInput
              label="Page Title"
              value={data.hero.title}
              onChange={(title) => update({ hero: { ...data.hero, title } })}
            />
            <TrilingualInput
              label="Page Subtitle / Description"
              value={data.hero.description}
              onChange={(description) => update({ hero: { ...data.hero, description } })}
              isTextarea
              rows={2}
            />
            <ImageUploadZone
              label="Banner Image"
              imageValue={data.hero.bannerImage}
              onImageChange={(bannerImage) => update({ hero: { ...data.hero, bannerImage } })}
            />
          </div>
        )}

        {activeSubTab === 'direct' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 2. Phone & Support Channels
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Customer service phone, WhatsApp line, email and working hours.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Hotline Phone #1
                </label>
                <input
                  type="text"
                  value={data.directChannels.phone}
                  onChange={(e) =>
                    update({ directChannels: { ...data.directChannels, phone: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                  placeholder="+964 750 000 0000"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Hotline Phone #2
                </label>
                <input
                  type="text"
                  value={data.directChannels.secondaryPhone || ''}
                  onChange={(e) =>
                    update({ directChannels: { ...data.directChannels, secondaryPhone: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                  placeholder="+964 770 000 0000"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  WhatsApp Helpline
                </label>
                <input
                  type="text"
                  value={data.directChannels.whatsapp}
                  onChange={(e) =>
                    update({ directChannels: { ...data.directChannels, whatsapp: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                  placeholder="+964 750 000 0000"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Official Email
                </label>
                <input
                  type="text"
                  value={data.directChannels.email}
                  onChange={(e) =>
                    update({ directChannels: { ...data.directChannels, email: e.target.value } })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                  placeholder="support@ordercenter.iq"
                />
              </div>
            </div>

            <TrilingualInput
              label="Working Hours Text"
              value={data.directChannels.workingHours}
              onChange={(workingHours) =>
                update({ directChannels: { ...data.directChannels, workingHours } })
              }
            />

            <TrilingualInput
              label="Support Response Note"
              value={data.directChannels.supportNote}
              onChange={(supportNote) =>
                update({ directChannels: { ...data.directChannels, supportNote } })
              }
            />
          </div>
        )}

        {activeSubTab === 'form' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span className="text-[#711612]">→</span> 3. Direct Inquiry Form
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Customize the headings, labels, button text, and success confirmation for the inquiry form.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Form Section Badge"
                value={data.inquiryForm?.badge || { en: 'Direct Assistance', ku: 'هاوکاری ڕاستەوخۆ', ar: 'مساعدة مباشرة' }}
                onChange={(badge) =>
                  update({ inquiryForm: { ...(data.inquiryForm || {}), badge } })
                }
              />
              <TrilingualInput
                label="Submit Button Text"
                value={data.inquiryForm?.submitButtonText || { en: 'Send Message', ku: 'ناردنی پەیام', ar: 'إرسال الرسالة' }}
                onChange={(submitButtonText) =>
                  update({ inquiryForm: { ...(data.inquiryForm || {}), submitButtonText } })
                }
              />
            </div>

            <TrilingualInput
              label="Form Section Title"
              value={data.inquiryForm?.title || { en: 'Send Us a Direct Inquiry', ku: 'پەیامێکی ڕاستەوخۆمان بۆ بنێرە', ar: 'أرسل لنا استفساراً مباشراً' }}
              onChange={(title) =>
                update({ inquiryForm: { ...(data.inquiryForm || {}), title } })
              }
            />

            <TrilingualInput
              label="Form Section Description"
              value={data.inquiryForm?.description || { en: 'Fill in your details below and we will connect with you right away.', ku: 'زانیارییەکانت لە خوارەوە پڕبکەرەوە و دەستبەجێ پەیوەندیت پێوە دەکەین.', ar: 'املأ بياناتك أدناه وسنتواصل معك على الفور.' }}
              onChange={(description) =>
                update({ inquiryForm: { ...(data.inquiryForm || {}), description } })
              }
              isTextarea
              rows={2}
            />

            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Form Submission Confirmation Card
              </h4>
              <TrilingualInput
                label="Success Title"
                value={data.inquiryForm?.successTitle || { en: 'Message Sent Successfully!', ku: 'پەیامەکەت بە سەرکەوتوویی نێردرا!', ar: 'تم إرسال الرسالة بنجاح!' }}
                onChange={(successTitle) =>
                  update({ inquiryForm: { ...(data.inquiryForm || {}), successTitle } })
                }
              />
              <TrilingualInput
                label="Success Description"
                value={data.inquiryForm?.successMessage || { en: 'Thank you for reaching out. A WhatsApp chat was initiated with our support desk, and one of our logistics specialists will assist you momentarily.', ku: 'سوپاس بۆ پەیوەندیکردنت. چاتی واتسئەپ دەستی پێکرد و پسپۆڕەکانمان هاوکاریت دەکەن.', ar: 'شكراً لتواصلك معنا. تم فتح محادثة واتساب وسيقوم أحد خبرائنا بمساعدتك فوراً.' }}
                onChange={(successMessage) =>
                  update({ inquiryForm: { ...(data.inquiryForm || {}), successMessage } })
                }
                isTextarea
                rows={2}
              />
            </div>
          </div>
        )}

        {activeSubTab === 'offices' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 4. Office Locations & Interactive Map
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Physical branches, headquarters address, district, landmarks, and exact Google Map coordinates.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: OfficeLocationItem = {
                    id: `loc-${Date.now()}`,
                    city: { en: 'Sulaymaniyah', ku: 'سلێمانی', ar: 'السليمانية' },
                    name: { en: 'Order Center — Sulaimany Hub', ku: 'ئۆردەر سەنتەر — لقی سلێمانی', ar: 'أوردر سنتر — فرع السليمانية' },
                    address: { en: 'Bakhtyari, near Falafelo Fast Food, Sulaimaniyah, Iraq', ku: 'بەختیاری، نزیک خواردنی خێرای فەلافێلۆ، سلێمانی، عێراق', ar: 'بختياري، قرب وجبات فلافيلو السريعة، السليمانية، العراق' },
                    district: { en: 'Bakhtyari', ku: 'بەختیاری', ar: 'بختياري' },
                    landmark: { en: 'Near Falafelo Fast Food', ku: 'نزیک خواردنی خێرای فەلافێلۆ', ar: 'قرب وجبات فلافيلو السريعة' },
                    phone: '0770 156 6233',
                    workingHours: { en: '9:00 AM – 9:00 PM', ku: '٩:٠٠ بەیانی – ٩:٠٠ شەو', ar: '9:00 ص – 9:00 م' },
                    mapCoordinates: '35.5712825,45.3985297',
                    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297',
                  };
                  update({ officeLocations: { ...data.officeLocations, items: [...data.officeLocations.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TrilingualInput
                label="Section Badge"
                value={data.officeLocations.label}
                onChange={(label) => update({ officeLocations: { ...data.officeLocations, label } })}
              />
              <TrilingualInput
                label="Section Title"
                value={data.officeLocations.title}
                onChange={(title) => update({ officeLocations: { ...data.officeLocations, title } })}
              />
            </div>

            <TrilingualInput
              label="Section Subtitle / Description"
              value={data.officeLocations.description || { en: 'Visit our physical office in Sulaymaniyah for parcel pick-up, local payment, or in-person logistics consultations.', ku: 'سەردانی ئۆفیسی سلێمانی بکە بۆ وەرگرتنی کەرەستەکان، پارەدان، یان ڕاوێژکاری بارکردن.', ar: 'تفضل بزيارة مكتبنا الفعلي في السليمانية لاستلام الطرود أو الدفع المحلي أو الاستشارات اللوجستية.' }}
              onChange={(description) => update({ officeLocations: { ...data.officeLocations, description } })}
              isTextarea
              rows={2}
            />

            <div className="space-y-6 pt-2">
              {data.officeLocations.items.map((loc, idx) => (
                <div key={loc.id} id={loc.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-4 shadow-xs transition-all">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#711612] text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      <MapPin className="w-4 h-4 text-[#711612]" />
                      <span>{loc.name?.en || loc.city?.en || 'Branch Location'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete Office Location',
                          `Are you sure you want to delete "${loc.name?.en || loc.city?.en || 'this location'}"? This action cannot be undone.`,
                          () => {
                            update({
                              officeLocations: {
                                ...data.officeLocations,
                                items: data.officeLocations.items.filter((l) => l.id !== loc.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Branch</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TrilingualInput
                      label="Branch / Hub Name"
                      value={loc.name}
                      onChange={(name) => {
                        const updated = data.officeLocations.items.map((l) => (l.id === loc.id ? { ...l, name } : l));
                        update({ officeLocations: { ...data.officeLocations, items: updated } });
                      }}
                    />
                    <TrilingualInput
                      label="City Name & Country"
                      value={loc.city}
                      onChange={(city) => {
                        const updated = data.officeLocations.items.map((l) => (l.id === loc.id ? { ...l, city } : l));
                        update({ officeLocations: { ...data.officeLocations, items: updated } });
                      }}
                    />
                  </div>

                  <TrilingualInput
                    label="Full Physical Address"
                    value={loc.address}
                    onChange={(address) => {
                      const updated = data.officeLocations.items.map((l) =>
                        l.id === loc.id ? { ...l, address } : l
                      );
                      update({ officeLocations: { ...data.officeLocations, items: updated } });
                    }}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TrilingualInput
                      label="District / Neighborhood"
                      value={loc.district || { en: '', ku: '', ar: '' }}
                      onChange={(district) => {
                        const updated = data.officeLocations.items.map((l) =>
                          l.id === loc.id ? { ...l, district } : l
                        );
                        update({ officeLocations: { ...data.officeLocations, items: updated } });
                      }}
                    />
                    <TrilingualInput
                      label="Landmark / Nearby Spot"
                      value={loc.landmark || { en: '', ku: '', ar: '' }}
                      onChange={(landmark) => {
                        const updated = data.officeLocations.items.map((l) =>
                          l.id === loc.id ? { ...l, landmark } : l
                        );
                        update({ officeLocations: { ...data.officeLocations, items: updated } });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Branch Phone / Hotline
                      </label>
                      <input
                        type="text"
                        value={loc.phone}
                        onChange={(e) => {
                          const updated = data.officeLocations.items.map((l) =>
                            l.id === loc.id ? { ...l, phone: e.target.value } : l
                          );
                          update({ officeLocations: { ...data.officeLocations, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold bg-white"
                        placeholder="0770 156 6233"
                      />
                    </div>
                    <TrilingualInput
                      label="Branch Hours"
                      value={loc.workingHours}
                      onChange={(workingHours) => {
                        const updated = data.officeLocations.items.map((l) =>
                          l.id === loc.id ? { ...l, workingHours } : l
                        );
                        update({ officeLocations: { ...data.officeLocations, items: updated } });
                      }}
                    />
                  </div>

                  {/* Exact Map GPS Coordinates & Direct Link */}
                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-3.5 rounded-xl border">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        GPS Coordinates (Latitude, Longitude)
                      </label>
                      <input
                        type="text"
                        value={loc.mapCoordinates || ''}
                        onChange={(e) => {
                          const updated = data.officeLocations.items.map((l) =>
                            l.id === loc.id ? { ...l, mapCoordinates: e.target.value } : l
                          );
                          update({ officeLocations: { ...data.officeLocations, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono bg-slate-50"
                        placeholder="35.5712825,45.3985297"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Controls the interactive map embed center and pin.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Google Maps Open / Directions URL
                      </label>
                      <input
                        type="text"
                        value={loc.googleMapsUrl || ''}
                        onChange={(e) => {
                          const updated = data.officeLocations.items.map((l) =>
                            l.id === loc.id ? { ...l, googleMapsUrl: e.target.value } : l
                          );
                          update({ officeLocations: { ...data.officeLocations, items: updated } });
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-mono bg-slate-50"
                        placeholder="https://www.google.com/maps/search/?api=1&query=35.5712825,45.3985297"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Target link when clicking "View Map", "Get Directions", or "Open in Maps".
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'faq' && (
          <div className="space-y-6 animate-fade-in">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 4. Frequently Asked Questions (FAQ)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Accordion questions and answers for shoppers.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newItem: ContactFaqItem = {
                    id: `faq-${Date.now()}`,
                    question: { en: '', ku: '', ar: '' },
                    answer: { en: '', ku: '', ar: '' },
                  };
                  update({ faq: { ...data.faq, items: [...data.faq.items, newItem] } });
                  scrollToNewItem(newItem.id);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#711612] text-white text-xs font-bold hover:bg-[#5A0E0B] transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {data.faq.items.map((f, idx) => (
                <div key={f.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">FAQ Item #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() =>
                        triggerDeleteConfirm(
                          'Delete FAQ Item',
                          `Are you sure you want to delete "${f.question?.en || 'this FAQ item'}"? This action cannot be undone.`,
                          () => {
                            update({
                              faq: {
                                ...data.faq,
                                items: data.faq.items.filter((item) => item.id !== f.id),
                              },
                            });
                          }
                        )
                      }
                      className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <TrilingualInput
                    label="Question"
                    value={f.question}
                    onChange={(question) => {
                      const updated = data.faq.items.map((item) => (item.id === f.id ? { ...item, question } : item));
                      update({ faq: { ...data.faq, items: updated } });
                    }}
                  />

                  <TrilingualInput
                    label="Answer"
                    value={f.answer}
                    onChange={(answer) => {
                      const updated = data.faq.items.map((item) => (item.id === f.id ? { ...item, answer } : item));
                      update({ faq: { ...data.faq, items: updated } });
                    }}
                    isTextarea
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === 'cta' && (() => {
          const ctaData = data.cta || {
            title: { en: 'Still have a question? Our support is live right now.', ku: 'هێشتا پرسیارت هەیە؟ تیمی پشتیوانیمان لەسەر هێڵن.', ar: 'هل لديك استفسار آخر؟ فريق الدعم متاح الآن لمساعدتك.' },
            subtitle: { en: 'Message our WhatsApp support directly for fast answers within minutes.', ku: 'ڕاستەوخۆ لە واتسئەپەوە نامە بنێرە بۆ وەڵامدانەوەی خێرا لە چەند خولەکێکدا.', ar: 'راسلنا مباشرة عبر واتساب للحصول على إجابات فورية خلال دقائق.' },
            primaryBtn: { en: 'Chat on WhatsApp', ku: 'گفتوگۆ لە واتسئەپ', ar: 'محادثة عبر واتساب' }
          };

          return (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="text-[#711612]">→</span> 6. Bottom Call To Action (CTA)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">The closing banner on the contact page.</p>
              </div>
              <TrilingualInput
                label="CTA Title"
                value={ctaData.title}
                onChange={(title) => update({ cta: { ...ctaData, title } })}
              />
              <TrilingualInput
                label="CTA Subtitle"
                value={ctaData.subtitle}
                onChange={(subtitle) => update({ cta: { ...ctaData, subtitle } })}
                isTextarea
                rows={2}
              />
              <TrilingualInput
                label="Button Text"
                value={ctaData.primaryBtn}
                onChange={(primaryBtn) => update({ cta: { ...ctaData, primaryBtn } })}
              />
            </div>
          );
        })()}

        <PageSaveBar onSave={onSave} saving={saving} hasUnsavedChanges={hasUnsavedChanges} pageName="Contact" />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.open}
        title={deleteModal.title}
        message={deleteModal.message}
        onCancel={() => setDeleteModal({ open: false, title: '', message: '', onConfirm: () => {} })}
        onConfirm={() => {
          deleteModal.onConfirm();
          setDeleteModal({ open: false, title: '', message: '', onConfirm: () => {} });
        }}
      />
      </div>
    </div>
  );
};

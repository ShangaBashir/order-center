import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowLeft, CheckCircle2, User, Phone, Mail, MapPin, FileText, Hash } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { customerApi } from '../api';

export const AddCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<{ id: string; name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessNotice(null);

    try {
      const res = await customerApi.createCustomer(formData);
      setSuccessNotice({
        id: res.customerId || res.customer.customerId,
        name: res.customer.name
      });
      setTimeout(() => {
        navigate('/admin/customers');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to register customer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Add New Customer">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Navigation back */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/customers"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#711612] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Customers Directory</span>
          </Link>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] p-6 text-white border-b border-[#D4AF37]/30 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                <UserPlus className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display tracking-wide">Register New Customer</h1>
                <p className="text-xs text-white/80 mt-0.5">
                  System will automatically assign a unique customer ID (e.g. CUST-1006).
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/30 border border-[#D4AF37]/40 text-xs font-mono text-[#D4AF37]">
              <Hash className="w-3.5 h-3.5" />
              <span>Auto Customer ID</span>
            </div>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">Customer Successfully Created!</div>
                <div className="text-xs text-emerald-700 mt-0.5">
                  Assigned ID <span className="font-mono font-bold">{successNotice.id}</span> for {successNotice.name}. Redirecting to directory...
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Main Form Body */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
            
            {/* Customer Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#711612] flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="w-4 h-4 text-[#711612]" />
                <span>Customer Profile Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Shanga Bashir"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 07701566233"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-[#711612] border font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. customer@example.com"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="e.g. Salim Street, Sulaimanyiah, Iraq"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Internal Notes / Preferred Delivery Details
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="e.g. VIP Customer, prefers afternoon deliveries or WhatsApp contact."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                  />
                </div>
              </div>
            </div>

            {/* Form Footer Action */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <Link
                to="/admin/customers"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] transition shadow-lg shadow-red-950/30 flex items-center gap-2 border border-[#D4AF37]/30 disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span>Save Customer & Assign ID</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </AdminLayout>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Search, UserPlus, Trash2, Hash, Tag, Plus } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { customerApi } from '../api';
import { Customer } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSettings } from '../context/SettingsContext';

export const AdminCustomers: React.FC = () => {
  const { formatPriceWithIqd } = useSettings();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmCust, setDeleteConfirmCust] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleDeleteCustomer = async (id: string) => {
    setIsDeleting(true);
    try {
      await customerApi.deleteCustomer(id);
      await loadCustomers();
    } finally {
      setIsDeleting(false);
      setDeleteConfirmCust(null);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      (c.customerId && c.customerId.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  return (
    <AdminLayout title="Customers Directory">
      <div className="space-y-6">
        
        {/* Header Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Customers Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Registered customers directory with auto-generated unique Customer IDs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/add-customer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#711612] to-[#8B1E1A] text-white font-bold text-sm rounded-xl hover:from-[#8B1E1A] hover:to-[#711612] transition shadow-md border border-[#D4AF37]/30"
            >
              <UserPlus className="w-4 h-4 text-[#D4AF37]" />
              <span>+ Add Customer</span>
            </Link>
          </div>
        </div>

        {/* Filter / Search Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-semibold text-slate-700">
            Total Registered Customers: <span className="text-[#711612] font-mono font-bold text-base ml-1">{filteredCustomers.length}</span>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID (e.g. CUST-1001), name, phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 bg-slate-50 text-slate-800"
            />
          </div>
        </div>

        {/* Customer Grid */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-3 border-[#711612] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading customer directory...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <UserPlus className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">No Customers Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                No customer profiles match your search criteria. You can register a new customer with a unique Customer ID.
              </p>
            </div>
            <Link
              to="/admin/add-customer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#711612] text-white text-sm font-bold rounded-xl hover:bg-[#8B1E1A] transition shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Customer</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCustomers.map(cust => (
              <div 
                key={cust._id || cust.customerId} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Header Profile Bar */}
                <div className="p-5 border-b border-slate-100 relative">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#711612] to-[#8B1E1A] text-white font-bold flex items-center justify-center text-base shadow-md group-hover:scale-105 transition-transform">
                        {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 group-hover:text-[#711612] transition-colors leading-tight">
                          {cust.name}
                        </h3>
                        {/* Unique Customer ID Badge */}
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md bg-amber-50 text-[#711612] border border-[#D4AF37]/40 text-[11px] font-mono font-bold">
                          <Hash className="w-3 h-3 text-[#D4AF37]" />
                          <span>{cust.customerId}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteConfirmCust(cust)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Customer Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 space-y-3 text-xs text-slate-600 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-[#711612] flex-shrink-0" />
                    <a href={`tel:${cust.phone}`} className="hover:underline font-semibold font-mono text-slate-800">
                      {cust.phone}
                    </a>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-[#711612] flex-shrink-0" />
                    <span className="truncate">{cust.email || 'N/A'}</span>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#711612] flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{cust.address}</span>
                  </div>

                  {cust.notes && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#711612] flex-shrink-0 mt-0.5" />
                      <span>{cust.notes}</span>
                    </div>
                  )}
                </div>

                {/* Footer Orders Stats */}
                <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">{cust.totalOrders || 1} Orders Placed</span>
                  <span className="text-[#711612] font-bold text-sm">
                    {formatPriceWithIqd(cust.totalSpent || 0).combinedStr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmCust}
        title="Delete Customer Profile"
        message={deleteConfirmCust ? `Are you sure you want to delete customer ${deleteConfirmCust.name} (${deleteConfirmCust.customerId})?` : ''}
        confirmText="Delete Customer"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={() => deleteConfirmCust && handleDeleteCustomer(deleteConfirmCust._id || deleteConfirmCust.customerId)}
        onCancel={() => setDeleteConfirmCust(null)}
      />
    </AdminLayout>
  );
};

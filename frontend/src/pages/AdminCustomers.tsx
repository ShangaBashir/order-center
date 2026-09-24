import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Search } from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder } from '../types';

export const AdminCustomers: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    orderApi.getOrders().then(setOrders).catch(console.error);
  }, []);

  // Group customer profiles from orders
  const customerMap = new Map<string, { name: string; phone: string; email: string; address: string; totalOrders: number; totalSpent: number }>();

  orders.forEach(ord => {
    const key = ord.phone.trim() || ord.customerName.trim();
    const existing = customerMap.get(key);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += ord.totalPrice;
    } else {
      customerMap.set(key, {
        name: ord.customerName,
        phone: ord.phone,
        email: ord.email || 'N/A',
        address: ord.address,
        totalOrders: 1,
        totalSpent: ord.totalPrice
      });
    }
  });

  const customerList = Array.from(customerMap.values()).filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Customers Directory">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Registered Customers ({customerList.length})</h2>
            <p className="text-xs text-slate-500">Directory of customers derived from active orders.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search customer name, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#711612] bg-white shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customerList.map((cust, i) => (
            <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition space-y-3">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="w-10 h-10 rounded-full bg-[#711612] text-white font-bold flex items-center justify-center text-sm shadow">
                  {cust.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{cust.name}</h3>
                  <div className="text-[11px] text-slate-400">Customer</div>
                </div>
              </div>

              <div className="text-xs space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#711612]" />
                  <a href={`tel:${cust.phone}`} className="hover:underline font-semibold">{cust.phone}</a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#711612]" />
                  <span>{cust.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#711612] flex-shrink-0 mt-0.5" />
                  <span className="truncate">{cust.address}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-500">{cust.totalOrders} Orders Placed</span>
                <span className="text-[#711612] font-bold">${cust.totalSpent.toFixed(2)} Spent</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

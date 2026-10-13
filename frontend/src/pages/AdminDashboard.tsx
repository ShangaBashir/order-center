import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, CheckCircle2, Search, PlusCircle,
  Eye, TrendingUp, ChevronLeft, ChevronRight, Building2
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { formatDisplayDate } from '../utils/formatters';

const ITEMS_PER_PAGE = 10;

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Stats calculation
  const totalOrders = orders.length;
  const purchasedOrders = orders.filter(o => o.status === 'Purchased').length;
  const inOfficeOrders = orders.filter(o => o.status === 'In Office').length;
  const arrivedOrders = orders.filter(o => o.status === 'Arrived').length;

  // Filtered recent orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination calculation
  const totalFilteredOrders = filteredOrders.length;
  const totalPages = Math.ceil(totalFilteredOrders / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalFilteredOrders);
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, note?: string) => {
    await orderApi.updateOrderStatus(orderId, status, note);
    await loadOrders();
    if (selectedOrder && selectedOrder.orderId === orderId) {
      const updated = await orderApi.getOrder(orderId);
      setSelectedOrder(updated);
    }
  };

  const handleSaveEdit = async (orderId: string, updates: Partial<AdminOrder>) => {
    await orderApi.updateOrder(orderId, updates);
    await loadOrders();
  };

  const handleDeleteOrder = async (orderId: string) => {
    await orderApi.deleteOrder(orderId);
    await loadOrders();
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Arrived':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Office':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Purchased':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-[#2C2C2C] space-y-8">
        
        {/* Top Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Welcome Back, Admin</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time overview of customer orders and logistics operations.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/add-order"
              className="px-4 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 border border-[#D4AF37]/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Order</span>
            </Link>
          </div>
        </div>

        {/* 4 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Orders */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
              <div className="p-2 rounded-md bg-slate-100 text-slate-700">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-3">{totalOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span>All registered orders</span>
            </div>
          </div>

          {/* Purchased */}
          <div className="bg-white p-5 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Purchased</span>
              <div className="p-2 rounded-md bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-3">{purchasedOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Item bought from supplier</div>
          </div>

          {/* In Office */}
          <div className="bg-white p-5 rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">In Office</span>
              <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-3">{inOfficeOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Processing at office hub</div>
          </div>

          {/* Arrived */}
          <div className="bg-white p-5 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Arrived</span>
              <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-3">{arrivedOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Arrived & ready</div>
          </div>

        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          
          {/* Filter & Search Header */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-slate-800">Recent Customer Orders</h3>
              <p className="text-xs text-slate-500">Search and filter active shipments</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#711612] bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses ({ALL_ORDER_STATUSES.length})</option>
                {ALL_ORDER_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Est. Delivery</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No orders match your search criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(ord => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#711612]">
                        {ord.orderId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{ord.customerName}</div>
                        <div className="text-[10px] text-slate-400">{ord.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate font-medium">
                        {ord.productName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {formatDisplayDate(ord.estimatedDelivery)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 bg-[#711612]/10 hover:bg-[#711612] text-[#711612] hover:text-white rounded font-semibold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{totalFilteredOrders > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-[#711612] font-mono">{totalFilteredOrders}</span> Orders
              <span className="ml-2 text-slate-400">(Page {currentPage} of {totalPages})</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 rounded border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px]"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 font-semibold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded text-[11px] font-bold transition ${
                      currentPage === page
                        ? 'bg-[#711612] text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-200 border border-slate-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-2.5 py-1 rounded border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-[11px]"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
        onEditOrder={ord => { setEditOrder(ord); setSelectedOrder(null); }}
        onDeleteOrder={handleDeleteOrder}
      />

      <EditOrderModal
        order={editOrder}
        onClose={() => setEditOrder(null)}
        onSave={handleSaveEdit}
      />
    </AdminLayout>
  );
};

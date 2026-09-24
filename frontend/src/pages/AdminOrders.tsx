import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, PlusCircle, RefreshCw, Eye, Edit, Trash2, Filter, ArrowUpDown
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { EditOrderModal } from '../components/EditOrderModal';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'>('date_desc');

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error loading orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

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

  // Filter & Sort logic
  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.orderId.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.phone.toLowerCase().includes(q) ||
      (o.trackingNumber && o.trackingNumber.toLowerCase().includes(q)) ||
      o.productName.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    if (sortBy === 'date_asc') return new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
    if (sortBy === 'price_desc') return b.totalPrice - a.totalPrice;
    if (sortBy === 'price_asc') return a.totalPrice - b.totalPrice;
    return 0;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
      case 'In Transit':
      case 'Shipped':
      case 'Out for Delivery': return 'bg-amber-100 text-amber-800 border-amber-300';
      default: return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <AdminLayout title="Order Management">
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">All Customer Orders ({orders.length})</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage, update status, and track order lifecycles.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="p-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition"
              title="Refresh order table"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/add-order"
              className="px-4 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 border border-[#D4AF37]/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Order</span>
            </Link>
          </div>
        </div>

        {/* Filter and Search Toolbar */}
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Customer, Tracking..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-md focus:border-[#711612] bg-white shadow-sm"
            />
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white font-medium text-slate-700 shadow-sm"
              >
                <option value="ALL">All Statuses ({orders.length})</option>
                {ALL_ORDER_STATUSES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white font-medium text-slate-700 shadow-sm"
              >
                <option value="date_desc">Newest First</option>
                <option value="date_asc">Oldest First</option>
                <option value="price_desc">Highest Price</option>
                <option value="price_asc">Lowest Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Complete Order Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Tracking #</th>
                  <th className="py-3.5 px-4">Est. Delivery</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No orders found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  sortedOrders.map(ord => (
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
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        ${ord.totalPrice.toFixed(2)} {ord.currency}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {ord.trackingNumber || <span className="text-slate-300">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {ord.estimatedDelivery || 'Pending'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-[#711612] text-slate-700 hover:text-white transition"
                            title="View Order Details & Timeline"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditOrder(ord)}
                            className="p-1.5 rounded bg-slate-100 hover:bg-[#711612] text-slate-700 hover:text-white transition"
                            title="Edit Order Info"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete order ${ord.orderId}?`)) {
                                handleDeleteOrder(ord.orderId);
                              }
                            }}
                            className="p-1.5 rounded bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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

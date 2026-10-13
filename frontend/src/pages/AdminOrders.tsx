import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search, PlusCircle, Eye, Edit, Trash2, Filter, ArrowUpDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder, OrderStatus, ALL_ORDER_STATUSES } from '../types';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { EditOrderModal } from '../components/EditOrderModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useSettings } from '../context/SettingsContext';
import { useRealtimeOrders, broadcastLocalOrderEvent } from '../utils/realtime';

const ITEMS_PER_PAGE = 10;

export const AdminOrders: React.FC = () => {
  const { formatPriceWithIqd } = useSettings();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || searchParams.get('customer') || searchParams.get('q') || ''
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'price_desc' | 'price_asc'>('date_desc');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);
  const [deleteFirstConfirm, setDeleteFirstConfirm] = useState<AdminOrder | null>(null);
  const [deleteSecondConfirm, setDeleteSecondConfirm] = useState<AdminOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Reset pagination on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy]);

  // Synchronize URL query params (for jumping to customer orders or specific order)
  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('customer') || searchParams.get('q');
    if (q && q !== searchQuery) {
      setSearchQuery(q);
    }
    const targetOrderId = searchParams.get('orderId');
    if (targetOrderId && orders.length > 0) {
      const match = orders.find(
        o => o.orderId.toLowerCase() === targetOrderId.toLowerCase() || o._id === targetOrderId
      );
      if (match) {
        setSelectedOrder(match);
      }
    }
  }, [searchParams, orders]);

  // Listen to realtime updates across browser tabs & backend SSE
  useRealtimeOrders(() => {
    loadOrders();
  });

  const handleStatusUpdate = async (orderId: string, status: OrderStatus, note?: string) => {
    broadcastLocalOrderEvent({ type: 'ORDER_STATUS_UPDATED', orderId, status });
    await orderApi.updateOrderStatus(orderId, status, note);
    await loadOrders();
    if (selectedOrder && selectedOrder.orderId === orderId) {
      const updated = await orderApi.getOrder(orderId);
      setSelectedOrder(updated);
    }
  };

  const handleSaveEdit = async (orderId: string, updates: Partial<AdminOrder>) => {
    broadcastLocalOrderEvent({ type: 'ORDER_UPDATED', orderId, status: updates.status });
    await orderApi.updateOrder(orderId, updates);
    await loadOrders();
  };

  const handleDeleteOrder = async (orderId: string) => {
    broadcastLocalOrderEvent({ type: 'ORDER_DELETED', orderId });
    setIsDeleting(true);
    try {
      await orderApi.deleteOrder(orderId);
      await loadOrders();
    } finally {
      setIsDeleting(false);
      setDeleteSecondConfirm(null);
    }
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

  // Pagination calculation
  const totalOrders = sortedOrders.length;
  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalOrders);
  const paginatedOrders = sortedOrders.slice(startIndex, endIndex);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Arrived': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Office': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Purchased':
      default: return 'bg-amber-100 text-amber-800 border-amber-300';
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
              placeholder="Search"
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
                <option value="ALL">All Statuses ({ALL_ORDER_STATUSES.length})</option>
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
                <tr className="bg-slate-100/70 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Product</th>
                  <th className="py-4 px-4">Price</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Est. Delivery</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Loading orders...
                    </td>
                  </tr>
                ) : paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No orders found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map(ord => (
                    <tr key={ord.orderId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#711612] text-sm">
                        {ord.orderId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{ord.customerName}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{ord.phone}</div>
                      </td>
                      <td className="py-4 px-4 max-w-xs truncate font-medium text-sm">
                        {ord.productName}
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-800 text-sm">
                        {formatPriceWithIqd(ord.totalPrice).combinedStr}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700 text-sm">
                        {ord.estimatedDelivery || 'Pending'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="p-2 rounded bg-slate-100 hover:bg-[#711612] text-slate-700 hover:text-white transition"
                            title="View Order Details & Timeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditOrder(ord)}
                            className="p-2 rounded bg-slate-100 hover:bg-[#711612] text-[#711612] hover:text-white transition"
                            title="Edit Order Info"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteFirstConfirm(ord)}
                            className="p-2 rounded bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
              Showing <span className="font-bold text-slate-900">{totalOrders > 0 ? startIndex + 1 : 0}</span> to{' '}
              <span className="font-bold text-slate-900">{endIndex}</span> of{' '}
              <span className="font-bold text-[#711612] font-mono">{totalOrders}</span> Total Orders
              <span className="ml-2 text-slate-400">(Page {currentPage} of {totalPages})</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 font-semibold">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
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
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 font-medium disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1"
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

      <ConfirmModal
        isOpen={!!deleteFirstConfirm}
        title="Delete Order"
        message={deleteFirstConfirm ? `Are you sure you want to delete order ${deleteFirstConfirm.orderId}? This action cannot be undone.` : ''}
        confirmText="Yes, Delete Order"
        cancelText="Cancel"
        type="danger"
        onConfirm={() => {
          const target = deleteFirstConfirm;
          setDeleteFirstConfirm(null);
          setDeleteSecondConfirm(target);
        }}
        onCancel={() => setDeleteFirstConfirm(null)}
      />

      <ConfirmModal
        isOpen={!!deleteSecondConfirm}
        title="Final Confirmation Required"
        message={deleteSecondConfirm ? `PLEASE CONFIRM: Are you absolutely sure you want to permanently delete order ${deleteSecondConfirm.orderId}? All details for this order will be permanently removed.` : ''}
        confirmText="Permanently Delete Order"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={() => deleteSecondConfirm && handleDeleteOrder(deleteSecondConfirm.orderId)}
        onCancel={() => setDeleteSecondConfirm(null)}
      />
    </AdminLayout>
  );
};

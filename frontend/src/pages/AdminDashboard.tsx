import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, Truck, CheckCircle2, XCircle, Search, PlusCircle,
  Eye, RefreshCw, ArrowUpRight, TrendingUp
} from 'lucide-react';
import { AdminLayout } from '../components/AdminLayout';
import { orderApi } from '../api';
import { AdminOrder, OrderStatus } from '../types';
import { OrderDetailsModal } from '../components/OrderDetailsModal';
import { EditOrderModal } from '../components/EditOrderModal';

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [editOrder, setEditOrder] = useState<AdminOrder | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Stats calculation
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'Order Received' || o.status === 'Order Confirmed' || o.status === 'Purchased' || o.status === 'Preparing').length;
  const inTransitOrders = orders.filter(o => o.status === 'Shipped' || o.status === 'In Transit' || o.status === 'Arrived' || o.status === 'Out for Delivery').length;
  const deliveredOrders = orders.filter(o => o.status === 'Delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length;

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
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'In Transit':
      case 'Shipped':
      case 'Out for Delivery':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="space-[#2C2C2C] space-y-8">
        
        {/* Top Quick Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Welcome Back, Admin 👋</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time overview of customer orders and logistics operations.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadOrders}
              className="p-2.5 rounded-md bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition"
              title="Refresh order data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/admin/add-order"
              className="px-4 py-2.5 bg-[#711612] hover:bg-[#57100d] text-white text-xs font-bold uppercase tracking-wider rounded-md shadow flex items-center gap-2 border border-[#D4AF37]/30 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Order</span>
            </Link>
          </div>
        </div>

        {/* 5 Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
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

          {/* Pending Orders */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</span>
              <div className="p-2 rounded-md bg-blue-50 text-blue-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600 mt-3">{pendingOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Processing / Sourcing</div>
          </div>

          {/* Orders In Transit */}
          <div className="bg-white p-5 rounded-lg border border-amber-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Transit</span>
              <div className="p-2 rounded-md bg-amber-50 text-amber-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600 mt-3">{inTransitOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Shipped & En Route</div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white p-5 rounded-lg border border-emerald-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Delivered</span>
              <div className="p-2 rounded-md bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600 mt-3">{deliveredOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Successfully fulfilled</div>
          </div>

          {/* Cancelled Orders */}
          <div className="bg-white p-5 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-700 uppercase tracking-wider">Cancelled</span>
              <div className="p-2 rounded-md bg-red-50 text-red-600">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-3">{cancelledOrders}</div>
            <div className="text-[11px] text-slate-500 mt-1">Voided or returned</div>
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
                  placeholder="Search ID, customer, product..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:border-[#711612] bg-white"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto text-xs border border-slate-300 rounded-md py-1.5 px-3 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="Order Received">Order Received</option>
                <option value="In Transit">In Transit</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
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
                  <th className="py-3.5 px-4">Tracking #</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4">Est. Delivery</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs text-slate-700">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No orders match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.slice(0, 10).map(ord => (
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
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {ord.trackingNumber || <span className="text-slate-300">Unassigned</span>}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(ord.createdAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {ord.estimatedDelivery || 'Pending'}
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

          <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#711612] hover:underline inline-flex items-center gap-1"
            >
              <span>View All Orders ({orders.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
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

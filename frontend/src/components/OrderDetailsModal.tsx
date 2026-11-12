import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X, ExternalLink, Truck, User, Package, Edit, Trash2
} from 'lucide-react';
import { AdminOrder, OrderStatus } from '../types';
import { StatusTimeline } from './StatusTimeline';
import { useSettings } from '../context/SettingsContext';
import { formatDisplayDate, formatDateTime } from '../utils/formatters';

import { ConfirmModal } from './ConfirmModal';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  onEditOrder: (order: AdminOrder) => void;
  onDeleteOrder: (orderId: string) => Promise<void>;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onEditOrder,
  onDeleteOrder
}) => {
  const { usdToIqdRate, formatPriceWithIqd } = useSettings();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSecondDeleteConfirm, setShowSecondDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!order) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Purchased':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Received in Warehouse':
      case 'In Office':
        return 'bg-sky-100 text-sky-900 border-sky-300';
      case 'Dispatched from Warehouse':
        return 'bg-[#711612]/10 text-[#711612] border-[#711612]/30 font-bold';
      case 'Arrived':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Done':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Canceled':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleFirstDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleProceedToSecondConfirm = () => {
    setShowDeleteConfirm(false);
    setShowSecondDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await onDeleteOrder(order.orderId);
      setShowSecondDeleteConfirm(false);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#711612] text-white px-6 py-5 flex items-center justify-between border-b border-[#D4AF37]/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-md font-mono font-bold text-sm border border-[#D4AF37]/40">
              {order.orderId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Order Details</h2>
                <span className={`px-2.5 py-0.5 rounded text-xs font-bold border shadow-xs ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-white/70">Created: {formatDateTime(order.createdAt || '')}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onEditOrder(order)}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleFirstDeleteClick}
              className="px-3 py-1.5 rounded text-xs font-semibold bg-red-600/80 hover:bg-red-600 text-white flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition ml-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 max-h-[80vh] overflow-y-auto bg-slate-50/50">

          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Current Status</div>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold border ${getStatusBadge(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Price</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">{formatPriceWithIqd(order.totalPrice).combinedStr}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Est. Delivery</div>
              <div className="text-sm font-semibold text-slate-700 mt-0.5">{formatDisplayDate(order.estimatedDelivery)}</div>
              {order.approximateDeliveryDate && (
                <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
                  Close Date: {formatDisplayDate(order.approximateDeliveryDate)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* CUSTOMER INFORMATION */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-[#711612] font-bold text-sm">
                  <User className="w-4 h-4" />
                  <span>CUSTOMER INFORMATION</span>
                </div>
                <Link
                  to={`/admin/customers?search=${encodeURIComponent(order.customerName)}&phone=${encodeURIComponent(order.phone || '')}`}
                  className="text-xs text-[#711612] hover:text-[#94201C] hover:underline font-bold inline-flex items-center gap-1 transition"
                  title="Open customer profile in Customers Directory"
                >
                  <span>View Customer Profile</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="text-sm space-y-2 text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">Name:</span>
                  <Link
                    to={`/admin/customers?search=${encodeURIComponent(order.customerName)}&phone=${encodeURIComponent(order.phone || '')}`}
                    className="font-bold text-[#711612] hover:text-[#94201C] hover:underline inline-flex items-center gap-1 group"
                    title={`View ${order.customerName} in Customers Directory`}
                  >
                    <span>{order.customerName}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                  </Link>
                </div>
                <div><span className="font-semibold text-slate-900">Phone:</span> {order.phone}</div>
                <div><span className="font-semibold text-slate-900">Email:</span> {order.email || 'N/A'}</div>
                <div><span className="font-semibold text-slate-900">Delivery Address:</span> {order.address}</div>
              </div>
            </div>

            {/* SHIPPING INFORMATION */}
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b pb-2 text-[#711612] font-bold text-sm">
                <Truck className="w-4 h-4" />
                <span>SHIPPING INFORMATION</span>
              </div>
              <div className="text-sm space-y-2 text-slate-700">
                <div><span className="font-semibold text-slate-900">Origin:</span> {order.originCountry}</div>
                <div><span className="font-semibold text-slate-900">Destination:</span> {order.destinationCountry}</div>
                <div><span className="font-semibold text-slate-900">Shipping Method:</span> {order.shippingMethod}</div>
                <div><span className="font-semibold text-slate-900">Est. Delivery:</span> {formatDisplayDate(order.estimatedDelivery)}</div>
              </div>
            </div>
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2 text-[#711612] font-bold text-sm">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>PRODUCT INFORMATION</span>
              </div>
              {order.productUrl && (
                <a
                  href={order.productUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#711612] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Open Supplier URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-4">
                {order.productImage && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0 shadow-xs">
                    <img
                      src={order.productImage}
                      alt={order.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-base">{order.productName}</h4>
                  {order.productUrl && (
                    <a
                      href={order.productUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#711612] hover:underline font-semibold inline-flex items-center gap-1 mt-1"
                    >
                      <span>View Store Product Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Quantity</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">{order.quantity || 1}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Unit Price</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {order.currency === 'IQD' ? `${(order.productPrice || 0).toLocaleString()} IQD` : `$${(order.productPrice || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[11px] font-semibold">Shipping Fee</span>
                  <span className="font-bold text-slate-800 text-sm mt-0.5 block">
                    {order.currency === 'IQD' ? `${(order.shippingFee || 0).toLocaleString()} IQD` : `$${(order.shippingFee || 0).toFixed(2)}`}
                  </span>
                </div>
                <div className="p-3 rounded-lg border border-[#D4AF37]/50 bg-amber-50/40">
                  <span className="text-slate-500 block text-[11px] font-semibold">Total Price</span>
                  <span className="font-extrabold text-[#711612] text-sm mt-0.5 block">
                    {order.currency === 'IQD'
                      ? `${(order.totalPrice || 0).toLocaleString()} IQD ($${((order.totalPrice || 0) / (usdToIqdRate || 1500)).toFixed(2)})`
                      : formatPriceWithIqd(order.totalPrice || 0).combinedStr
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>


          {/* ORDER NOTES */}
          {order.notes && (
            <div className="bg-amber-50/60 p-4 rounded-lg border border-[#D4AF37]/40 shadow-sm space-y-1 text-slate-800 text-xs">
              <span className="font-bold text-[#711612] block uppercase tracking-wider">Order Notes</span>
              <p className="whitespace-pre-wrap">{order.notes}</p>
            </div>
          )}

          {/* VISUAL STATUS TIMELINE */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <div className="text-[#711612] font-bold text-sm border-b pb-2">
              ORDER STATUS TIMELINE & HISTORY
            </div>
            <StatusTimeline
              currentStatus={order.status}
              statusHistory={order.statusHistory}
              showNotes={true}
              estimatedDelivery={order.estimatedDelivery}
              createdAt={order.createdAt}
            />
          </div>

        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order.orderId}? This action cannot be undone.`}
        confirmText="Yes, Delete Order"
        cancelText="Cancel"
        type="danger"
        onConfirm={handleProceedToSecondConfirm}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmModal
        isOpen={showSecondDeleteConfirm}
        title="Final Confirmation Required"
        message={`PLEASE CONFIRM: Are you absolutely sure you want to permanently delete order ${order.orderId}? All details for this order will be permanently removed.`}
        confirmText="Permanently Delete Order"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowSecondDeleteConfirm(false)}
      />
    </div>
  );
};

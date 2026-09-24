import React from 'react';
import {
  CheckCircle2, Clock, PackageCheck, ShoppingBag, Box, Truck, Plane, MapPin, Navigation, Home, XCircle
} from 'lucide-react';
import { OrderStatus, StatusHistoryItem } from '../types';

interface StatusTimelineProps {
  currentStatus: OrderStatus;
  statusHistory?: StatusHistoryItem[];
  showNotes?: boolean;
}

const ORDER_TIMELINE_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'Order Received', label: 'Order Received', icon: Clock },
  { status: 'Order Confirmed', label: 'Order Confirmed', icon: PackageCheck },
  { status: 'Purchased', label: 'Purchased', icon: ShoppingBag },
  { status: 'Preparing', label: 'Preparing', icon: Box },
  { status: 'Shipped', label: 'Shipped', icon: Plane },
  { status: 'In Transit', label: 'In Transit', icon: Truck },
  { status: 'Arrived', label: 'Arrived', icon: MapPin },
  { status: 'Out for Delivery', label: 'Out for Delivery', icon: Navigation },
  { status: 'Delivered', label: 'Delivered', icon: Home },
];

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  statusHistory = [],
  showNotes = true
}) => {
  const isCancelled = currentStatus === 'Cancelled';
  const currentIndex = ORDER_TIMELINE_STEPS.findIndex(s => s.status === currentStatus);

  // Map history logs by status for timestamp/note lookup
  const historyMap = new Map<string, StatusHistoryItem>();
  statusHistory.forEach(item => {
    historyMap.set(item.status, item);
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="w-full py-4">
      {/* If Cancelled */}
      {isCancelled && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 flex items-center gap-3 text-red-700">
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-sm uppercase tracking-wide">Order Cancelled</div>
            <div className="text-xs text-red-600">This order has been cancelled by the administrator.</div>
          </div>
        </div>
      )}

      {/* Vertical / Horizontal Timeline */}
      <div className="relative pl-6 space-y-6 border-l-2 border-slate-200">
        {ORDER_TIMELINE_STEPS.map((step, index) => {
          const isCompleted = !isCancelled && (index < currentIndex || currentStatus === 'Delivered');
          const isCurrent = !isCancelled && index === currentIndex;
          const historyEntry = historyMap.get(step.status);
          const IconComponent = step.icon;

          let dotBg = 'bg-slate-200 text-slate-400 border-slate-300';
          let textColor = 'text-slate-400 font-normal';

          if (isCompleted) {
            dotBg = 'bg-[#711612] text-white border-[#711612] shadow-sm';
            textColor = 'text-slate-800 font-semibold';
          } else if (isCurrent) {
            dotBg = 'bg-[#D4AF37] text-white border-[#D4AF37] ring-4 ring-[#D4AF37]/20 shadow-md animate-pulse';
            textColor = 'text-[#711612] font-bold text-base';
          }

          return (
            <div key={step.status} className="relative flex items-start group">
              {/* Dot Icon Positioned on Left Line */}
              <div
                className={`absolute -left-[35px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${dotBg}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <IconComponent className="w-4 h-4" />
                )}
              </div>

              {/* Step Details */}
              <div className="ml-3 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className={`text-sm ${textColor}`}>
                    {step.label}
                    {isCurrent && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#711612] uppercase tracking-wider">
                        Current Status
                      </span>
                    )}
                  </div>
                  {historyEntry && (
                    <div className="text-xs text-slate-400 font-mono">
                      {formatDate(historyEntry.date)}
                    </div>
                  )}
                </div>

                {showNotes && historyEntry?.note && (
                  <div className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1.5 inline-block">
                    💬 {historyEntry.note}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

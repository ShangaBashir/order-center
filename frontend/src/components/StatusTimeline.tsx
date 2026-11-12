import React from 'react';
import {
  ShoppingBag, Warehouse, PlaneTakeoff, PackageCheck, CheckCircle2, XCircle, Plane, Clock, Calendar, Check
} from 'lucide-react';
import { OrderStatus, StatusHistoryItem } from '../types';

interface StatusTimelineProps {
  currentStatus: OrderStatus | string;
  statusHistory?: StatusHistoryItem[];
  showNotes?: boolean;
  estimatedDelivery?: string;
  createdAt?: string;
}

export const formatDateTime = (dateStr?: string | Date): string => {
  if (!dateStr) return '';
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return String(dateStr);
    const datePart = d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${datePart} • ${timePart}`;
  } catch (e) {
    return String(dateStr);
  }
};

export const normalizeStatus = (st: string): string => {
  if (!st) return 'Purchased';
  const lower = st.toLowerCase().trim();
  if (lower === 'purchased' || lower === 'pending') return 'Purchased';
  if (lower === 'received in warehouse' || lower === 'in office') return 'Received in Warehouse';
  if (lower === 'dispatched from warehouse' || lower === 'dispatched' || lower === 'in transit' || lower === 'shipped') return 'Dispatched from Warehouse';
  if (lower === 'arrived') return 'Arrived';
  if (lower === 'done' || lower === 'delivered' || lower === 'completed') return 'Done';
  if (lower === 'canceled' || lower === 'cancelled') return 'Canceled';
  return st;
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus: rawStatus,
  statusHistory = [],
  showNotes = true,
  estimatedDelivery,
  createdAt,
}) => {
  const currentStatus = normalizeStatus(rawStatus || 'Purchased');
  const isCanceled = currentStatus === 'Canceled';

  // Map history logs by normalized status
  const historyMap = new Map<string, StatusHistoryItem>();
  statusHistory.forEach((item) => {
    const norm = normalizeStatus(item.status);
    historyMap.set(norm, item);
  });

  const STEPS: { status: string; label: string; icon: React.ElementType; desc: string; percent: number }[] = [
    {
      status: 'Purchased',
      label: 'Purchased',
      icon: ShoppingBag,
      desc: 'Order verified & purchased from vendor',
      percent: 18,
    },
    {
      status: 'Received in Warehouse',
      label: 'Received in Warehouse',
      icon: Warehouse,
      desc: 'Package received & inspected at export sorting hub',
      percent: 42,
    },
    {
      status: 'Dispatched from Warehouse',
      label: 'Dispatched from Warehouse',
      icon: PlaneTakeoff,
      desc: 'Dispatched on international air cargo flight',
      percent: 68,
    },
    {
      status: 'Arrived',
      label: 'Arrived',
      icon: PackageCheck,
      desc: 'Arrived at destination hub & cleared customs',
      percent: 88,
    },
    {
      status: isCanceled ? 'Canceled' : 'Done',
      label: isCanceled ? 'Canceled' : 'Done',
      icon: isCanceled ? XCircle : CheckCircle2,
      desc: isCanceled ? 'Order has been canceled' : 'Successfully delivered to customer',
      percent: 100,
    },
  ];

  const currentIndex = STEPS.findIndex((s) => s.status === currentStatus);
  const activePercent = currentIndex !== -1 ? STEPS[currentIndex].percent : 18;

  const firstEntry = statusHistory[0];
  const lastEntry = statusHistory[statusHistory.length - 1];
  const startDate = firstEntry?.date || createdAt || '';
  const currentEntry = historyMap.get(currentStatus) || lastEntry;

  return (
    <div className="w-full space-y-6">
      {/* ── FLIGHT TRACKER BAR (Order Center Colors & Airplane) ────────────────────── */}
      <div className="bg-gradient-to-b from-[#FAF8F5] via-white to-[#FAF8F5] p-5 sm:p-7 rounded-2xl border border-[#D4AF37]/35 shadow-sm space-y-4">
        {/* Top Dates Bar */}
        <div className="flex items-center justify-between text-xs font-bold gap-2">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-[#711612]" />
            <span className="font-mono">{startDate ? formatDateTime(startDate) : 'Order Placed'}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[#711612]">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-mono">
              {currentStatus === 'Done'
                ? `Delivered: ${formatDateTime(currentEntry?.date || '')}`
                : isCanceled
                ? `Canceled: ${formatDateTime(currentEntry?.date || '')}`
                : `ETA: ${estimatedDelivery || 'In Transit'}`}
            </span>
          </div>
        </div>

        {/* The Flight Track Bar */}
        <div className="relative pt-3 pb-3">
          <div className="h-9 sm:h-10 bg-slate-100 rounded-full border border-slate-200/90 relative p-1 flex items-center shadow-inner overflow-visible">
            {/* The Gradient Progress Fill in Order Center Colors */}
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out flex items-center justify-between shadow-md relative ${
                isCanceled
                  ? 'bg-gradient-to-r from-red-900 via-red-700 to-rose-600 shadow-red-900/30'
                  : 'bg-gradient-to-r from-[#711612] via-[#94201C] to-[#D4AF37] shadow-[#711612]/30'
              }`}
              style={{ width: `${Math.max(activePercent, 12)}%` }}
            >
              {/* Start Dot Pin */}
              <div className="w-3.5 h-3.5 ml-1.5 rounded-full bg-white flex items-center justify-center shadow-xs flex-shrink-0">
                <div className={`w-1.5 h-1.5 rounded-full ${isCanceled ? 'bg-red-700' : 'bg-[#711612]'}`} />
              </div>

              {/* Airplane Gliding Icon at Progress Head */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-4 flex items-center justify-center z-20">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center shadow-lg transition-transform duration-300 transform -rotate-12 hover:rotate-0 ${
                    isCanceled
                      ? 'bg-red-800 border-white text-white shadow-red-900/40'
                      : 'bg-[#711612] border-[#D4AF37] text-[#D4AF37] shadow-[#711612]/40 ring-2 ring-[#D4AF37]/40 animate-pulse'
                  }`}
                  title={`Current Status: ${currentStatus}`}
                >
                  <Plane className="w-4 h-4 sm:w-5 sm:h-5 transform rotate-45" />
                </div>
              </div>
            </div>

            {/* Target Ring Destination at end of Track */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-slate-300 bg-white flex items-center justify-center pointer-events-none z-10">
              <div className={`w-2 h-2 rounded-full ${currentIndex === 4 ? (isCanceled ? 'bg-red-600' : 'bg-[#15803d]') : 'bg-slate-300'}`} />
            </div>
          </div>
        </div>

        {/* Current Status Pill & Real Date Time */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Current Status:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold border shadow-2xs inline-flex items-center gap-1.5 ${
                isCanceled
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : currentStatus === 'Done'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-amber-50 text-[#711612] border-[#D4AF37]/50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full animate-ping ${isCanceled ? 'bg-red-500' : currentStatus === 'Done' ? 'bg-emerald-500' : 'bg-[#D4AF37]'}`} />
              <span>{currentStatus}</span>
            </span>
          </div>

          {currentEntry?.date && (
            <div className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
              <span className="text-slate-400">Updated:</span>
              <span className="font-bold text-slate-700">{formatDateTime(currentEntry.date)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── DETAILED MILESTONE STEPPERS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {STEPS.map((step, index) => {
          const isDoneStep = step.status === 'Done';
          const isCancelStep = step.status === 'Canceled';
          const isCompleted = index < currentIndex || (index === currentIndex && (isDoneStep || isCancelStep));
          const isCurrent = index === currentIndex && !isDoneStep && !isCancelStep;
          const historyEntry = historyMap.get(step.status);
          const Icon = step.icon;

          let cardStyle = 'border-slate-200 bg-white text-slate-400';
          let iconStyle = 'bg-slate-100 text-slate-400 border-slate-200';
          let titleStyle = 'text-slate-600';

          if (isCancelStep && isCurrent) {
            cardStyle = 'border-red-300 bg-red-50/60 shadow-xs ring-1 ring-red-300';
            iconStyle = 'bg-red-600 text-white border-red-700';
            titleStyle = 'text-red-900 font-extrabold';
          } else if (isDoneStep && isCompleted) {
            cardStyle = 'border-emerald-300 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-300';
            iconStyle = 'bg-emerald-600 text-white border-emerald-700';
            titleStyle = 'text-emerald-900 font-extrabold';
          } else if (isCompleted) {
            cardStyle = 'border-[#711612]/30 bg-[#711612]/5 shadow-xs';
            iconStyle = 'bg-[#711612] text-[#D4AF37] border-[#711612]';
            titleStyle = 'text-[#711612] font-bold';
          } else if (isCurrent) {
            cardStyle = 'border-[#D4AF37] bg-amber-50/60 shadow-sm ring-2 ring-[#D4AF37]/30';
            iconStyle = 'bg-[#D4AF37] text-white border-[#D4AF37] animate-pulse';
            titleStyle = 'text-[#711612] font-extrabold';
          }

          return (
            <div
              key={step.status}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${cardStyle}`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${iconStyle}`}>
                    {isCompleted && !isCancelStep ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">0{index + 1}</span>
                </div>

                <div className={`text-xs leading-snug mb-1 ${titleStyle}`}>{step.label}</div>
                <p className="text-[10px] text-slate-500 leading-tight line-clamp-2">{step.desc}</p>
              </div>

              {/* Real Date & Time */}
              <div className="mt-3 pt-2 border-t border-slate-100/80">
                {historyEntry?.date ? (
                  <div className="text-[10px] font-mono text-slate-600 font-semibold leading-tight">
                    {formatDateTime(historyEntry.date)}
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-300 font-mono">Pending</div>
                )}

                {showNotes && historyEntry?.note && (
                  <div className="mt-1 text-[10px] text-slate-600 bg-white/80 border border-slate-200/60 rounded px-1.5 py-0.5 truncate" title={historyEntry.note}>
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

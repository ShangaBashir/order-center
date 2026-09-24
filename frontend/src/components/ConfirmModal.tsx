import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDanger = type === 'danger';
  const defaultTitle = isDanger ? 'Delete Confirmation' : 'Confirmation';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-[#1C1C1F] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden transform transition-all text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header accent line */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 ${
            isDanger ? 'bg-gradient-to-r from-red-600 to-rose-500' : 'bg-gradient-to-r from-[#711612] to-[#D4AF37]'
          }`} 
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`p-3 rounded-xl flex-shrink-0 ${
            isDanger ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-[#711612]/20 text-[#D4AF37] border border-[#D4AF37]/30'
          }`}>
            {isDanger ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-wide">
              {title || defaultTitle}
            </h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/10"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg transition-all flex items-center gap-2 ${
              isDanger
                ? 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 shadow-red-900/30'
                : 'bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] shadow-red-950/40 border border-[#D4AF37]/30'
            }`}
          >
            {isLoading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

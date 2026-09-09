import React from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';

// -------------------------------------------------------------
// Badge Component
// -------------------------------------------------------------
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'amber' | 'rose' | 'blue' | 'slate' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'slate',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border tracking-wide uppercase whitespace-nowrap ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

// -------------------------------------------------------------
// Modal Component
// -------------------------------------------------------------
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div
        className={`w-full ${widthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in zoom-in-95`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs sm:text-sm text-slate-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// EmptyState Component
// -------------------------------------------------------------
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 shadow-2xs">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// Loading State & Skeletons
// -------------------------------------------------------------
export const AILoadingState: React.FC<{ message?: string }> = ({
  message = 'AI is creating your marketing content...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-blue-50/40 rounded-2xl border border-blue-100 animate-pulse">
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      </div>
      <h4 className="text-base font-semibold text-slate-900 mb-1">{message}</h4>
      <p className="text-xs text-slate-500 max-w-xs">
        Crafting high-converting hooks, audience psychographics, and direct-response formulas.
      </p>
    </div>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`bg-slate-200/80 animate-pulse rounded-md ${className}`} />;
};

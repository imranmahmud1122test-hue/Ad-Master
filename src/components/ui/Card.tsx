import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden transition-all ${
        hoverable ? 'hover:shadow-md hover:border-slate-300' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 ${className}`}>
      <div>
        <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
};

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`px-5 py-4 sm:px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
};

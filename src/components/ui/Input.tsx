import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-white text-slate-900 border text-sm rounded-lg shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  rows = 4,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full px-3.5 py-2.5 bg-white text-slate-900 border text-sm rounded-lg shadow-2xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500 ${
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  id,
  options,
  children,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full px-3.5 py-2.5 bg-white text-slate-900 border text-sm rounded-lg shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-50 disabled:text-slate-500 cursor-pointer ${
          error ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-200'
        } ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error ? (
        <p className="mt-1 text-xs text-rose-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

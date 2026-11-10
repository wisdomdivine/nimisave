import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs text-neutral-400">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-neutral-900 text-neutral-100 placeholder-neutral-600 px-4 py-3 text-sm outline-none transition-colors rounded-xl focus:bg-neutral-850 ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};

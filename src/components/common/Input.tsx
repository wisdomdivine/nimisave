import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixText?: string;
  suffixText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefixText,
  suffixText,
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

      <div className="relative flex items-center w-full bg-neutral-900 rounded-xl px-4 py-3 transition-colors focus-within:bg-neutral-850">
        {prefixText && (
          <span className="text-sm text-neutral-400 mr-2 select-none">
            {prefixText}
          </span>
        )}

        <input
          className={`w-full bg-transparent text-neutral-100 placeholder-neutral-500 text-sm outline-none ${className}`}
          {...props}
        />

        {suffixText && (
          <span className="text-xs text-neutral-400 ml-2 select-none">
            {suffixText}
          </span>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-400">
          {error}
        </span>
      )}
    </div>
  );
};

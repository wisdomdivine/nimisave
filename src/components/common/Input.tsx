import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixText?: string;
  suffixText?: string;
  containerClassName?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  prefixText,
  suffixText,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const hasBg = /(^|\s)bg-/.test(containerClassName);
  const bgClass = hasBg ? '' : 'bg-neutral-800';

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label className="text-xs text-neutral-400 font-medium">
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center w-full ${bgClass} rounded-xl px-4 py-3.5 transition-colors focus-within:bg-neutral-700 hover:bg-neutral-750 ${containerClassName}`.trim()}
      >
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

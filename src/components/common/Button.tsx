import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}) => {
  let variantStyle = 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200';
  if (variant === 'secondary') {
    variantStyle = 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700';
  } else if (variant === 'ghost') {
    variantStyle = 'bg-transparent text-neutral-300 hover:bg-neutral-900';
  } else if (variant === 'danger') {
    variantStyle = 'bg-red-950 text-red-200 hover:bg-red-900';
  }

  let sizeStyle = 'px-6 py-3 text-sm';
  if (size === 'sm') {
    sizeStyle = 'px-4 py-2 text-xs';
  } else if (size === 'lg') {
    sizeStyle = 'px-8 py-4 text-base';
  }

  const disabledStyle = disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

  return (
    <button
      className={`inline-flex items-center justify-center font-light tracking-wide transition-colors ${sizeStyle} ${variantStyle} ${disabledStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};


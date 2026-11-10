import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const clickableStyle = onClick ? 'cursor-pointer hover:bg-neutral-850 transition-colors' : '';
  const hasBg = /(^|\s)bg-/.test(className);
  const bgClass = hasBg ? '' : 'bg-neutral-900';

  return (
    <div
      onClick={onClick}
      className={`${bgClass} p-6 sm:p-8 rounded-2xl ${clickableStyle} ${className}`.trim()}
    >
      {children}
    </div>
  );
};

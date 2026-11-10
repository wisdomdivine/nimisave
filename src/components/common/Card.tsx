import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const clickableStyle = onClick ? 'cursor-pointer hover:bg-neutral-850 transition-colors' : '';

  return (
    <div
      onClick={onClick}
      className={`bg-neutral-900 p-8 rounded-2xl ${clickableStyle} ${className}`}
    >
      {children}
    </div>
  );
};

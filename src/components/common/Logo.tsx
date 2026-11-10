import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  color?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 24,
  className = '',
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g fill={color}>
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(0 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(30 50 50)" />
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(60 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(90 50 50)" />
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(120 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(150 50 50)" />
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(180 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(210 50 50)" />
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(240 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(270 50 50)" />
        <rect x="47.25" y="8" width="5.5" height="24" rx="2.75" transform="rotate(300 50 50)" />
        <rect x="47.25" y="14" width="5.5" height="18" rx="2.75" transform="rotate(330 50 50)" />
      </g>
    </svg>
  );
};


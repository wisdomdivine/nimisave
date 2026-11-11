import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home01Icon, CompassIcon, Group01Icon, Wallet01Icon } from 'hugeicons-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Overview', shortLabel: 'Overview', icon: Home01Icon },
    { path: '/prompts', label: 'Hobby Prompts', shortLabel: 'Prompts', icon: CompassIcon },
    { path: '/communities', label: 'Communities', shortLabel: 'Communities', icon: Group01Icon },
    { path: '/wallet', label: 'Settlement', shortLabel: 'Settlement', icon: Wallet01Icon },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-2.5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 backdrop-blur-md p-1 sm:p-1.5 rounded-2xl flex items-center justify-center gap-0.5 sm:gap-1 max-w-[calc(100vw-1rem)] sm:max-w-fit shadow-none select-none"
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative px-2 min-[380px]:px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[11px] min-[380px]:text-xs sm:text-sm flex items-center gap-1 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap flex-shrink-0"
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActiveIndicator"
                className="absolute inset-0 bg-neutral-800 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1 sm:gap-2 transition-colors ${
                isActive ? 'text-neutral-100 font-medium' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

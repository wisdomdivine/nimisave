import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home01Icon, CompassIcon, Group01Icon, Wallet01Icon } from 'hugeicons-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: Home01Icon },
    { path: '/prompts', label: 'Hobby Prompts', icon: CompassIcon },
    { path: '/communities', label: 'Communities', icon: Group01Icon },
    { path: '/wallet', label: 'Settlement', icon: Wallet01Icon },
  ];

  return (
    <nav className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900/95 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl flex items-center gap-1 max-w-[calc(100vw-1.5rem)] shadow-none">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const IconComponent = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className="relative px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-colors whitespace-nowrap"
          >
            {isActive && (
              <motion.div
                layoutId="bottomNavActiveIndicator"
                className="absolute inset-0 bg-neutral-800 rounded-xl"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 sm:gap-2 transition-colors ${
                isActive ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <IconComponent size={16} />
              <span>{item.label}</span>
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
};

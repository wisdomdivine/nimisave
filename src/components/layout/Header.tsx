import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSavings } from '../../context/SavingsContext';
import { Wallet01Icon, Compass01Icon, Home01Icon, PlusSignIcon } from 'hugeicons-react';

export const Header: React.FC = () => {
  const { wallet } = useSavings();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 text-sm font-light tracking-wide transition-colors cursor-pointer ${
      isActive ? 'text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
    }`;

  return (
    <header className="w-full bg-neutral-950 py-6 px-6 sm:px-12 flex items-center justify-between">
      <div className="flex items-center gap-12">
        <NavLink to="/" className="text-xl font-light tracking-widest text-neutral-100 cursor-pointer">
          gammy
        </NavLink>

        <nav className="hidden md:flex items-center gap-8">
          <NavLink to="/" className={navLinkClass}>
            <Home01Icon size={16} />
            <span>overview</span>
          </NavLink>
          <NavLink to="/prompts" className={navLinkClass}>
            <Compass01Icon size={16} />
            <span>hobby prompts</span>
          </NavLink>
          <NavLink to="/wallet" className={navLinkClass}>
            <Wallet01Icon size={16} />
            <span>settlement</span>
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <NavLink
          to="/create"
          className="flex items-center gap-2 text-xs font-light text-neutral-300 hover:text-neutral-100 cursor-pointer transition-colors"
        >
          <PlusSignIcon size={14} />
          <span>create goal</span>
        </NavLink>

        <div className="text-right">
          <div className="text-xs font-light text-neutral-400 tracking-wider">
            Nimiq gas free settlement
          </div>
          <div className="text-xs font-light text-neutral-200">
            {wallet.sponsoredTxCount} transactions sponsored
          </div>
        </div>
      </div>
    </header>
  );
};

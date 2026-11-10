import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSavings } from '../../context/SavingsContext';
import { Wallet01Icon, CompassIcon, Home01Icon, PlusSignIcon } from 'hugeicons-react';

export const Header: React.FC = () => {
  const { wallet } = useSavings();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 text-sm transition-all cursor-pointer px-4 py-2 rounded-xl ${
      isActive
        ? 'bg-neutral-800 text-neutral-100'
        : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/60'
    }`;

  return (
    <header className="w-full bg-neutral-950 py-6 px-6 sm:px-12 flex items-center justify-between">
      <div className="flex items-center gap-10">
        <NavLink to="/" className="text-xl text-neutral-100 cursor-pointer">
          Gammy
        </NavLink>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={navLinkClass}>
            <Home01Icon size={16} />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/prompts" className={navLinkClass}>
            <CompassIcon size={16} />
            <span>Hobby Prompts</span>
          </NavLink>
          <NavLink to="/wallet" className={navLinkClass}>
            <Wallet01Icon size={16} />
            <span>Settlement</span>
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <NavLink
          to="/create"
          className="flex items-center gap-2 text-xs bg-neutral-100 text-neutral-950 hover:bg-neutral-200 px-4 py-2 rounded-xl cursor-pointer transition-colors"
        >
          <PlusSignIcon size={14} />
          <span>Create Goal</span>
        </NavLink>

        <div className="text-right">
          <div className="text-xs text-neutral-300">
            Nimiq Gas Free Settlement
          </div>
          <div className="text-xs text-neutral-400">
            {wallet.sponsoredTxCount} Sponsored Transactions
          </div>
        </div>
      </div>
    </header>
  );
};

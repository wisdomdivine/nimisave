import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSavings } from '../../context/SavingsContext';
import { PlusSignIcon } from 'hugeicons-react';

export const Header: React.FC = () => {
  const { wallet } = useSavings();

  return (
    <header className="w-full bg-neutral-950 py-5 sm:py-6 px-4 sm:px-8 lg:px-12 flex items-center justify-between">
      <NavLink to="/" className="text-xl text-neutral-100 cursor-pointer">
        Gammy
      </NavLink>

      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-right hidden sm:block">
          <div className="text-xs text-neutral-300">
            Nimiq Gas Free Settlement
          </div>
          <div className="text-xs text-neutral-400">
            {wallet.sponsoredTxCount} Sponsored Transactions
          </div>
        </div>

        <NavLink
          to="/create"
          className="flex items-center gap-2 text-xs bg-neutral-100 text-neutral-950 hover:bg-neutral-200 px-3.5 sm:px-4 py-2 rounded-xl cursor-pointer transition-colors"
        >
          <PlusSignIcon size={14} />
          <span>Create Goal</span>
        </NavLink>
      </div>
    </header>
  );
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSavings } from '../../context/SavingsContext';
import { Logo } from '../common/Logo';
import { PlusSignIcon, FireIcon, Wallet01Icon } from 'hugeicons-react';

export const Header: React.FC = () => {
  const {
    wallet,
    openCreateGoal,
    streak,
    isWalletConnected,
    openConnectModal,
  } = useSavings();

  const shortAddress = wallet.nimiqAddress
    ? `${wallet.nimiqAddress.slice(0, 4)}...${wallet.nimiqAddress.slice(-4)}`
    : 'Connect';

  return (
    <header className="w-full bg-neutral-950 py-5 sm:py-6">
      <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5 text-xl text-neutral-100 cursor-pointer">
          <Logo size={22} className="text-neutral-100" />
          <span className="font-light">Nimisave</span>
        </NavLink>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Streak Badge */}
          <NavLink
            to="/communities"
            className="flex items-center gap-1.5 py-1.5 px-3 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-xs text-amber-400 transition-colors cursor-pointer"
          >
            <FireIcon size={15} />
            <span>{streak.currentDays}d Streak</span>
          </NavLink>

          {/* Wallet Connect Pill */}
          <button
            type="button"
            onClick={openConnectModal}
            className="flex items-center gap-2 py-2 px-3.5 bg-neutral-900 hover:bg-neutral-850 rounded-xl text-xs text-neutral-200 transition-colors cursor-pointer"
          >
            <Wallet01Icon size={14} className={isWalletConnected ? 'text-emerald-400' : 'text-neutral-400'} />
            <span className="hidden sm:inline">
              {isWalletConnected ? shortAddress : 'Connect Wallet'}
            </span>
          </button>

          {/* Create Goal Button */}
          <button
            type="button"
            onClick={openCreateGoal}
            className="flex items-center gap-2 text-xs bg-neutral-100 text-neutral-950 hover:bg-neutral-200 px-3.5 sm:px-4 py-2 rounded-xl cursor-pointer transition-colors font-medium"
          >
            <PlusSignIcon size={14} />
            <span>Create Goal</span>
          </button>
        </div>
      </div>
    </header>
  );
};

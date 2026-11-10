import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Logo } from '../components/common/Logo';

export const LandingPage: React.FC = () => {
  const { openConnectModal, isWalletConnected, wallet } = useSavings();

  const shortAddress = React.useMemo(() => {
    if (!wallet.nimiqAddress) return '';
    const addr = wallet.nimiqAddress;
    return addr.length > 10 ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : addr;
  }, [wallet.nimiqAddress]);

  return (
    <div className="h-screen min-h-screen max-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col justify-between overflow-hidden selection:bg-neutral-800 selection:text-neutral-100 px-4 py-6 sm:py-8">
      {/* Floating Header with Nimisave Logo and Connect Wallet button */}
      <header className="w-full flex justify-center z-30 flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="inline-flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full backdrop-blur-md shadow-sm bg-neutral-900/90 text-neutral-200"
        >
          {/* Brand Logo */}
          <Link
            to="/"
            className="p-0.5 text-white hover:text-neutral-300 transition-colors cursor-pointer flex items-center gap-2"
            title="Nimisave"
          >
            <Logo size={19} className="text-white" />
            <span className="font-light text-xs text-neutral-200 hidden sm:inline">
              Nimisave
            </span>
          </Link>

          {/* Divider */}
          <div className="w-px h-4 sm:h-5 bg-neutral-800" />

          {/* X (Twitter) */}
          <a
            href="https://x.com/nimiq"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="X (Twitter)"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/wisdomdivine/nimisave"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="GitHub"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
          </a>

          {/* Document / App Overview */}
          <Link
            to="/dashboard"
            className="p-1 rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
            title="Dashboard Overview"
          >
            <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </Link>

          {/* Divider */}
          <div className="w-px h-4 sm:h-5 bg-neutral-800" />

          {/* Connect Wallet Button */}
          <button
            type="button"
            onClick={openConnectModal}
            className="px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shadow-sm bg-white text-neutral-950 hover:bg-neutral-200"
          >
            {isWalletConnected ? shortAddress : 'Connect Wallet'}
          </button>
        </motion.div>
      </header>

      {/* Main Hero: Illustration and elevated text moved up */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full my-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full flex justify-center py-2 sm:py-3"
        >
          <img
            src="/illustration-windows-dark.png"
            alt="Passengers on a savings journey"
            className="w-full max-w-md sm:max-w-lg md:max-w-xl max-h-[30vh] sm:max-h-[34vh] object-contain select-none"
          />
        </motion.div>

        {/* Text underneath the illustration */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex flex-col items-center text-center gap-2.5 sm:gap-3.5 max-w-xl px-2"
        >
          <div className="flex items-center gap-2 text-neutral-400">
            <Logo size={16} className="text-neutral-300" />
            <span className="text-xs font-light tracking-widest uppercase text-neutral-400">
              Nimisave
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-white">
            Disciplined savings for life ahead
          </h1>

          <p className="text-xs sm:text-sm font-light leading-relaxed max-w-lg text-neutral-400">
            Automate voluntary micro savings in stable USDT or native NIM tokens with zero gas fees.
            Watch your physical goals assemble in real time 3D with every victory.
          </p>

          {/* Enter Dashboard Button */}
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-block bg-white text-neutral-950 hover:bg-neutral-200 px-7 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-colors text-center cursor-pointer shadow-sm"
            >
              Enter Dashboard
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Clean bottom spacing to preserve perfect 100vh centering */}
      <div className="h-2 flex-shrink-0" />
    </div>
  );
};

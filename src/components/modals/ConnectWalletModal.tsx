import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useSavings } from '../../context/SavingsContext';
import { formatNimiqAddress } from '../../services/nimiqService';
import {
  Wallet01Icon,
  CheckmarkCircle01Icon,
  Coins01Icon,
  Shield01Icon,
  Copy01Icon,
} from 'hugeicons-react';

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectWalletModal: React.FC<ConnectWalletModalProps> = ({ isOpen, onClose }) => {
  const {
    wallet,
    isWalletConnected,
    walletProvider,
    connectWallet,
    disconnectWallet,
  } = useSavings();
  const navigate = useNavigate();

  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string>('MetaMask and EVM');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const providers = [
    {
      name: 'MetaMask and EVM',
      desc: 'Sign in with your Ethereum or EVM wallet for non custodial settlement',
      icon: Wallet01Icon,
      accentColor: 'text-emerald-400',
    },
    {
      name: 'Nimiq Hub',
      desc: 'Live browser native non custodial wallet with zero extension install required',
      icon: Coins01Icon,
      accentColor: 'text-amber-400',
    },
    {
      name: 'Ledger Hardware',
      desc: 'Cold storage connection for maximum asset security',
      icon: Shield01Icon,
      accentColor: 'text-blue-400',
    },
  ];

  const handleConnect = async (provName: string) => {
    setErrorMessage('');
    setSelectedProvider(provName);
    setIsConnecting(true);

    try {
      if (provName === 'MetaMask and EVM' && (typeof window === 'undefined' || !window.ethereum)) {
        throw new Error('No EVM wallet detected. Please install MetaMask, Rabby, or open in a Web3 browser.');
      }
      await connectWallet(provName);
      setIsConnecting(false);
      onClose();
    } catch (err: any) {
      setIsConnecting(false);
      setErrorMessage(err?.message || 'Failed to authenticate wallet');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.nimiqAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isWalletConnected ? 'Connected Wallet' : 'Connect Settlement Wallet'}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col gap-6">
        <p className="text-xs text-neutral-400 leading-relaxed font-light -mt-2">
          Connect your non custodial wallet to sign gas sponsored savings transactions and verify your on chain ownership.
        </p>

        {errorMessage && (
          <div className="bg-neutral-850 p-3.5 rounded-xl text-xs text-amber-300 font-light leading-relaxed">
            {errorMessage}
          </div>
        )}

        {isWalletConnected ? (
          <div className="flex flex-col gap-5">
            {/* Connected status summary */}
            <div className="bg-neutral-950 p-5 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckmarkCircle01Icon size={16} className="text-emerald-400" />
                  <span className="text-xs text-neutral-200 font-medium">
                    Connected via {walletProvider || 'Nimiq Hub'}
                  </span>
                </div>
                <span className="text-2xs text-emerald-400 font-light">
                  Mainnet Ready
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-2xs text-neutral-500">
                  Settlement Address
                </span>
                <span className="text-xs text-neutral-200 font-mono">
                  {formatNimiqAddress(wallet.nimiqAddress)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-neutral-900 p-3 rounded-xl flex flex-col gap-0.5">
                  <span className="text-2xs text-neutral-400">NIM Balance</span>
                  <span className="text-sm text-neutral-100 font-medium">
                    {wallet.balanceNim.toLocaleString()} NIM
                  </span>
                </div>
                <div className="bg-neutral-900 p-3 rounded-xl flex flex-col gap-0.5">
                  <span className="text-2xs text-neutral-400">USDT Reserves</span>
                  <span className="text-sm text-neutral-100 font-medium">
                    ${wallet.balanceUsdt.toLocaleString()} USDT
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy01Icon size={15} />
                <span>{copied ? 'Copied' : 'Copy Address'}</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  disconnectWallet();
                  onClose();
                  navigate('/');
                }}
              >
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {providers.map((p) => {
              const IconComp = p.icon;
              return (
                <button
                  key={p.name}
                  type="button"
                  disabled={isConnecting}
                  onClick={() => handleConnect(p.name)}
                  className="p-4 bg-neutral-950 hover:bg-neutral-850 rounded-2xl flex items-center justify-between gap-4 text-left transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-neutral-900 rounded-xl text-neutral-200">
                      <IconComp size={18} className={p.accentColor} />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm text-neutral-100 font-medium">
                        {p.name}
                      </span>
                      <span className="text-2xs text-neutral-400 font-light leading-relaxed">
                        {p.desc}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400 flex-shrink-0">
                    {isConnecting && selectedProvider === p.name ? 'Connecting...' : 'Connect'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};


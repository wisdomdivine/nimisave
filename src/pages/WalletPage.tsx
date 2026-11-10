import React, { useState } from 'react';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatNimiqAddress, nimToUsd } from '../services/nimiqService';
import { Wallet01Icon, Coins01Icon } from 'hugeicons-react';

export const WalletPage: React.FC = () => {
  const { wallet, transactions } = useSavings();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.nimiqAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const usdValue = nimToUsd(wallet.balanceNim);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl text-neutral-100">
          Nimiq Settlement Wallet
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
          Nimiq powers the settlement infrastructure under the hood. All savings deposits and emergency
          withdrawals settle directly through low latency proof of stake transactions with sponsored gas fees.
        </p>
      </div>

      {/* Wallet balance cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Settlement Balance
            </span>
            <Wallet01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl text-neutral-100">
            {wallet.balanceNim.toLocaleString()} NIM
          </div>
          <span className="text-xs text-neutral-300">
            Equivalent to Approximately ${usdValue.toLocaleString()} USD
          </span>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Emergency Passes
            </span>
            <Coins01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl text-neutral-100">
            {wallet.freeEmergencyWithdrawalsRemaining} Free Passes
          </div>
          <span className="text-xs text-neutral-300">
            Zero Fees Applied for Immediate Life Emergencies
          </span>
        </Card>

        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Gasless Transactions
            </span>
            <Coins01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl text-neutral-100">
            {wallet.sponsoredTxCount} Settled
          </div>
          <span className="text-xs text-neutral-300">
            Transaction Fees Covered by Application Relayer
          </span>
        </Card>
      </section>

      {/* On chain address block */}
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-300">
            Dedicated Nimiq Settlement Address
          </span>
          <span className="text-xs text-neutral-300">
            Mainnet Ready
          </span>
        </div>

        <div className="bg-neutral-950 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs text-neutral-200 break-all">
            {formatNimiqAddress(wallet.nimiqAddress)}
          </span>
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? 'Copied to Clipboard' : 'Copy Address'}
          </Button>
        </div>
      </Card>

      {/* Non punitive withdrawal terms */}
      <div className="bg-neutral-900 p-8 rounded-2xl flex flex-col gap-4">
        <h3 className="text-base text-neutral-100">
          Transparent Emergency Access Policy
        </h3>
        <p className="text-xs text-neutral-300 leading-relaxed">
          Unlike traditional lock up products that impose punitive charges when users need their own money,
          Gammy provides transparent emergency rules. Every user receives free emergency withdrawals. If additional
          early access is required beyond the free allowance, fees are strictly capped at fifteen dollars rather than
          an unbounded percentage of your hard earned savings.
        </p>
      </div>

      {/* Full on chain audit log */}
      <section className="flex flex-col gap-6">
        <h3 className="text-lg text-neutral-100">
          Complete Settlement Records
        </h3>

        <div className="bg-neutral-900 p-6 rounded-3xl flex flex-col gap-3">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl hover:bg-neutral-850 transition-colors gap-3 text-xs text-neutral-200"
            >
              <div className="flex flex-col gap-1">
                <span className="text-neutral-100 text-sm">{tx.goalTitle}</span>
                <span className="text-neutral-300 capitalize">{tx.note || tx.type}</span>
                <span className="text-neutral-400 text-2xs break-all">
                  hash {tx.txHash}
                </span>
              </div>

              <div className="flex flex-col md:items-end gap-1">
                <span className="text-neutral-100 text-sm">
                  ${tx.amount} {tx.type === 'withdrawal' ? 'out' : 'in'}
                </span>
                <span className="text-neutral-300">
                  {tx.date}
                </span>
                <span className="text-neutral-300">
                  Fee {tx.fee === 0 ? '0.00 (Sponsored)' : `$${tx.fee}`}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

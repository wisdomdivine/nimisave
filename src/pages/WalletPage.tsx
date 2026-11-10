import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { formatNimiqAddress, nimToUsd } from '../services/nimiqService';
import {
  Wallet01Icon,
  Coins01Icon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  ArrowDownLeft01Icon,
  ArrowUpRight01Icon,
} from 'hugeicons-react';

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl text-neutral-100">
          Nimiq Settlement Wallet
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
          Nimiq powers the settlement infrastructure under the hood. All savings deposits and emergency
          withdrawals settle directly through low latency proof of stake transactions with sponsored gas fees.
        </p>
      </div>

      {/* Wallet balance cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Settlement Balance
            </span>
            <Wallet01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            {wallet.balanceNim.toLocaleString()} NIM
          </div>
          <span className="text-xs text-neutral-400">
            Equivalent to Approximately ${usdValue.toLocaleString()} USD
          </span>
        </Card>

        <Card className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Emergency Passes
            </span>
            <Coins01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            {wallet.freeEmergencyWithdrawalsRemaining} Free Passes
          </div>
          <span className="text-xs text-neutral-400">
            Zero Fees Applied for Immediate Life Emergencies
          </span>
        </Card>

        <Card className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-300">
              Gasless Transactions
            </span>
            <Coins01Icon size={16} className="text-neutral-300" />
          </div>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            {wallet.sponsoredTxCount} Settled
          </div>
          <span className="text-xs text-neutral-400">
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
          <span className="text-xs text-neutral-400">
            Mainnet Ready
          </span>
        </div>

        <div className="bg-neutral-950 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <span className="text-xs text-neutral-200 break-all font-mono sm:font-sans">
            {formatNimiqAddress(wallet.nimiqAddress)}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopy}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <CheckmarkCircle01Icon size={15} />
                <span>Copied to Clipboard</span>
              </>
            ) : (
              <>
                <Copy01Icon size={15} />
                <span>Copy Address</span>
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Non punitive withdrawal terms */}
      <div className="bg-neutral-900 p-6 sm:p-8 rounded-2xl flex flex-col gap-3 sm:gap-4">
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
      <section className="flex flex-col gap-5 sm:gap-6">
        <h3 className="text-lg text-neutral-100">
          Complete Settlement Records
        </h3>

        <div className="bg-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3">
          {transactions.map((tx) => {
            const isWithdrawal = tx.type === 'withdrawal';
            const TxIcon = isWithdrawal ? ArrowUpRight01Icon : ArrowDownLeft01Icon;

            return (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl hover:bg-neutral-850 transition-colors gap-3 text-xs text-neutral-200"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 sm:p-2.5 bg-neutral-950 rounded-xl flex items-center justify-center text-neutral-300 flex-shrink-0">
                    <TxIcon size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-neutral-100 text-sm">{tx.goalTitle}</span>
                    <span className="text-neutral-400 capitalize">{tx.note || tx.type}</span>
                    <span className="text-neutral-500 text-2xs break-all max-w-[200px] sm:max-w-md truncate">
                      hash {tx.txHash}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-1 pt-1 sm:pt-0">
                  <span className="text-neutral-100 text-sm font-medium">
                    ${tx.amount} {isWithdrawal ? 'out' : 'in'}
                  </span>
                  <div className="flex items-center gap-2 sm:gap-1 text-neutral-400">
                    <span>{tx.date}</span>
                    <span className="hidden sm:inline">·</span>
                    <span>Fee {tx.fee === 0 ? '0.00 (Sponsored)' : `$${tx.fee}`}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </motion.div>
  );
};

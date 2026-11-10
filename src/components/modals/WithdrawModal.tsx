import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useSavings } from '../../context/SavingsContext';
import { calculateWithdrawalDetails, formatAmount, usdtToNim, nimToUsdt } from '../../services/nimiqService';
import { SavingsGoal, Currency } from '../../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, goal }) => {
  const { withdraw, wallet } = useSavings();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(goal?.currency || 'USDT');
  const [amountStr, setAmountStr] = useState<string>(goal?.currency === 'NIM' ? '25000' : '50');
  const [isEmergency, setIsEmergency] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  if (!goal) return null;

  const handleCurrencySwitch = (newCur: Currency) => {
    setSelectedCurrency(newCur);
    setAmountStr(newCur === 'NIM' ? '25000' : '50');
  };

  const amount = parseFloat(amountStr) || 0;

  // Max available in chosen withdrawal currency
  const maxAvailable =
    selectedCurrency === goal.currency
      ? goal.currentAmount
      : selectedCurrency === 'NIM'
      ? usdtToNim(goal.currentAmount)
      : nimToUsdt(goal.currentAmount);

  const details = calculateWithdrawalDetails(
    amount,
    selectedCurrency,
    isEmergency,
    wallet.freeEmergencyWithdrawalsRemaining
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > maxAvailable) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const ok = await withdraw(goal.id, amount, selectedCurrency, isEmergency, 'User initiated withdrawal');
      if (ok) {
        setMessage(`Withdrawal of ${formatAmount(details.netAmount, selectedCurrency)} processed to your wallet`);
        setTimeout(() => {
          setMessage('');
          setIsSubmitting(false);
          onClose();
        }, 1200);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Withdraw from ${goal.title}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <div className="flex flex-col gap-1 text-xs text-neutral-400">
          <span>Available in this goal box</span>
          <span className="text-neutral-100 text-sm font-medium">
            {formatAmount(goal.currentAmount, goal.currency)}
            {goal.currency === 'USDT' && (
              <span className="text-neutral-400 text-xs ml-2">
                (≈ {usdtToNim(goal.currentAmount).toLocaleString()} NIM)
              </span>
            )}
            {goal.currency === 'NIM' && (
              <span className="text-neutral-400 text-xs ml-2">
                (≈ {nimToUsdt(goal.currentAmount).toLocaleString()} USDT)
              </span>
            )}
          </span>
        </div>

        {/* Currency selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-400">
            Withdrawal payout currency
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleCurrencySwitch('USDT')}
              className={`py-2.5 px-3 text-xs rounded-xl cursor-pointer transition-colors ${
                selectedCurrency === 'USDT'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              USDT Stablecoin
            </button>
            <button
              type="button"
              onClick={() => handleCurrencySwitch('NIM')}
              className={`py-2.5 px-3 text-xs rounded-xl cursor-pointer transition-colors ${
                selectedCurrency === 'NIM'
                  ? 'bg-neutral-800 text-neutral-100'
                  : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              NIM Native Token
            </button>
          </div>
        </div>

        <Input
          label={`Amount to withdraw in ${selectedCurrency}`}
          type="number"
          min="1"
          max={maxAvailable}
          step="any"
          prefixText={selectedCurrency === 'USDT' ? '$' : ''}
          suffixText={selectedCurrency}
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
        />

        <div className="flex flex-col gap-2.5">
          <label className="text-xs text-neutral-400">
            Withdrawal terms
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsEmergency(true)}
              className={`p-4 text-left transition-colors rounded-2xl cursor-pointer ${
                isEmergency ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="text-sm text-neutral-100 font-medium">Emergency access</div>
              <div className="text-xs text-neutral-400 mt-1">
                {wallet.freeEmergencyWithdrawalsRemaining} free emergency passes left
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsEmergency(false)}
              className={`p-4 text-left transition-colors rounded-2xl cursor-pointer ${
                !isEmergency ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="text-sm text-neutral-100 font-medium">Standard early unlock</div>
              <div className="text-xs text-neutral-400 mt-1">
                Two percent fee capped at fifteen dollars
              </div>
            </button>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl flex flex-col gap-2 text-xs">
          <div className="flex justify-between text-neutral-400">
            <span>Requested amount</span>
            <span className="text-neutral-200">{formatAmount(details.grossAmount, selectedCurrency)}</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Fee applied</span>
            <span className={details.fee === 0 ? 'text-emerald-400' : 'text-neutral-200'}>
              {details.fee === 0 ? 'Zero fee (Emergency pass)' : formatAmount(details.fee, selectedCurrency)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400 pt-2 bg-neutral-900 p-2.5 rounded-xl">
            <span className="text-neutral-200 font-medium">Net transfer to wallet</span>
            <span className="text-neutral-100 font-medium">{formatAmount(details.netAmount, selectedCurrency)}</span>
          </div>
        </div>

        {message && (
          <div className="bg-neutral-800 p-4 rounded-xl text-xs text-neutral-100 text-center">
            {message}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || amount <= 0 || amount > maxAvailable}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Transferring via Nimiq...' : `Confirm Withdrawal`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

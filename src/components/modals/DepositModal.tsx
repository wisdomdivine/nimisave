import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useSavings } from '../../context/SavingsContext';
import { SavingsGoal, Currency } from '../../types';
import { usdtToNim, nimToUsdt, formatAmount } from '../../services/nimiqService';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, goal }) => {
  const { deposit, wallet } = useSavings();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(goal?.currency || 'USDT');
  const [amount, setAmount] = useState<number>(goal?.currency === 'NIM' ? 10000 : 25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!goal) return null;

  const availableBalance =
    selectedCurrency === 'USDT' ? wallet.balanceUsdt : wallet.balanceNim;

  const quickUsdtAmounts = [10, 25, 50, 100, 250];
  const quickNimAmounts = [2500, 5000, 10000, 25000, 50000];

  const currentQuick = selectedCurrency === 'NIM' ? quickNimAmounts : quickUsdtAmounts;

  const handleCurrencySwitch = (newCur: Currency) => {
    setSelectedCurrency(newCur);
    setCustomAmount('');
    setAmount(newCur === 'NIM' ? 10000 : 25);
  };

  const handleQuickSelect = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const conversionPreview = () => {
    if (selectedCurrency === 'USDT') {
      const nimEquiv = usdtToNim(amount);
      return `≈ ${nimEquiv.toLocaleString()} NIM`;
    }
    const usdtEquiv = nimToUsdt(amount);
    return `≈ ${usdtEquiv.toLocaleString()} USDT`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    if (amount > availableBalance) {
      setErrorMessage(
        `Deposit exceeds available balance of ${selectedCurrency === 'USDT' ? '$' : ''}${availableBalance.toLocaleString()} ${selectedCurrency}.`
      );
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const ok = await deposit(goal.id, amount, selectedCurrency, 'Direct voluntary deposit');
      if (ok) {
        setSuccessMessage(
          `Successfully deposited ${formatAmount(amount, selectedCurrency)} into ${goal.title}`
        );
        setTimeout(() => {
          setSuccessMessage('');
          setIsSubmitting(false);
          onClose();
        }, 1200);
      } else {
        setIsSubmitting(false);
        setErrorMessage('Insufficient available balance for this deposit.');
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contribute to ${goal.title}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        {/* Currency selection toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-neutral-400">
            Deposit currency
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

        {/* Quick selection */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>Quick selection</span>
            <span className="text-neutral-300">{conversionPreview()}</span>
          </div>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {currentQuick.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickSelect(val)}
                className={`py-2.5 sm:py-3 text-xs transition-colors rounded-xl cursor-pointer ${
                  amount === val && customAmount === ''
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {selectedCurrency === 'USDT' ? `$${val}` : `${val >= 1000 ? `${val / 1000}k` : val}`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Input
            label={`Or enter custom amount in ${selectedCurrency}`}
            type="number"
            min="1"
            step="any"
            prefixText={selectedCurrency === 'USDT' ? '$' : ''}
            suffixText={selectedCurrency}
            value={customAmount}
            onChange={(e) => {
              handleCustomChange(e);
              setErrorMessage('');
            }}
          />
          <div className="flex items-center justify-between text-xs text-neutral-400 mt-1 px-1 font-light">
            <span>Available balance:</span>
            <span className={availableBalance > 0 ? 'text-neutral-200' : 'text-neutral-400'}>
              {selectedCurrency === 'USDT'
                ? `$${wallet.balanceUsdt.toLocaleString()} USDT`
                : `${wallet.balanceNim.toLocaleString()} NIM`}
            </span>
          </div>
          {errorMessage && (
            <div className="text-xs text-rose-400 mt-1 px-1 font-light">
              {errorMessage}
            </div>
          )}
        </div>

        <div className="bg-neutral-950 p-4 sm:p-5 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Settlement network</span>
            <span className="text-neutral-200">Nimiq PoS Blockchain</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Network transaction fee</span>
            <span className="text-neutral-100">Zero gas sponsored</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Goal box target</span>
            <span className="text-neutral-200">{formatAmount(goal.targetAmount, goal.currency)}</span>
          </div>
        </div>

        {successMessage && (
          <div className="bg-neutral-800 p-4 rounded-xl text-xs text-neutral-100 text-center">
            {successMessage}
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
            disabled={isSubmitting || amount <= 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Confirming with Nimiq...' : `Deposit ${formatAmount(amount, selectedCurrency)}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

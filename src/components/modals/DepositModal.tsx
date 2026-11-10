import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useSavings } from '../../context/SavingsContext';
import { SavingsGoal } from '../../types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const DepositModal: React.FC<DepositModalProps> = ({ isOpen, onClose, goal }) => {
  const { deposit } = useSavings();
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  if (!goal) return null;

  const quickAmounts = [10, 25, 50, 100, 250];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    setIsSubmitting(true);
    setSuccessMessage('');

    try {
      const ok = await deposit(goal.id, amount, 'Direct contribution');
      if (ok) {
        setSuccessMessage(`Successfully contributed ${amount} dollars to ${goal.title}`);
        setTimeout(() => {
          setSuccessMessage('');
          setIsSubmitting(false);
          onClose();
        }, 1200);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribute to ${goal.title}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-xs text-neutral-400">
            Quick selection
          </span>
          <div className="grid grid-cols-5 gap-2">
            {quickAmounts.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickSelect(val)}
                className={`py-3 text-xs transition-colors rounded-xl cursor-pointer ${
                  amount === val && customAmount === ''
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                ${val}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Or enter custom amount in dollars"
          type="number"
          min="1"
          step="any"
          prefixText="$"
          suffixText="USD"
          value={customAmount}
          onChange={handleCustomChange}
          placeholder="For example 75"
        />

        <div className="bg-neutral-950 p-6 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Settlement network</span>
            <span className="text-neutral-200">Nimiq PoS micro settlement</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Network gas fee</span>
            <span className="text-neutral-200">0.00 dollars sponsored</span>
          </div>
          <div className="flex justify-between text-xs text-neutral-400">
            <span>Progress after deposit</span>
            <span className="text-neutral-200">
              {Math.min(100, Math.round(((goal.currentAmount + amount) / goal.targetAmount) * 100))}%
            </span>
          </div>
        </div>

        {successMessage && (
          <div className="p-4 bg-neutral-800 rounded-xl text-xs text-neutral-200 text-center">
            {successMessage}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting || amount <= 0}>
            {isSubmitting ? 'Confirming with Nimiq...' : `Save $${amount}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

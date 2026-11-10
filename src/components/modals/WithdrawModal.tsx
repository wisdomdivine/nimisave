import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useSavings } from '../../context/SavingsContext';
import { calculateWithdrawalDetails } from '../../services/nimiqService';
import { SavingsGoal } from '../../types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({ isOpen, onClose, goal }) => {
  const { withdraw, wallet } = useSavings();
  const [amountStr, setAmountStr] = useState<string>('50');
  const [isEmergency, setIsEmergency] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  if (!goal) return null;

  const amount = parseFloat(amountStr) || 0;
  const details = calculateWithdrawalDetails(
    amount,
    isEmergency,
    wallet.freeEmergencyWithdrawalsRemaining
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > goal.currentAmount) return;

    setIsSubmitting(true);
    setMessage('');

    try {
      const ok = await withdraw(goal.id, amount, isEmergency, 'User initiated withdrawal');
      if (ok) {
        setMessage(`Withdrawal of ${details.netAmount} dollars processed to your wallet`);
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Withdraw from ${goal.title}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="text-xs font-light text-neutral-400">
          Available in this goal box: {goal.currentAmount} dollars
        </div>

        <Input
          label="Amount to withdraw in dollars"
          type="number"
          min="1"
          max={goal.currentAmount}
          step="any"
          value={amountStr}
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="For example 50"
        />

        <div className="flex flex-col gap-3">
          <label className="text-xs font-light text-neutral-400 tracking-wider">
            Withdrawal category
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsEmergency(true)}
              className={`p-4 text-left transition-colors cursor-pointer ${
                isEmergency ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="text-sm font-light">Emergency access</div>
              <div className="text-xs font-light text-neutral-400 mt-1">
                {wallet.freeEmergencyWithdrawalsRemaining} free emergency passes left
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsEmergency(false)}
              className={`p-4 text-left transition-colors cursor-pointer ${
                !isEmergency ? 'bg-neutral-800 text-neutral-100' : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="text-sm font-light">Standard early unlock</div>
              <div className="text-xs font-light text-neutral-400 mt-1">
                Two percent fee capped at fifteen dollars
              </div>
            </button>
          </div>
        </div>

        <div className="bg-neutral-950 p-4 flex flex-col gap-2">
          <div className="flex justify-between text-xs font-light text-neutral-400">
            <span>Requested amount</span>
            <span className="text-neutral-200">{details.grossAmount} dollars</span>
          </div>
          <div className="flex justify-between text-xs font-light text-neutral-400">
            <span>Administrative deduction</span>
            <span className="text-neutral-200">
              {details.fee === 0 ? 'Zero dollars' : `${details.fee} dollars`}
            </span>
          </div>
          <div className="flex justify-between text-xs font-light text-neutral-400">
            <span>Net funds returned to you</span>
            <span className="text-neutral-100 text-sm">
              {details.netAmount} dollars
            </span>
          </div>
          <p className="text-xs font-light text-neutral-500 mt-2">
            {details.explanation}
          </p>
        </div>

        {message && (
          <div className="p-3 bg-neutral-800 text-xs font-light text-neutral-200 text-center">
            {message}
          </div>
        )}

        <div className="flex justify-end gap-4 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="secondary"
            disabled={isSubmitting || amount <= 0 || amount > goal.currentAmount}
          >
            {isSubmitting ? 'Settling with Nimiq...' : 'Confirm withdrawal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};


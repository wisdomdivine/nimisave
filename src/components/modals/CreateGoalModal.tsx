import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { useSavings } from '../../context/SavingsContext';
import { GoalCategory } from '../../types';
import {
  Home01Icon,
  Car01Icon,
  Airplane01Icon,
  Shield01Icon,
} from 'hugeicons-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal } = useSavings();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('house');
  const [targetAmountStr, setTargetAmountStr] = useState('10000');
  const [initialDepositStr, setInitialDepositStr] = useState('100');
  const [deadlineMonthsStr, setDeadlineMonthsStr] = useState('12');

  const categories: {
    key: GoalCategory;
    label: string;
    desc: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    {
      key: 'house',
      label: 'Dream House',
      desc: 'Foundation walls and roof assemble in 3D',
      icon: Home01Icon,
    },
    {
      key: 'car',
      label: 'Performance Car',
      desc: 'Chassis engine shell and wheels build up',
      icon: Car01Icon,
    },
    {
      key: 'trip',
      label: 'Travel Adventure',
      desc: 'Flights lodging and experience milestones',
      icon: Airplane01Icon,
    },
    {
      key: 'emergency',
      label: 'Emergency Buffer',
      desc: 'Zero deduction emergency access terms',
      icon: Shield01Icon,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(targetAmountStr) || 1000;
    const initialDeposit = parseFloat(initialDepositStr) || 0;
    const deadlineMonths = parseInt(deadlineMonthsStr, 10) || 12;

    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      category,
      targetAmount,
      currentAmount: initialDeposit,
      currency: 'USD',
      deadlineMonths,
    });

    // Reset fields
    setTitle('');
    setCategory('house');
    setTargetAmountStr('10000');
    setInitialDepositStr('100');
    setDeadlineMonthsStr('12');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Savings Box">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
        <p className="text-xs text-neutral-300 leading-relaxed -mt-2">
          Pick a 3D asset theme, set your target amount, and start building brick by brick.
        </p>

        {/* Category selector */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs text-neutral-400">
            Choose asset category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categories.map((c) => {
              const IconComp = c.icon;
              const isSelected = category === c.key;

              return (
                <Card
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className={`p-3.5 flex flex-col gap-1.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-850'
                      : 'bg-neutral-950 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconComp size={16} className="text-neutral-300" />
                      <span className="text-xs text-neutral-100 font-medium">
                        {c.label}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="text-2xs text-neutral-400">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-2xs text-neutral-400 leading-normal">
                    {c.desc}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Form inputs */}
        <Input
          label="Goal Box Title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="For example Modern Mountain Cabin or Tokyo Trip"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Target Amount"
            type="number"
            min="10"
            required
            prefixText="$"
            suffixText="USD"
            value={targetAmountStr}
            onChange={(e) => setTargetAmountStr(e.target.value)}
          />

          <Input
            label="Initial Deposit"
            type="number"
            min="0"
            prefixText="$"
            suffixText="USD"
            value={initialDepositStr}
            onChange={(e) => setInitialDepositStr(e.target.value)}
          />
        </div>

        <Input
          label="Target Timeline"
          type="number"
          min="1"
          max="60"
          suffixText="Months"
          value={deadlineMonthsStr}
          onChange={(e) => setDeadlineMonthsStr(e.target.value)}
        />

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-4 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim()}
            className="w-full sm:w-auto"
          >
            Create Box and Launch 3D View
          </Button>
        </div>
      </form>
    </Modal>
  );
};

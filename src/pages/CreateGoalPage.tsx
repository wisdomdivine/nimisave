import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { GoalCategory } from '../types';

export const CreateGoalPage: React.FC = () => {
  const navigate = useNavigate();
  const { addGoal } = useSavings();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('house');
  const [targetAmountStr, setTargetAmountStr] = useState('10000');
  const [initialDepositStr, setInitialDepositStr] = useState('100');
  const [deadlineMonthsStr, setDeadlineMonthsStr] = useState('12');

  const categories: { key: GoalCategory; label: string; desc: string }[] = [
    {
      key: 'house',
      label: 'Dream house',
      desc: 'Watch foundation walls and roof assemble in 3D as you save',
    },
    {
      key: 'car',
      label: 'Performance car',
      desc: 'Chassis engine shell and wheels build up in 3D',
    },
    {
      key: 'trip',
      label: 'Travel adventure',
      desc: 'Milestones focused on plane tickets lodging and experiences',
    },
    {
      key: 'emergency',
      label: 'Emergency buffer',
      desc: 'Readily accessible stash with zero deduction access terms',
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

    navigate('/');
  };

  return (
    <div className="flex flex-col gap-10 max-w-2xl mx-auto w-full">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-light text-neutral-100 tracking-wide">
          Create a new savings box
        </h1>
        <p className="text-sm font-light text-neutral-400 leading-relaxed">
          Give your goal a visual shape. Pick a 3D asset theme or savings category,
          set your target, and start building brick by brick.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Category selector */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-light text-neutral-400 tracking-wider">
            Choose your 3D asset or category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((c) => (
              <Card
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`p-6 flex flex-col gap-2 cursor-pointer transition-colors ${
                  category === c.key
                    ? 'bg-neutral-850'
                    : 'bg-neutral-900 hover:bg-neutral-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-light text-neutral-100">
                    {c.label}
                  </span>
                  {category === c.key && (
                    <span className="text-xs font-light text-neutral-300">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-xs font-light text-neutral-400 leading-relaxed">
                  {c.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Form inputs */}
        <Input
          label="Goal box title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="For example Cabin in the Woods or Summer Holiday"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Input
            label="Target amount in dollars"
            type="number"
            min="10"
            required
            value={targetAmountStr}
            onChange={(e) => setTargetAmountStr(e.target.value)}
          />

          <Input
            label="Initial contribution in dollars"
            type="number"
            min="0"
            value={initialDepositStr}
            onChange={(e) => setInitialDepositStr(e.target.value)}
          />
        </div>

        <Input
          label="Target timeline in months"
          type="number"
          min="1"
          max="60"
          value={deadlineMonthsStr}
          onChange={(e) => setDeadlineMonthsStr(e.target.value)}
        />

        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!title.trim()}
          >
            Create box and launch 3D view
          </Button>
        </div>
      </form>
    </div>
  );
};


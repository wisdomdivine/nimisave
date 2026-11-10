import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { useSavings } from '../../context/SavingsContext';
import { GoalCategory, Currency, GoalType } from '../../types';
import {
  Home01Icon,
  Car01Icon,
  Airplane01Icon,
  SafeIcon,
  Coins01Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ isOpen, onClose }) => {
  const { addGoal } = useSavings();

  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('target');
  const [category, setCategory] = useState<GoalCategory>('house');
  const [currency, setCurrency] = useState<Currency>('USDT');
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
      desc: 'Foundation walls roof and garden assemble in 3D',
      icon: Home01Icon,
    },
    {
      key: 'car',
      label: 'Performance Car',
      desc: 'Sleek aerodynamic body cockpit and alloy wheels',
      icon: Car01Icon,
    },
    {
      key: 'trip',
      label: 'Travel Journey',
      desc: 'Modern jet flight contrails and destination milestones',
      icon: Airplane01Icon,
    },
    {
      key: 'emergency',
      label: 'Emergency Vault',
      desc: 'Heavy safe door spins open with stacking gold reserves',
      icon: SafeIcon,
    },
  ];

  const handleCurrencyChange = (newCur: Currency) => {
    setCurrency(newCur);
    if (newCur === 'NIM') {
      setTargetAmountStr('2500000');
      setInitialDepositStr('25000');
    } else {
      setTargetAmountStr('10000');
      setInitialDepositStr('100');
    }
  };

  const handleCategoryChange = (newCat: GoalCategory) => {
    setCategory(newCat);
    if (newCat === 'emergency') {
      setGoalType('open_vault');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmount = parseFloat(targetAmountStr) || (currency === 'NIM' ? 100000 : 1000);
    const initialDeposit = parseFloat(initialDepositStr) || 0;
    const deadlineMonths = parseInt(deadlineMonthsStr, 10) || 12;

    if (!title.trim()) return;

    addGoal({
      title: title.trim(),
      category,
      goalType,
      targetAmount,
      currentAmount: initialDeposit,
      currency,
      deadlineMonths: goalType === 'open_vault' ? undefined : deadlineMonths,
    });

    // Reset fields
    setTitle('');
    setCategory('house');
    setGoalType('target');
    setCurrency('USDT');
    setTargetAmountStr('10000');
    setInitialDepositStr('100');
    setDeadlineMonthsStr('12');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Savings Box"
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8 sm:gap-10">
        <p className="text-sm text-neutral-300 leading-relaxed font-light">
          Pick your 3D asset theme, choose your savings currency, and watch your asset assemble with every voluntary deposit.
        </p>

        {/* Spacious two column grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 3D Category Selection & Visual Theme */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-neutral-400 font-medium">
                Choose 3D asset category
              </span>
              <span className="text-2xs text-neutral-500">
                Interactive real time model will assemble as you save
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
              {categories.map((c) => {
                const IconComp = c.icon;
                const isSelected = category === c.key;

                return (
                  <Card
                    key={c.key}
                    onClick={() => handleCategoryChange(c.key)}
                    className={`p-4 sm:p-5 flex flex-col gap-2 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-neutral-800'
                        : 'bg-neutral-950 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-neutral-700 text-neutral-100' : 'bg-neutral-900 text-neutral-300'}`}>
                          <IconComp size={18} />
                        </div>
                        <span className="text-sm text-neutral-100 font-medium">
                          {c.label}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                          <CheckmarkCircle01Icon size={16} />
                          <span>Selected</span>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500">
                          Select
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light pt-1">
                      {c.desc}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Explanatory badge */}
            <div className="bg-neutral-950 p-4 rounded-2xl flex flex-col gap-1.5 text-xs text-neutral-400">
              <span className="text-neutral-200 font-medium">
                Zero Gas Micro Settlements
              </span>
              <p className="text-2xs text-neutral-400 leading-relaxed font-light">
                Every deposit triggers physical construction in your 3D view. All network settlement fees are covered by Nimisave relayer.
              </p>
            </div>
          </div>

          {/* Right Column: Mode, Currency & Financial Parameters */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Savings Box Mode */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs text-neutral-400 font-medium">
                Savings box mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGoalType('target')}
                  className={`p-4 text-left rounded-2xl cursor-pointer transition-colors ${
                    goalType === 'target'
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-100 font-medium">Target Goal</span>
                    {goalType === 'target' && (
                      <CheckmarkCircle01Icon size={16} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-light">
                    Fixed financial target and scheduled timeline
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGoalType('open_vault')}
                  className={`p-4 text-left rounded-2xl cursor-pointer transition-colors ${
                    goalType === 'open_vault'
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-100 font-medium">Open Vault</span>
                    {goalType === 'open_vault' && (
                      <CheckmarkCircle01Icon size={16} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-light">
                    Continuous compounding buffer with no hard ceiling
                  </div>
                </button>
              </div>
            </div>

            {/* Currency Selection: USDT vs NIM */}
            <div className="flex flex-col gap-2.5">
              <label className="text-xs text-neutral-400 font-medium">
                Denomination currency
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleCurrencyChange('USDT')}
                  className={`p-4 text-left rounded-2xl cursor-pointer transition-colors ${
                    currency === 'USDT'
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-100 font-medium">USDT Stablecoin</span>
                    <Coins01Icon size={16} className="text-emerald-400" />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-light">
                    Dollar pegged stable purchasing value
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleCurrencyChange('NIM')}
                  className={`p-4 text-left rounded-2xl cursor-pointer transition-colors ${
                    currency === 'NIM'
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-100 font-medium">NIM Native Token</span>
                    <Coins01Icon size={16} className="text-amber-400" />
                  </div>
                  <div className="text-xs text-neutral-400 mt-1 font-light">
                    Native Nimiq PoS cryptocurrency
                  </div>
                </button>
              </div>
            </div>

            {/* Goal Title */}
            <Input
              label="Goal Box Title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                category === 'house'
                  ? 'For example Modern Mountain Sanctuary'
                  : category === 'car'
                  ? 'For example Electric Performance Sport'
                  : category === 'trip'
                  ? 'For example Tokyo and Kyoto Journey'
                  : 'For example High Security Emergency Reserve'
              }
            />

            {/* Financial Amounts Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={goalType === 'open_vault' ? 'Milestone Target Tier' : 'Target Amount'}
                type="number"
                min="1"
                required
                prefixText={currency === 'USDT' ? '$' : ''}
                suffixText={currency}
                value={targetAmountStr}
                onChange={(e) => setTargetAmountStr(e.target.value)}
              />

              <Input
                label="Initial Deposit"
                type="number"
                min="0"
                prefixText={currency === 'USDT' ? '$' : ''}
                suffixText={currency}
                value={initialDepositStr}
                onChange={(e) => setInitialDepositStr(e.target.value)}
              />
            </div>

            {goalType === 'target' && (
              <Input
                label="Target Timeline"
                type="number"
                min="1"
                max="60"
                suffixText="Months"
                value={deadlineMonthsStr}
                onChange={(e) => setDeadlineMonthsStr(e.target.value)}
              />
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
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
                className="w-full sm:w-auto px-8"
              >
                Create Box and Launch 3D View
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { HobbyCategory } from '../types';
import { formatAmount } from '../services/nimiqService';
import {
  FootballIcon,
  Basketball01Icon,
  GameController01Icon,
  Coins01Icon,
  CheckmarkCircle01Icon,
} from 'hugeicons-react';

export const HobbyPromptsPage: React.FC = () => {
  const {
    prompts,
    goals,
    acceptPrompt,
    selectedHobby,
    selectedTopic,
    setHobbyPreference,
  } = useSavings();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetGoalId, setTargetGoalId] = useState<string>(goals[0]?.id || '');
  const [actionNotice, setActionNotice] = useState<string>('');

  const topicOptions: Record<HobbyCategory, string[]> = {
    football: ['Arsenal', 'Real Madrid', 'Chelsea', 'Barcelona', 'Man City'],
    basketball: ['Golden State', 'Lakers', 'Celtics', 'Bucks'],
    gaming: ['Squad Raid', 'Valorant', 'Apex Legends', 'CS2'],
    crypto: ['Nimiq PoS', 'Staking Run', 'Halving Cycle'],
  };

  const filteredPrompts =
    selectedCategory === 'all'
      ? prompts
      : prompts.filter((p) => p.hobbyCategory === selectedCategory);

  const getHobbyIcon = (cat: HobbyCategory) => {
    switch (cat) {
      case 'football':
        return <FootballIcon size={18} className="text-neutral-300" />;
      case 'basketball':
        return <Basketball01Icon size={18} className="text-neutral-300" />;
      case 'gaming':
        return <GameController01Icon size={18} className="text-neutral-300" />;
      case 'crypto':
        return <Coins01Icon size={18} className="text-neutral-300" />;
      default:
        return null;
    }
  };

  const handleTrigger = async (promptId: string) => {
    if (!targetGoalId) return;
    const ok = await acceptPrompt(promptId, targetGoalId);
    if (ok) {
      setActionNotice('Savings prompt accepted and deposited into your selected box');
      setTimeout(() => setActionNotice(''), 3000);
    }
  };

  const categoryLabels: Record<string, string> = {
    all: 'All',
    football: 'Football',
    basketball: 'Basketball',
    gaming: 'Gaming',
    crypto: 'Crypto',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 sm:gap-10"
    >
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl text-neutral-100 font-light">
          Hobby Savings Prompts
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed font-light">
          Connect your daily passions to your savings habits. Receive voluntary nudges
          whenever your football club wins, your squad completes a game quest, or network milestones happen.
        </p>
      </div>

      {/* Strict boundary notice */}
      <div className="bg-neutral-900 p-5 sm:p-6 rounded-2xl flex flex-col gap-2">
        <span className="text-xs text-neutral-200 font-medium">
          Responsible Financial Design Boundary
        </span>
        <p className="text-xs text-neutral-300 leading-relaxed font-light">
          These are voluntary savings reminders, not wagers or bets. You never risk money on match outcomes
          or token price movements. Every dollar or token you deposit remains one hundred percent your money,
          secured in your savings box and settled on Nimiq.
        </p>
      </div>

      {/* Interest and Team customizer */}
      <div className="bg-neutral-900 p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm text-neutral-100 font-medium">
              Configure Your Active Passion
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Choose which team or interest generates your voluntary savings boosts
            </p>
          </div>
          <span className="text-xs text-neutral-400">
            Selected: {selectedTopic}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {topicOptions[selectedHobby].map((topic) => {
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setHobbyPreference(selectedHobby, topic)}
                className={`px-3 py-1.5 text-xs rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {actionNotice && (
        <div className="bg-neutral-800 p-4 rounded-xl text-xs text-neutral-200 text-center">
          {actionNotice}
        </div>
      )}

      {/* Target Goal Destination Selector */}
      <div className="bg-neutral-900 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-neutral-300">
            Destination Savings Box
          </span>
          <span className="text-2xs text-neutral-400">
            Where your accepted prompt contributions will be deposited
          </span>
        </div>
        <div className="w-full sm:w-72">
          <Select
            label=""
            value={targetGoalId}
            onChange={(val) => setTargetGoalId(val)}
            options={goals.map((g) => ({
              value: g.id,
              label: `${g.title} (${formatAmount(g.currentAmount, g.currency)})`,
            }))}
          />
        </div>
      </div>

      {/* Hobby category filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {Object.entries(categoryLabels).map(([key, label]) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`py-2 px-4 rounded-xl text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Prompts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="flex flex-col justify-between gap-5 sm:gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getHobbyIcon(prompt.hobbyCategory)}
                  <span className="text-xs text-neutral-400 capitalize">
                    {prompt.hobbyCategory}
                  </span>
                </div>
                <span className="text-2xs px-2.5 py-1 rounded-full bg-neutral-800 text-neutral-300">
                  {prompt.teamOrTopic}
                </span>
              </div>

              <h3 className="text-base text-neutral-100 font-light">
                {prompt.title}
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed font-light">
                {prompt.eventDescription}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex flex-col">
                <span className="text-2xs text-neutral-400">
                  Suggested Voluntary Boost
                </span>
                <span className="text-base text-neutral-100 font-medium">
                  {formatAmount(prompt.suggestedAmount, prompt.currency)}
                </span>
              </div>

              {prompt.completed ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckmarkCircle01Icon size={16} />
                  <span>Accepted</span>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTrigger(prompt.id)}
                >
                  Deposit Now
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

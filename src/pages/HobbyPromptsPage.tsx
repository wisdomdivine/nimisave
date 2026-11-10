import React, { useState } from 'react';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { HobbyCategory } from '../types';
import { FootballIcon, Basketball01Icon, GameController01Icon, Coins01Icon } from 'hugeicons-react';

export const HobbyPromptsPage: React.FC = () => {
  const { prompts, goals, acceptPrompt } = useSavings();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [targetGoalId, setTargetGoalId] = useState<string>(goals[0]?.id || '');
  const [actionNotice, setActionNotice] = useState<string>('');

  const filteredPrompts = selectedCategory === 'all'
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
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl text-neutral-100">
          Hobby Savings Prompts
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
          Connect your daily passions to your savings habits. Receive voluntary nudges
          whenever your football club wins, your squad completes a game quest, or network milestones happen.
        </p>
      </div>

      {/* Strict boundary notice */}
      <div className="bg-neutral-900 p-6 rounded-2xl flex flex-col gap-2">
        <span className="text-xs text-neutral-200">
          Responsible Financial Design Boundary
        </span>
        <p className="text-xs text-neutral-300 leading-relaxed">
          These are voluntary savings reminders, not wagers or bets. You never risk money on match outcomes
          or token price movements. Every dollar you deposit remains one hundred percent your money,
          secured in your savings box and settled on Nimiq.
        </p>
      </div>

      {actionNotice && (
        <div className="bg-neutral-800 p-4 rounded-xl text-xs text-neutral-200 text-center">
          {actionNotice}
        </div>
      )}

      {/* Target box selection and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          {['all', 'football', 'basketball', 'gaming', 'crypto'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs transition-colors rounded-xl cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-neutral-100 text-neutral-950 font-normal'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-300">
            Deposit Target:
          </span>
          <select
            value={targetGoalId}
            onChange={(e) => setTargetGoalId(e.target.value)}
            className="bg-neutral-900 text-neutral-200 px-4 py-2 text-xs rounded-xl outline-none cursor-pointer"
          >
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompts list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrompts.map((prompt) => (
          <Card key={prompt.id} className="flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getHobbyIcon(prompt.hobbyCategory)}
                  <span className="text-xs text-neutral-300 capitalize">
                    {prompt.hobbyCategory}
                  </span>
                </div>
                <span className="text-xs text-neutral-300">
                  {prompt.teamOrTopic}
                </span>
              </div>

              <h3 className="text-base text-neutral-100">
                {prompt.title}
              </h3>

              <p className="text-xs text-neutral-300 leading-relaxed">
                {prompt.eventDescription}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-300">
                  Suggested Boost
                </span>
                <span className="text-lg text-neutral-100">
                  ${prompt.suggestedAmount}
                </span>
              </div>

              {prompt.completed ? (
                <span className="text-xs text-neutral-400">
                  Contributed to Goal
                </span>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleTrigger(prompt.id)}
                >
                  Save ${prompt.suggestedAmount}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

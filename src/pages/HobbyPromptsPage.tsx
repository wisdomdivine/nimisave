import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { TopicPickerModal } from '../components/modals/TopicPickerModal';
import { getPopularTopics, getTopicsByCategory } from '../data/hobbyTopics';
import { HobbyCategory } from '../types';
import { formatAmount } from '../services/nimiqService';
import {
  FootballIcon,
  Basketball01Icon,
  GameController01Icon,
  Coins01Icon,
  CheckmarkCircle01Icon,
  Search01Icon,
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
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const popularTopics = useMemo(() => {
    const popular = getPopularTopics(selectedHobby).map((t) => t.name);
    if (selectedTopic && !popular.includes(selectedTopic)) {
      return [selectedTopic, ...popular.slice(0, 5)];
    }
    return popular.slice(0, 6);
  }, [selectedHobby, selectedTopic]);

  const totalCategoryCount = useMemo(() => {
    return getTopicsByCategory(selectedHobby).length;
  }, [selectedHobby]);

  const hobbyCategories: {
    key: HobbyCategory;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
  }[] = [
    { key: 'football', label: 'Football', icon: FootballIcon },
    { key: 'basketball', label: 'Basketball', icon: Basketball01Icon },
    { key: 'gaming', label: 'Gaming', icon: GameController01Icon },
    { key: 'crypto', label: 'Crypto', icon: Coins01Icon },
  ];

  const getDynamicTopicLabel = (hobby: HobbyCategory): string => {
    switch (hobby) {
      case 'football':
        return 'Choose club:';
      case 'basketball':
        return 'Choose team:';
      case 'gaming':
        return 'Choose game:';
      case 'crypto':
        return 'Choose focus:';
      default:
        return 'Choose topic:';
    }
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

        {/* Hobby category switcher with icons and content fit */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hobbyCategories.map(({ key, label, icon: IconComp }) => {
            const isSelected = selectedHobby === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const defaultTopic = getPopularTopics(key)[0]?.name || 'Arsenal';
                  setHobbyPreference(key, defaultTopic);
                }}
                className={`w-fit inline-flex items-center gap-2 py-2 px-3.5 text-xs rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-800 text-neutral-100 font-medium'
                    : 'bg-neutral-950 text-neutral-400 hover:bg-neutral-850 hover:text-neutral-200'
                }`}
              >
                <IconComp
                  size={15}
                  className={isSelected ? 'text-neutral-100' : 'text-neutral-400'}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Topic choices */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-neutral-400 mr-1">
            {getDynamicTopicLabel(selectedHobby)}
          </span>
          {popularTopics.map((topic) => {
            const isSelected = selectedTopic.toLowerCase() === topic.toLowerCase();
            return (
              <button
                key={topic}
                type="button"
                onClick={() => setHobbyPreference(selectedHobby, topic)}
                className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                {topic}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer bg-neutral-950 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 transition-colors"
          >
            <Search01Icon size={13} />
            <span>Browse all ({totalCategoryCount})</span>
          </button>
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
          const IconComp =
            key === 'football'
              ? FootballIcon
              : key === 'basketball'
              ? Basketball01Icon
              : key === 'gaming'
              ? GameController01Icon
              : key === 'crypto'
              ? Coins01Icon
              : null;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedCategory(key)}
              className={`w-fit inline-flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-neutral-100 text-neutral-950 font-medium'
                  : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {IconComp && (
                <IconComp
                  size={14}
                  className={isSelected ? 'text-neutral-950' : 'text-neutral-400'}
                />
              )}
              <span>{label}</span>
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

      <TopicPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        category={selectedHobby}
        selectedTopic={selectedTopic}
        onSelectTopic={(name) => setHobbyPreference(selectedHobby, name)}
      />
    </motion.div>
  );
};

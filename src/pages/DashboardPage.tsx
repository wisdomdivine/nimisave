import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GoalCanvas } from '../components/three/GoalCanvas';
import { DepositModal } from '../components/modals/DepositModal';
import { WithdrawModal } from '../components/modals/WithdrawModal';
import { TopicPickerModal } from '../components/modals/TopicPickerModal';
import { getPopularTopics, getTopicsByCategory } from '../data/hobbyTopics';
import { formatAmount, usdtToNim, nimToUsdt } from '../services/nimiqService';
import { HobbyCategory } from '../types';
import {
  PlusSignIcon,
  Coins01Icon,
  ArrowUpRight01Icon,
  Home01Icon,
  Car01Icon,
  Airplane01Icon,
  SafeIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  FireIcon,
  Group01Icon,
  FootballIcon,
  Basketball01Icon,
  GameController01Icon,
  Search01Icon,
} from 'hugeicons-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const {
    goals,
    activeGoal,
    setActiveGoalId,
    prompts,
    acceptPrompt,
    dismissPrompt,
    wallet,
    transactions,
    openCreateGoal,
    selectedHobby,
    selectedTopic,
    setHobbyPreference,
    streak,
    activeCommunity,
  } = useSavings();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [previewPercent, setPreviewPercent] = useState<number | null>(null);

  // Compute total savings in USD/USDT equivalent across all goals
  const totalSavedUsdt = goals.reduce((sum, g) => {
    if (g.currency === 'NIM') {
      return sum + nimToUsdt(g.currentAmount);
    }
    return sum + g.currentAmount;
  }, 0);

  const totalNimSaved = goals.reduce((sum, g) => {
    if (g.currency === 'NIM') {
      return sum + g.currentAmount;
    }
    return sum + usdtToNim(g.currentAmount);
  }, 0);

  const currentGoalPercent = activeGoal
    ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100))
    : 0;

  const displayPercent = previewPercent !== null ? previewPercent : currentGoalPercent;

  const activePrompt = prompts.find((p) => !p.completed);

  const popularTopics = useMemo(() => {
    const popular = getPopularTopics(selectedHobby).map((t) => t.name);
    if (selectedTopic && !popular.includes(selectedTopic)) {
      return [selectedTopic, ...popular.slice(0, 5)];
    }
    return popular.slice(0, 6);
  }, [selectedHobby, selectedTopic]);

  const totalTopicsCount = useMemo(() => {
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'car':
        return <Car01Icon size={16} className="text-neutral-300" />;
      case 'trip':
        return <Airplane01Icon size={16} className="text-neutral-300" />;
      case 'emergency':
        return <SafeIcon size={16} className="text-neutral-300" />;
      case 'house':
      default:
        return <Home01Icon size={16} className="text-neutral-300" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-10 sm:gap-12"
    >
      {/* Brand Ethos Hero Banner */}
      <section className="bg-neutral-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-2xs text-neutral-400 uppercase tracking-wider font-medium">
              Nimiq Micro Settlement Protocol
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-neutral-100 font-light tracking-tight">
            Save. Play. Build.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
            Automate disciplined savings in stable USDT or native NIM tokens with zero gas fees.
            Watch your physical goals assemble in real time 3D with every victory and habit deposit.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            variant="primary"
            onClick={openCreateGoal}
            className="flex-1 md:flex-initial"
          >
            <PlusSignIcon size={16} className="mr-2" />
            Create Goal Box
          </Button>
          <Link to="/wallet" className="flex-1 md:flex-initial">
            <Button variant="secondary" className="w-full">
              Wallet Overview
            </Button>
          </Link>
        </div>
      </section>

      {/* Top statistics summary */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-xs text-neutral-400">
            Total Funds Saved
          </span>
          <div className="text-2xl sm:text-3xl text-neutral-100 font-light">
            ${Math.round(totalSavedUsdt).toLocaleString()} USDT
          </div>
          <span className="text-xs text-neutral-400">
            Equivalent to {Math.round(totalNimSaved).toLocaleString()} NIM
          </span>
        </Card>

        <Link to="/communities" className="block">
          <Card className="flex flex-col gap-2 hover:bg-neutral-850 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Saving Streak
              </span>
              <FireIcon size={16} className="text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl text-amber-400 font-light">
              {streak.currentDays} Days
            </div>
            <span className="text-xs text-neutral-400">
              Personal Record {streak.longestDays} Days Active
            </span>
          </Card>
        </Link>

        <Link to="/communities" className="block">
          <Card className="flex flex-col gap-2 hover:bg-neutral-850 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-400">
                Supporter Club
              </span>
              <Group01Icon size={16} className="text-neutral-300" />
            </div>
            <div className="text-xl sm:text-2xl text-neutral-100 font-light truncate">
              {activeCommunity.name}
            </div>
            <span className="text-xs text-neutral-400">
              {activeCommunity.memberCount.toLocaleString()} Savers Pooled
            </span>
          </Card>
        </Link>

        <Card className="flex flex-col gap-2">
          <span className="text-xs text-neutral-400">
            Emergency Access
          </span>
          <div className="text-2xl sm:text-3xl text-neutral-100 font-light">
            {wallet.freeEmergencyWithdrawalsRemaining} Free Passes
          </div>
          <span className="text-xs text-neutral-400">
            Zero Penalty for Life Emergencies
          </span>
        </Card>
      </section>

      {/* Interactive Hobby and Passion Selector */}
      <section className="bg-neutral-900 p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm text-neutral-100 font-medium">
              Tailor Your Voluntary Savings Prompts
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Select your hobby and topic to receive personalized victory nudges
            </p>
          </div>
          <span className="text-xs text-neutral-400">
            Current topic: {selectedTopic}
          </span>
        </div>

        {/* Hobby category buttons with icons and content fit */}
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
          {popularTopics.map((top) => {
            const isSelected = selectedTopic.toLowerCase() === top.toLowerCase();
            return (
              <button
                key={top}
                type="button"
                onClick={() => setHobbyPreference(selectedHobby, top)}
                className={`px-3 py-1.5 text-xs rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-neutral-100 text-neutral-950 font-medium'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                }`}
              >
                {top}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg cursor-pointer bg-neutral-950 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850 transition-colors"
          >
            <Search01Icon size={13} />
            <span>Browse all ({totalTopicsCount})</span>
          </button>
        </div>
      </section>

      {/* Hobby prompt voluntary notification if active */}
      {activePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        >
          <div className="flex flex-col gap-1 max-w-2xl">
            <span className="text-xs text-neutral-400">
              Voluntary Habit Trigger ({activePrompt.teamOrTopic})
            </span>
            <p className="text-sm text-neutral-200 font-light">
              {activePrompt.eventDescription}
            </p>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => dismissPrompt(activePrompt.id)}
            >
              Dismiss
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="flex-1 sm:flex-initial"
              onClick={() => {
                if (activeGoal) {
                  acceptPrompt(activePrompt.id, activeGoal.id);
                }
              }}
            >
              Save {formatAmount(activePrompt.suggestedAmount, activePrompt.currency)} Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Empty goals state if none exist yet */}
      {!activeGoal && (
        <section className="bg-neutral-900 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="p-4 bg-neutral-850 rounded-2xl text-neutral-400">
            <SafeIcon size={32} />
          </div>
          <div className="flex flex-col gap-1 max-w-md">
            <h2 className="text-lg text-neutral-100 font-light">No Active Goal Boxes</h2>
            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Create your first live goal box to begin watching your physical aspirations assemble in real time 3D.
            </p>
          </div>
          <Button variant="primary" onClick={openCreateGoal}>
            <PlusSignIcon size={16} className="mr-2" />
            Create Your First Goal Box
          </Button>
        </section>
      )}

      {/* Featured 3D goal builder workspace */}
      {activeGoal && (
        <section className="bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch">
          {/* 3D Canvas visual stage view */}
          <div className="lg:w-7/12 relative flex flex-col">
            {/* Quick model category selector bar */}
            <div className="p-4 sm:p-6 pb-2 flex items-center gap-2 overflow-x-auto">
              {goals.map((g) => {
                const isSelected = g.id === activeGoal.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setActiveGoalId(g.id);
                      setPreviewPercent(null);
                    }}
                    className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs cursor-pointer transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-neutral-100 text-neutral-950'
                        : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                    }`}
                  >
                    {getCategoryIcon(g.category)}
                    <span>{g.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3 sm:p-6 pb-0 flex-1">
              <GoalCanvas category={activeGoal.category} progress={displayPercent} />
            </div>

            <div className="p-4 sm:p-6 bg-neutral-900 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Interactive Build Preview Slider</span>
                <span className="text-neutral-100">{displayPercent}% Visual Stage</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={displayPercent}
                onChange={(e) => setPreviewPercent(Number(e.target.value))}
                className="w-full accent-neutral-100 cursor-pointer bg-neutral-800 h-1.5 rounded-full"
              />
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Foundation</span>
                <span>Assembly</span>
                <span>Refinement</span>
                <span>Completed</span>
              </div>
            </div>
          </div>

          {/* Goal details, action buttons and dynamic milestones */}
          <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between gap-6 sm:gap-8 bg-neutral-900">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400 capitalize">
                  {activeGoal.category} Visual Box
                </span>
                <span className="text-xs text-neutral-300">
                  Target {formatAmount(activeGoal.targetAmount, activeGoal.currency)}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl text-neutral-100 font-light">
                {activeGoal.title}
              </h2>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl text-neutral-100 font-light">
                  {formatAmount(activeGoal.currentAmount, activeGoal.currency)}
                </span>
                <span className="text-xs sm:text-sm text-neutral-400">
                  saved ({currentGoalPercent}% completed)
                </span>
              </div>

              {activeGoal.currency === 'USDT' && (
                <span className="text-xs text-neutral-400 -mt-2">
                  Equivalent to {usdtToNim(activeGoal.currentAmount).toLocaleString()} NIM
                </span>
              )}
              {activeGoal.currency === 'NIM' && (
                <span className="text-xs text-neutral-400 -mt-2">
                  Equivalent to ${nimToUsdt(activeGoal.currentAmount).toLocaleString()} USDT
                </span>
              )}

              <p className="text-xs text-neutral-300 leading-relaxed pt-1 font-light">
                Every voluntary contribution assembles new physical parts of your 3D asset.
                Settled instantly through Nimiq with zero gas cost.
              </p>

              {/* Dynamic milestones list */}
              <div className="flex flex-col gap-2.5 pt-3">
                <span className="text-xs text-neutral-400">
                  Progression Milestones
                </span>
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {activeGoal.milestones.map((m) => {
                    const isUnlocked = currentGoalPercent >= m.thresholdPercent;
                    return (
                      <div
                        key={m.id}
                        className={`p-3 sm:p-4 rounded-xl flex items-center justify-between text-xs transition-colors ${
                          isUnlocked
                            ? 'bg-neutral-800 text-neutral-100'
                            : 'bg-neutral-950 text-neutral-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 pr-2">
                          {isUnlocked ? (
                            <CheckmarkCircle01Icon size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Clock01Icon size={16} className="text-neutral-500 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className={isUnlocked ? 'text-neutral-100' : 'text-neutral-300'}>
                              {m.name}
                            </span>
                            <span className="text-neutral-400 text-2xs sm:text-xs">
                              {m.description}
                            </span>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-xs ${isUnlocked ? 'text-emerald-400' : 'text-neutral-500'}`}>
                          {isUnlocked ? 'Unlocked' : `${m.thresholdPercent}%`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-3">
              <Button
                variant="primary"
                className="w-full sm:flex-1"
                onClick={() => setIsDepositOpen(true)}
              >
                <PlusSignIcon size={16} className="mr-2" />
                Contribute Funds
              </Button>
              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => setIsWithdrawOpen(true)}
              >
                Withdraw
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Goal boxes list */}
      <section className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-100 font-light">
            Your Savings Boxes
          </h3>
          <button
            type="button"
            onClick={openCreateGoal}
            className="flex items-center gap-2 text-xs bg-neutral-100 text-neutral-950 hover:bg-neutral-200 px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer"
          >
            <PlusSignIcon size={14} />
            <span>New Box</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {goals.length === 0 ? (
            <div className="col-span-full bg-neutral-900 p-8 rounded-2xl text-center text-xs text-neutral-400 font-light">
              No goal boxes created yet. Click New Box above to create one.
            </div>
          ) : (
            goals.map((g) => {
              const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
              const isSelected = activeGoal?.id === g.id;

              return (
                <motion.div
                  key={g.id}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                >
                  <Card
                    onClick={() => {
                      setActiveGoalId(g.id);
                      setPreviewPercent(null);
                    }}
                    className={`flex flex-col justify-between gap-5 sm:gap-6 cursor-pointer transition-colors ${
                      isSelected ? 'bg-neutral-850' : 'bg-neutral-900 hover:bg-neutral-850'
                    }`}
                  >
                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <div className="flex items-center gap-1.5">
                          {getCategoryIcon(g.category)}
                          <span className="capitalize">{g.category}</span>
                        </div>
                        <span>{pct}%</span>
                      </div>
                      <h4 className="text-base text-neutral-100 font-light">
                        {g.title}
                      </h4>
                      <div className="text-xl text-neutral-100 pt-1 font-light">
                        {formatAmount(g.currentAmount, g.currency)}
                      </div>
                      <span className="text-xs text-neutral-400">
                        Target of {formatAmount(g.targetAmount, g.currency)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 text-xs text-neutral-400">
                      <span>{isSelected ? 'Viewing in 3D' : 'Inspect in 3D'}</span>
                      <ArrowUpRight01Icon size={14} />
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      {/* Recent Nimiq settlement transactions */}
      <section className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-100 font-light">
            Recent Settlement Activity
          </h3>
          <Link
            to="/wallet"
            className="text-xs text-neutral-400 hover:text-neutral-100 transition-colors cursor-pointer"
          >
            View All Records
          </Link>
        </div>

        <div className="bg-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3">
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-400 font-light">
              No recent settlement activity recorded. Create a goal box or accept a prompt to begin.
            </div>
          ) : (
            transactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-xl hover:bg-neutral-850 transition-colors gap-2 text-xs text-neutral-200"
              >
                <div className="flex items-center gap-3.5">
                  <Coins01Icon size={16} className="text-neutral-300 flex-shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-neutral-100">{tx.goalTitle}</span>
                    <span className="text-neutral-400">{tx.note || tx.type}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-1 sm:pt-0">
                  <span className="text-neutral-400 text-2xs truncate max-w-[120px] sm:max-w-xs">
                    {tx.txHash.slice(0, 16)}...
                  </span>
                  <span className="text-neutral-400">{tx.date}</span>
                  <span
                    className={`font-medium ${
                      tx.type === 'withdrawal'
                        ? 'text-neutral-300'
                        : 'text-neutral-100'
                    }`}
                  >
                    {formatAmount(tx.amount, tx.currency)} {tx.type === 'withdrawal' ? 'out' : 'in'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Modals */}
      <TopicPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        category={selectedHobby}
        selectedTopic={selectedTopic}
        onSelectTopic={(name) => setHobbyPreference(selectedHobby, name)}
      />
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        goal={activeGoal}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        goal={activeGoal}
      />
    </motion.div>
  );
};

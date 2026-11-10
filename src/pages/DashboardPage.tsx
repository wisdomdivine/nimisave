import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { GoalCanvas } from '../components/three/GoalCanvas';
import { DepositModal } from '../components/modals/DepositModal';
import { WithdrawModal } from '../components/modals/WithdrawModal';
import { PlusSignIcon, Coins01Icon, ArrowUpRight01Icon } from 'hugeicons-react';
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
  } = useSavings();

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [previewPercent, setPreviewPercent] = useState<number | null>(null);

  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const overallPercent = Math.round((totalSaved / totalTarget) * 100);

  const currentGoalPercent = activeGoal
    ? Math.min(100, Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100))
    : 0;

  const displayPercent = previewPercent !== null ? previewPercent : currentGoalPercent;

  const activePrompt = prompts.find((p) => !p.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-10 sm:gap-12"
    >
      {/* Top statistics summary */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="flex flex-col gap-2">
          <span className="text-xs text-neutral-300">
            Total Funds Saved
          </span>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            ${totalSaved.toLocaleString()}
          </div>
          <span className="text-xs text-neutral-300">
            Across {goals.length} Personal Savings Boxes
          </span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-xs text-neutral-300">
            Overall Dream Progress
          </span>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            {overallPercent}%
          </div>
          <span className="text-xs text-neutral-300">
            ${(totalTarget - totalSaved).toLocaleString()} Remaining to Target
          </span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="text-xs text-neutral-300">
            Emergency Access Passes
          </span>
          <div className="text-2xl sm:text-3xl text-neutral-100">
            {wallet.freeEmergencyWithdrawalsRemaining} Free Passes
          </div>
          <span className="text-xs text-neutral-300">
            Capped Fees if Extra Access is Needed
          </span>
        </Card>
      </section>

      {/* Hobby prompt voluntary notification if active */}
      {activePrompt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 p-5 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6"
        >
          <div className="flex flex-col gap-1 max-w-2xl">
            <span className="text-xs text-neutral-300">
              Voluntary Hobby Trigger ({activePrompt.teamOrTopic})
            </span>
            <p className="text-sm text-neutral-200">
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
              Save ${activePrompt.suggestedAmount} Now
            </Button>
          </div>
        </motion.div>
      )}

      {/* Featured 3D goal builder workspace */}
      {activeGoal && (
        <section className="bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col lg:flex-row items-stretch">
          {/* 3D Canvas visual stage view */}
          <div className="lg:w-7/12 relative flex flex-col">
            <div className="p-3 sm:p-6 pb-0">
              <GoalCanvas category={activeGoal.category} progress={displayPercent} />
            </div>

            <div className="p-4 sm:p-6 bg-neutral-900 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-neutral-300">
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
              <div className="flex justify-between text-xs text-neutral-300">
                <span>Ground Work</span>
                <span>Framing</span>
                <span>Enclosure</span>
                <span>Complete</span>
              </div>
            </div>
          </div>

          {/* Goal details, action buttons and milestones */}
          <div className="lg:w-5/12 p-6 sm:p-8 flex flex-col justify-between gap-6 sm:gap-8 bg-neutral-900">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-300">
                  Active Visual Goal
                </span>
                <span className="text-xs text-neutral-300">
                  Target ${activeGoal.targetAmount.toLocaleString()}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl text-neutral-100">
                {activeGoal.title}
              </h2>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl text-neutral-100">
                  ${activeGoal.currentAmount.toLocaleString()}
                </span>
                <span className="text-xs sm:text-sm text-neutral-300">
                  saved ({currentGoalPercent}% completed)
                </span>
              </div>

              <p className="text-xs text-neutral-300 leading-relaxed pt-1">
                Every contribution assembles new physical parts of your 3D asset.
                Settled through Nimiq with zero gas cost.
              </p>

              {/* Milestones list */}
              <div className="flex flex-col gap-2.5 pt-3">
                <span className="text-xs text-neutral-300">
                  Construction Milestones
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
                            : 'bg-neutral-950 text-neutral-300'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 pr-2">
                          <span className="text-neutral-200">{m.name}</span>
                          <span className="text-neutral-400 text-2xs sm:text-xs">{m.description}</span>
                        </div>
                        <span className="text-neutral-200 flex-shrink-0">{m.thresholdPercent}%</span>
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
          <h3 className="text-lg text-neutral-100">
            Your Savings Boxes
          </h3>
          <Link
            to="/create"
            className="flex items-center gap-2 text-xs bg-neutral-100 text-neutral-950 hover:bg-neutral-200 px-3.5 py-1.5 sm:py-2 rounded-xl transition-colors cursor-pointer"
          >
            <PlusSignIcon size={14} />
            <span>New Box</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
            const isSelected = activeGoal?.id === g.id;

            return (
              <motion.div
                key={g.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.15 }}
              >
                <Card
                  onClick={() => setActiveGoalId(g.id)}
                  className={`flex flex-col justify-between gap-5 sm:gap-6 cursor-pointer transition-colors ${
                    isSelected ? 'bg-neutral-850' : 'bg-neutral-900 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-xs text-neutral-300">
                      <span className="capitalize">{g.category}</span>
                      <span>{pct}%</span>
                    </div>
                    <h4 className="text-base text-neutral-100">
                      {g.title}
                    </h4>
                    <div className="text-xl text-neutral-100 pt-1">
                      ${g.currentAmount.toLocaleString()}
                    </div>
                    <span className="text-xs text-neutral-300">
                      Goal of ${g.targetAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 text-xs text-neutral-300">
                    <span>{isSelected ? 'Viewing in 3D' : 'Click to Inspect in 3D'}</span>
                    <ArrowUpRight01Icon size={14} />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Recent Nimiq settlement transactions */}
      <section className="flex flex-col gap-5 sm:gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-neutral-100">
            Recent Settlement Activity
          </h3>
          <Link
            to="/wallet"
            className="text-xs text-neutral-300 hover:text-neutral-100 transition-colors cursor-pointer"
          >
            View All Records
          </Link>
        </div>

        <div className="bg-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col gap-3">
          {transactions.slice(0, 4).map((tx) => (
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
                  ${tx.amount} {tx.type === 'withdrawal' ? 'out' : 'in'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
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

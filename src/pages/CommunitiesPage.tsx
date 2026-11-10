import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSavings } from '../context/SavingsContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  FireIcon,
  Group01Icon,
  RankingIcon,
  MedalFirstPlaceIcon,
  MedalSecondPlaceIcon,
  MedalThirdPlaceIcon,
  CheckmarkCircle01Icon,
  Shield01Icon,
  Coins01Icon,
} from 'hugeicons-react';
import { formatAmount } from '../services/nimiqService';

export const CommunitiesPage: React.FC = () => {
  const {
    streak,
    communities,
    activeCommunity,
    setHobbyPreference,
    openCreateGoal,
  } = useSavings();

  const [activeTab, setActiveTab] = useState<'club' | 'all'>('club');
  const [selectedCommunityId, setSelectedCommunityId] = useState<string>(activeCommunity.id);

  useEffect(() => {
    if (activeCommunity?.id) {
      setSelectedCommunityId(activeCommunity.id);
    }
  }, [activeCommunity?.id]);

  const displayedCommunity =
    communities.find((c) => c.id === selectedCommunityId) || activeCommunity;

  const handleSelectCommunity = (comm: typeof displayedCommunity) => {
    setSelectedCommunityId(comm.id);
    setHobbyPreference(comm.hobbyCategory, comm.teamOrTopic);
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <MedalFirstPlaceIcon size={18} className="text-amber-400" />;
      case 2:
        return <MedalSecondPlaceIcon size={18} className="text-neutral-300" />;
      case 3:
        return <MedalThirdPlaceIcon size={18} className="text-amber-600" />;
      default:
        return <span className="text-xs text-neutral-400 font-mono">#{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-8 sm:gap-10"
    >
      {/* Page Title & Intro */}
      <div className="flex flex-col gap-2.5">
        <h1 className="text-2xl text-neutral-100 font-light">
          Savings Communities and Streaks
        </h1>
        <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed font-light">
          Saving with your supporter tribe turns solitary financial discipline into shared momentum.
          Compete on voluntary deposit streaks, climb club leaderboards, and pool collective savings with fellow fans.
        </p>
      </div>

      {/* Streak Dashboard Card */}
      <section className="bg-neutral-900 p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="p-4 bg-neutral-950 text-neutral-200 rounded-2xl flex items-center justify-center">
            <FireIcon size={32} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl text-neutral-100 font-light">
                {streak.currentDays} Day Streak
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-light">
              Personal record {streak.longestDays} days. Every voluntary contribution keeps your streak active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="bg-neutral-950 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs text-neutral-300">
            <Shield01Icon size={16} className="text-neutral-400" />
            <span>{streak.freezesRemaining} Freeze Passes Available</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={openCreateGoal}
          >
            Extend Streak Now
          </Button>
        </div>
      </section>

      {/* Communities Club Selector */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-base text-neutral-100 font-medium">
            Supporter Clubs and Guilds
          </h2>
          <span className="text-xs text-neutral-400">
            Active Community: {displayedCommunity.name}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((comm) => {
            const isSelected = displayedCommunity.id === comm.id;
            return (
              <Card
                key={comm.id}
                onClick={() => handleSelectCommunity(comm)}
                className={`p-5 flex flex-col justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected ? 'bg-neutral-850' : 'bg-neutral-900 hover:bg-neutral-850'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="capitalize">{comm.hobbyCategory}</span>
                    <span className="text-neutral-300">{comm.memberCount.toLocaleString()} Savers</span>
                  </div>
                  <h3 className="text-base text-neutral-100 font-light">
                    {comm.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    {comm.collectiveGoalTitle}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex flex-col">
                    <span className="text-2xs text-neutral-400">Club Pool Saved</span>
                    <span className="text-sm text-neutral-100 font-medium">
                      ${comm.totalPoolUsdt.toLocaleString()} USDT
                    </span>
                  </div>
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <CheckmarkCircle01Icon size={16} />
                      <span>Joined</span>
                    </div>
                  ) : (
                    <span className="text-xs text-neutral-400">
                      Join Club
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Supporter Leaderboard */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RankingIcon size={18} className="text-neutral-300" />
            <h2 className="text-base text-neutral-100 font-medium">
              {displayedCommunity.name} Leaderboard
            </h2>
          </div>
          <span className="text-xs text-neutral-400">
            Updated Daily on Nimiq Network
          </span>
        </div>

        <div className="bg-neutral-900 p-4 sm:p-6 rounded-3xl flex flex-col gap-3">
          {displayedCommunity.leaderboard.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-400 font-light">
              No savers recorded in this club yet. Create a goal box or make a deposit to lead this club.
            </div>
          ) : (
            displayedCommunity.leaderboard.map((entry) => {
              const isMe = entry.isCurrentUser;
              return (
                <div
                  key={entry.rank}
                  className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isMe
                      ? 'bg-neutral-800 text-neutral-100'
                      : 'bg-neutral-950 text-neutral-300 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {getRankBadge(entry.rank)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm ${isMe ? 'text-neutral-100 font-medium' : 'text-neutral-200'}`}>
                          {entry.username}
                        </span>
                      </div>
                      <span className="text-neutral-400 text-2xs">
                        {entry.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-1 sm:pt-0">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <FireIcon size={14} />
                      <span>{entry.streakDays} Day Streak</span>
                    </div>
                    <span className="text-neutral-100 text-sm font-medium">
                      ${entry.totalSavedUsdt.toLocaleString()} USDT
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </motion.div>
  );
};


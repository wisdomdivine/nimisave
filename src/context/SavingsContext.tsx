import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  SavingsGoal,
  GoalMilestone,
  Transaction,
  HobbyPrompt,
  WalletInfo,
  Currency,
  GoalType,
  HobbyCategory,
  SavingsStreakInfo,
  SavingsCommunity,
} from '../types';
import {
  executeSettlement,
  simulateNimiqSettlement,
  calculateWithdrawalDetails,
  usdtToNim,
  nimToUsdt,
} from '../services/nimiqService';
import {
  fetchRemoteGoals,
  upsertRemoteGoal,
  updateRemoteGoalAmount,
  fetchRemoteTransactions,
  insertRemoteTransaction,
  fetchRemoteUserProfile,
  upsertRemoteUserProfile,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  setSecureSessionItem,
  getSecureSessionItem,
  removeSecureSessionItem,
} from '../services/secureSession';
import {
  connectLiveEvmWallet,
  connectLiveNimiqHub,
  getLiveWalletSession,
  disconnectLiveWallet,
  fetchLiveNimPrice,
  LiveWalletSession,
} from '../services/liveWalletService';

interface SavingsContextType {
  goals: SavingsGoal[];
  activeGoal: SavingsGoal | null;
  setActiveGoalId: (id: string) => void;
  transactions: Transaction[];
  prompts: HobbyPrompt[];
  wallet: WalletInfo;
  selectedHobby: HobbyCategory;
  selectedTopic: string;
  setHobbyPreference: (hobby: HobbyCategory, topic: string) => void;
  streak: SavingsStreakInfo;
  communities: SavingsCommunity[];
  activeCommunity: SavingsCommunity;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  isWalletConnected: boolean;
  walletProvider: string | null;
  connectWallet: (provider: string) => Promise<void>;
  disconnectWallet: () => void;
  isConnectModalOpen: boolean;
  setIsConnectModalOpen: (open: boolean) => void;
  openConnectModal: () => void;
  closeConnectModal: () => void;
  deposit: (goalId: string, amount: number, currency?: Currency, note?: string) => Promise<boolean>;
  withdraw: (goalId: string, amount: number, currency: Currency, isEmergency: boolean, note?: string) => Promise<boolean>;
  acceptPrompt: (promptId: string, goalId: string) => Promise<boolean>;
  dismissPrompt: (promptId: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'milestones'>) => void;
  isCreateGoalOpen: boolean;
  setIsCreateGoalOpen: (open: boolean) => void;
  openCreateGoal: () => void;
  closeCreateGoal: () => void;
}

const defaultGoals: SavingsGoal[] = [
  {
    id: 'goal_house',
    title: 'Modern Dream House',
    category: 'house',
    goalType: 'target',
    targetAmount: 350000,
    currentAmount: 145000,
    currency: 'USDT',
    deadlineMonths: 36,
    createdAt: '2026 01 15',
    milestones: [
      { id: 'm1', name: 'Foundation and Site Prep', description: 'Excavation ground grading and foundation slab', thresholdPercent: 20 },
      { id: 'm2', name: 'Concrete Framing and Steel', description: 'Reinforced pillars core columns and floor beams', thresholdPercent: 40 },
      { id: 'm3', name: 'Weatherproof Shell and Walls', description: 'Exterior insulated walls and secure entrance portal', thresholdPercent: 60 },
      { id: 'm4', name: 'Architectural Roof and Glazing', description: 'Pitched modern roof skylights and panoramic glass', thresholdPercent: 80 },
      { id: 'm5', name: 'Interior Finishes and Garden', description: 'Custom carpentry terrace and landscaping', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_car',
    title: 'Electric Performance Car',
    category: 'car',
    goalType: 'target',
    targetAmount: 65000,
    currentAmount: 24500,
    currency: 'USDT',
    deadlineMonths: 18,
    createdAt: '2026 03 01',
    milestones: [
      { id: 'c1', name: 'Structural Chassis and Core', description: 'Underbody aero floor and high capacity battery pack', thresholdPercent: 25 },
      { id: 'c2', name: 'Sport Cockpit and Dash', description: 'Dual racing bucket seats and heads up display', thresholdPercent: 50 },
      { id: 'c3', name: 'Aerodynamic Body Shell', description: 'Metallic bodywork rear diffuser and active spoiler', thresholdPercent: 75 },
      { id: 'c4', name: 'Alloy Wheels and LED Lighting', description: 'Forged lightweight wheels and full LED light array', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_trip',
    title: 'Tokyo and Kyoto Journey',
    category: 'trip',
    goalType: 'target',
    targetAmount: 6500,
    currentAmount: 3900,
    currency: 'USDT',
    deadlineMonths: 8,
    createdAt: '2026 04 12',
    milestones: [
      { id: 't1', name: 'Roundtrip Flights', description: 'Direct international flight tickets reserved', thresholdPercent: 25 },
      { id: 't2', name: 'Ryokan and Boutique Stays', description: 'Traditional hot spring inn and boutique city hotel', thresholdPercent: 50 },
      { id: 't3', name: 'Shinkansen Rail Passes', description: 'High speed bullet train tickets and regional transit', thresholdPercent: 75 },
      { id: 't4', name: 'Culinary and Excursions', description: 'Full cultural travel itinerary and guided tours covered', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_emergency',
    title: 'Perpetual Reserve Vault',
    category: 'emergency',
    goalType: 'open_vault',
    targetAmount: 2500000,
    currentAmount: 750000,
    currency: 'NIM',
    deadlineMonths: 36,
    createdAt: '2026 02 10',
    milestones: [
      { id: 'v1', name: 'Reinforced Outer Casing', description: 'Heavy vault structural enclosure and armor plating', thresholdPercent: 25 },
      { id: 'v2', name: 'Steel Door and Dial', description: 'Rotary combination wheel and deadbolt locking system', thresholdPercent: 50 },
      { id: 'v3', name: 'Internal Gold Stacks', description: 'Physical gold bullion and reserve settlement tokens', thresholdPercent: 75 },
      { id: 'v4', name: 'Open Treasure Chest', description: 'Compounding perpetual safety cushion with zero lockup', thresholdPercent: 100 },
    ],
  },
];

const defaultPrompts: HobbyPrompt[] = [
  {
    id: 'p1',
    title: 'Weekend Football Win',
    hobbyCategory: 'football',
    eventDescription: 'Your chosen club secured three points in the weekend league. Voluntary victory savings boost.',
    suggestedAmount: 25,
    currency: 'USDT',
    teamOrTopic: 'Arsenal',
    completed: false,
  },
  {
    id: 'p2',
    title: 'Basketball Game Night',
    hobbyCategory: 'basketball',
    eventDescription: 'Your team reached over 110 points tonight. Put aside a small boost toward your goal.',
    suggestedAmount: 20,
    currency: 'USDT',
    teamOrTopic: 'Golden State',
    completed: false,
  },
  {
    id: 'p3',
    title: 'Weekend Gaming Quest',
    hobbyCategory: 'gaming',
    eventDescription: 'Weekly gaming raid finished with your squad. Celebrate discipline by adding to your dream.',
    suggestedAmount: 15,
    currency: 'USDT',
    teamOrTopic: 'Squad Raid',
    completed: false,
  },
  {
    id: 'p4',
    title: 'Nimiq Network Milestone',
    hobbyCategory: 'crypto',
    eventDescription: 'Proof of Stake validators reached milestone block. Voluntary habit deposit with zero gas.',
    suggestedAmount: 10000,
    currency: 'NIM',
    teamOrTopic: 'Nimiq PoS',
    completed: false,
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: 'tx_01',
    goalId: 'goal_trip',
    goalTitle: 'Tokyo and Kyoto Journey',
    amount: 250,
    currency: 'USDT',
    equivalentAmount: 71428,
    equivalentCurrency: 'NIM',
    type: 'deposit',
    date: '2026 11 09',
    txHash: 'a71b2d493a04cf91b29a8f2761038b556942ce2139487920ab3e8f192bce9100',
    fee: 0,
    status: 'confirmed',
    note: 'Weekly trip flight savings deposit',
  },
  {
    id: 'tx_02',
    goalId: 'goal_emergency',
    goalTitle: 'Perpetual Reserve Vault',
    amount: 50000,
    currency: 'NIM',
    equivalentAmount: 175,
    equivalentCurrency: 'USDT',
    type: 'deposit',
    date: '2026 11 08',
    txHash: 'e71b2d493a04cf91b29a8f2761038b556942ce2139487920ab3e8f192bce9100',
    fee: 0,
    status: 'confirmed',
    note: 'Native NIM staking reward rollover',
  },
  {
    id: 'tx_03',
    goalId: 'goal_car',
    goalTitle: 'Electric Performance Car',
    amount: 500,
    currency: 'USDT',
    equivalentAmount: 142857,
    equivalentCurrency: 'NIM',
    type: 'deposit',
    date: '2026 11 05',
    txHash: '8b3c990234a419df0123567889bcde44512903847291aebcd398402910293847',
    fee: 0,
    status: 'confirmed',
    note: 'Biweekly car fund contribution',
  },
  {
    id: 'tx_04',
    goalId: 'goal_house',
    goalTitle: 'Modern Dream House',
    amount: 1000,
    currency: 'USDT',
    equivalentAmount: 285714,
    equivalentCurrency: 'NIM',
    type: 'prompt_deposit',
    date: '2026 11 02',
    txHash: '990234123567889bcde44512903847291aebcd3984029102938478b3c88123490',
    fee: 0,
    status: 'confirmed',
    note: 'Arsenal weekend victory voluntary boost',
  },
];

const defaultWallet: WalletInfo = {
  nimiqAddress: '',
  balanceNim: 0,
  balanceUsdt: 0,
  nimPriceUsd: 0.0035,
  freeEmergencyWithdrawalsRemaining: 3,
  sponsoredTxCount: 0,
  isConnected: false,
};

const defaultStreak: SavingsStreakInfo = {
  currentDays: 0,
  longestDays: 0,
  lastDepositDate: '',
  freezesRemaining: 2,
};

const defaultCommunities: SavingsCommunity[] = [
  {
    id: 'comm_arsenal',
    name: 'Arsenal Gunners Club',
    hobbyCategory: 'football',
    teamOrTopic: 'Arsenal',
    memberCount: 1280,
    totalPoolUsdt: 142500,
    collectiveGoalTitle: 'Emirates Stadium Tour and VIP Box Fund',
    leaderboard: [
      { rank: 1, username: 'BukayoSaver', totalSavedUsdt: 14200, streakDays: 42, badge: 'Syndicate Leader' },
      { rank: 2, username: 'ThierryNIM', totalSavedUsdt: 11800, streakDays: 35, badge: 'Veteran Saver' },
      { rank: 3, username: 'NorthLondonGold', totalSavedUsdt: 9400, streakDays: 28, badge: 'Goal Hunter' },
      { rank: 4, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 5, username: 'GunnerFaithful', totalSavedUsdt: 4200, streakDays: 12, badge: 'Discipline Master' },
    ],
  },
  {
    id: 'comm_madrid',
    name: 'Real Madrid Madridistas',
    hobbyCategory: 'football',
    teamOrTopic: 'Real Madrid',
    memberCount: 1840,
    totalPoolUsdt: 218000,
    collectiveGoalTitle: 'Bernabeu Champions League Trip',
    leaderboard: [
      { rank: 1, username: 'HalaNimiq', totalSavedUsdt: 18500, streakDays: 56, badge: 'Syndicate Leader' },
      { rank: 2, username: 'WhiteCrown', totalSavedUsdt: 15200, streakDays: 41, badge: 'Veteran Saver' },
      { rank: 3, username: 'ModricMagic', totalSavedUsdt: 12100, streakDays: 32, badge: 'Goal Hunter' },
      { rank: 4, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 5, username: 'CibelesDream', totalSavedUsdt: 4900, streakDays: 19, badge: 'Discipline Master' },
    ],
  },
  {
    id: 'comm_warriors',
    name: 'Golden State Warriors Hub',
    hobbyCategory: 'basketball',
    teamOrTopic: 'Golden State',
    memberCount: 940,
    totalPoolUsdt: 98000,
    collectiveGoalTitle: 'Chase Center Courtside Season Pass',
    leaderboard: [
      { rank: 1, username: 'CurrySplash', totalSavedUsdt: 16400, streakDays: 48, badge: 'Syndicate Leader' },
      { rank: 2, username: 'BayAreaVault', totalSavedUsdt: 10900, streakDays: 31, badge: 'Veteran Saver' },
      { rank: 3, username: 'DubNation99', totalSavedUsdt: 7800, streakDays: 22, badge: 'Goal Hunter' },
      { rank: 4, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 5, username: 'KlayCoast', totalSavedUsdt: 3600, streakDays: 10, badge: 'Discipline Master' },
    ],
  },
  {
    id: 'comm_gaming',
    name: 'Squad Raid Gamers',
    hobbyCategory: 'gaming',
    teamOrTopic: 'Squad Raid',
    memberCount: 720,
    totalPoolUsdt: 64000,
    collectiveGoalTitle: 'Custom High End Battlestations Fund',
    leaderboard: [
      { rank: 1, username: 'RaidBossLoot', totalSavedUsdt: 12800, streakDays: 39, badge: 'Syndicate Leader' },
      { rank: 2, username: 'PixelKnight', totalSavedUsdt: 9200, streakDays: 27, badge: 'Veteran Saver' },
      { rank: 3, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 4, username: 'MythicDrop', totalSavedUsdt: 4400, streakDays: 15, badge: 'Goal Hunter' },
      { rank: 5, username: 'RespawnDiscipline', totalSavedUsdt: 2900, streakDays: 8, badge: 'Discipline Master' },
    ],
  },
  {
    id: 'comm_nimiq',
    name: 'Nimiq PoS Stakers Circle',
    hobbyCategory: 'crypto',
    teamOrTopic: 'Nimiq PoS',
    memberCount: 2450,
    totalPoolUsdt: 480000,
    collectiveGoalTitle: 'Validator Node Staking Compound Pool',
    leaderboard: [
      { rank: 1, username: 'GenesisValidator', totalSavedUsdt: 35000, streakDays: 90, badge: 'Syndicate Leader' },
      { rank: 2, username: 'AlbatrossNode', totalSavedUsdt: 28400, streakDays: 74, badge: 'Veteran Saver' },
      { rank: 3, username: 'PoSHarvester', totalSavedUsdt: 19800, streakDays: 52, badge: 'Goal Hunter' },
      { rank: 4, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 5, username: 'NIMHolder', totalSavedUsdt: 14200, streakDays: 38, badge: 'Discipline Master' },
    ],
  },
];

export function resolveCommunityForTopic(
  topic: string,
  hobby: HobbyCategory,
  existingCommunities: SavingsCommunity[] = defaultCommunities
): SavingsCommunity {
  const match = existingCommunities.find(
    (c) => c.teamOrTopic.toLowerCase() === topic.toLowerCase()
  );
  if (match) return match;

  const slug = topic.toLowerCase().replace(/[^a-z0-9]/g, '');
  let suffix = 'Club';
  let goalTitle = `${topic} Fan Collective Milestone Pool`;
  if (hobby === 'football') {
    suffix = 'Supporters Club';
    goalTitle = `${topic} Matchday Away Trip and VIP Box Fund`;
  } else if (hobby === 'basketball') {
    suffix = 'Warriors Hub';
    goalTitle = `${topic} Courtside Arena Season Pass`;
  } else if (hobby === 'gaming') {
    suffix = 'Guild';
    goalTitle = `${topic} Squad Gear and Tourney Fund`;
  } else if (hobby === 'crypto') {
    suffix = 'Stakers Circle';
    goalTitle = `${topic} Compounding Staking and Node Pool`;
  }

  const hash = topic.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const memberCount = 750 + (hash % 1600);
  const totalPoolUsdt = 45000 + ((hash * 137) % 220000);

  const cleanTopic = topic.replace(/\s+/g, '');
  return {
    id: `comm_${slug || 'custom'}`,
    name: `${topic} ${suffix}`,
    hobbyCategory: hobby,
    teamOrTopic: topic,
    memberCount,
    totalPoolUsdt,
    collectiveGoalTitle: goalTitle,
    leaderboard: [
      { rank: 1, username: `${cleanTopic}Alpha`, totalSavedUsdt: 18200, streakDays: 52, badge: 'Syndicate Leader' },
      { rank: 2, username: `${cleanTopic}Captain`, totalSavedUsdt: 14500, streakDays: 38, badge: 'Veteran Saver' },
      { rank: 3, username: 'ChainDiscipline', totalSavedUsdt: 10800, streakDays: 29, badge: 'Goal Hunter' },
      { rank: 4, username: 'You', totalSavedUsdt: 5800, streakDays: 14, isCurrentUser: true, badge: 'Active Striker' },
      { rank: 5, username: 'ReserveKeeper', totalSavedUsdt: 4100, streakDays: 11, badge: 'Discipline Master' },
    ],
  };
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('nimisave_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if user still had the old dummy 25000 house price; if so, upgrade to realistic price
          return parsed.map((g: any) => {
            let targetAmount = typeof g.targetAmount === 'number' && g.targetAmount > 0 ? g.targetAmount : 1000;
            let currentAmount = typeof g.currentAmount === 'number' ? g.currentAmount : 0;
            if (g.id === 'goal_house' && targetAmount === 25000) {
              targetAmount = 350000;
              currentAmount = 145000;
            } else if (g.id === 'goal_car' && targetAmount === 18000) {
              targetAmount = 65000;
              currentAmount = 24500;
            } else if (g.id === 'goal_trip' && targetAmount === 4500) {
              targetAmount = 6500;
              currentAmount = 3900;
            }
            return {
              ...g,
              currency: g.currency === 'NIM' ? 'NIM' : 'USDT',
              category: g.category || 'house',
              targetAmount,
              currentAmount,
              milestones: Array.isArray(g.milestones) ? g.milestones : [],
            };
          });
        }
      } catch {
        return defaultGoals;
      }
    }
    return defaultGoals;
  });

  const [activeGoalId, setActiveGoalId] = useState<string>('goal_house');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nimisave_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((tx: any) => ({
            ...tx,
            amount: typeof tx.amount === 'number' ? tx.amount : 0,
            currency: tx.currency === 'NIM' ? 'NIM' : 'USDT',
            fee: typeof tx.fee === 'number' ? tx.fee : 0,
            goalTitle: tx.goalTitle || 'Savings Box',
            date: tx.date || '2026 11 10',
            txHash: tx.txHash || 'e71b2d493a04cf91b29a8f2761038b556942ce2139487920ab3e8f192bce9100',
          }));
        }
      } catch {
        return defaultTransactions;
      }
    }
    return defaultTransactions;
  });

  const [prompts, setPrompts] = useState<HobbyPrompt[]>(() => {
    const saved = localStorage.getItem('nimisave_prompts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            currency: p.currency === 'NIM' ? 'NIM' : 'USDT',
            suggestedAmount: typeof p.suggestedAmount === 'number' ? p.suggestedAmount : 20,
            teamOrTopic: p.teamOrTopic || 'Arsenal',
          }));
        }
      } catch {
        return defaultPrompts;
      }
    }
    return defaultPrompts;
  });

  const [wallet, setWallet] = useState<WalletInfo>(() => {
    const saved = localStorage.getItem('nimisave_wallet');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultWallet,
          ...parsed,
          balanceNim: typeof parsed.balanceNim === 'number' ? parsed.balanceNim : defaultWallet.balanceNim,
          balanceUsdt: typeof parsed.balanceUsdt === 'number' ? parsed.balanceUsdt : defaultWallet.balanceUsdt,
          freeEmergencyWithdrawalsRemaining:
            typeof parsed.freeEmergencyWithdrawalsRemaining === 'number'
              ? parsed.freeEmergencyWithdrawalsRemaining
              : defaultWallet.freeEmergencyWithdrawalsRemaining,
          sponsoredTxCount:
            typeof parsed.sponsoredTxCount === 'number'
              ? parsed.sponsoredTxCount
              : defaultWallet.sponsoredTxCount,
          isConnected: parsed.isConnected ?? true,
          connectedProvider: parsed.connectedProvider ?? 'Nimiq Hub',
        };
      } catch {
        return defaultWallet;
      }
    }
    return defaultWallet;
  });

  const [streak, setStreak] = useState<SavingsStreakInfo>(() => {
    const saved = localStorage.getItem('nimisave_streak');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultStreak;
      }
    }
    return defaultStreak;
  });

  const [selectedHobby, setSelectedHobby] = useState<HobbyCategory>(() => {
    return (localStorage.getItem('nimisave_hobby') as HobbyCategory) || 'football';
  });

  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    return localStorage.getItem('nimisave_topic') || 'Arsenal';
  });

  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const openConnectModal = () => setIsConnectModalOpen(true);
  const closeConnectModal = () => setIsConnectModalOpen(false);

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState<boolean>(false);
  const openCreateGoal = () => setIsCreateGoalOpen(true);
  const closeCreateGoal = () => setIsCreateGoalOpen(false);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('nimisave_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('nimisave_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nimisave_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('nimisave_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nimisave_prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('nimisave_wallet', JSON.stringify(wallet));
  }, [wallet]);

  useEffect(() => {
    localStorage.setItem('nimisave_streak', JSON.stringify(streak));
  }, [streak]);

  const syncUserCloudData = async (address: string) => {
    if (!isSupabaseConfigured() || !address) return;

    try {
      const [remoteGoals, remoteTx, remoteProfile] = await Promise.all([
        fetchRemoteGoals(address),
        fetchRemoteTransactions(address),
        fetchRemoteUserProfile(address),
      ]);

      if (remoteGoals !== null) {
        setGoals(remoteGoals);
        if (remoteGoals.length > 0) {
          setActiveGoalId(remoteGoals[0].id);
        }
      }

      if (remoteTx !== null) {
        setTransactions(remoteTx);
      }

      if (remoteProfile) {
        if (remoteProfile.hobby) setSelectedHobby(remoteProfile.hobby);
        if (remoteProfile.topic) setSelectedTopic(remoteProfile.topic);
        if (remoteProfile.streak) setStreak(remoteProfile.streak);
      }
    } catch (err) {
      console.warn('Error syncing Supabase cloud data:', err);
    }
  };

  // Restore live encrypted session on load
  useEffect(() => {
    let isMounted = true;

    async function initLiveEnvironment() {
      try {
        const livePrice = await fetchLiveNimPrice();
        if (isMounted && livePrice > 0) {
          setWallet((prev) => ({ ...prev, nimPriceUsd: livePrice }));
        }
      } catch {}

      const existingSession = await getLiveWalletSession();
      if (existingSession && isMounted) {
        setIsWalletConnected(true);
        setWalletProvider(existingSession.provider);
        setWallet((prev) => ({
          ...prev,
          isConnected: true,
          nimiqAddress: existingSession.address,
          connectedProvider: existingSession.provider,
          balanceNim: existingSession.balanceNim,
          balanceUsdt: existingSession.balanceUsdt,
        }));

        await syncUserCloudData(existingSession.address);
      } else if (isMounted) {
        setIsWalletConnected(false);
        setWalletProvider(null);
        setWallet((prev) => ({
          ...prev,
          isConnected: false,
          nimiqAddress: '',
        }));
      }
    }

    initLiveEnvironment();

    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (!isMounted) return;
        if (!accounts || accounts.length === 0) {
          disconnectWallet();
        } else {
          const newAddress = accounts[0].toLowerCase();
          setWallet((prev) => ({ ...prev, nimiqAddress: newAddress }));
          await syncUserCloudData(newAddress);
        }
      };

      window.ethereum.on?.('accountsChanged', handleAccountsChanged);

      return () => {
        isMounted = false;
        window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const connectWallet = async (provider: string) => {
    let session: LiveWalletSession;

    if (provider === 'MetaMask and EVM') {
      session = await connectLiveEvmWallet();
    } else if (provider === 'Nimiq Hub') {
      session = await connectLiveNimiqHub();
    } else {
      if (typeof window !== 'undefined' && window.ethereum) {
        session = await connectLiveEvmWallet();
      } else {
        session = await connectLiveNimiqHub();
      }
    }

    setIsWalletConnected(true);
    setWalletProvider(session.provider);
    setWallet((prev) => ({
      ...prev,
      isConnected: true,
      nimiqAddress: session.address,
      connectedProvider: session.provider,
      balanceNim: session.balanceNim,
      balanceUsdt: session.balanceUsdt,
    }));

    try {
      const livePrice = await fetchLiveNimPrice();
      if (livePrice > 0) {
        setWallet((prev) => ({ ...prev, nimPriceUsd: livePrice }));
      }
    } catch {}

    await syncUserCloudData(session.address);
  };

  const disconnectWallet = () => {
    disconnectLiveWallet();
    setIsWalletConnected(false);
    setWalletProvider(null);
    setWallet({
      nimiqAddress: '',
      balanceNim: 0,
      balanceUsdt: 0,
      nimPriceUsd: 0.0035,
      freeEmergencyWithdrawalsRemaining: 3,
      sponsoredTxCount: 0,
      isConnected: false,
    });
    setGoals([]);
    setTransactions([]);
    localStorage.removeItem('nimisave_goals');
    localStorage.removeItem('nimisave_transactions');
    localStorage.removeItem('nimisave_wallet');
  };

  const setHobbyPreference = (hobby: HobbyCategory, topic: string) => {
    setSelectedHobby(hobby);
    setSelectedTopic(topic);
    localStorage.setItem('nimisave_hobby', hobby);
    localStorage.setItem('nimisave_topic', topic);

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      upsertRemoteUserProfile(wallet.nimiqAddress, { hobby, topic });
    }

    setPrompts((prev) =>
      prev.map((p) => {
        if (p.hobbyCategory === hobby) {
          return {
            ...p,
            teamOrTopic: topic,
            completed: false,
            eventDescription:
              hobby === 'football'
                ? `${topic} secured three points in the weekend league. Voluntary victory savings boost.`
                : hobby === 'basketball'
                ? `${topic} scored high in the conference tonight. Voluntary victory savings boost.`
                : hobby === 'gaming'
                ? `${topic} completed raid objectives. Voluntary victory savings boost.`
                : `${topic} achieved network milestone. Voluntary voluntary savings boost.`,
          };
        }
        return p;
      })
    );
  };

  const activeCommunity = useMemo(() => {
    return resolveCommunityForTopic(selectedTopic, selectedHobby, defaultCommunities);
  }, [selectedTopic, selectedHobby]);

  const communities = useMemo(() => {
    const list = [...defaultCommunities];
    const exists = list.some(
      (c) =>
        c.id === activeCommunity.id ||
        c.teamOrTopic.toLowerCase() === activeCommunity.teamOrTopic.toLowerCase()
    );
    if (!exists) {
      return [activeCommunity, ...list];
    }
    return list;
  }, [activeCommunity]);

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const extendStreak = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    setStreak((prev) => {
      const nextDays = prev.currentDays + 1;
      const nextStreak = {
        ...prev,
        currentDays: nextDays,
        longestDays: Math.max(prev.longestDays, nextDays),
        lastDepositDate: dateStr,
      };
      if (isSupabaseConfigured() && wallet.nimiqAddress) {
        upsertRemoteUserProfile(wallet.nimiqAddress, { streak: nextStreak });
      }
      return nextStreak;
    });
  };

  const deposit = async (
    goalId: string,
    amount: number,
    depositCurrency?: Currency,
    note?: string
  ): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return false;

    const usedCurrency: Currency = depositCurrency || targetGoal.currency;
    const settlement = await executeSettlement(wallet.nimiqAddress, wallet.nimiqAddress, amount, usedCurrency);

    let addedAmount = amount;
    if (usedCurrency !== targetGoal.currency) {
      if (usedCurrency === 'NIM' && targetGoal.currency === 'USDT') {
        addedAmount = nimToUsdt(amount);
      } else if (usedCurrency === 'USDT' && targetGoal.currency === 'NIM') {
        addedAmount = usdtToNim(amount);
      }
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      goalId,
      goalTitle: targetGoal.title,
      amount,
      currency: usedCurrency,
      equivalentAmount: usedCurrency === 'NIM' ? settlement.usdtEquivalent : settlement.nimEquivalent,
      equivalentCurrency: usedCurrency === 'NIM' ? 'USDT' : 'NIM',
      type: 'deposit',
      date: dateStr,
      txHash: settlement.txHash,
      fee: 0,
      status: 'confirmed',
      note: note || 'Voluntary deposit',
    };

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + addedAmount } : g
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    setWallet((prev) => ({
      ...prev,
      sponsoredTxCount: prev.sponsoredTxCount + 1,
    }));

    extendStreak();

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      updateRemoteGoalAmount(goalId, targetGoal.currentAmount + addedAmount);
      insertRemoteTransaction(wallet.nimiqAddress, newTx);
    }

    return true;
  };

  const withdraw = async (
    goalId: string,
    amount: number,
    withdrawCurrency: Currency,
    isEmergency: boolean,
    note?: string
  ): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return false;

    let deductionFromGoal = amount;
    if (withdrawCurrency !== targetGoal.currency) {
      if (withdrawCurrency === 'NIM' && targetGoal.currency === 'USDT') {
        deductionFromGoal = nimToUsdt(amount);
      } else if (withdrawCurrency === 'USDT' && targetGoal.currency === 'NIM') {
        deductionFromGoal = usdtToNim(amount);
      }
    }

    if (targetGoal.currentAmount < deductionFromGoal) return false;

    const details = calculateWithdrawalDetails(
      amount,
      withdrawCurrency,
      isEmergency,
      wallet.freeEmergencyWithdrawalsRemaining
    );

    const settlement = await executeSettlement(wallet.nimiqAddress, wallet.nimiqAddress, amount, withdrawCurrency);

    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      goalId,
      goalTitle: targetGoal.title,
      amount: details.netAmount,
      currency: withdrawCurrency,
      equivalentAmount:
        withdrawCurrency === 'NIM' ? settlement.usdtEquivalent : settlement.nimEquivalent,
      equivalentCurrency: withdrawCurrency === 'NIM' ? 'USDT' : 'NIM',
      type: 'withdrawal',
      date: dateStr,
      txHash: settlement.txHash,
      fee: details.fee,
      status: 'confirmed',
      note: note || (isEmergency ? 'Emergency access withdrawal' : 'Standard withdrawal'),
    };

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount - deductionFromGoal } : g
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    if (details.isFreeEmergency) {
      setWallet((prev) => ({
        ...prev,
        freeEmergencyWithdrawalsRemaining: Math.max(0, prev.freeEmergencyWithdrawalsRemaining - 1),
      }));
    }

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      updateRemoteGoalAmount(goalId, targetGoal.currentAmount - deductionFromGoal);
      insertRemoteTransaction(wallet.nimiqAddress, newTx);
    }

    return true;
  };

  const acceptPrompt = async (promptId: string, goalId: string): Promise<boolean> => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (!prompt) return false;

    const success = await deposit(
      goalId,
      prompt.suggestedAmount,
      prompt.currency,
      `${prompt.title} voluntary prompt`
    );

    if (success) {
      setPrompts((prev) =>
        prev.map((p) => (p.id === promptId ? { ...p, completed: true } : p))
      );
    }

    return success;
  };

  const dismissPrompt = (promptId: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
  };

  const addGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'milestones'>) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    const newId = `goal_${Date.now()}`;

    let milestones: GoalMilestone[] = [];
    if (goalData.category === 'house') {
      milestones = [
        { id: 'm1', name: 'Foundation and Site Prep', description: 'Excavation ground grading and foundation slab', thresholdPercent: 20 },
        { id: 'm2', name: 'Concrete Framing and Steel', description: 'Reinforced pillars core columns and floor beams', thresholdPercent: 40 },
        { id: 'm3', name: 'Weatherproof Shell and Walls', description: 'Exterior insulated walls and secure entrance portal', thresholdPercent: 60 },
        { id: 'm4', name: 'Architectural Roof and Glazing', description: 'Pitched modern roof skylights and panoramic glass', thresholdPercent: 80 },
        { id: 'm5', name: 'Interior Finishes and Garden', description: 'Custom carpentry terrace and landscaping', thresholdPercent: 100 },
      ];
    } else if (goalData.category === 'car') {
      milestones = [
        { id: 'c1', name: 'Structural Chassis and Core', description: 'Underbody aero floor and high capacity battery pack', thresholdPercent: 25 },
        { id: 'c2', name: 'Sport Cockpit and Dash', description: 'Dual racing bucket seats and heads up display', thresholdPercent: 50 },
        { id: 'c3', name: 'Aerodynamic Body Shell', description: 'Metallic bodywork rear diffuser and active spoiler', thresholdPercent: 75 },
        { id: 'c4', name: 'Alloy Wheels and LED Lighting', description: 'Forged lightweight wheels and full LED light array', thresholdPercent: 100 },
      ];
    } else if (goalData.category === 'trip') {
      milestones = [
        { id: 't1', name: 'Roundtrip Flights', description: 'Direct international flight tickets reserved', thresholdPercent: 25 },
        { id: 't2', name: 'Ryokan and Boutique Stays', description: 'Traditional hot spring inn and boutique city hotel', thresholdPercent: 50 },
        { id: 't3', name: 'Shinkansen Rail Passes', description: 'High speed bullet train tickets and regional transit', thresholdPercent: 75 },
        { id: 't4', name: 'Culinary and Excursions', description: 'Full cultural travel itinerary and guided tours covered', thresholdPercent: 100 },
      ];
    } else {
      milestones = [
        { id: 'v1', name: 'Reinforced Outer Casing', description: 'Heavy vault structural enclosure and armor plating', thresholdPercent: 25 },
        { id: 'v2', name: 'Steel Door and Dial', description: 'Rotary combination wheel and deadbolt locking system', thresholdPercent: 50 },
        { id: 'v3', name: 'Internal Gold Stacks', description: 'Physical gold bullion and reserve settlement tokens', thresholdPercent: 75 },
        { id: 'v4', name: 'Open Treasure Chest', description: 'Compounding perpetual safety cushion with zero lockup', thresholdPercent: 100 },
      ];
    }

    const newGoal: SavingsGoal = {
      ...goalData,
      id: newId,
      createdAt: dateStr,
      milestones,
    };

    setGoals((prev) => [...prev, newGoal]);
    setActiveGoalId(newId);
    setIsCreateGoalOpen(false);

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      upsertRemoteGoal(wallet.nimiqAddress, newGoal);
    }
  };

  return (
    <SavingsContext.Provider
      value={{
        goals,
        activeGoal,
        setActiveGoalId,
        transactions,
        prompts,
        wallet,
        selectedHobby,
        selectedTopic,
        setHobbyPreference,
        streak,
        communities,
        activeCommunity,
        theme,
        toggleTheme,
        isWalletConnected,
        walletProvider,
        connectWallet,
        disconnectWallet,
        isConnectModalOpen,
        setIsConnectModalOpen,
        openConnectModal,
        closeConnectModal,
        deposit,
        withdraw,
        acceptPrompt,
        dismissPrompt,
        addGoal,
        isCreateGoalOpen,
        setIsCreateGoalOpen,
        openCreateGoal,
        closeCreateGoal,
      }}
    >
      {children}
    </SavingsContext.Provider>
  );
};

export const useSavings = (): SavingsContextType => {
  const context = useContext(SavingsContext);
  if (!context) {
    throw new Error('useSavings must be used within a SavingsProvider');
  }
  return context;
};

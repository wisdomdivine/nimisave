import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  SavingsGoal,
  GoalMilestone,
  Transaction,
  HobbyPrompt,
  WalletInfo,
  Currency,
  HobbyCategory,
  SavingsStreakInfo,
  SavingsCommunity,
  CommunityLeaderboardEntry,
} from '../types';
import {
  executeSettlement,
  calculateWithdrawalDetails,
  usdtToNim,
  nimToUsdt,
  formatNimiqAddress,
} from '../services/nimiqService';
import {
  fetchRemoteGoals,
  upsertRemoteGoal,
  updateRemoteGoalAmount,
  fetchRemoteTransactions,
  insertRemoteTransaction,
  fetchRemoteUserProfile,
  upsertRemoteUserProfile,
  fetchRemotePrompts,
  upsertRemotePrompts,
  deleteRemotePrompt,
  fetchLiveCommunityAggregation,
  LiveCommunityAggregation,
} from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  connectLiveEvmWallet,
  connectLiveNimiqHub,
  connectLiveNimiqPayMiniApp,
  connectLiveNimiqAddress,
  isInsideNimiqPayApp,
  getLiveWalletSession,
  disconnectLiveWallet,
  fetchLiveNimPrice,
  LiveWalletSession,
} from '../services/liveWalletService';
import { setSecureSessionItem } from '../services/secureSession';

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
  isSessionLoading: boolean;
  walletProvider: string | null;
  connectWallet: (provider: string, customAddress?: string) => Promise<void>;
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

const emptyWallet: WalletInfo = {
  nimiqAddress: '',
  balanceNim: 0,
  balanceUsdt: 0,
  nimPriceUsd: 0.0035,
  freeEmergencyWithdrawalsRemaining: 3,
  sponsoredTxCount: 0,
  isConnected: false,
};

const emptyStreak: SavingsStreakInfo = {
  currentDays: 0,
  longestDays: 0,
  lastDepositDate: '',
  freezesRemaining: 2,
};

const baseCommunityDefinitions: {
  id: string;
  name: string;
  hobbyCategory: HobbyCategory;
  teamOrTopic: string;
  collectiveGoalTitle: string;
}[] = [
  {
    id: 'comm_arsenal',
    name: 'Arsenal Gunners Club',
    hobbyCategory: 'football',
    teamOrTopic: 'Arsenal',
    collectiveGoalTitle: 'Emirates Stadium Tour and VIP Box Fund',
  },
  {
    id: 'comm_madrid',
    name: 'Real Madrid Madridistas',
    hobbyCategory: 'football',
    teamOrTopic: 'Real Madrid',
    collectiveGoalTitle: 'Bernabeu Champions League Trip',
  },
  {
    id: 'comm_warriors',
    name: 'Golden State Warriors Hub',
    hobbyCategory: 'basketball',
    teamOrTopic: 'Golden State',
    collectiveGoalTitle: 'Chase Center Courtside Season Pass',
  },
  {
    id: 'comm_gaming',
    name: 'Squad Raid Gamers',
    hobbyCategory: 'gaming',
    teamOrTopic: 'Squad Raid',
    collectiveGoalTitle: 'Custom High End Battlestations Fund',
  },
  {
    id: 'comm_nimiq',
    name: 'Nimiq PoS Stakers Circle',
    hobbyCategory: 'crypto',
    teamOrTopic: 'Nimiq PoS',
    collectiveGoalTitle: 'Validator Node Staking Compound Pool',
  },
];

function buildPromptsForSelection(hobby: HobbyCategory, topic: string): HobbyPrompt[] {
  return [
    {
      id: 'p_football',
      title: 'Weekend Football Win',
      hobbyCategory: 'football',
      eventDescription: `${hobby === 'football' ? topic : 'Arsenal'} secured three points in the weekend league. Voluntary victory savings boost.`,
      suggestedAmount: 25,
      currency: 'USDT',
      teamOrTopic: hobby === 'football' ? topic : 'Arsenal',
      completed: false,
    },
    {
      id: 'p_basketball',
      title: 'Basketball Game Night',
      hobbyCategory: 'basketball',
      eventDescription: `${hobby === 'basketball' ? topic : 'Golden State'} reached over 110 points tonight. Put aside a small boost toward your goal.`,
      suggestedAmount: 20,
      currency: 'USDT',
      teamOrTopic: hobby === 'basketball' ? topic : 'Golden State',
      completed: false,
    },
    {
      id: 'p_gaming',
      title: 'Weekend Gaming Quest',
      hobbyCategory: 'gaming',
      eventDescription: `${hobby === 'gaming' ? topic : 'Squad Raid'} finished weekly raid objectives. Celebrate discipline by adding to your dream.`,
      suggestedAmount: 15,
      currency: 'USDT',
      teamOrTopic: hobby === 'gaming' ? topic : 'Squad Raid',
      completed: false,
    },
    {
      id: 'p_crypto',
      title: 'Nimiq Network Milestone',
      hobbyCategory: 'crypto',
      eventDescription: `${hobby === 'crypto' ? topic : 'Nimiq PoS'} validators reached milestone block. Voluntary habit deposit with zero gas.`,
      suggestedAmount: 10000,
      currency: 'NIM',
      teamOrTopic: hobby === 'crypto' ? topic : 'Nimiq PoS',
      completed: false,
    },
  ];
}

export function resolveCommunityForTopic(
  topic: string,
  hobby: HobbyCategory,
  existingCommunities: SavingsCommunity[] = [],
  aggregation: LiveCommunityAggregation | null = null,
  currentUserAddress: string = '',
  currentUserSavedUsdt: number = 0,
  currentUserStreakDays: number = 0
): SavingsCommunity {
  const existingMatch = existingCommunities.find(
    (c) => c.teamOrTopic.toLowerCase() === topic.toLowerCase()
  );
  if (existingMatch) return existingMatch;

  const baseDef = baseCommunityDefinitions.find(
    (d) => d.teamOrTopic.toLowerCase() === topic.toLowerCase()
  );

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

  const commId = baseDef ? baseDef.id : `comm_${slug || 'custom'}`;
  const commName = baseDef ? baseDef.name : `${topic} ${suffix}`;
  const commGoalTitle = baseDef ? baseDef.collectiveGoalTitle : goalTitle;

  const normalizedTopic = topic.toLowerCase();
  const normalizedUser = currentUserAddress.toLowerCase();

  const matchingProfiles = (aggregation?.profiles || []).filter(
    (p) => p.topic.toLowerCase() === normalizedTopic
  );

  const memberMap = new Map<
    string,
    { address: string; savedUsdt: number; streakDays: number; isCurrentUser: boolean }
  >();

  for (const p of matchingProfiles) {
    const addrKey = p.walletAddress.toLowerCase();
    if (!addrKey) continue;
    const isMe = Boolean(normalizedUser && addrKey === normalizedUser);
    const saved = isMe
      ? currentUserSavedUsdt
      : Math.round(aggregation?.walletTotalsUsdt[addrKey] || 0);
    const strk = isMe ? currentUserStreakDays : p.streakDays;
    memberMap.set(addrKey, {
      address: p.walletAddress,
      savedUsdt: saved,
      streakDays: strk,
      isCurrentUser: isMe,
    });
  }

  if (normalizedUser && !memberMap.has(normalizedUser)) {
    memberMap.set(normalizedUser, {
      address: currentUserAddress,
      savedUsdt: Math.round(currentUserSavedUsdt),
      streakDays: currentUserStreakDays,
      isCurrentUser: true,
    });
  }

  const membersList = Array.from(memberMap.values()).sort(
    (a, b) => b.savedUsdt - a.savedUsdt || b.streakDays - a.streakDays
  );

  const totalPoolUsdt = membersList.reduce((sum, m) => sum + m.savedUsdt, 0);
  const memberCount = membersList.length;

  const leaderboard: CommunityLeaderboardEntry[] = membersList.slice(0, 10).map((m, idx) => ({
    rank: idx + 1,
    username: m.isCurrentUser ? `${formatNimiqAddress(m.address)} (You)` : formatNimiqAddress(m.address),
    totalSavedUsdt: Math.round(m.savedUsdt),
    streakDays: m.streakDays,
    isCurrentUser: m.isCurrentUser,
    badge: idx === 0 && m.savedUsdt > 0 ? 'Club Leader' : m.streakDays > 0 ? 'Active Saver' : 'Club Member',
  }));

  return {
    id: commId,
    name: commName,
    hobbyCategory: hobby,
    teamOrTopic: topic,
    memberCount,
    totalPoolUsdt: Math.round(totalPoolUsdt),
    collectiveGoalTitle: commGoalTitle,
    leaderboard,
  };
}

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean up any legacy unauthenticated dummy keys in localStorage on startup
  useEffect(() => {
    const legacyKeys = [
      'nimisave_goals',
      'nimisave_transactions',
      'nimisave_wallet',
      'nimisave_streak',
      'nimisave_prompts',
    ];
    for (const k of legacyKeys) {
      localStorage.removeItem(k);
    }
  }, []);

  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallet, setWallet] = useState<WalletInfo>(emptyWallet);
  const [streak, setStreak] = useState<SavingsStreakInfo>(emptyStreak);
  const [selectedHobby, setSelectedHobby] = useState<HobbyCategory>(() => {
    return (localStorage.getItem('nimisave_hobby') as HobbyCategory) || 'football';
  });
  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    return localStorage.getItem('nimisave_topic') || 'Arsenal';
  });
  const [prompts, setPrompts] = useState<HobbyPrompt[]>(() =>
    buildPromptsForSelection(
      (localStorage.getItem('nimisave_hobby') as HobbyCategory) || 'football',
      localStorage.getItem('nimisave_topic') || 'Arsenal'
    )
  );
  const [communityAggregation, setCommunityAggregation] = useState<LiveCommunityAggregation | null>(null);

  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState<boolean>(false);
  const openConnectModal = useCallback(() => setIsConnectModalOpen(true), []);
  const closeConnectModal = useCallback(() => setIsConnectModalOpen(false), []);

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState<boolean>(false);
  const openCreateGoal = useCallback(() => setIsCreateGoalOpen(true), []);
  const closeCreateGoal = useCallback(() => setIsCreateGoalOpen(false), []);

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

  const syncUserCloudData = useCallback(async (address: string, nimPrice: number = 0.0035) => {
    if (!address) return;

    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const [remoteGoals, remoteTx, remoteProfile, remotePrompts, liveAgg] = await Promise.all([
        fetchRemoteGoals(address),
        fetchRemoteTransactions(address),
        fetchRemoteUserProfile(address),
        fetchRemotePrompts(address),
        fetchLiveCommunityAggregation(nimPrice),
      ]);

      if (liveAgg) {
        setCommunityAggregation(liveAgg);
      }

      if (remoteGoals !== null) {
        const cleanGoals = remoteGoals.filter(
          (g) => !['goal_house', 'goal_car', 'goal_trip', 'goal_emergency'].includes(g.id)
        );
        setGoals(cleanGoals);
        setActiveGoalId(cleanGoals[0]?.id || '');
      }

      if (remoteTx !== null) {
        const cleanTx = remoteTx.filter(
          (t) => !['tx_01', 'tx_02', 'tx_03', 'tx_04'].includes(t.id)
        );
        setTransactions(cleanTx);
      }

      let activeHobby: HobbyCategory = selectedHobby;
      let activeTopic: string = selectedTopic;

      if (remoteProfile) {
        if (remoteProfile.hobby) {
          activeHobby = remoteProfile.hobby;
          setSelectedHobby(remoteProfile.hobby);
          localStorage.setItem('nimisave_hobby', remoteProfile.hobby);
        }
        if (remoteProfile.topic) {
          activeTopic = remoteProfile.topic;
          setSelectedTopic(remoteProfile.topic);
          localStorage.setItem('nimisave_topic', remoteProfile.topic);
        }
        if (remoteProfile.streak) {
          setStreak(remoteProfile.streak);
        }
        setWallet((prev) => ({
          ...prev,
          freeEmergencyWithdrawalsRemaining:
            typeof remoteProfile.freeEmergencyWithdrawalsRemaining === 'number'
              ? remoteProfile.freeEmergencyWithdrawalsRemaining
              : prev.freeEmergencyWithdrawalsRemaining,
          sponsoredTxCount:
            typeof remoteProfile.sponsoredTxCount === 'number'
              ? remoteProfile.sponsoredTxCount
              : prev.sponsoredTxCount,
        }));
      }

      if (remotePrompts && remotePrompts.length > 0) {
        setPrompts(remotePrompts);
      } else {
        const freshPrompts = buildPromptsForSelection(activeHobby, activeTopic);
        setPrompts(freshPrompts);
        upsertRemotePrompts(address, freshPrompts);
      }
    } catch (err) {
      console.warn('Sync notice:', err);
    }
  }, [selectedHobby, selectedTopic]);

  // Restore live encrypted session on load
  useEffect(() => {
    let isMounted = true;

    async function initLiveEnvironment() {
      const currentNimPrice = 0.0035;
      fetchLiveNimPrice()
        .then((livePrice) => {
          if (livePrice > 0 && isMounted) {
            setWallet((prev) => ({ ...prev, nimPriceUsd: livePrice }));
          }
        })
        .catch(() => {});

      try {
        const existingSession = await getLiveWalletSession();
        if (existingSession && existingSession.address && isMounted) {
          setIsWalletConnected(true);
          setWalletProvider(existingSession.provider);
          setWallet((prev) => ({
            ...prev,
            isConnected: true,
            nimiqAddress: existingSession.address,
            connectedProvider: existingSession.provider,
            balanceNim: existingSession.balanceNim,
            balanceUsdt: existingSession.balanceUsdt,
            nimPriceUsd: prev.nimPriceUsd || currentNimPrice,
          }));

          syncUserCloudData(existingSession.address, currentNimPrice);
        } else if (isMounted) {
          setIsWalletConnected(false);
          setWalletProvider(null);
          setWallet((prev) => ({ ...emptyWallet, nimPriceUsd: prev.nimPriceUsd || currentNimPrice }));
          setGoals([]);
          setTransactions([]);
          setStreak(emptyStreak);
        }
      } finally {
        if (isMounted) {
          setIsSessionLoading(false);
        }
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

  const connectWallet = async (provider: string, customAddress?: string) => {
    let session: LiveWalletSession;

    if (customAddress && customAddress.trim()) {
      session = await connectLiveNimiqAddress(customAddress.trim());
    } else if (provider === 'MetaMask and EVM') {
      session = await connectLiveEvmWallet();
    } else if (provider === 'Nimiq Pay' || provider === 'Nimiq Pay Mobile App') {
      session = await connectLiveNimiqPayMiniApp();
    } else if (provider === 'Nimiq Hub' || provider === 'Ledger Hardware') {
      session = await connectLiveNimiqHub();
    } else {
      if (typeof window !== 'undefined' && window.ethereum) {
        session = await connectLiveEvmWallet();
      } else {
        session = await connectLiveNimiqHub();
      }
    }

    const currentNimPrice = wallet.nimPriceUsd || 0.0035;

    setIsWalletConnected(true);
    setWalletProvider(session.provider);
    setWallet({
      nimiqAddress: session.address,
      connectedProvider: session.provider,
      balanceNim: session.balanceNim,
      balanceUsdt: session.balanceUsdt,
      nimPriceUsd: currentNimPrice,
      freeEmergencyWithdrawalsRemaining: 3,
      sponsoredTxCount: 0,
      isConnected: true,
    });

    fetchLiveNimPrice()
      .then((livePrice) => {
        if (livePrice > 0) {
          setWallet((prev) => ({ ...prev, nimPriceUsd: livePrice }));
        }
      })
      .catch(() => {});

    syncUserCloudData(session.address, currentNimPrice);
  };

  const disconnectWallet = () => {
    disconnectLiveWallet();
    setIsWalletConnected(false);
    setWalletProvider(null);
    setWallet(emptyWallet);
    setGoals([]);
    setActiveGoalId('');
    setTransactions([]);
    setStreak(emptyStreak);
  };

  const setHobbyPreference = (hobby: HobbyCategory, topic: string) => {
    setSelectedHobby(hobby);
    setSelectedTopic(topic);
    localStorage.setItem('nimisave_hobby', hobby);
    localStorage.setItem('nimisave_topic', topic);

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      upsertRemoteUserProfile(wallet.nimiqAddress, { hobby, topic }).then(() => {
        fetchLiveCommunityAggregation(wallet.nimPriceUsd).then((agg) => {
          if (agg) setCommunityAggregation(agg);
        });
      });
    }

    setPrompts((prev) => {
      const updated = prev.map((p) => {
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
                : `${topic} achieved network milestone. Voluntary victory savings boost.`,
          };
        }
        return p;
      });
      if (isSupabaseConfigured() && wallet.nimiqAddress) {
        upsertRemotePrompts(wallet.nimiqAddress, updated);
      }
      return updated;
    });
  };

  const currentUserSavedUsdt = useMemo(() => {
    return goals.reduce((acc, g) => {
      return acc + (g.currency === 'USDT' ? g.currentAmount : nimToUsdt(g.currentAmount));
    }, 0);
  }, [goals]);

  const baseCommunities = useMemo(() => {
    return baseCommunityDefinitions.map((def) => {
      const isUserActiveTopic = def.teamOrTopic.toLowerCase() === selectedTopic.toLowerCase();
      return resolveCommunityForTopic(
        def.teamOrTopic,
        def.hobbyCategory,
        [],
        communityAggregation,
        isUserActiveTopic ? wallet.nimiqAddress : '',
        currentUserSavedUsdt,
        streak.currentDays
      );
    });
  }, [communityAggregation, selectedTopic, wallet.nimiqAddress, currentUserSavedUsdt, streak.currentDays]);

  const activeCommunity = useMemo(() => {
    return resolveCommunityForTopic(
      selectedTopic,
      selectedHobby,
      baseCommunities,
      communityAggregation,
      wallet.nimiqAddress,
      currentUserSavedUsdt,
      streak.currentDays
    );
  }, [
    selectedTopic,
    selectedHobby,
    baseCommunities,
    communityAggregation,
    wallet.nimiqAddress,
    currentUserSavedUsdt,
    streak.currentDays,
  ]);

  const communities = useMemo(() => {
    const exists = baseCommunities.some(
      (c) =>
        c.id === activeCommunity.id ||
        c.teamOrTopic.toLowerCase() === activeCommunity.teamOrTopic.toLowerCase()
    );
    if (!exists) {
      return [activeCommunity, ...baseCommunities];
    }
    return baseCommunities.map((c) =>
      c.teamOrTopic.toLowerCase() === activeCommunity.teamOrTopic.toLowerCase()
        ? activeCommunity
        : c
    );
  }, [baseCommunities, activeCommunity]);

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const extendStreak = () => {
    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;
    setStreak((prev) => {
      if (prev.lastDepositDate === dateStr && prev.currentDays > 0) {
        return prev;
      }
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

  const updateSessionBalances = async (nextBalanceNim: number, nextBalanceUsdt: number) => {
    try {
      const existing = await getLiveWalletSession();
      if (existing) {
        await setSecureSessionItem('nimisave_auth_session', {
          ...existing,
          balanceNim: nextBalanceNim,
          balanceUsdt: nextBalanceUsdt,
        });
      }
    } catch {}
  };

  const deposit = async (
    goalId: string,
    amount: number,
    depositCurrency?: Currency,
    note?: string
  ): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal || !wallet.nimiqAddress || amount <= 0) return false;

    const usedCurrency: Currency = depositCurrency || targetGoal.currency;
    const available = usedCurrency === 'NIM' ? wallet.balanceNim : wallet.balanceUsdt;
    if (amount > available) {
      return false;
    }

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

    const nextGoalAmount = targetGoal.currentAmount + addedAmount;

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: nextGoalAmount } : g
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    const nextSponsored = wallet.sponsoredTxCount + 1;
    const nextBalanceNim =
      usedCurrency === 'NIM' ? Math.max(0, wallet.balanceNim - amount) : wallet.balanceNim;
    const nextBalanceUsdt =
      usedCurrency === 'USDT' ? Math.max(0, Math.round((wallet.balanceUsdt - amount) * 100) / 100) : wallet.balanceUsdt;

    setWallet((prev) => ({
      ...prev,
      balanceNim: nextBalanceNim,
      balanceUsdt: nextBalanceUsdt,
      sponsoredTxCount: nextSponsored,
    }));

    updateSessionBalances(nextBalanceNim, nextBalanceUsdt);
    extendStreak();

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      await Promise.all([
        updateRemoteGoalAmount(goalId, nextGoalAmount),
        insertRemoteTransaction(wallet.nimiqAddress, newTx),
        upsertRemoteUserProfile(wallet.nimiqAddress, { sponsoredTxCount: nextSponsored }),
      ]);
      const agg = await fetchLiveCommunityAggregation(wallet.nimPriceUsd);
      if (agg) setCommunityAggregation(agg);
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
    if (!targetGoal || !wallet.nimiqAddress || amount <= 0) return false;

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

    const nextGoalAmount = Math.max(0, targetGoal.currentAmount - deductionFromGoal);

    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: nextGoalAmount } : g
      )
    );

    setTransactions((prev) => [newTx, ...prev]);

    const nextFreePasses = details.isFreeEmergency
      ? Math.max(0, wallet.freeEmergencyWithdrawalsRemaining - 1)
      : wallet.freeEmergencyWithdrawalsRemaining;
    const nextBalanceNim =
      withdrawCurrency === 'NIM' ? wallet.balanceNim + details.netAmount : wallet.balanceNim;
    const nextBalanceUsdt =
      withdrawCurrency === 'USDT'
        ? Math.round((wallet.balanceUsdt + details.netAmount) * 100) / 100
        : wallet.balanceUsdt;

    setWallet((prev) => ({
      ...prev,
      balanceNim: nextBalanceNim,
      balanceUsdt: nextBalanceUsdt,
      freeEmergencyWithdrawalsRemaining: nextFreePasses,
    }));

    updateSessionBalances(nextBalanceNim, nextBalanceUsdt);

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      await Promise.all([
        updateRemoteGoalAmount(goalId, nextGoalAmount),
        insertRemoteTransaction(wallet.nimiqAddress, newTx),
        upsertRemoteUserProfile(wallet.nimiqAddress, {
          freeEmergencyWithdrawalsRemaining: nextFreePasses,
        }),
      ]);
      const agg = await fetchLiveCommunityAggregation(wallet.nimPriceUsd);
      if (agg) setCommunityAggregation(agg);
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
      setPrompts((prev) => {
        const updated = prev.map((p) => (p.id === promptId ? { ...p, completed: true } : p));
        if (isSupabaseConfigured() && wallet.nimiqAddress) {
          upsertRemotePrompts(wallet.nimiqAddress, updated);
        }
        return updated;
      });
    }

    return success;
  };

  const dismissPrompt = (promptId: string) => {
    setPrompts((prev) => prev.filter((p) => p.id !== promptId));
    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      deleteRemotePrompt(wallet.nimiqAddress, promptId);
    }
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

    if (goalData.currentAmount > 0 && wallet.nimiqAddress) {
      const nextBalanceNim =
        goalData.currency === 'NIM'
          ? Math.max(0, wallet.balanceNim - goalData.currentAmount)
          : wallet.balanceNim;
      const nextBalanceUsdt =
        goalData.currency === 'USDT'
          ? Math.max(0, Math.round((wallet.balanceUsdt - goalData.currentAmount) * 100) / 100)
          : wallet.balanceUsdt;
      const nextSponsored = wallet.sponsoredTxCount + 1;

      setWallet((prev) => ({
        ...prev,
        balanceNim: nextBalanceNim,
        balanceUsdt: nextBalanceUsdt,
        sponsoredTxCount: nextSponsored,
      }));
      updateSessionBalances(nextBalanceNim, nextBalanceUsdt);
      extendStreak();

      executeSettlement(
        wallet.nimiqAddress,
        wallet.nimiqAddress,
        goalData.currentAmount,
        goalData.currency
      ).then((settlement) => {
        const initTx: Transaction = {
          id: `tx_${Date.now()}`,
          goalId: newId,
          goalTitle: newGoal.title,
          amount: goalData.currentAmount,
          currency: goalData.currency,
          equivalentAmount:
            goalData.currency === 'NIM' ? settlement.usdtEquivalent : settlement.nimEquivalent,
          equivalentCurrency: goalData.currency === 'NIM' ? 'USDT' : 'NIM',
          type: 'deposit',
          date: dateStr,
          txHash: settlement.txHash,
          fee: 0,
          status: 'confirmed',
          note: 'Initial goal box deposit',
        };
        setTransactions((prev) => [initTx, ...prev]);
        if (isSupabaseConfigured() && wallet.nimiqAddress) {
          insertRemoteTransaction(wallet.nimiqAddress, initTx);
          upsertRemoteUserProfile(wallet.nimiqAddress, { sponsoredTxCount: nextSponsored });
        }
      });
    }

    if (isSupabaseConfigured() && wallet.nimiqAddress) {
      upsertRemoteGoal(wallet.nimiqAddress, newGoal).then(() => {
        fetchLiveCommunityAggregation(wallet.nimPriceUsd).then((agg) => {
          if (agg) setCommunityAggregation(agg);
        });
      });
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
        isSessionLoading,
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

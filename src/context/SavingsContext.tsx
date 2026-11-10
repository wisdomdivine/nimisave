import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SavingsGoal,
  GoalMilestone,
  Transaction,
  HobbyPrompt,
  WalletInfo,
  Currency,
  GoalType,
  HobbyCategory,
} from '../types';
import {
  simulateNimiqSettlement,
  calculateWithdrawalDetails,
  usdtToNim,
  nimToUsdt,
} from '../services/nimiqService';

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
    targetAmount: 25000,
    currentAmount: 14500,
    currency: 'USDT',
    deadlineMonths: 24,
    createdAt: '2026 01 15',
    milestones: [
      { id: 'm1', name: 'Foundation Slab', description: 'Excavation and ground concrete', thresholdPercent: 20 },
      { id: 'm2', name: 'Framing Pillars', description: 'Wood beams and core columns', thresholdPercent: 40 },
      { id: 'm3', name: 'Enclosed Walls', description: 'Outer walls and entrance', thresholdPercent: 60 },
      { id: 'm4', name: 'Pitched Roof', description: 'Roof structure and chimney', thresholdPercent: 80 },
      { id: 'm5', name: 'Glass and Garden', description: 'Glazing porch and landscaping', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_car',
    title: 'Electric Performance Car',
    category: 'car',
    goalType: 'target',
    targetAmount: 18000,
    currentAmount: 7200,
    currency: 'USDT',
    deadlineMonths: 18,
    createdAt: '2026 03 01',
    milestones: [
      { id: 'c1', name: 'Chassis Platform', description: 'Underbody floor and battery pack', thresholdPercent: 25 },
      { id: 'c2', name: 'Sport Cockpit', description: 'Dual racing seats and dash display', thresholdPercent: 50 },
      { id: 'c3', name: 'Aerodynamic Shell', description: 'Metallic bodywork and rear spoiler', thresholdPercent: 75 },
      { id: 'c4', name: 'Wheels and LED Lights', description: 'Alloy wheels and full lighting array', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_trip',
    title: 'Tokyo and Kyoto Journey',
    category: 'trip',
    goalType: 'target',
    targetAmount: 4500,
    currentAmount: 2925,
    currency: 'USDT',
    deadlineMonths: 10,
    createdAt: '2026 04 12',
    milestones: [
      { id: 't1', name: 'Roundtrip Flights', description: 'Long haul flight tickets reserved', thresholdPercent: 25 },
      { id: 't2', name: 'Ryokan Stays', description: 'Traditional accommodations booked', thresholdPercent: 50 },
      { id: 't3', name: 'High Speed Shinkansen', description: 'Rail passes and city transits ready', thresholdPercent: 75 },
      { id: 't4', name: 'Culinary and Excursions', description: 'Full cultural travel itinerary covered', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_emergency',
    title: 'Perpetual Reserve Vault',
    category: 'emergency',
    goalType: 'open_vault',
    targetAmount: 1000000,
    currentAmount: 742850,
    currency: 'NIM',
    deadlineMonths: 36,
    createdAt: '2026 02 10',
    milestones: [
      { id: 'v1', name: 'Reinforced Outer Casing', description: 'Heavy vault structural enclosure', thresholdPercent: 25 },
      { id: 'v2', name: 'Steel Door and Dial', description: 'Rotary dial and bolt locking system', thresholdPercent: 50 },
      { id: 'v3', name: 'Internal Gold Stacks', description: 'Physical gold bullion and reserve tokens', thresholdPercent: 75 },
      { id: 'v4', name: 'Open Treasure Chest', description: 'Compounding perpetual safety cushion', thresholdPercent: 100 },
    ],
  },
];

const defaultPrompts: HobbyPrompt[] = [
  {
    id: 'p1',
    title: 'Weekend Football Win',
    hobbyCategory: 'football',
    eventDescription: 'Your chosen club secured three points in the weekend league. Voluntary victory savings boost.',
    suggestedAmount: 20,
    currency: 'USDT',
    teamOrTopic: 'Arsenal',
    completed: false,
  },
  {
    id: 'p2',
    title: 'Basketball Game Night',
    hobbyCategory: 'basketball',
    eventDescription: 'Your team reached over 110 points tonight. Put aside a small boost toward your goal.',
    suggestedAmount: 15,
    currency: 'USDT',
    teamOrTopic: 'Golden State',
    completed: false,
  },
  {
    id: 'p3',
    title: 'Weekend Gaming Quest',
    hobbyCategory: 'gaming',
    eventDescription: 'Weekly gaming raid finished with your squad. Celebrate discipline by adding to your dream.',
    suggestedAmount: 10,
    currency: 'USDT',
    teamOrTopic: 'Squad Raid',
    completed: false,
  },
  {
    id: 'p4',
    title: 'Nimiq Network Milestone',
    hobbyCategory: 'crypto',
    eventDescription: 'Proof of Stake validators reached milestone block. Voluntary habit deposit with zero gas.',
    suggestedAmount: 5000,
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
    amount: 150,
    currency: 'USDT',
    equivalentAmount: 42857,
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
    amount: 150,
    currency: 'USDT',
    equivalentAmount: 42857,
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
    amount: 20,
    currency: 'USDT',
    equivalentAmount: 5714,
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
  nimiqAddress: 'NQ42 8X7K M9V1 B2L8 QP03 7N92 Y44D 10KL',
  balanceNim: 742857,
  balanceUsdt: 2500,
  nimPriceUsd: 0.0035,
  freeEmergencyWithdrawalsRemaining: 2,
  sponsoredTxCount: 32,
};

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('nimisave_goals');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((g: any) => ({
            ...g,
            currency: g.currency === 'NIM' ? 'NIM' : 'USDT',
            category: g.category || 'house',
            currentAmount: typeof g.currentAmount === 'number' ? g.currentAmount : 0,
            targetAmount: typeof g.targetAmount === 'number' && g.targetAmount > 0 ? g.targetAmount : 1000,
            milestones: Array.isArray(g.milestones) ? g.milestones : [],
          }));
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
        };
      } catch {
        return defaultWallet;
      }
    }
    return defaultWallet;
  });

  const [selectedHobby, setSelectedHobby] = useState<HobbyCategory>(() => {
    return (localStorage.getItem('nimisave_hobby') as HobbyCategory) || 'football';
  });

  const [selectedTopic, setSelectedTopic] = useState<string>(() => {
    return localStorage.getItem('nimisave_topic') || 'Arsenal';
  });

  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState<boolean>(false);
  const openCreateGoal = () => setIsCreateGoalOpen(true);
  const closeCreateGoal = () => setIsCreateGoalOpen(false);

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

  const setHobbyPreference = (hobby: HobbyCategory, topic: string) => {
    setSelectedHobby(hobby);
    setSelectedTopic(topic);
    localStorage.setItem('nimisave_hobby', hobby);
    localStorage.setItem('nimisave_topic', topic);

    // Update active prompts to reflect this topic
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

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const deposit = async (
    goalId: string,
    amount: number,
    depositCurrency?: Currency,
    note?: string
  ): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return false;

    const usedCurrency: Currency = depositCurrency || targetGoal.currency;
    const settlement = await simulateNimiqSettlement(wallet.nimiqAddress, amount, usedCurrency);

    // Calculate effective added amount in the goal's native currency
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

    const settlement = await simulateNimiqSettlement(wallet.nimiqAddress, amount, withdrawCurrency);

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
        { id: 'm1', name: 'Foundation Slab', description: 'Excavation and ground concrete', thresholdPercent: 20 },
        { id: 'm2', name: 'Framing Pillars', description: 'Wood beams and core columns', thresholdPercent: 40 },
        { id: 'm3', name: 'Enclosed Walls', description: 'Outer walls and entrance', thresholdPercent: 60 },
        { id: 'm4', name: 'Pitched Roof', description: 'Roof structure and chimney', thresholdPercent: 80 },
        { id: 'm5', name: 'Glass and Garden', description: 'Glazing porch and landscaping', thresholdPercent: 100 },
      ];
    } else if (goalData.category === 'car') {
      milestones = [
        { id: 'c1', name: 'Chassis Platform', description: 'Underbody floor and battery pack', thresholdPercent: 25 },
        { id: 'c2', name: 'Sport Cockpit', description: 'Dual racing seats and dash display', thresholdPercent: 50 },
        { id: 'c3', name: 'Aerodynamic Shell', description: 'Metallic bodywork and rear spoiler', thresholdPercent: 75 },
        { id: 'c4', name: 'Wheels and LED Lights', description: 'Alloy wheels and full lighting array', thresholdPercent: 100 },
      ];
    } else if (goalData.category === 'trip') {
      milestones = [
        { id: 't1', name: 'Roundtrip Flights', description: 'Long haul flight tickets reserved', thresholdPercent: 25 },
        { id: 't2', name: 'Lodging Stays', description: 'Scenic accommodations booked', thresholdPercent: 50 },
        { id: 't3', name: 'Transit Passes', description: 'High speed transfers and travel passes', thresholdPercent: 75 },
        { id: 't4', name: 'Excursions and Dining', description: 'Full cultural travel itinerary covered', thresholdPercent: 100 },
      ];
    } else {
      milestones = [
        { id: 'v1', name: 'Reinforced Outer Casing', description: 'Heavy vault structural enclosure', thresholdPercent: 25 },
        { id: 'v2', name: 'Steel Door and Dial', description: 'Rotary dial and bolt locking system', thresholdPercent: 50 },
        { id: 'v3', name: 'Internal Gold Stacks', description: 'Physical gold bullion and reserve tokens', thresholdPercent: 75 },
        { id: 'v4', name: 'Open Treasure Chest', description: 'Compounding perpetual safety cushion', thresholdPercent: 100 },
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavingsGoal, GoalMilestone, Transaction, HobbyPrompt, WalletInfo } from '../types';
import { simulateNimiqSettlement, calculateWithdrawalDetails } from '../services/nimiqService';

interface SavingsContextType {
  goals: SavingsGoal[];
  activeGoal: SavingsGoal | null;
  setActiveGoalId: (id: string) => void;
  transactions: Transaction[];
  prompts: HobbyPrompt[];
  wallet: WalletInfo;
  deposit: (goalId: string, amount: number, note?: string) => Promise<boolean>;
  withdraw: (goalId: string, amount: number, isEmergency: boolean, note?: string) => Promise<boolean>;
  acceptPrompt: (promptId: string, goalId: string) => Promise<boolean>;
  dismissPrompt: (promptId: string) => void;
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'milestones'>) => void;
}

const defaultGoals: SavingsGoal[] = [
  {
    id: 'goal_house',
    title: 'Modern Dream House',
    category: 'house',
    targetAmount: 25000,
    currentAmount: 14500,
    currency: 'USD',
    deadlineMonths: 24,
    createdAt: '2026 01 15',
    milestones: [
      { id: 'm1', name: 'Foundation Slab', description: 'Excavation and ground concrete', thresholdPercent: 20 },
      { id: 'm2', name: 'Framing Pillars', description: 'Wood beams and core columns', thresholdPercent: 40 },
      { id: 'm3', name: 'Enclosed Walls', description: 'Outer walls and entrance', thresholdPercent: 60 },
      { id: 'm4', name: 'Pitched Roof', description: 'Roof structure and chimney', thresholdPercent: 80 },
      { id: 'm5', name: 'Glass and Garden', description: 'Glazing, porch and trees', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_car',
    title: 'Electric Performance Car',
    category: 'car',
    targetAmount: 18000,
    currentAmount: 7200,
    currency: 'USD',
    deadlineMonths: 18,
    createdAt: '2026 03 01',
    milestones: [
      { id: 'c1', name: 'Chassis Frame', description: 'Wheel base and structural floor', thresholdPercent: 25 },
      { id: 'c2', name: 'Powertrain', description: 'Battery block and cockpit seating', thresholdPercent: 50 },
      { id: 'c3', name: 'Body Panels', description: 'Exterior aerodynamic shell', thresholdPercent: 75 },
      { id: 'c4', name: 'Wheels and Trim', description: 'Alloy wheels and headlights', thresholdPercent: 100 },
    ],
  },
  {
    id: 'goal_emergency',
    title: 'Peace of Mind Stash',
    category: 'emergency',
    targetAmount: 5000,
    currentAmount: 3500,
    currency: 'USD',
    deadlineMonths: 6,
    createdAt: '2026 02 10',
    milestones: [
      { id: 'e1', name: 'One Month Buffer', description: 'Immediate essentials covered', thresholdPercent: 33 },
      { id: 'e2', name: 'Two Month Safety', description: 'Full rent and living covered', thresholdPercent: 66 },
      { id: 'e3', name: 'Full Stash Goal', description: 'Complete financial safety reserve', thresholdPercent: 100 },
    ],
  },
];

const defaultPrompts: HobbyPrompt[] = [
  {
    id: 'p1',
    title: 'Weekend Football Win',
    hobbyCategory: 'football',
    eventDescription: 'Your favorite team secured three points in the weekend league. Voluntary victory savings boost.',
    suggestedAmount: 20,
    teamOrTopic: 'Arsenal',
    completed: false,
  },
  {
    id: 'p2',
    title: 'Basketball Game Night',
    hobbyCategory: 'basketball',
    eventDescription: 'Golden State reached over 110 points tonight. Put aside a small boost toward your goal.',
    suggestedAmount: 15,
    teamOrTopic: 'Golden State',
    completed: false,
  },
  {
    id: 'p3',
    title: 'Weekend Gaming Quest',
    hobbyCategory: 'gaming',
    eventDescription: 'Weekly gaming raid finished with your squad. Celebrate discipline by adding to your dream.',
    suggestedAmount: 10,
    teamOrTopic: 'Squad Raid',
    completed: false,
  },
  {
    id: 'p4',
    title: 'Nimiq Network Milestone',
    hobbyCategory: 'crypto',
    eventDescription: 'Proof of Stake validators reached milestone block. Voluntary habit deposit with zero gas.',
    suggestedAmount: 25,
    teamOrTopic: 'Nimiq PoS',
    completed: false,
  },
];

const defaultTransactions: Transaction[] = [
  {
    id: 'tx_01',
    goalId: 'goal_house',
    goalTitle: 'Modern Dream House',
    amount: 500,
    type: 'deposit',
    date: '2026 11 08',
    txHash: 'e71b2d493a04cf91b29a8f2761038b556942ce2139487920ab3e8f192bce9100',
    fee: 0,
    status: 'confirmed',
    note: 'Weekly savings deposit',
  },
  {
    id: 'tx_02',
    goalId: 'goal_car',
    goalTitle: 'Electric Performance Car',
    amount: 150,
    type: 'deposit',
    date: '2026 11 05',
    txHash: '8b3c990234a419df0123567889bcde44512903847291aebcd398402910293847',
    fee: 0,
    status: 'confirmed',
    note: 'Biweekly car fund contribution',
  },
  {
    id: 'tx_03',
    goalId: 'goal_house',
    goalTitle: 'Modern Dream House',
    amount: 20,
    type: 'prompt_deposit',
    date: '2026 11 02',
    txHash: '990234123567889bcde44512903847291aebcd3984029102938478b3c88123490',
    fee: 0,
    status: 'confirmed',
    note: 'Football victory voluntary boost',
  },
];

const defaultWallet: WalletInfo = {
  nimiqAddress: 'NQ42 8X7K M9V1 B2L8 QP03 7N92 Y44D 10KL',
  balanceNim: 742857.14,
  nimPriceUsd: 0.0035,
  freeEmergencyWithdrawalsRemaining: 2,
  sponsoredTxCount: 28,
};

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export const SavingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('gammy_goals');
    return saved ? JSON.parse(saved) : defaultGoals;
  });

  const [activeGoalId, setActiveGoalId] = useState<string>('goal_house');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('gammy_transactions');
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [prompts, setPrompts] = useState<HobbyPrompt[]>(() => {
    const saved = localStorage.getItem('gammy_prompts');
    return saved ? JSON.parse(saved) : defaultPrompts;
  });

  const [wallet, setWallet] = useState<WalletInfo>(() => {
    const saved = localStorage.getItem('gammy_wallet');
    return saved ? JSON.parse(saved) : defaultWallet;
  });

  useEffect(() => {
    localStorage.setItem('gammy_goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('gammy_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('gammy_prompts', JSON.stringify(prompts));
  }, [prompts]);

  useEffect(() => {
    localStorage.setItem('gammy_wallet', JSON.stringify(wallet));
  }, [wallet]);

  const activeGoal = goals.find((g) => g.id === activeGoalId) || goals[0] || null;

  const deposit = async (goalId: string, amount: number, note?: string): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal) return false;

    const settlement = await simulateNimiqSettlement(wallet.nimiqAddress, amount);

    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      goalId,
      goalTitle: targetGoal.title,
      amount,
      type: 'deposit',
      date: dateStr,
      txHash: settlement.txHash,
      fee: 0,
      status: 'confirmed',
      note: note || 'Direct voluntary deposit',
    };

    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g))
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
    isEmergency: boolean,
    note?: string
  ): Promise<boolean> => {
    const targetGoal = goals.find((g) => g.id === goalId);
    if (!targetGoal || targetGoal.currentAmount < amount) return false;

    const details = calculateWithdrawalDetails(
      amount,
      isEmergency,
      wallet.freeEmergencyWithdrawalsRemaining
    );

    const settlement = await simulateNimiqSettlement(wallet.nimiqAddress, amount);

    const now = new Date();
    const dateStr = `${now.getFullYear()} ${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getDate()).padStart(2, '0')}`;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      goalId,
      goalTitle: targetGoal.title,
      amount: details.netAmount,
      type: 'withdrawal',
      date: dateStr,
      txHash: settlement.txHash,
      fee: details.fee,
      status: 'confirmed',
      note: note || (isEmergency ? 'Emergency access withdrawal' : 'Standard withdrawal'),
    };

    setGoals((prev) =>
      prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount - amount } : g))
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
        { id: 'm5', name: 'Glass and Garden', description: 'Glazing, porch and trees', thresholdPercent: 100 },
      ];
    } else if (goalData.category === 'car') {
      milestones = [
        { id: 'c1', name: 'Chassis Frame', description: 'Wheel base and structural floor', thresholdPercent: 25 },
        { id: 'c2', name: 'Powertrain', description: 'Battery block and cockpit seating', thresholdPercent: 50 },
        { id: 'c3', name: 'Body Panels', description: 'Exterior aerodynamic shell', thresholdPercent: 75 },
        { id: 'c4', name: 'Wheels and Trim', description: 'Alloy wheels and headlights', thresholdPercent: 100 },
      ];
    } else {
      milestones = [
        { id: 's1', name: 'First Quarter Milestone', description: 'Early momentum achieved', thresholdPercent: 25 },
        { id: 's2', name: 'Halfway Mark', description: 'Halfway to target reach', thresholdPercent: 50 },
        { id: 's3', name: 'Three Quarter Sprint', description: 'Final stretch in sight', thresholdPercent: 75 },
        { id: 's4', name: 'Goal Completed', description: 'Full target unlocked', thresholdPercent: 100 },
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
        deposit,
        withdraw,
        acceptPrompt,
        dismissPrompt,
        addGoal,
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

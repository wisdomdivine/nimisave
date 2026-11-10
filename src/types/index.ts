export type GoalCategory = 'house' | 'car' | 'trip' | 'emergency';

export interface GoalMilestone {
  id: string;
  name: string;
  description: string;
  thresholdPercent: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: GoalCategory;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  deadlineMonths: number;
  createdAt: string;
  milestones: GoalMilestone[];
}

export type TransactionType = 'deposit' | 'withdrawal' | 'prompt_deposit';

export interface Transaction {
  id: string;
  goalId: string;
  goalTitle: string;
  amount: number;
  type: TransactionType;
  date: string;
  txHash: string;
  fee: number;
  status: 'confirmed' | 'pending';
  note?: string;
}

export type HobbyCategory = 'football' | 'basketball' | 'gaming' | 'crypto';

export interface HobbyPrompt {
  id: string;
  title: string;
  hobbyCategory: HobbyCategory;
  eventDescription: string;
  suggestedAmount: number;
  teamOrTopic: string;
  completed: boolean;
}

export interface WalletInfo {
  nimiqAddress: string;
  balanceNim: number;
  nimPriceUsd: number;
  freeEmergencyWithdrawalsRemaining: number;
  sponsoredTxCount: number;
}


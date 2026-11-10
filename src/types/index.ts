export type GoalCategory = 'house' | 'car' | 'trip' | 'emergency';

export type GoalType = 'target' | 'open_vault';

export type Currency = 'USDT' | 'NIM' | 'USD';

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
  goalType?: GoalType;
  targetAmount: number;
  currentAmount: number;
  currency: Currency;
  deadlineMonths?: number;
  createdAt: string;
  milestones: GoalMilestone[];
}

export type TransactionType = 'deposit' | 'withdrawal' | 'prompt_deposit';

export interface Transaction {
  id: string;
  goalId: string;
  goalTitle: string;
  amount: number;
  currency: Currency;
  equivalentAmount?: number;
  equivalentCurrency?: Currency;
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
  currency: Currency;
  teamOrTopic: string;
  completed: boolean;
}

export interface WalletInfo {
  nimiqAddress: string;
  balanceNim: number;
  balanceUsdt: number;
  nimPriceUsd: number;
  freeEmergencyWithdrawalsRemaining: number;
  sponsoredTxCount: number;
  isConnected?: boolean;
  connectedProvider?: string;
}

export interface SavingsStreakInfo {
  currentDays: number;
  longestDays: number;
  lastDepositDate: string;
  freezesRemaining: number;
}

export interface CommunityLeaderboardEntry {
  rank: number;
  username: string;
  totalSavedUsdt: number;
  streakDays: number;
  isCurrentUser?: boolean;
  badge: string;
}

export interface SavingsCommunity {
  id: string;
  name: string;
  hobbyCategory: HobbyCategory;
  teamOrTopic: string;
  memberCount: number;
  totalPoolUsdt: number;
  collectiveGoalTitle: string;
  leaderboard: CommunityLeaderboardEntry[];
}

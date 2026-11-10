import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SavingsGoal, Transaction, HobbyPrompt, HobbyCategory, SavingsStreakInfo } from '../types';

/**
 * Fetch all goals for a given wallet address from Supabase.
 */
export async function fetchRemoteGoals(walletAddress: string): Promise<SavingsGoal[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Supabase fetchRemoteGoals notice:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      goalType: row.goal_type,
      targetAmount: Number(row.target_amount),
      currentAmount: Number(row.current_amount),
      currency: row.currency,
      deadlineMonths: row.deadline_months,
      createdAt: row.created_at,
      milestones: Array.isArray(row.milestones) ? row.milestones : [],
    }));
  } catch (err) {
    console.warn('Supabase fetchRemoteGoals exception:', err);
    return null;
  }
}

/**
 * Upsert a goal in Supabase.
 */
export async function upsertRemoteGoal(walletAddress: string, goal: SavingsGoal): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('goals').upsert({
      id: goal.id,
      wallet_address: walletAddress,
      title: goal.title,
      category: goal.category,
      goal_type: goal.goalType || 'target',
      target_amount: goal.targetAmount,
      current_amount: goal.currentAmount,
      currency: goal.currency,
      deadline_months: goal.deadlineMonths || null,
      milestones: goal.milestones,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase upsertRemoteGoal notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertRemoteGoal exception:', err);
    return false;
  }
}

/**
 * Update the current amount for an existing goal.
 */
export async function updateRemoteGoalAmount(goalId: string, currentAmount: number): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('goals')
      .update({
        current_amount: currentAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', goalId);

    if (error) {
      console.warn('Supabase updateRemoteGoalAmount notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase updateRemoteGoalAmount exception:', err);
    return false;
  }
}

/**
 * Fetch transactions for a wallet address from Supabase.
 */
export async function fetchRemoteTransactions(walletAddress: string): Promise<Transaction[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetchRemoteTransactions notice:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: row.id,
      goalId: row.goal_id,
      goalTitle: row.goal_title,
      amount: Number(row.amount),
      currency: row.currency,
      equivalentAmount: row.equivalent_amount ? Number(row.equivalent_amount) : undefined,
      equivalentCurrency: row.equivalent_currency || undefined,
      type: row.type,
      date: row.date,
      txHash: row.tx_hash,
      fee: Number(row.fee || 0),
      status: row.status,
      note: row.note,
    }));
  } catch (err) {
    console.warn('Supabase fetchRemoteTransactions exception:', err);
    return null;
  }
}

/**
 * Insert a transaction in Supabase.
 */
export async function insertRemoteTransaction(walletAddress: string, tx: Transaction): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('transactions').upsert({
      id: tx.id,
      goal_id: tx.goalId || null,
      wallet_address: walletAddress,
      goal_title: tx.goalTitle,
      amount: tx.amount,
      currency: tx.currency,
      equivalent_amount: tx.equivalentAmount || null,
      equivalent_currency: tx.equivalentCurrency || null,
      type: tx.type,
      date: tx.date,
      tx_hash: tx.txHash,
      fee: tx.fee,
      status: tx.status,
      note: tx.note || null,
    });

    if (error) {
      console.warn('Supabase insertRemoteTransaction notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase insertRemoteTransaction exception:', err);
    return false;
  }
}

/**
 * Fetch user profile preferences and streak from Supabase.
 */
export async function fetchRemoteUserProfile(walletAddress: string): Promise<{
  hobby?: HobbyCategory;
  topic?: string;
  streak?: SavingsStreakInfo;
} | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) {
      console.warn('Supabase fetchRemoteUserProfile notice:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      hobby: data.selected_hobby as HobbyCategory,
      topic: data.selected_topic,
      streak: {
        currentDays: data.streak_current_days,
        longestDays: data.streak_longest_days,
        lastDepositDate: data.streak_last_deposit_date || '',
        freezesRemaining: 2,
      },
    };
  } catch (err) {
    console.warn('Supabase fetchRemoteUserProfile exception:', err);
    return null;
  }
}

/**
 * Upsert user profile preferences and streak in Supabase.
 */
export async function upsertRemoteUserProfile(
  walletAddress: string,
  profile: {
    hobby?: HobbyCategory;
    topic?: string;
    streak?: SavingsStreakInfo;
  }
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const payload: any = {
      wallet_address: walletAddress,
      updated_at: new Date().toISOString(),
    };

    if (profile.hobby) payload.selected_hobby = profile.hobby;
    if (profile.topic) payload.selected_topic = profile.topic;
    if (profile.streak) {
      payload.streak_current_days = profile.streak.currentDays;
      payload.streak_longest_days = profile.streak.longestDays;
      payload.streak_last_deposit_date = profile.streak.lastDepositDate;
    }

    const { error } = await supabase.from('user_profiles').upsert(payload);

    if (error) {
      console.warn('Supabase upsertRemoteUserProfile notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase upsertRemoteUserProfile exception:', err);
    return false;
  }
}


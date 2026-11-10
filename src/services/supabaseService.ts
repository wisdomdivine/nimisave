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
      console.warn('Sync notice:', error.message);
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
    console.warn('Sync error:', err);
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
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
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
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
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
      console.warn('Sync notice:', error.message);
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
    console.warn('Sync error:', err);
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
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
    return false;
  }
}

/**
 * Fetch user profile preferences and streak from live database.
 */
export async function fetchRemoteUserProfile(walletAddress: string): Promise<{
  hobby?: HobbyCategory;
  topic?: string;
  streak?: SavingsStreakInfo;
  freeEmergencyWithdrawalsRemaining?: number;
  sponsoredTxCount?: number;
} | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    if (error) {
      console.warn('Sync notice:', error.message);
      return null;
    }

    if (!data) return null;

    return {
      hobby: data.selected_hobby as HobbyCategory,
      topic: data.selected_topic,
      streak: {
        currentDays: Number(data.streak_current_days || 0),
        longestDays: Number(data.streak_longest_days || 0),
        lastDepositDate: data.streak_last_deposit_date || '',
        freezesRemaining: 2,
      },
      freeEmergencyWithdrawalsRemaining:
        typeof data.free_emergency_withdrawals_remaining === 'number'
          ? data.free_emergency_withdrawals_remaining
          : 3,
      sponsoredTxCount:
        typeof data.sponsored_tx_count === 'number'
          ? data.sponsored_tx_count
          : 0,
    };
  } catch (err) {
    console.warn('Sync error:', err);
    return null;
  }
}

/**
 * Upsert user profile preferences and streak in live database.
 */
export async function upsertRemoteUserProfile(
  walletAddress: string,
  profile: {
    hobby?: HobbyCategory;
    topic?: string;
    streak?: SavingsStreakInfo;
    freeEmergencyWithdrawalsRemaining?: number;
    sponsoredTxCount?: number;
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
    if (typeof profile.freeEmergencyWithdrawalsRemaining === 'number') {
      payload.free_emergency_withdrawals_remaining = profile.freeEmergencyWithdrawalsRemaining;
    }
    if (typeof profile.sponsoredTxCount === 'number') {
      payload.sponsored_tx_count = profile.sponsoredTxCount;
    }

    const { error } = await supabase.from('user_profiles').upsert(payload);

    if (error) {
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
    return false;
  }
}

/**
 * Fetch voluntary prompts for a wallet address from live database.
 */
export async function fetchRemotePrompts(walletAddress: string): Promise<HobbyPrompt[] | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Sync notice:', error.message);
      return null;
    }

    if (!data) return null;

    return data.map((row: any) => ({
      id: row.id,
      title: row.title,
      hobbyCategory: row.hobby_category as HobbyCategory,
      eventDescription: row.event_description,
      suggestedAmount: Number(row.suggested_amount),
      currency: row.currency,
      teamOrTopic: row.team_or_topic,
      completed: Boolean(row.completed),
    }));
  } catch (err) {
    console.warn('Sync error:', err);
    return null;
  }
}

/**
 * Upsert voluntary prompts for a wallet address in live database.
 */
export async function upsertRemotePrompts(
  walletAddress: string,
  prompts: HobbyPrompt[]
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase || prompts.length === 0) return false;

  try {
    const rows = prompts.map((p) => ({
      id: `${walletAddress}_${p.id}`,
      wallet_address: walletAddress,
      title: p.title,
      hobby_category: p.hobbyCategory,
      event_description: p.eventDescription,
      suggested_amount: p.suggestedAmount,
      currency: p.currency,
      team_or_topic: p.teamOrTopic,
      completed: p.completed,
    }));

    const { error } = await supabase.from('prompts').upsert(rows);
    if (error) {
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
    return false;
  }
}

/**
 * Delete a prompt from live database.
 */
export async function deleteRemotePrompt(walletAddress: string, promptId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .in('id', [promptId, `${walletAddress}_${promptId}`])
      .eq('wallet_address', walletAddress);

    if (error) {
      console.warn('Sync notice:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Sync error:', err);
    return false;
  }
}

export interface LiveCommunityAggregation {
  profiles: {
    walletAddress: string;
    hobby: HobbyCategory;
    topic: string;
    streakDays: number;
  }[];
  walletTotalsUsdt: Record<string, number>;
}

/**
 * Fetch real community members and real savings totals from live database.
 */
export async function fetchLiveCommunityAggregation(
  nimPriceUsd: number = 0.0035
): Promise<LiveCommunityAggregation | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  try {
    const [profilesRes, goalsRes] = await Promise.all([
      supabase.from('user_profiles').select('wallet_address, selected_hobby, selected_topic, streak_current_days'),
      supabase.from('goals').select('wallet_address, current_amount, currency'),
    ]);

    if (profilesRes.error || goalsRes.error) {
      return null;
    }

    const walletTotalsUsdt: Record<string, number> = {};
    for (const g of goalsRes.data || []) {
      const addr = String(g.wallet_address || '').toLowerCase();
      if (!addr) continue;
      const amt = Number(g.current_amount || 0);
      const usdtVal = g.currency === 'NIM' ? amt * nimPriceUsd : amt;
      walletTotalsUsdt[addr] = (walletTotalsUsdt[addr] || 0) + usdtVal;
    }

    const profiles = (profilesRes.data || []).map((p: any) => ({
      walletAddress: String(p.wallet_address || ''),
      hobby: (p.selected_hobby as HobbyCategory) || 'football',
      topic: String(p.selected_topic || 'Arsenal'),
      streakDays: Number(p.streak_current_days || 0),
    }));

    return {
      profiles,
      walletTotalsUsdt,
    };
  } catch (err) {
    console.warn('Sync error:', err);
    return null;
  }
}


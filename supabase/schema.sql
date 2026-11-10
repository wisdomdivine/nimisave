-- Nimisave Database Schema for Supabase
-- Run this in your Supabase SQL Editor

-- 1. User Profiles and Preference Tracking
create table if not exists public.user_profiles (
  wallet_address text primary key,
  selected_hobby text not null default 'football',
  selected_topic text not null default 'Arsenal',
  streak_current_days integer not null default 0,
  streak_longest_days integer not null default 0,
  streak_last_deposit_date text,
  free_emergency_withdrawals_remaining integer not null default 3,
  sponsored_tx_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Savings Goals Boxes
create table if not exists public.goals (
  id text primary key,
  wallet_address text not null,
  title text not null,
  category text not null,
  goal_type text not null default 'target',
  target_amount numeric not null,
  current_amount numeric not null default 0,
  currency text not null default 'USDT',
  deadline_months integer,
  milestones jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_goals_wallet on public.goals (wallet_address);

-- 3. Savings Transactions
create table if not exists public.transactions (
  id text primary key,
  goal_id text references public.goals(id) on delete set null,
  wallet_address text not null,
  goal_title text not null,
  amount numeric not null,
  currency text not null,
  equivalent_amount numeric,
  equivalent_currency text,
  type text not null,
  date text not null,
  tx_hash text not null,
  fee numeric not null default 0,
  status text not null default 'confirmed',
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_wallet on public.transactions (wallet_address);
create index if not exists idx_transactions_goal on public.transactions (goal_id);

-- 4. Hobby Victory Prompts
create table if not exists public.prompts (
  id text primary key,
  wallet_address text not null,
  title text not null,
  hobby_category text not null,
  event_description text not null,
  suggested_amount numeric not null,
  currency text not null,
  team_or_topic text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_prompts_wallet on public.prompts (wallet_address);

-- Enable Row Level Security (RLS)
alter table public.user_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.transactions enable row level security;
alter table public.prompts enable row level security;

-- Public anon policies for Nimisave non custodial wallet addresses
create policy "Public read user profiles" on public.user_profiles for select using (true);
create policy "Public insert or update user profiles" on public.user_profiles for all using (true) with check (true);

create policy "Public read goals" on public.goals for select using (true);
create policy "Public manage goals" on public.goals for all using (true) with check (true);

create policy "Public read transactions" on public.transactions for select using (true);
create policy "Public insert transactions" on public.transactions for all using (true) with check (true);

create policy "Public read prompts" on public.prompts for select using (true);
create policy "Public manage prompts" on public.prompts for all using (true) with check (true);

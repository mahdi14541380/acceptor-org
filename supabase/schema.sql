-- Run this in your Supabase project: SQL Editor → New query → paste → Run.
-- Fully safe to re-run any number of times: every create/alter/policy
-- statement below is idempotent (checks "if not exists" or drops first).

-- 1. Profiles — one row per signed-up user, created automatically on signup.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

drop policy if exists "Users can read their own profile" on profiles;
create policy "Users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Balances — USD-equivalent balance per user. Only ever written by the
--    server (service role), never directly by the client, so RLS only allows
--    reading your own row.
create table if not exists balances (
  user_id uuid primary key references profiles(id) on delete cascade,
  amount_usd numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

alter table balances enable row level security;

drop policy if exists "Users can read their own balance" on balances;
create policy "Users can read their own balance"
  on balances for select
  using (auth.uid() = user_id);

create or replace function public.handle_new_balance()
returns trigger as $$
begin
  insert into public.balances (user_id, amount_usd)
  values (new.id, 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profile_created on profiles;
create trigger on_profile_created
  after insert on profiles
  for each row execute procedure public.handle_new_balance();

-- 3. Country prices — overrides the defaults in lib/countries.ts. Two tiers:
--    price_old (aged accounts, faster delivery) and price_new (newer accounts,
--    slower delivery). The admin panel writes here through a server route
--    that checks ADMIN_EMAIL, so no public write policy is needed.
create table if not exists country_prices (
  country_key text primary key,
  updated_at timestamptz not null default now()
);

alter table country_prices add column if not exists price_old numeric(10, 2);
alter table country_prices add column if not exists price_new numeric(10, 2);

alter table country_prices enable row level security;

drop policy if exists "Anyone can read current prices" on country_prices;
create policy "Anyone can read current prices"
  on country_prices for select
  using (true);

-- 4. Top-ups — USDT deposit records via darimarket.online's own top-up API.
create table if not exists topups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  amount_usd numeric(12, 2) not null,
  status text not null default 'pending', -- pending | confirmed | failed
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table topups add column if not exists provider text not null default 'darimarket';
alter table topups add column if not exists provider_payment_id text;
alter table topups add column if not exists pay_currency text; -- network, e.g. trc20 / bep20
alter table topups add column if not exists deposit_address text;

-- Ensure provider_payment_id has a unique constraint (guarded so re-runs don't error).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'topups_provider_payment_id_key'
  ) then
    alter table topups add constraint topups_provider_payment_id_key unique (provider_payment_id);
  end if;
end $$;

alter table topups enable row level security;

drop policy if exists "Users can read their own topups" on topups;
create policy "Users can read their own topups"
  on topups for select
  using (auth.uid() = user_id);

-- 5. Orders — Stars purchases sourced via the darimarket.online API.
-- NOTE: darimarket's /v1/buy has no recipient field — it only sources Stars
-- at the country's wholesale rate. telegram_username is our own record of who
-- the Stars are meant for; final delivery to that account is a separate step.
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  country_key text not null,
  amount_usd numeric(12, 2) not null, -- quantity * price-per-star at order time
  status text not null default 'pending', -- pending | processing | completed | failed
  created_at timestamptz not null default now()
);

alter table orders add column if not exists quantity integer not null default 1;
alter table orders add column if not exists telegram_username text;
alter table orders add column if not exists provider_order_id text;
alter table orders add column if not exists download_url text;
alter table orders add column if not exists download_token text;
alter table orders add column if not exists download_filename text;
alter table orders add column if not exists error_message text;
alter table orders add column if not exists tier text not null default 'old'; -- 'old' | 'new'

alter table orders enable row level security;

drop policy if exists "Users can read their own orders" on orders;
create policy "Users can read their own orders"
  on orders for select
  using (auth.uid() = user_id);

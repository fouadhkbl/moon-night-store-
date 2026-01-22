

-- ==============================================================================
-- MOON NIGHT COMPLETE DATABASE SETUP (V25 - POINTS CHAT)
-- Run this in the Supabase SQL Editor to fix Foreign Key constraints and Policies.
-- ==============================================================================

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. PRODUCTS TABLE
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  category text not null, 
  image_url text not null,
  stock int default 999,
  platform text,
  country text default 'Global', -- New Column for Region/Country
  is_trending boolean default false,
  is_vip boolean default false, -- New VIP Column
  is_hidden boolean default false, -- New Hidden Column
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Add country column if it doesn't exist
alter table public.products add column if not exists country text default 'Global';

-- MIGRATION: Add is_vip column if it doesn't exist
alter table public.products add column if not exists is_vip boolean default false;

-- MIGRATION: Add is_hidden column if it doesn't exist
alter table public.products add column if not exists is_hidden boolean default false;

-- 3. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  password text, 
  avatar_url text default 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
  wallet_balance decimal(10, 2) default 0.00,
  vip_level int default 0,
  vip_points int default 0,
  discord_points int default 0, -- NEW: Discord Points
  total_donated decimal(10, 2) default 0.00, -- NEW: Donation Tracking
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(email)
);

-- Ensure columns exist
alter table public.profiles add column if not exists wallet_balance decimal(10, 2) default 0.00;
alter table public.profiles add column if not exists vip_level int default 0;
alter table public.profiles add column if not exists vip_points int default 0;
alter table public.profiles add column if not exists discord_points int default 0;
alter table public.profiles add column if not exists total_donated decimal(10, 2) default 0.00;
alter table public.profiles add column if not exists avatar_url text default 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80';
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists password text;

-- CLEANUP Orphans
delete from public.profiles where id not in (select id from auth.users);

-- 4. CART ITEMS TABLE
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Ensure Cart Items user_id cascade
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'cart_items_user_id_fkey' and table_name = 'cart_items') then
    alter table public.cart_items drop constraint cart_items_user_id_fkey;
  end if;
  alter table public.cart_items add constraint cart_items_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
end;
$$;

-- 5. ORDERS TABLE (Modified with Cascade)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  total_amount decimal(10, 2) not null,
  status text default 'pending', 
  payment_method text,
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure Orders columns exist
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists transaction_id text;

-- MIGRATION: Update Orders Foreign Key to Cascade Delete
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'orders_user_id_fkey' and table_name = 'orders') then
    alter table public.orders drop constraint orders_user_id_fkey;
  end if;
  alter table public.orders add constraint orders_user_id_fkey foreign key (user_id) references public.profiles(id) on delete cascade;
end;
$$;

-- 6. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id), 
  quantity int not null,
  price_at_purchase decimal(10, 2) not null
);

-- MIGRATION: Fix Order Items product_id constraint to Set Null on Delete (Allows deleting products even if ordered)
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'order_items_product_id_fkey' and table_name = 'order_items') then
    alter table public.order_items drop constraint order_items_product_id_fkey;
  end if;
  alter table public.order_items add constraint order_items_product_id_fkey foreign key (product_id) references public.products(id) on delete set null;
end;
$$;

-- 7. COUPONS TABLE
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percent', 'fixed')),
  discount_value decimal(10, 2) not null,
  max_uses int default null,
  usage_count int default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ORDER MESSAGES TABLE
create table if not exists public.order_messages (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Update Order Messages Sender Foreign Key to Cascade Delete
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'order_messages_sender_id_fkey' and table_name = 'order_messages') then
    alter table public.order_messages drop constraint order_messages_sender_id_fkey;
  end if;
  alter table public.order_messages add constraint order_messages_sender_id_fkey foreign key (sender_id) references public.profiles(id) on delete cascade;
end;
$$;

-- 9. ACCESS LOGS (VISITOR TRACKING)
create table if not exists public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  ip_address text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. POINT TRANSACTIONS (NEW)
create table if not exists public.point_transactions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    points_amount int not null,
    money_equivalent decimal(10, 2) not null,
    status text default 'pending', -- pending, completed, rejected
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. POINTS SHOP PRODUCTS (NEW)
create table if not exists public.point_products (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    image_url text not null,
    cost int not null,
    duration text, -- e.g. "Lifetime", "30 Days"
    advantage text, -- e.g. "20% Boost", "Access to VIP"
    is_active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. POINTS REDEMPTIONS (NEW - Tracking items bought with points)
create table if not exists public.point_redemptions (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    product_id uuid references public.point_products(id) on delete set null,
    cost_at_redemption int not null,
    status text default 'pending', -- CHANGED TO PENDING DEFAULT
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MIGRATION: Update default status for existing and new rows
alter table public.point_redemptions alter column status set default 'pending';

-- 13. REDEMPTION MESSAGES (NEW - Chat for points)
create table if not exists public.redemption_messages (
  id uuid default uuid_generate_v4() primary key,
  redemption_id uuid references public.point_redemptions(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. DONATIONS (NEW - For Donation Page)
create table if not exists public.donations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  amount decimal(10, 2) not null,
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. TOURNAMENTS (NEW)
create table if not exists public.tournaments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  game_name text not null,
  description text,
  image_url text not null,
  start_date timestamp with time zone not null,
  status text default 'open', -- open, live, past
  entry_fee text default 'Free',
  prize_pool text,
  max_participants int default 100,
  current_participants int default 0,
  format text default 'Solo',
  rules text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. SECURITY POLICIES
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.order_messages enable row level security;
alter table public.access_logs enable row level security;
alter table public.point_transactions enable row level security;
alter table public.point_products enable row level security;
alter table public.point_redemptions enable row level security;
alter table public.redemption_messages enable row level security;
alter table public.donations enable row level security;
alter table public.tournaments enable row level security;

-- PROFILES
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);

drop policy if exists "Enable update for admin panel on profiles" on public.profiles;
create policy "Enable update for admin panel on profiles" on public.profiles for update using (true);

drop policy if exists "Enable delete for admin panel on profiles" on public.profiles;
create policy "Enable delete for admin panel on profiles" on public.profiles for delete using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- PRODUCTS
drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone" on public.products for select using (true);

drop policy if exists "Enable insert for admin panel" on public.products;
create policy "Enable insert for admin panel" on public.products for insert with check (true);

drop policy if exists "Enable update for admin panel" on public.products;
create policy "Enable update for admin panel" on public.products for update using (true);

drop policy if exists "Enable delete for admin panel" on public.products;
create policy "Enable delete for admin panel" on public.products for delete using (true);

-- CART ITEMS
drop policy if exists "Users can view own cart" on public.cart_items;
create policy "Users can view own cart" on public.cart_items for select using (auth.uid() = user_id);

drop policy if exists "Users can insert into own cart" on public.cart_items;
create policy "Users can insert into own cart" on public.cart_items for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own cart" on public.cart_items;
create policy "Users can update own cart" on public.cart_items for update using (auth.uid() = user_id);

drop policy if exists "Users can delete from own cart" on public.cart_items;
create policy "Users can delete from own cart" on public.cart_items for delete using (auth.uid() = user_id);

-- ORDERS
drop policy if exists "Users can view own orders" on public.orders;
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can create orders" on public.orders;
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

drop policy if exists "Enable view for admin panel orders" on public.orders;
create policy "Enable view for admin panel orders" on public.orders for select using (true);

drop policy if exists "Enable update for admin panel orders" on public.orders;
create policy "Enable update for admin panel orders" on public.orders for update using (true);

drop policy if exists "Enable delete for admin panel orders" on public.orders;
create policy "Enable delete for admin panel orders" on public.orders for delete using (true);

-- ORDER ITEMS
drop policy if exists "Users can view own order items" on public.order_items;
create policy "Users can view own order items" on public.order_items for select using (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);

drop policy if exists "Users can create order items" on public.order_items;
create policy "Users can create order items" on public.order_items for insert with check (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);

drop policy if exists "Enable view for admin panel order items" on public.order_items;
create policy "Enable view for admin panel order items" on public.order_items for select using (true);

-- ORDER MESSAGES
drop policy if exists "Users can view own order messages" on public.order_messages;
create policy "Users can view own order messages" on public.order_messages for select using (
  exists ( select 1 from public.orders where orders.id = order_messages.order_id and orders.user_id = auth.uid() )
);

drop policy if exists "Users can insert own order messages" on public.order_messages;
create policy "Users can insert own order messages" on public.order_messages for insert with check (
  auth.uid() = sender_id AND
  exists ( select 1 from public.orders where orders.id = order_messages.order_id and orders.user_id = auth.uid() )
);

drop policy if exists "Admin can view all messages" on public.order_messages;
create policy "Admin can view all messages" on public.order_messages for select using (true); 

drop policy if exists "Admin can insert messages" on public.order_messages;
create policy "Admin can insert messages" on public.order_messages for insert with check (true);

-- COUPONS
drop policy if exists "Coupons are viewable by everyone" on public.coupons;
create policy "Coupons are viewable by everyone" on public.coupons for select using (true);

drop policy if exists "Enable insert for admin panel coupons" on public.coupons;
create policy "Enable insert for admin panel coupons" on public.coupons for insert with check (true);

drop policy if exists "Enable update for admin panel coupons" on public.coupons;
create policy "Enable update for admin panel coupons" on public.coupons for update using (true);

drop policy if exists "Enable delete for admin panel coupons" on public.coupons;
create policy "Enable delete for admin panel coupons" on public.coupons for delete using (true);

-- ACCESS LOGS
drop policy if exists "Allow public insert to access logs" on public.access_logs;
create policy "Allow public insert to access logs" on public.access_logs for insert with check (true);

drop policy if exists "Allow admin read access logs" on public.access_logs;
create policy "Allow admin read access logs" on public.access_logs for select using (true);

-- POINT TRANSACTIONS
drop policy if exists "Users can view own point transactions" on public.point_transactions;
create policy "Users can view own point transactions" on public.point_transactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own point transactions" on public.point_transactions;
create policy "Users can insert own point transactions" on public.point_transactions for insert with check (auth.uid() = user_id);

drop policy if exists "Admin can view all point transactions" on public.point_transactions;
create policy "Admin can view all point transactions" on public.point_transactions for select using (true);

drop policy if exists "Admin can update point transactions" on public.point_transactions;
create policy "Admin can update point transactions" on public.point_transactions for update using (true);

drop policy if exists "Admin can delete point transactions" on public.point_transactions;
create policy "Admin can delete point transactions" on public.point_transactions for delete using (true);

-- POINT PRODUCTS (NEW POLICIES)
drop policy if exists "Point Products viewable by everyone" on public.point_products;
create policy "Point Products viewable by everyone" on public.point_products for select using (true);

drop policy if exists "Admin can manage point products" on public.point_products;
create policy "Admin can manage point products" on public.point_products for all using (true);

-- POINT REDEMPTIONS (NEW POLICIES)
drop policy if exists "Users can view own redemptions" on public.point_redemptions;
create policy "Users can view own redemptions" on public.point_redemptions for select using (auth.uid() = user_id);

drop policy if exists "Users can create redemptions" on public.point_redemptions;
create policy "Users can create redemptions" on public.point_redemptions for insert with check (auth.uid() = user_id);

drop policy if exists "Admin can view all redemptions" on public.point_redemptions;
create policy "Admin can view all redemptions" on public.point_redemptions for select using (true);

drop policy if exists "Admin can update redemptions" on public.point_redemptions;
create policy "Admin can update redemptions" on public.point_redemptions for update using (true);

-- REDEMPTION MESSAGES (NEW POLICIES)
drop policy if exists "Users can view own redemption messages" on public.redemption_messages;
create policy "Users can view own redemption messages" on public.redemption_messages for select using (
  exists ( select 1 from public.point_redemptions where point_redemptions.id = redemption_messages.redemption_id and point_redemptions.user_id = auth.uid() )
);

drop policy if exists "Users can insert own redemption messages" on public.redemption_messages;
create policy "Users can insert own redemption messages" on public.redemption_messages for insert with check (
  auth.uid() = sender_id AND
  exists ( select 1 from public.point_redemptions where point_redemptions.id = redemption_messages.redemption_id and point_redemptions.user_id = auth.uid() )
);

drop policy if exists "Admin can view all redemption messages" on public.redemption_messages;
create policy "Admin can view all redemption messages" on public.redemption_messages for select using (true);

drop policy if exists "Admin can insert redemption messages" on public.redemption_messages;
create policy "Admin can insert redemption messages" on public.redemption_messages for insert with check (true);

-- DONATIONS (NEW POLICIES)
drop policy if exists "Donations are viewable by everyone" on public.donations;
create policy "Donations are viewable by everyone" on public.donations for select using (true);

drop policy if exists "Users can insert donations" on public.donations;
create policy "Users can insert donations" on public.donations for insert with check (true);

-- TOURNAMENTS (NEW POLICIES)
drop policy if exists "Tournaments are viewable by everyone" on public.tournaments;
create policy "Tournaments are viewable by everyone" on public.tournaments for select using (true);

drop policy if exists "Admin can manage tournaments" on public.tournaments;
create policy "Admin can manage tournaments" on public.tournaments for all using (true);


-- 17. TRIGGERS
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists on_products_updated on public.products;
create trigger on_products_updated
  before update on public.products
  for each row execute procedure public.handle_updated_at();

-- 18. SYSTEM CONFIG (Secrets)
create table if not exists public.system_secrets (
  key text primary key,
  value text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.system_secrets enable row level security;

-- Only service role (admin) can access
drop policy if exists "No public access to secrets" on public.system_secrets;
create policy "No public access to secrets" on public.system_secrets for all using (false);

-- Insert PayPal Secret (Upsert)
insert into public.system_secrets (key, value) 
values ('PAYPAL_CLIENT_SECRET', 'EC1RPFQYPMaro4bSOQDvvpEocT-KfVwh5k1uTDH-vlWEXCiXK6Fi5baj15siumIAqFRGwc4pMptDyx26')
on conflict (key) do update set value = excluded.value;
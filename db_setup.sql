-- ==============================================================================
-- MOON NIGHT COMPLETE DATABASE SETUP (V10 - PAYPAL ENHANCED)
-- Run this in the Supabase SQL Editor to sync your DB with Google/Discord data.
-- ==============================================================================

-- 1. Enable UUID extension (Required for ID generation)
create extension if not exists "uuid-ossp";

-- 2. RESET SHOP TABLES (Optional: Comment out if you want to keep data)
-- drop table if exists public.order_items;
-- drop table if exists public.cart_items;
-- drop table if exists public.products cascade;
-- drop table if exists public.coupons;

-- 3. PRODUCTS TABLE (Re-created with Platform and Trending support)
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10, 2) not null,
  category text not null, 
  image_url text not null,
  stock int default 999,
  platform text,
  is_trending boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. PROFILES TABLE (User Data & Wallet)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  username text,
  password text, -- Added to store raw password as requested
  avatar_url text default 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
  wallet_balance decimal(10, 2) default 0.00, -- The "Solde"
  vip_level int default 0,
  vip_points int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(email)
);

-- Ensure columns exist if table was already there (Migration safe)
alter table public.profiles add column if not exists wallet_balance decimal(10, 2) default 0.00;
alter table public.profiles add column if not exists vip_level int default 0;
alter table public.profiles add column if not exists vip_points int default 0;
alter table public.profiles add column if not exists avatar_url text default 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80';
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists password text;

-- CLEANUP: Delete any profiles that don't have a user in Auth (Orphans)
delete from public.profiles where id not in (select id from auth.users);

-- Fix Foreign Key to allow Deletion from Auth (Migration safe)
do $$
begin
  if exists (select 1 from information_schema.table_constraints where constraint_name = 'profiles_id_fkey' and table_name = 'profiles') then
    alter table public.profiles drop constraint profiles_id_fkey;
    alter table public.profiles add constraint profiles_id_fkey foreign key (id) references auth.users(id) on delete cascade;
  end if;
end;
$$;

-- Add unique constraint if it doesn't exist
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_email_key') then
    alter table public.profiles add constraint profiles_email_key unique (email);
  end if;
end;
$$;

-- 5. CART ITEMS TABLE
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. ORDERS TABLE
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  total_amount decimal(10, 2) not null,
  status text default 'pending', 
  payment_method text,
  transaction_id text, -- Added transaction_id column
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure Orders columns exist
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists transaction_id text;

-- 7. ORDER ITEMS TABLE
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id), 
  quantity int not null,
  price_at_purchase decimal(10, 2) not null
);

-- 8. COUPONS TABLE
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

-- 9. ORDER MESSAGES TABLE (NEW FOR CHAT)
create table if not exists public.order_messages (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. SECURITY POLICIES (RLS - Row Level Security)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.coupons enable row level security;
alter table public.order_messages enable row level security;

-- Clean up old policies to ensure clean slate
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Enable update for admin panel on profiles" on public.profiles;
drop policy if exists "Enable delete for admin panel on profiles" on public.profiles;
drop policy if exists "Products are viewable by everyone" on public.products;
drop policy if exists "Enable insert for admin panel" on public.products;
drop policy if exists "Enable update for admin panel" on public.products;
drop policy if exists "Enable delete for admin panel" on public.products;
drop policy if exists "Users can view own cart" on public.cart_items;
drop policy if exists "Users can insert into own cart" on public.cart_items;
drop policy if exists "Users can update own cart" on public.cart_items;
drop policy if exists "Users can delete from own cart" on public.cart_items;
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can create orders" on public.orders;
drop policy if exists "Enable view for admin panel orders" on public.orders;
drop policy if exists "Enable update for admin panel orders" on public.orders;
drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Users can create order items" on public.order_items;
drop policy if exists "Enable view for admin panel order items" on public.order_items;
drop policy if exists "Coupons are viewable by everyone" on public.coupons;
drop policy if exists "Enable insert for admin panel coupons" on public.coupons;
drop policy if exists "Enable update for admin panel coupons" on public.coupons;
drop policy if exists "Enable delete for admin panel coupons" on public.coupons;
drop policy if exists "Users can view own order messages" on public.order_messages;
drop policy if exists "Users can insert own order messages" on public.order_messages;
drop policy if exists "Admin can view all messages" on public.order_messages;
drop policy if exists "Admin can insert messages" on public.order_messages;

-- PROFILES POLICIES
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Enable update for admin panel on profiles" on public.profiles for update using (true);
create policy "Enable delete for admin panel on profiles" on public.profiles for delete using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- PRODUCTS (Public Read, Admin Write)
create policy "Products are viewable by everyone" on public.products for select using (true);
create policy "Enable insert for admin panel" on public.products for insert with check (true);
create policy "Enable update for admin panel" on public.products for update using (true);
create policy "Enable delete for admin panel" on public.products for delete using (true);

-- CART (Private)
create policy "Users can view own cart" on public.cart_items for select using (auth.uid() = user_id);
create policy "Users can insert into own cart" on public.cart_items for insert with check (auth.uid() = user_id);
create policy "Users can update own cart" on public.cart_items for update using (auth.uid() = user_id);
create policy "Users can delete from own cart" on public.cart_items for delete using (auth.uid() = user_id);

-- ORDERS (Private + Admin)
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);
create policy "Enable view for admin panel orders" on public.orders for select using (true);
create policy "Enable update for admin panel orders" on public.orders for update using (true);

-- ORDER ITEMS (Private + Admin)
create policy "Users can view own order items" on public.order_items for select using (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);
create policy "Users can create order items" on public.order_items for insert with check (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);
create policy "Enable view for admin panel order items" on public.order_items for select using (true);

-- ORDER MESSAGES (Private + Admin)
create policy "Users can view own order messages" on public.order_messages for select using (
  exists ( select 1 from public.orders where orders.id = order_messages.order_id and orders.user_id = auth.uid() )
);
create policy "Users can insert own order messages" on public.order_messages for insert with check (
  auth.uid() = sender_id AND
  exists ( select 1 from public.orders where orders.id = order_messages.order_id and orders.user_id = auth.uid() )
);
-- NOTE: For production, you'd want a dedicated 'is_admin' column on profiles. 
-- For this setup, we allow reading all messages if you aren't the owner (Admin simulation) or relying on simple rules.
create policy "Admin can view all messages" on public.order_messages for select using (true); 
create policy "Admin can insert messages" on public.order_messages for insert with check (true);


-- COUPONS (Public Read for validation, Admin Write)
create policy "Coupons are viewable by everyone" on public.coupons for select using (true);
create policy "Enable insert for admin panel coupons" on public.coupons for insert with check (true);
create policy "Enable update for admin panel coupons" on public.coupons for update using (true);
create policy "Enable delete for admin panel coupons" on public.coupons for delete using (true);

-- 11. AUTOMATION TRIGGERS

-- Handle updated_at automatically
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

-- ROBUST NEW USER HANDLER (V9 - OAuth Support)
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  is_orphan boolean;
  oauth_avatar text;
  oauth_name text;
begin
  -- Try to get avatar and name from metadata (Google/Discord send these)
  -- 'avatar_url' is standard, Google uses 'picture', Discord uses 'avatar_url'
  oauth_avatar := coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80');
  
  -- Try to get username, full_name, or fall back to email part
  oauth_name := coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
  values (
    new.id, 
    new.email, 
    oauth_name,
    0.00, 0, 0, 
    oauth_avatar
  );
  return new;
exception
  when unique_violation then
    -- Email collision detected. Check if orphan.
    select count(*) = 0 into is_orphan from auth.users where email = new.email;
    
    if is_orphan then
       delete from public.profiles where email = new.email;
       
       -- Retry insert
       insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
       values (
         new.id, 
         new.email, 
         oauth_name, 
         0.00, 0, 0, 
         oauth_avatar
       );
    end if;
    return new;
  when others then
    return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- BACKFILL PROFILES (Optimized to not overwrite existing)
insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'username', raw_user_meta_data->>'full_name', split_part(email, '@', 1)),
  0.00, 
  0, 
  0, 
  coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80')
from auth.users
on conflict (id) do nothing;

-- 12. SEED DATA (Only if empty)
insert into public.products (name, description, price, category, image_url, is_trending, platform) 
select 'Fortnite V-Bucks (13500)', 'Top up your V-Bucks instantly. Compatible with all platforms.', 79.99, 'Top Up', 'https://images.unsplash.com/photo-1589241062272-c0a000071964?auto=format&fit=crop&w=600&q=80', true, 'Multi'
where not exists (select 1 from public.products);
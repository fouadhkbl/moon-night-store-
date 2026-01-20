-- ==============================================================================
-- MOON NIGHT COMPLETE DATABASE SETUP (V8 - SMART ORPHAN CLEANUP)
-- Run this in the Supabase SQL Editor to sync your DB with the new UI features.
-- ==============================================================================

-- 1. Enable UUID extension (Required for ID generation)
create extension if not exists "uuid-ossp";

-- 2. RESET SHOP TABLES
drop table if exists public.order_items;
drop table if exists public.cart_items;
drop table if exists public.products cascade;

-- 3. PRODUCTS TABLE (Re-created with Platform and Trending support)
create table public.products (
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
-- This runs once during setup to clean the slate.
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
create table public.cart_items (
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
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure Orders columns exist
alter table public.orders add column if not exists status text default 'pending';
alter table public.orders add column if not exists payment_method text;

-- 7. ORDER ITEMS TABLE
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id), 
  quantity int not null,
  price_at_purchase decimal(10, 2) not null
);

-- 8. SECURITY POLICIES (RLS - Row Level Security)
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Clean up old policies to ensure clean slate
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Enable update for admin panel on profiles" on public.profiles;
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
drop policy if exists "Users can view own order items" on public.order_items;
drop policy if exists "Users can create order items" on public.order_items;

-- PROFILES POLICIES
create policy "Profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Enable update for admin panel on profiles" on public.profiles for update using (true);
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

-- ORDERS (Private)
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can create orders" on public.orders for insert with check (auth.uid() = user_id);

-- ORDER ITEMS (Private)
create policy "Users can view own order items" on public.order_items for select using (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);
create policy "Users can create order items" on public.order_items for insert with check (
  exists ( select 1 from public.orders where orders.id = order_items.order_id and orders.user_id = auth.uid() )
);

-- 9. AUTOMATION TRIGGERS

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

-- ROBUST NEW USER HANDLER (V8)
-- Intelligently handles email collisions to prevent signup blockers
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  is_orphan boolean;
begin
  insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    0.00, 0, 0, 
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
  );
  return new;
exception
  when unique_violation then
    -- Email collision detected. Check if the colliding profile is an orphan (exists in profiles but not auth.users).
    -- This happens if a user was deleted from Auth but not Profiles.
    select count(*) = 0 into is_orphan from auth.users where email = new.email;
    
    if is_orphan then
       -- It is an orphan (bad data), delete it so we can insert the new real user.
       delete from public.profiles where email = new.email;
       
       -- Retry insert for the new user
       insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
       values (
         new.id, 
         new.email, 
         coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
         0.00, 0, 0, 
         'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
       );
    end if;
    return new;
  when others then
    -- Catch all other errors to ensure Auth User creation never fails.
    return new;
end;
$$ language plpgsql security definer;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- BACKFILL PROFILES
insert into public.profiles (id, email, username, wallet_balance, vip_level, vip_points, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'username', split_part(email, '@', 1)),
  0.00, 
  0, 
  0, 
  'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
from auth.users
on conflict (id) do nothing;

-- 10. SEED DATA
insert into public.products (name, description, price, category, image_url, is_trending, platform) values
('Fortnite V-Bucks (13500)', 'Top up your V-Bucks instantly. Compatible with all platforms.', 79.99, 'Top Up', 'https://images.unsplash.com/photo-1589241062272-c0a000071964?auto=format&fit=crop&w=600&q=80', true, 'Multi'),
('EA FC 25 Coins (1M)', 'Get ahead in Ultimate Team with 1 Million Coins. Sniper bot delivery method.', 45.50, 'Coins', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=600&q=80', true, 'PS5'),
('Elden Ring Runes (50M)', 'Boost your tarnished with massive runes. Face-to-face trade in-game.', 15.00, 'Items', 'https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?auto=format&fit=crop&w=600&q=80', false, 'PC'),
('Discord Nitro (1 Year)', 'Enhance your discord experience with global emotes and larger file uploads.', 49.99, 'Top Up', 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=600&q=80', true, 'PC'),
('WoW Gold (100k)', 'World of Warcraft Gold for Classic servers. Mailbox delivery.', 32.20, 'Coins', 'https://images.unsplash.com/photo-1620321023374-d1a68fddadb3?auto=format&fit=crop&w=600&q=80', false, 'PC'),
('Valorant Points (11000)', 'Buy skins and battle pass instantly. Code delivered via email.', 85.00, 'Top Up', 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&w=600&q=80', true, 'PC'),
('GTA V Money Drop (100M)', 'Safe money drop for GTA Online private lobby.', 10.00, 'Boosting', 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80', true, 'PC'),
('Roblox Robux (10000)', 'Robux gift card code sent instantly via email.', 99.99, 'Gift Card', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80', true, 'Multi')
on conflict do nothing;

-- 11. BONUS: TEST DATA SETUP
update public.profiles 
set wallet_balance = 50.00, vip_level = 1, vip_points = 500 
where wallet_balance = 0.00;
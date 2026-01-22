
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  username text,
  avatar_url text,
  wallet_balance decimal(10,2) default 0.00,
  vip_level int default 0,
  vip_points int default 0,
  discord_points int default 0,
  total_donated decimal(10,2) default 0.00,
  referral_code text unique,
  referred_by uuid references public.profiles(id) on delete set null,
  referral_earnings decimal(10,2) default 0.00,
  auth_provider text default 'email',
  updated_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. PRODUCTS
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  price decimal(10,2) not null,
  category text not null,
  image_url text,
  stock int default 0,
  platform text default 'PC',
  country text default 'Global',
  is_trending boolean default false,
  is_vip boolean default false,
  is_hidden boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. ORDERS
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  total_amount decimal(10,2) not null,
  status text default 'pending', -- pending, completed, canceled
  payment_method text,
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ORDER ITEMS
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity int not null,
  price_at_purchase decimal(10,2) not null
);

-- 5. CART ITEMS
create table if not exists public.cart_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  quantity int default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. COUPONS
create table if not exists public.coupons (
  id uuid default uuid_generate_v4() primary key,
  code text unique not null,
  discount_type text not null, -- 'percent' or 'fixed'
  discount_value decimal(10,2) not null,
  max_uses int,
  usage_count int default 0,
  expires_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. ORDER MESSAGES (Chat)
create table if not exists public.order_messages (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  sender_id uuid not null, 
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. ACCESS LOGS
create table if not exists public.access_logs (
  id uuid default uuid_generate_v4() primary key,
  ip_address text,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. POINT PRODUCTS (Rewards)
create table if not exists public.point_products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  cost int not null,
  duration text,
  advantage text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. POINT REDEMPTIONS
create table if not exists public.point_redemptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.point_products(id) on delete set null,
  cost_at_redemption int not null,
  status text default 'pending', -- pending, delivered
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. POINT TRANSACTIONS (History)
create table if not exists public.point_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  points_amount int not null,
  money_equivalent decimal(10,2),
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. REDEMPTION MESSAGES
create table if not exists public.redemption_messages (
  id uuid default uuid_generate_v4() primary key,
  redemption_id uuid references public.point_redemptions(id) on delete cascade not null,
  sender_id uuid not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. DONATIONS
create table if not exists public.donations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  amount decimal(10,2) not null,
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. TOURNAMENTS
create table if not exists public.tournaments (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  game_name text not null,
  description text,
  image_url text not null,
  start_date timestamp with time zone not null,
  status text default 'open',
  entry_fee text default 'Free',
  prize_pool text,
  prize_2nd text,
  prize_3rd text,
  max_participants int default 100,
  current_participants int default 0,
  format text default 'Solo',
  rules text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 15. REVIEWS
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 16. ANNOUNCEMENTS (New Table for Multiple Announcements)
create table if not exists public.announcements (
  id uuid default uuid_generate_v4() primary key,
  message text not null,
  background_color text default 'linear-gradient(to right, #1e3a8a, #581c87, #1e3a8a)',
  text_color text default '#ffffff',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. APP SETTINGS (Admin Config)
create table if not exists public.app_settings (
  key text primary key,
  value text not null
);

-- Insert Default Settings
insert into public.app_settings (key, value) values ('affiliate_invite_reward', '5') on conflict do nothing;
insert into public.app_settings (key, value) values ('affiliate_order_reward_percentage', '5') on conflict do nothing;
insert into public.app_settings (key, value) values ('sale_code', 'MOON20') on conflict do nothing;
insert into public.app_settings (key, value) values ('site_background', '') on conflict do nothing;

-- ENABLE ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.order_messages enable row level security;
alter table public.access_logs enable row level security;
alter table public.point_products enable row level security;
alter table public.point_redemptions enable row level security;
alter table public.point_transactions enable row level security;
alter table public.redemption_messages enable row level security;
alter table public.donations enable row level security;
alter table public.tournaments enable row level security;
alter table public.reviews enable row level security;
alter table public.app_settings enable row level security;
alter table public.announcements enable row level security;

-- SECURITY POLICIES (Previous policies remain, ensuring idempotent behavior)

-- Profiles
drop policy if exists "Public profiles" on public.profiles;
create policy "Public profiles" on public.profiles for select using (true);
drop policy if exists "Users insert own" on public.profiles;
create policy "Users insert own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "Users update own" on public.profiles;
create policy "Users update own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "Admin update all profiles" on public.profiles;
create policy "Admin update all profiles" on public.profiles for update using (true);

-- App Settings
drop policy if exists "Public read settings" on public.app_settings;
create policy "Public read settings" on public.app_settings for select using (true);
drop policy if exists "Admin manage settings" on public.app_settings;
create policy "Admin manage settings" on public.app_settings for all using (true);

-- Announcements
drop policy if exists "Public read announcements" on public.announcements;
create policy "Public read announcements" on public.announcements for select using (true);
drop policy if exists "Admin manage announcements" on public.announcements;
create policy "Admin manage announcements" on public.announcements for all using (true);

-- Products
drop policy if exists "Public products" on public.products;
create policy "Public products" on public.products for select using (true);
drop policy if exists "Admin insert products" on public.products;
create policy "Admin insert products" on public.products for insert with check (true);
drop policy if exists "Admin update products" on public.products;
create policy "Admin update products" on public.products for update using (true);
drop policy if exists "Admin delete products" on public.products;
create policy "Admin delete products" on public.products for delete using (true);

-- Orders
drop policy if exists "User view orders" on public.orders;
create policy "User view orders" on public.orders for select using (auth.uid() = user_id or user_id is null);
drop policy if exists "User insert orders" on public.orders;
create policy "User insert orders" on public.orders for insert with check (auth.uid() = user_id);
drop policy if exists "User update orders" on public.orders;
create policy "User update orders" on public.orders for update using (true);

-- Order Items
drop policy if exists "View order items" on public.order_items;
create policy "View order items" on public.order_items for select using (true);
drop policy if exists "Insert order items" on public.order_items;
create policy "Insert order items" on public.order_items for insert with check (true);

-- Reviews
drop policy if exists "View reviews" on public.reviews;
create policy "View reviews" on public.reviews for select using (true);
drop policy if exists "Insert reviews" on public.reviews;
create policy "Insert reviews" on public.reviews for insert with check (auth.uid() = user_id);

-- Cart
drop policy if exists "User cart" on public.cart_items;
create policy "User cart" on public.cart_items for all using (auth.uid() = user_id);

-- Messages & Others
drop policy if exists "Public read all" on public.order_messages;
create policy "Public read all" on public.order_messages for select using (true);
drop policy if exists "Public insert all" on public.order_messages;
create policy "Public insert all" on public.order_messages for insert with check (true);

drop policy if exists "Public read all" on public.point_products;
create policy "Public read all" on public.point_products for select using (true);
drop policy if exists "Admin manage all" on public.point_products;
create policy "Admin manage all" on public.point_products for all using (true);

drop policy if exists "Public read all" on public.tournaments;
create policy "Public read all" on public.tournaments for select using (true);
drop policy if exists "Admin manage all" on public.tournaments;
create policy "Admin manage all" on public.tournaments for all using (true);

drop policy if exists "Public read all" on public.donations;
create policy "Public read all" on public.donations for select using (true);
drop policy if exists "Insert donations" on public.donations;
create policy "Insert donations" on public.donations for insert with check (true);

-- AUTO PROFILE CREATION TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
declare
  new_referral_code text;
begin
  -- Generate a random 8-char referral code
  new_referral_code := upper(substring(md5(random()::text) from 1 for 8));

  insert into public.profiles (id, email, username, avatar_url, referred_by, referral_code)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    (new.raw_user_meta_data->>'referrer_id')::uuid,
    new_referral_code
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

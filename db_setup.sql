
-- MOON NIGHT COMPLETE DATABASE SCHEMA
-- Target: Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  username text,
  avatar_url text,
  wallet_balance decimal(10,2) DEFAULT 0.00,
  vip_level int DEFAULT 0,
  vip_points int DEFAULT 0,
  discord_points int DEFAULT 0,
  spins_count int DEFAULT 0,
  total_donated decimal(10,2) DEFAULT 0.00,
  referral_code text UNIQUE,
  referred_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referral_earnings decimal(10,2) DEFAULT 0.00,
  auth_provider text DEFAULT 'email',
  last_daily_claim timestamp with time zone,
  updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category text NOT NULL,
  image_url text,
  image_url_2 text, 
  stock int DEFAULT 0,
  platform text DEFAULT 'PC',
  country text DEFAULT 'Global',
  is_trending boolean DEFAULT false,
  is_vip boolean DEFAULT false,
  is_hidden boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'pending', -- pending, completed, canceled
  payment_method text,
  transaction_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. ORDER ITEMS
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  quantity int NOT NULL,
  price_at_purchase decimal(10,2) NOT NULL
);

-- 5. CART ITEMS
CREATE TABLE IF NOT EXISTS public.cart_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  quantity int DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. COUPONS
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL, -- 'percent' or 'fixed'
  discount_value decimal(10,2) NOT NULL,
  max_uses int,
  usage_count int DEFAULT 0,
  expires_at timestamp with time zone,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ORDER MESSAGES (Chat)
CREATE TABLE IF NOT EXISTS public.order_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL, 
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. ACCESS LOGS
CREATE TABLE IF NOT EXISTS public.access_logs (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  ip_address text,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_agent text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. POINT PRODUCTS (Rewards)
CREATE TABLE IF NOT EXISTS public.point_products (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  image_url text,
  cost int NOT NULL,
  duration text,
  advantage text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. POINT REDEMPTIONS
CREATE TABLE IF NOT EXISTS public.point_redemptions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.point_products(id) ON DELETE SET NULL,
  cost_at_redemption int NOT NULL,
  status text DEFAULT 'pending', -- pending, delivered
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. POINT TRANSACTIONS (History)
CREATE TABLE IF NOT EXISTS public.point_transactions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  points_amount int NOT NULL,
  money_equivalent decimal(10,2),
  status text DEFAULT 'completed',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. REDEMPTION MESSAGES
CREATE TABLE IF NOT EXISTS public.redemption_messages (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  redemption_id uuid REFERENCES public.point_redemptions(id) ON DELETE CASCADE NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. DONATIONS
CREATE TABLE IF NOT EXISTS public.donations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount decimal(10,2) NOT NULL,
  transaction_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. TOURNAMENTS
CREATE TABLE IF NOT EXISTS public.tournaments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title text NOT NULL,
  game_name text NOT NULL,
  description text,
  image_url text NOT NULL,
  start_date timestamp with time zone NOT NULL,
  status text DEFAULT 'open',
  entry_fee text DEFAULT 'Free',
  prize_pool text,
  prize_2nd text,
  prize_3rd text,
  max_participants int DEFAULT 100,
  current_participants int DEFAULT 0,
  format text DEFAULT 'Solo',
  rules text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14.1 TOURNAMENT REQUIREMENTS (Dynamic fields)
CREATE TABLE IF NOT EXISTS public.tournament_requirements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  label text NOT NULL,
  field_type text DEFAULT 'text', -- 'text', 'number', 'discord'
  is_required boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14.2 TOURNAMENT APPLICATIONS
CREATE TABLE IF NOT EXISTS public.tournament_applications (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE,
  status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_message text,
  form_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tournament_id)
);

-- 15. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. ANNOUNCEMENTS (Legacy, replaced by live feed settings)
CREATE TABLE IF NOT EXISTS public.announcements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  message text NOT NULL,
  background_color text DEFAULT 'linear-gradient(to right, #1e3a8a, #581c87, #1e3a8a)',
  text_color text DEFAULT '#ffffff',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. APP SETTINGS
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- 18. LOOT BOXES (Moon Packs)
CREATE TABLE IF NOT EXISTS public.loot_boxes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  price decimal(10,2) NOT NULL,
  multiplier decimal(10,2) DEFAULT 1.0,
  color text DEFAULT 'bg-blue-900/40',
  border_color text DEFAULT 'border-blue-500',
  glow_color text DEFAULT 'shadow-blue-500/20',
  icon_type text DEFAULT 'package',
  potential_rewards text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 19. LOOT BOX OPENS
CREATE TABLE IF NOT EXISTS public.loot_box_opens (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  loot_box_id uuid REFERENCES public.loot_boxes(id) ON DELETE SET NULL,
  box_name text,
  box_price decimal(10,2) NOT NULL,
  reward_type text NOT NULL, -- 'money' or 'points'
  reward_value decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 20. SPIN WHEEL ITEMS
CREATE TABLE IF NOT EXISTS public.spin_wheel_items (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  type text NOT NULL, -- 'money', 'points', 'none'
  value decimal(10,2) NOT NULL,
  text text NOT NULL,
  color text NOT NULL,
  probability decimal(5,2) NOT NULL, -- percentage 0-100
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------------------
-- INITIAL SEED DATA
-- -------------------------------------------------------------------------------------

INSERT INTO public.app_settings (key, value) VALUES 
('affiliate_invite_reward', '5'),
('affiliate_order_reward_percentage', '5'),
('sale_code', 'MOON20'),
('site_background', ''),
('vip_membership_price', '199.00'),
('vip_discount_percent', '5.00'),
('live_feed_text', 'Welcome to Moon Night Marketplace • System Active • New Items Daily'),
('live_feed_badge', 'SYSTEM'),
('live_feed_color', '#2563eb'),
('live_feed_speed', '30s'),
('global_jackpot_pool', '1250.50')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.spin_wheel_items (type, value, text, color, probability) VALUES 
('money', 1, '1 DH', '#10b981', 10),
('points', 50, '50 PTS', '#8b5cf6', 20),
('money', 0.5, '0.5 DH', '#3b82f6', 20),
('points', 100, '100 PTS', '#8b5cf6', 15),
('money', 2, '2 DH', '#eab308', 3),
('points', 500, '500 PTS', '#8b5cf6', 1.5),
('money', 5, '5 DH', '#ef4444', 0.5),
('none', 0, 'Retry', '#6b7280', 30)
ON CONFLICT DO NOTHING;

-- -------------------------------------------------------------------------------------
-- RLS SECURITY POLICIES
-- -------------------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loot_box_opens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_wheel_items ENABLE ROW LEVEL SECURITY;

-- Dynamic Policy Creation Helper
DO $$
BEGIN
    -- Profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users insert own' AND tablename = 'profiles') THEN
        CREATE POLICY "Users insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users update own' AND tablename = 'profiles') THEN
        CREATE POLICY "Users update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    END IF;

    -- Tournament Applications
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users see own apps' AND tablename = 'tournament_applications') THEN
        CREATE POLICY "Users see own apps" ON public.tournament_applications FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users apply' AND tablename = 'tournament_applications') THEN
        CREATE POLICY "Users apply" ON public.tournament_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Global Admin Logic (Simplified for this script)
    -- Typically you would use: (auth.jwt() ->> 'email') IN ('grosafzemb@gmail.com', 'inzoka333@gmail.com', 'adamelalam82@gmail.com')
END $$;

-- -------------------------------------------------------------------------------------
-- TRIGGERS & FUNCTIONS
-- -------------------------------------------------------------------------------------

-- AUTO PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_referral_code text;
BEGIN
  -- Generate a random 8-char referral code
  new_referral_code := UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8));

  INSERT INTO public.profiles (id, email, username, avatar_url, referred_by, referral_code)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', 'Player'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://ui-avatars.com/api/?name=Player&background=random'),
    (new.raw_user_meta_data->>'referrer_id')::uuid,
    new_referral_code
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  platform: string;
  country?: string; 
  is_trending: boolean;
  is_vip?: boolean; 
  is_hidden?: boolean; 
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  username: string;
  password?: string;
  avatar_url: string;
  wallet_balance: number;
  vip_level: number;
  vip_points: number;
  discord_points: number; 
  spins_count: number;
  total_donated: number; 
  referral_code?: string;
  referred_by?: string;
  referral_earnings?: number;
  auth_provider?: string;
  last_daily_claim?: string;
}

export interface AppSetting {
  key: string;
  value: string;
}

export interface Announcement {
  id: string;
  message: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  created_at: string;
}

export interface LootBox {
  id: string;
  name: string;
  price: number;
  multiplier: number;
  color: string;
  border_color: string;
  glow_color: string;
  icon_type: string;
  potential_rewards: string;
  created_at: string;
}

export interface LootBoxOpen {
  id: string;
  user_id: string;
  loot_box_id: string;
  box_name: string;
  box_price: number;
  reward_type: 'money' | 'points';
  reward_value: number;
  created_at: string;
  profile?: Profile;
}

export interface SpinWheelItem {
  id: string;
  type: 'money' | 'points' | 'none';
  value: number;
  text: string;
  color: string;
  probability: number;
  is_active: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profile?: Profile;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method?: string;
  transaction_id?: string;
  created_at: string;
  items?: OrderItem[];
  profile?: Profile; 
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_purchase: number;
  product?: Product;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number | null;
  usage_count: number;
  expires_at: string | null;
  is_active: boolean;
}

export interface OrderMessage {
    id: string;
    order_id: string;
    sender_id: string;
    message: string;
    created_at: string;
}

export interface RedemptionMessage {
    id: string;
    redemption_id: string;
    sender_id: string;
    message: string;
    created_at: string;
}

export interface AccessLog {
    id: string;
    ip_address: string;
    user_id?: string;
    created_at: string;
}

export interface PointTransaction {
  id: string;
  user_id: string;
  points_amount: number;
  money_equivalent: number;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  profile?: Profile; 
}

export interface PointProduct {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cost: number;
  duration: string;
  advantage: string;
  is_active: boolean;
}

export interface PointRedemption {
  id: string;
  user_id: string;
  product_id: string;
  cost_at_redemption: number;
  status: string;
  created_at: string;
  point_product?: PointProduct;
  profile?: Profile;
}

export interface Donation {
  id: string;
  user_id: string;
  amount: number;
  transaction_id?: string;
  created_at: string;
  profile?: Profile;
}

export interface Tournament {
  id: string;
  title: string;
  game_name: string;
  description: string;
  image_url: string;
  start_date: string;
  status: 'open' | 'live' | 'past';
  entry_fee: string;
  prize_pool: string;
  prize_2nd?: string;
  prize_3rd?: string;
  max_participants: number;
  current_participants: number;
  format: string;
  rules: string;
  created_at: string;
}

export enum GameCategory {
  ACCOUNTS = 'Accounts',
  COINS = 'Coins',
  KEYS = 'Keys',
  ITEMS = 'Items',
  BOOSTING = 'Boosting',
  GIFT_CARD = 'Gift Card',
  SUBSCRIPTION = 'Subscription'
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  platform: string;
  country?: string; // New field for region/country
  is_trending: boolean;
  is_vip?: boolean; // New field for VIP status
  is_hidden?: boolean; // New field for visibility
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
  total_donated: number; // Added total_donated
  auth_provider?: string;
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
  profile?: Profile; // For admin view
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
  profile?: Profile; // Added for Admin Join
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
  profile?: Profile; // For Admin
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
  GIFT_CARD = 'Gift Card'
}
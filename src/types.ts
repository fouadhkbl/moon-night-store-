export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  stock: number;
  platform: string;
  is_trending: boolean;
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
  total_amount: number;
  status: string;
  created_at: string;
  items?: OrderItem[];
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

export enum GameCategory {
  COINS = 'Coins',
  TOP_UP = 'Top Up',
  ITEMS = 'Items',
  BOOSTING = 'Boosting',
  GIFT_CARD = 'Gift Card'
}
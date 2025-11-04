export type Campaign = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  image_url: string;
  starting_price: number;
  final_price: number;
  target_quantity: number;
  current_quantity: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  campaign_id: string;
  buyer_email: string;
  buyer_name: string;
  quantity: number;
  price_paid: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
};

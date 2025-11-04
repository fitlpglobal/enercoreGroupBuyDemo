# Database Setup Instructions

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Copy your project URL and anon key
3. Update the `.env.local` file with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## SQL Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  starting_price numeric NOT NULL CHECK (starting_price > 0),
  final_price numeric NOT NULL CHECK (final_price > 0),
  target_quantity integer NOT NULL CHECK (target_quantity > 0),
  current_quantity integer DEFAULT 0 CHECK (current_quantity >= 0),
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  buyer_email text NOT NULL,
  buyer_name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  price_paid numeric NOT NULL CHECK (price_paid > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Campaigns policies (public read/write for demo)
CREATE POLICY "Anyone can view campaigns"
  ON campaigns FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update campaigns"
  ON campaigns FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Orders policies
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_orders_campaign_id ON orders(campaign_id);

-- Create function to update campaign quantity
CREATE OR REPLACE FUNCTION update_campaign_quantity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE campaigns
  SET
    current_quantity = current_quantity + NEW.quantity,
    status = CASE
      WHEN current_quantity + NEW.quantity >= target_quantity THEN 'completed'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_campaign_quantity ON orders;
CREATE TRIGGER trigger_update_campaign_quantity
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_quantity();
```

## Sample Data (Optional)

```sql
-- Insert a sample campaign
INSERT INTO campaigns (seller_id, title, description, image_url, starting_price, final_price, target_quantity, status)
VALUES (
  'seller123',
  'Premium Wireless Headphones',
  'High-quality wireless headphones with noise cancellation, 30-hour battery life, and premium sound quality. Perfect for music lovers and professionals.',
  'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
  299.99,
  199.99,
  50,
  'active'
);
```

## Testing the Application

1. Visit the seller dashboard at `/seller`
2. Create a new campaign with your product details
3. View the campaign on the home page
4. Click on a product to see the detailed page and checkout form
5. Place an order to see the quantity update in real-time
6. Return to the seller dashboard to manage your campaigns (pause/resume/delete)

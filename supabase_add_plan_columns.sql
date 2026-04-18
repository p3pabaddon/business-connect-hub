
-- Add plan and plan_price columns to businesses table
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS plan_price INTEGER DEFAULT 299;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';

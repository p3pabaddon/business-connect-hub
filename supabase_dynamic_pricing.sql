ALTER TABLE businesses ADD COLUMN IF NOT EXISTS dynamic_pricing JSONB DEFAULT '{
  "peak_multiplier": 1.1,
  "slow_multiplier": 0.9,
  "peak_days": ["saturday", "sunday"],
  "slow_days": ["tuesday", "wednesday"]
}'::JSONB;

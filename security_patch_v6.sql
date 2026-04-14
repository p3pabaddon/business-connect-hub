-- Missing review columns for Social Proof & Verification
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS appointment_id UUID REFERENCES appointments(id);

-- Update existing reviews to be visible by default
UPDATE reviews SET is_visible = true WHERE is_visible IS NULL;

-- 📝 Review Enhancements: Helpful & Report
-- 1. Add helpful_count to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- 2. Create review_reports table
CREATE TABLE IF NOT EXISTS review_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, resolved, dismissed
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS for review_reports
ALTER TABLE review_reports ENABLE ROW LEVEL SECURITY;

-- Everyone can report
CREATE POLICY "Herkes rapor verebilir" ON review_reports FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only admins can see and update reports
CREATE POLICY "Adminler raporları görebilir" ON review_reports FOR SELECT USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Adminler raporları güncelleyebilir" ON review_reports FOR UPDATE USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. Function to increment helpful count (safer than direct update)
CREATE OR REPLACE FUNCTION increment_review_helpful(target_review_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = target_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

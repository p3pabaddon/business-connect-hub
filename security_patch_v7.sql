-- 🛡️ SECURITY & PERFORMANCE PATCH v7
-- Objective: Fix high-priority audit findings at the database level.

-- 1. Optimized Revenue Aggregator (Performance)
-- Moves revenue calculation from client to server.
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
BEGIN
  RETURN (SELECT COALESCE(SUM(total_price), 0) FROM appointments WHERE status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Secure Role Verification (Security)
-- Prevents client-side role manipulation.
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id 
    AND role IN ('admin', 'hq_staff')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Business Stats Aggregator (Performance)
-- Combines multiple counts into a single request.
CREATE OR REPLACE FUNCTION get_business_dashboard_stats(target_biz_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  today_date DATE := CURRENT_DATE;
BEGIN
  SELECT json_build_object(
    'total_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id),
    'today_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id AND appointment_date = today_date),
    'pending_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id AND status = 'pending'),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM appointments WHERE business_id = target_biz_id AND status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Churn Risk Calculator (Performance)
-- Offloads data-heavy filtering to the engine.
CREATE OR REPLACE FUNCTION get_churn_risk_customers(target_biz_id UUID, days_threshold INTEGER DEFAULT 45)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  last_visit DATE,
  visit_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.customer_id, 
    MAX(a.customer_name) as customer_name, 
    MAX(a.appointment_date) as last_visit,
    COUNT(*) as visit_count
  FROM appointments a
  WHERE a.business_id = target_biz_id 
    AND a.status = 'completed'
    AND a.customer_id IS NOT NULL
  GROUP BY a.customer_id
  HAVING MAX(a.appointment_date) < (CURRENT_DATE - days_threshold);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RLS Protection for Notifications
-- Ensure users only see their own notifications.
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can see own notifications" ON notifications;
CREATE POLICY "Users can see own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- 6. OpenAI Key Warning (Documentation only)
-- Note: Remember to run 'supabase secrets set OPENAI_API_KEY=...' via CLI.

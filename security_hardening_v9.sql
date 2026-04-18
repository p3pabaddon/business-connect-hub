-- 🛡️ SECURITY HARDENING PATCH v9
-- Objective: Fix BOLA (Broken Object Level Authorization) and restrict global data leaks.

-- 1. Secure Global Revenue (Access Control)
-- Restriction: Only platform admins can see the total platform revenue.
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'hq_staff')
  ) THEN
    RAISE EXCEPTION 'Yetki Hatası: Global ciro verisine sadece platform yöneticileri erişebilir.';
  END IF;

  RETURN (SELECT COALESCE(SUM(total_price), 0) FROM appointments WHERE status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Secure Business Stats (Ownership Check)
-- BOLA fix: Prevents business A from seeing business B's dashboard stats.
CREATE OR REPLACE FUNCTION get_business_dashboard_stats(target_biz_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Verificaion: Does auth.uid() own target_biz_id OR is admin?
  IF NOT EXISTS (
    SELECT 1 FROM businesses WHERE id = target_biz_id AND owner_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hq_staff')
  ) THEN
    RAISE EXCEPTION 'Yetki Hatası: Bu işletmenin verilerine erişim izniniz yok.';
  END IF;

  SELECT json_build_object(
    'total_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id),
    'today_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id AND appointment_date = today_date),
    'pending_appointments', (SELECT count(*) FROM appointments WHERE business_id = target_biz_id AND status = 'pending'),
    'total_revenue', (SELECT COALESCE(SUM(total_price), 0) FROM appointments WHERE business_id = target_biz_id AND status = 'completed')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Secure Churn Risk (Ownership Check)
-- BOLA fix: Restricts AI Churn analysis to business owners only.
CREATE OR REPLACE FUNCTION get_churn_risk_customers(target_biz_id UUID, days_threshold INTEGER DEFAULT 45)
RETURNS TABLE (
  customer_id UUID,
  customer_name TEXT,
  last_visit DATE,
  visit_count BIGINT
) AS $$
BEGIN
  -- Ownership Check
  IF NOT EXISTS (
    SELECT 1 FROM businesses WHERE id = target_biz_id AND owner_id = auth.uid()
  ) AND NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'hq_staff')
  ) THEN
    RAISE EXCEPTION 'Yetki Hatası: Müşteri churn analizine erişim reddedildi.';
  END IF;

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

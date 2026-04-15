-- 🛡️ SECURITY PATCH v8 (Final Audit Fixes)
-- IDs Addressed: 02, 03, 04

-- 1. ID 02: Notification Injection Prevention
-- Restrict INSERT so users can only insert for themselves (or bypass with service_role)
DROP POLICY IF EXISTS "Sistem bildirim ekleyebilir" ON notifications;
CREATE POLICY "Kullanıcı sadece kendine bildirim atabilir" 
ON notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. ID 03: Support Message Hijacking Prevention
-- Ensure sender is either the ticket owner or an admin
DROP POLICY IF EXISTS "Mesaj gönderme" ON support_messages;
CREATE POLICY "Sadece bilet sahibi veya admin mesaj gönderebilir" 
ON support_messages FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id = ticket_id 
        AND (owner_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
);

-- 3. ID 04: Revenue Data Leakage Prevention
-- Add explicit role check inside SECURITY DEFINER function
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC AS $$
BEGIN
  -- Explicit check for admin role in profiles table
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Yetkisiz erişim: Bu veriyi sadece yöneticiler görebilir.';
  END IF;

  RETURN (SELECT COALESCE(SUM(total_price), 0) FROM appointments WHERE status = 'completed');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Traffic Logs Security Hardening
-- Ensure even for INSERT, if a user_id is provided, it must match the authenticated user
DROP POLICY IF EXISTS "Herkes log üretebilir" ON traffic_logs;
CREATE POLICY "Herkes güvenli log üretebilir" ON traffic_logs FOR INSERT WITH CHECK (
    user_id IS NULL OR user_id = auth.uid()
);

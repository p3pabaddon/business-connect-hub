-- Notification Payload Migration
-- Run this in your Supabase SQL Editor

-- 1. Add payload column
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;

-- 2. Update Appointment Notification Trigger
CREATE OR REPLACE FUNCTION notify_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type, payload)
  VALUES (
    (SELECT owner_id FROM businesses WHERE id = NEW.business_id),
    'YENİ RANDEVU TALEBİ',
    'YENİ BİR MÜŞTERİ RANDEVU ALDI: ' || COALESCE(NEW.customer_name, 'BİR MÜŞTERİ'),
    'appointment',
    jsonb_build_object(
      'appointment_id', NEW.id,
      'appointment_date', NEW.appointment_date,
      'appointment_time', NEW.appointment_time
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

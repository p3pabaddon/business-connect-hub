-- Otomatik Bildirim Sistemi (FIXED)
-- Yeni randevu geldiğinde veya destek mesajı atıldığında 'notifications' tablosuna kayıt atar.

-- 1. Randevu Bildirim Tetikleyicisi
CREATE OR REPLACE FUNCTION notify_on_appointment()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, title, message, type)
  VALUES (
    (SELECT owner_id FROM businesses WHERE id = NEW.business_id),
    'YENİ RANDEVU TALEBİ',
    'YENİ BİR MÜŞTERİ RANDEVU ALDI: ' || COALESCE((SELECT full_name FROM profiles WHERE id = NEW.user_id), 'BİR MÜŞTERİ'),
    'appointment'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_appointment ON appointments;
CREATE TRIGGER tr_notify_appointment
AFTER INSERT ON appointments
FOR EACH ROW EXECUTE FUNCTION notify_on_appointment();

-- 2. Destek Mesajı Bildirim Tetikleyicisi (İşletme Sahibine)
CREATE OR REPLACE FUNCTION notify_on_support_message()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  ticket_owner_id UUID;
  sender_role TEXT;
BEGIN
  -- Mesajı atan kim?
  SELECT role INTO sender_role FROM profiles WHERE id = NEW.sender_id;
  
  -- Ticket sahibi kim?
  SELECT owner_id INTO ticket_owner_id FROM support_tickets WHERE id = NEW.ticket_id;

  -- Eğer admin mesaj attıysa, fatura/işletme sahibine bildir
  IF sender_role = 'admin' THEN
    target_user_id := ticket_owner_id;
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (target_user_id, 'DESTEK MERKEZİNDEN MESAJ', 'DESTEK TALEBİNİZE YENİ BİR CEVAP GELDİ.', 'message');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_support_message ON support_messages;
CREATE TRIGGER tr_notify_support_message
AFTER INSERT ON support_messages
FOR EACH ROW EXECUTE FUNCTION notify_on_support_message();

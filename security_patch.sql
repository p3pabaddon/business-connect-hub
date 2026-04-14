-- ==========================================
-- GÜVENLİK YAMASI VE DENETİMİ
-- ==========================================

-- 1. SUPPORT TICKETS GÜVENLİK GÜNCELLEMESİ
-- Zafiyet: Herkes herhangi bir ID ile talep açabiliyordu
DROP POLICY IF EXISTS "Herkes talep açabilir" ON support_tickets;
CREATE POLICY "Sadece kendi adına talep açabilir" ON support_tickets 
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    owner_id = auth.uid()
);

-- 2. SUPPORT MESSAGES GÜVENLİK GÜNCELLEMESİ
-- Zafiyet: Herhangi bir kullanıcı, diğer kullanıcıların taleplerine mesaj gönderebiliyordu ve sender_id'yi taklit edebiliyordu.
DROP POLICY IF EXISTS "Mesaj gönderme" ON support_messages;
CREATE POLICY "Sadece talep sahibi ve admin mesaj gönderebilir" ON support_messages 
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    sender_id = auth.uid() AND
    EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id = ticket_id AND (
            owner_id = auth.uid() OR 
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        )
    )
);

-- 3. BİLDİRİM (NOTIFICATIONS) GÜVENLİK GÜNCELLEMESİ
-- Zafiyet: Herhangi biri başkası adına bildirim oluşturabilirdi. Uygulama backend (sistem seviyesi) gerektirmediği için burada kontrol sağlamlaştırılır.
DROP POLICY IF EXISTS "Sistem bildirim ekleyebilir" ON notifications;
CREATE POLICY "Sadece adminler ve sistem bildirim gönderebilir" ON notifications 
FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 4. TRAFİK LOGLARI VERİ ZAFİYETİ
-- Botların loglara spam yapmasını engellemek için basic check eklenebilir veya mevcut bırakılabilir
-- DROP POLICY IF EXISTS "Herkes log üretebilir" ON traffic_logs;
-- Orijinal policy kalabilir, zira dış site hitleri de loglanabilir.

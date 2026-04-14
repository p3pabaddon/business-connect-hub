-- ==========================================
-- GÜVENLİK YAMASI VE DENETİMİ (BÖLÜM 3)
-- OKUMA (SELECT) POLİTİKALARI VE HATA GİDERME
-- ==========================================

-- support_messages tablosunda RLS aktifse ve SELECT politikası yoksa
-- kullanıcılar kendi mesajlarını dahi göremezler.

-- 1. SUPPORT MESSAGES OKUMA İZNİ
DROP POLICY IF EXISTS "Kullanıcılar ilgili mesajları görebilir" ON support_messages;
CREATE POLICY "Kullanıcılar ilgili mesajları görebilir" ON support_messages 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM support_tickets 
        WHERE id = ticket_id AND (
            owner_id = auth.uid() OR 
            (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        )
    )
);

-- 2. SUPPORT TICKETS OKUMA İZNİ (Eğer eksikse)
DROP POLICY IF EXISTS "Kullanıcılar kendi biletlerini görebilir" ON support_tickets;
CREATE POLICY "Kullanıcılar kendi biletlerini görebilir" ON support_tickets 
FOR SELECT USING (
    owner_id = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

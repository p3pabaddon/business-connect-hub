-- ==========================================
-- GÜVENLİK YAMASI VE DENETİMİ (BÖLÜM 4)
-- REALTIME ETKİNLEŞTİRME VE STATUS GENİŞLETME
-- ==========================================

-- 1. REALTIME ETKİNLEŞTİRME
-- Supabase Dashboard'da manuel yapılmadıysa buradan da denenebilir:
-- (NOT: Bu komut genellikle Dashboard -> Database -> Publications -> 'supabase_realtime' içinden tablo ekleyerek yapılır)
-- Eğer supabase_realtime yayını varsa tabloyu ona ekleyelim:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;
        ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
        ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
        ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
END $$;

-- 2. STATUS KONTROLÜ (Optional: TEXT kolon olduğu için uygulama seviyesinde yönetilebilir ama kısıtlama ekleyebiliriz)
-- Mevcut status: 'open', 'closed'.
-- İstenenler: 'in_review', 'queued', 'waiting_reply'
-- Biz TEXT olarak bırakıyoruz ama UI'da bunları kullanacağız.

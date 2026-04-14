-- ==========================================
-- GÜVENLİK YAMASI VE DENETİMİ (BÖLÜM 2)
-- SİSTEM VE YÖNETİCİ TABLOLARI İÇİN SIKI RLS
-- ==========================================

-- Admin tablolarının dışarıdan erişime karşı kapatılması
-- Eğer RLS yoksa, herhangi biri tarayıcı konsolundan supabase.from('banned_users').insert(...) yazarak
-- istediği kişiyi banlayabilir. Bunu engellemek için tüm admin tablolarını kilitliyoruz.

-- 1. BANNED USERS
ALTER TABLE IF EXISTS banned_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Adminler banned_users görebilir" ON banned_users;
DROP POLICY IF EXISTS "Adminler banned_users değiştirebilir" ON banned_users;

CREATE POLICY "Adminler banned_users görebilir" ON banned_users 
FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Adminler banned_users değiştirebilir" ON banned_users 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


-- 2. ANNOUNCEMENTS
ALTER TABLE IF EXISTS announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes duyuruları görebilir" ON announcements;
DROP POLICY IF EXISTS "Sadece admin duyuru ekleyebilir" ON announcements;

CREATE POLICY "Herkes duyuruları görebilir" ON announcements 
FOR SELECT USING (true); -- Tüm kullanıcılar duyuruları okuyabilir

CREATE POLICY "Sadece admin duyuru ekleyebilir" ON announcements 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');


-- 3. AUDIT LOGS
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Adminler audit_logs okuyabilir" ON audit_logs;
DROP POLICY IF EXISTS "Sistem audit_log ekleyebilir" ON audit_logs;

CREATE POLICY "Adminler audit_logs okuyabilir" ON audit_logs 
FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Sadece sistem/admin işlem kaydı yapabilmeli
CREATE POLICY "Sadece admin audit_log ekleyebilir" ON audit_logs 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 4. SYSTEM SETTINGS
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Herkes ayarları görebilir" ON system_settings;
DROP POLICY IF EXISTS "Sadece admin ayarları güncelleyebilir" ON system_settings;

CREATE POLICY "Herkes ayarları görebilir" ON system_settings 
FOR SELECT USING (true);

CREATE POLICY "Sadece admin ayarları güncelleyebilir" ON system_settings 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

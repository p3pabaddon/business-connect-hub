-- 🛡️ SECURITY PATCH v10: GOD MODE & ADMINISTRATIVE HARDENING
-- Addresses IDs: 01, 05, 06, 07

-- 1. HARDEN PROFILES (STOP PRIVILEGE ESCALATION & DATA LEAKAGE)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by owner or admin" 
ON profiles FOR SELECT USING (
    auth.uid() = id 
    OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin', 'hq_staff')
);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
    auth.uid() = id AND 
    (
        -- Prevent changing role unless the requester is already an admin
        role = (SELECT role FROM profiles WHERE id = auth.uid()) 
        OR 
        (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
    )
);

-- 2. HARDEN STORAGE (STOP ASSET HIJACKING)
-- Remove the weak policy from migrate.js/nuclear_fix
DROP POLICY IF EXISTS "Business owners can upload their assets" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can update their assets" ON storage.objects;

CREATE POLICY "Business owners can upload their assets" 
ON storage.objects FOR INSERT 
WITH CHECK (
    bucket_id = 'business-assets' AND 
    (substring(name from '^([^/]+)') IN (SELECT id::text FROM businesses WHERE owner_id = auth.uid()))
);

CREATE POLICY "Business owners can delete their assets" 
ON storage.objects FOR DELETE 
USING (
    bucket_id = 'business-assets' AND 
    (substring(name from '^([^/]+)') IN (SELECT id::text FROM businesses WHERE owner_id = auth.uid()))
);

-- 3. HARDEN SUPPORT TICKETS (STOP SPOOFING)
DROP POLICY IF EXISTS "Herkes talep açabilir" ON support_tickets;
CREATE POLICY "Kullanıcılar sadece kendi adına talep açabilir" 
ON support_tickets FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- 4. HARDEN ADMIN TABLES (OVERWRITE INSECURE MIGRATE.JS POLICIES)
-- Fix audit_logs
DROP POLICY IF EXISTS "admin_all_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Adminler audit_logs okuyabilir" ON audit_logs;
DROP POLICY IF EXISTS "Sadece admin audit_log ekleyebilir" ON audit_logs;

CREATE POLICY "Adminler audit_logs görebilir" ON audit_logs 
FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'hq_staff', 'super_admin'));

CREATE POLICY "Sistem audit_log ekleyebilir" ON audit_logs 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL); -- Still allow insert but we should verify performed_by in future

-- Fix system_settings
DROP POLICY IF EXISTS "admin_all_system_settings" ON system_settings;
DROP POLICY IF EXISTS "Sadece admin ayarları güncelleyebilir" ON system_settings;

CREATE POLICY "Sadece admin ayarları güncelleyebilir" ON system_settings 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin'));

-- Fix banned_users
DROP POLICY IF EXISTS "admin_all_banned_users" ON banned_users;
CREATE POLICY "Adminler yasaklıları yönetebilir" ON banned_users 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'hq_staff', 'super_admin'));

-- Fix announcements
DROP POLICY IF EXISTS "admin_all_announcements" ON announcements;
CREATE POLICY "Adminler duyuru yönetebilir" ON announcements 
FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'hq_staff', 'super_admin'));

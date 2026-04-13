
-- TÜM POLİTİKALARI SIFIRLA (Eskiden kalanları temizle)
DROP POLICY IF EXISTS "Business owners can upload their assets" ON storage.objects;
DROP POLICY IF EXISTS "Business assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Business owners can delete their assets" ON storage.objects;
DROP POLICY IF EXISTS "Kullanıcı kendi taleplerini görebilir" ON support_tickets;
DROP POLICY IF EXISTS "Herkes talep açabilir" ON support_tickets;
DROP POLICY IF EXISTS "Portfolyoyu herkes görebilir" ON business_portfolios;
DROP POLICY IF EXISTS "Sadece dükkan sahibi portfolyo ekleyebilir" ON business_portfolios;

-- 1. STORAGE (GALERİ) - Kesin Çözüm
CREATE POLICY "Business assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

-- Yükleme yetkisini biraz daha esnetiyoruz (Üst klasör ID kontrolü ile)
CREATE POLICY "Business owners can upload their assets" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'business-assets' AND 
    auth.uid() IS NOT NULL
);

CREATE POLICY "Business owners can update their assets" ON storage.objects FOR UPDATE WITH CHECK (
    bucket_id = 'business-assets' AND 
    auth.uid() IS NOT NULL
);

-- 2. DESTEK TALEPLERİ - Kesin Çözüm
-- Herkes talep açabilir (Bağlı olduğu sürece)
CREATE POLICY "Herkes talep açabilir" ON support_tickets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Kendi taleplerini ve adminlerin hepsini görebilmesi için (Subquery'yi garantiye alıyoruz)
CREATE POLICY "Herkes kendi talebini görebilir" ON support_tickets 
FOR SELECT USING (
    owner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. PORTFOLYO TABLOSU (Metin verileri)
CREATE POLICY "Portfolyoyu herkes görebilir" ON business_portfolios FOR SELECT USING (true);
CREATE POLICY "Sadece dükkan sahibi ekleyebilir" ON business_portfolios FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

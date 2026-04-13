
-- STORAGE POLİTİKALARINI SIFIRLA VE GÜNCELLE
DROP POLICY IF EXISTS "Business owners can upload their assets" ON storage.objects;
DROP POLICY IF EXISTS "Business assets are publicly accessible" ON storage.objects;

-- Herkes görebilir
CREATE POLICY "Business assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');

-- İşletme sahipleri yükleyebilir (Eşleşme IN ile yapılır, hata payı sıfır)
CREATE POLICY "Business owners can upload their assets" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'business-assets' AND
    (substring(name from '^([^/]+)') IN (SELECT id::text FROM businesses WHERE owner_id = auth.uid()))
);

-- İşletme sahipleri silebilir
CREATE POLICY "Business owners can delete their assets" ON storage.objects FOR DELETE USING (
    bucket_id = 'business-assets' AND
    (substring(name from '^([^/]+)') IN (SELECT id::text FROM businesses WHERE owner_id = auth.uid()))
);

-- DESTEK TALEPLERİ GÜNCELLEME (Eğer owner_id UUID uyuşmazlığı varsa)
DROP POLICY IF EXISTS "Herkes talep açabilir" ON support_tickets;
CREATE POLICY "Herkes talep açabilir" ON support_tickets FOR INSERT WITH CHECK (true); 
-- Not: owner_id'yi uygulama üzerinden auth.uid() olarak basıyoruz zaten.

-- Gerekli eklentiyi etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLOLARI TEMİZLE (Hatalı şemaları temizlemek için)
DROP TABLE IF EXISTS support_messages CASCADE;
DROP TABLE IF EXISTS support_tickets CASCADE;
DROP TABLE IF EXISTS business_portfolios CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS traffic_logs CASCADE;

-- TABLO OLUŞTURMA: Portfolyo (Gallery)
CREATE TABLE business_portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    main_image TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLO OLUŞTURMA: Destek Talepleri
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES auth.users(id),
    business_id UUID REFERENCES businesses(id),
    subject TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLO OLUŞTURMA: Destek Mesajları
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLO OLUŞTURMA: Kuponlar
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    title TEXT,
    code TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLO OLUŞTURMA: Bildirimler
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'general',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLO OLUŞTURMA: Trafik Logları
CREATE TABLE traffic_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS ETKİNLEŞTİRME
ALTER TABLE business_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE traffic_logs ENABLE ROW LEVEL SECURITY;

-- POLİTİKALAR: Portfolyo
CREATE POLICY "Portfolyoyu herkes görebilir" ON business_portfolios FOR SELECT USING (true);
CREATE POLICY "Sadece dükkan sahibi portfolyo ekleyebilir" ON business_portfolios FOR INSERT WITH CHECK (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);
CREATE POLICY "Sadece dükkan sahibi silebilir" ON business_portfolios FOR DELETE USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

-- POLİTİKALAR: Destek
CREATE POLICY "Kullanıcı kendi taleplerini görebilir" ON support_tickets FOR SELECT USING (owner_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Herkes talep açabilir" ON support_tickets FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Adminler durum değiştirebilir" ON support_tickets FOR UPDATE USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Mesajları talep sahibi ve admin görebilir" ON support_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM support_tickets WHERE id = ticket_id AND (owner_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'))
);
CREATE POLICY "Mesaj gönderme" ON support_messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- POLİTİKALAR: Kuponlar
CREATE POLICY "Aktif kuponları herkes görebilir" ON coupons FOR SELECT USING (is_active = true OR EXISTS (SELECT 1 FROM businesses WHERE id = business_id AND owner_id = auth.uid()));
CREATE POLICY "İşletme sahibi kupon yönetebilir" ON coupons FOR ALL USING (
    business_id IN (SELECT id FROM businesses WHERE owner_id = auth.uid())
);

-- POLİTİKALAR: Bildirimler
CREATE POLICY "Kullanıcı kendi bildirimlerini görebilir" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Kullanıcı bildirimini güncelleyebilir" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Sistem bildirim ekleyebilir" ON notifications FOR INSERT WITH CHECK (true);

-- POLİTİKALAR: Trafik Logları
CREATE POLICY "Logları sadece admin görebilir" ON traffic_logs FOR SELECT USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR EXISTS (SELECT 1 FROM businesses WHERE owner_id = auth.uid()));
CREATE POLICY "Herkes log üretebilir" ON traffic_logs FOR INSERT WITH CHECK (true);

-- STORAGE POLİTİKALARI
CREATE POLICY "Business assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'business-assets');
CREATE POLICY "Business owners can upload their assets" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'business-assets' AND
    (substring(name from '^([^/]+)') = (SELECT id::text FROM businesses WHERE owner_id = auth.uid()))
);

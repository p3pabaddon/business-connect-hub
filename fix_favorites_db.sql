
-- 1. Favoriler tablosunun yapısını kontrol et ve eksikse oluştur
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, business_id)
);

-- 2. Eğer tablo zaten varsa ama kısıtlamalar eksikse ekle
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'favorites_user_business_key'
    ) THEN
        ALTER TABLE favorites ADD CONSTRAINT favorites_user_business_key UNIQUE (user_id, business_id);
    END IF;
END $$;

-- 3. RLS (Row Level Security) Politikalarını Ayarla
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Herkes kendi favorilerini görebilsin
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

-- Herkes kendi favorisini ekleyebilsin
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Herkes kendi favorisini silebilirsin
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;
CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- Herkes kendi favorisini güncelleyebilsin (upsert için)
DROP POLICY IF EXISTS "Users can update own favorites" ON favorites;
CREATE POLICY "Users can update own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Yayınlama: Bu betiği Supabase SQL Editor'da çalıştırın.

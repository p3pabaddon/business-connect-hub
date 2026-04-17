
-- Favoriler tablosu için benzersiz kısıtlama ekleyelim (aynı işletme iki kez eklenmesin)
ALTER TABLE favorites DROP CONSTRAINT IF EXISTS favorites_user_business_key;
ALTER TABLE favorites ADD CONSTRAINT favorites_user_business_key UNIQUE (user_id, business_id);

-- Randevu Dünyası Advanced Features Enhancement
-- Includes: PostGIS Geolocation, Programmatic SEO Blog, Push Notifications

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Update Businesses with Location
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS location geography(Point, 4326);
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS address_details JSONB;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS city TEXT;

-- 3. Blog System for Programmatic SEO
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    main_image TEXT,
    meta_title TEXT,
    meta_description TEXT,
    category TEXT,
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT UNIQUE NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. RLS Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Blog Policies
DROP POLICY IF EXISTS "Public can read published posts" ON blog_posts;
CREATE POLICY "Public can read published posts" ON blog_posts FOR SELECT USING (is_published = true);

DROP POLICY IF EXISTS "Admins can manage blog" ON blog_posts;
CREATE POLICY "Admins can manage blog" ON blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Push Policies
DROP POLICY IF EXISTS "Users manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users manage own subscriptions" ON push_subscriptions FOR ALL USING (user_id = auth.uid());

-- 6. RPC Functions
-- Function to find businesses near a point
CREATE OR REPLACE FUNCTION find_businesses_near(
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 10000
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    dist_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        id,
        name,
        ST_Distance(location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography) as dist_meters
    FROM businesses
    WHERE ST_DWithin(location, ST_SetSRID(ST_Point(lng, lat), 4326)::geography, radius_meters)
    ORDER BY dist_meters ASC;
$$;

-- 7. Indexes
CREATE INDEX IF NOT EXISTS businesses_location_idx ON businesses USING GIST (location);
CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published_idx ON blog_posts (is_published);

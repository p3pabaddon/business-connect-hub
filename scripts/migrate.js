/**
 * Supabase Migration Script
 * Creates missing tables: banned_users, announcements, system_settings, audit_logs
 * Uses the Supabase service role key via the REST API
 */

const SUPABASE_URL = 'https://szlkjqamknjiwlwtaxpw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bGtqcWFta25qaXdsd3RheHB3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDcwNzM4MywiZXhwIjoyMDkwMjgzMzgzfQ.JPVVZtUTzSKWhGKKHkEK1JDscz6xdctE1NrluDEik1Q';

const SQL = `
-- ============================================
-- 1. audit_logs (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action text NOT NULL,
  details text,
  performed_by text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 2. banned_users
-- ============================================
CREATE TABLE IF NOT EXISTS banned_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  reason text DEFAULT 'Belirtilmedi',
  banned_by text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 3. announcements
-- ============================================
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL,
  target text DEFAULT 'all' CHECK (target IN ('all', 'businesses', 'customers')),
  sent_by text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- 4. system_settings
-- ============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id text PRIMARY KEY DEFAULT 'global',
  platform_name text DEFAULT 'RandevuDunyasi',
  support_email text DEFAULT 'info@randevudunyasi.com',
  no_show_limit integer DEFAULT 3,
  mfa_required boolean DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS but allow service role full access
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banned_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin check is on frontend)
DO $$ BEGIN
  -- audit_logs policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'admin_all_audit_logs') THEN
    CREATE POLICY admin_all_audit_logs ON audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- banned_users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'banned_users' AND policyname = 'admin_all_banned_users') THEN
    CREATE POLICY admin_all_banned_users ON banned_users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- announcements policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'admin_all_announcements') THEN
    CREATE POLICY admin_all_announcements ON announcements FOR ALL USING (true) WITH CHECK (true);
  END IF;
  -- system_settings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'admin_all_system_settings') THEN
    CREATE POLICY admin_all_system_settings ON system_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Seed default settings row
INSERT INTO system_settings (id, platform_name, support_email, no_show_limit, mfa_required)
VALUES ('global', 'RandevuDunyasi', 'info@randevudunyasi.com', 3, true)
ON CONFLICT (id) DO NOTHING;
`;

async function runMigration() {
  console.log('🚀 Supabase Migration başlatılıyor...\n');

  // Method 1: Try the SQL query endpoint (newer Supabase versions)
  const endpoints = [
    '/rest/v1/rpc/exec_sql',
    '/rest/v1/rpc/run_sql',
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Deneniyor: ${endpoint}...`);
      const res = await fetch(`${SUPABASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ query: SQL }),
      });
      if (res.ok) {
        console.log(`✅ Migration başarılı (${endpoint})`);
        return;
      }
      console.log(`  ❌ ${endpoint} → ${res.status} ${res.statusText}`);
    } catch (e) {
      console.log(`  ❌ ${endpoint} → ${e.message}`);
    }
  }

  // Method 2: If RPC didn't work, print SQL for manual execution
  console.log('\n' + '='.repeat(60));
  console.log('⚠️  Otomatik migration yapılamadı.');
  console.log('📋 Aşağıdaki SQL\'i Supabase Dashboard > SQL Editor\'e yapıştırın:');
  console.log('='.repeat(60));
  console.log(SQL);
  console.log('='.repeat(60));
}

runMigration().catch(console.error);

-- 005_grant_supabase_roles.sql
-- Grants schema and table access to Supabase anon and authenticated roles
-- Configures Row Level Security (RLS) policies for direct PostgREST queries

-- 0. Ensure roles exist (on standard local Postgres where Supabase roles aren't pre-installed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;
END $$;

-- 1. Grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

-- 3. Default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 4. RLS Read Policies for Admin Dashboard & Direct PostgREST
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'users', 'farms', 'plots', 'workers', 'user_sessions', 
    'processing_activities', 'privacy_requests', 'admin_audit_logs',
    'economy_transactions', 'achievements', 'reports', 'consent_records'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'allow_anon_read'
    ) THEN
      EXECUTE format('CREATE POLICY "allow_anon_read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    END IF;
  END LOOP;
END $$;

-- 5. RLS Write Policies for Sessions and Reports
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'allow_anon_insert'
  ) THEN
    CREATE POLICY "allow_anon_insert" ON public.user_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_sessions' AND policyname = 'allow_anon_update'
  ) THEN
    CREATE POLICY "allow_anon_update" ON public.user_sessions FOR UPDATE TO anon, authenticated USING (true);
  END IF;
END $$;

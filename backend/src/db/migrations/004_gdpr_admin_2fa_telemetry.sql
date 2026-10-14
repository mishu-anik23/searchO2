-- searchO2 Migration 004
-- GDPR / Deutsche Datenschutzerklärung alignment
-- Admin TOTP 2FA · Consent · Privacy requests · Consent-gated telemetry
-- Legal basis must be recorded for every processing purpose (Art. 6 GDPR).

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1) Users: privacy & admin security columns
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_version VARCHAR(32);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS analytics_opt_in BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS data_retention_until TIMESTAMPTZ;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret_enc TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_backup_codes_hash TEXT[];
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_must_change BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS bootstrap_admin BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2) Cookie / consent ledger (Art. 7 — demonstrable consent)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_client_id VARCHAR(64),
  policy_version VARCHAR(32) NOT NULL,
  necessary BOOLEAN NOT NULL DEFAULT TRUE,
  functional BOOLEAN NOT NULL DEFAULT FALSE,
  analytics BOOLEAN NOT NULL DEFAULT FALSE,
  marketing BOOLEAN NOT NULL DEFAULT FALSE,
  source VARCHAR(32) NOT NULL DEFAULT 'banner',
  ip_hash VARCHAR(64),
  user_agent_hash VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_consent_user ON consent_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_consent_guest ON consent_records(guest_client_id);

-- ---------------------------------------------------------------------------
-- 3) Privacy requests (Art. 15 access, Art. 17 erasure, Art. 20 portability)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS privacy_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type VARCHAR(32) NOT NULL CHECK (request_type IN ('access','erasure','portability','rectification','objection')),
  status VARCHAR(32) NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','completed','rejected')),
  legal_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  notes TEXT,
  handled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_privacy_user ON privacy_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_status ON privacy_requests(status);

-- ---------------------------------------------------------------------------
-- 4) Action telemetry — ONLY when analytics_opt_in / analytics consent = true
--    IP stored as one-way hash; approximate geo only (country/region).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_action_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_client_id VARCHAR(64),
  session_id UUID,
  event_name VARCHAR(64) NOT NULL,
  route_path VARCHAR(256),
  region_code VARCHAR(64),
  device_type VARCHAR(32),
  browser VARCHAR(64),
  os VARCHAR(64),
  country_code VARCHAR(8),
  region_label VARCHAR(64),
  dwell_ms INT DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  consent_record_id UUID REFERENCES consent_records(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actions_user_time ON user_action_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_actions_event ON user_action_events(event_name, created_at DESC);

-- ---------------------------------------------------------------------------
-- 5) Processing activities register (Art. 30 — Verarbeitungsverzeichnis)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processing_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(128) NOT NULL,
  purpose TEXT NOT NULL,
  legal_basis VARCHAR(64) NOT NULL,
  data_categories TEXT NOT NULL,
  recipients TEXT,
  retention TEXT NOT NULL,
  transfers_outside_eea BOOLEAN NOT NULL DEFAULT FALSE,
  security_measures TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO processing_activities (name, purpose, legal_basis, data_categories, recipients, retention, transfers_outside_eea, security_measures)
VALUES
  ('Account authentication', 'Login, session security, abuse prevention', 'Art. 6(1)(b) contract / Art. 6(1)(f) legitimate interest', 'Email, password hash, session tokens, IP (hashed), user-agent', 'Hosting processor (EU preferred)', 'Account lifetime + 90 days after deletion for security logs', FALSE, 'TLS, bcrypt, HTTP-only cookies, rate limits'),
  ('Guest game progress', 'Persist anonymous farm state until claim', 'Art. 6(1)(b) pre-contractual / Art. 6(1)(f)', 'Guest UUID, farm JSON, recovery-code hash', 'Hosting processor', '90 days idle guest purge or until merge', FALSE, 'Hashed recovery codes, soft-delete on merge'),
  ('Optional analytics', 'Improve UX and chapter completion rates', 'Art. 6(1)(a) consent', 'Pseudonymous events, coarse geo, device class', 'None beyond host', '13 months max, then aggregate or delete', FALSE, 'Consent gate; no ads; no sale of data'),
  ('Admin operations', 'Support, moderation, GDPR fulfilment', 'Art. 6(1)(c) legal obligation / Art. 6(1)(f)', 'User profile, sessions, audit logs', 'Designated admins only', 'Audit logs 3 years', FALSE, 'Role check, TOTP 2FA, immutable audit trail')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- 6) Bootstrap admin placeholder (password set on first interactive login)
--    Email: searcho2.online@gmail.com — password_hash NULL until first login sets it.
-- ---------------------------------------------------------------------------
INSERT INTO users (email, password_hash, display_name, role, auth_provider, status, email_verified, bootstrap_admin, password_must_change)
SELECT 'searcho2.online@gmail.com', NULL, 'SearchO2 Admin', 'admin', 'local', 'active', TRUE, TRUE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE lower(email) = 'searcho2.online@gmail.com');

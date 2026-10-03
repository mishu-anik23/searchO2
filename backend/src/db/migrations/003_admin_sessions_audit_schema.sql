-- searchO2 Database Schema Migration 003
-- User Sessions, Device Tracking, Admin Audit Logs, and User Status
-- PostgreSQL 18 Production Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Extend Users Table with status and email_verified
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'active';
        ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. User Sessions & Device Tracking Table (Browser Session Cookies & Tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    geo_location JSONB DEFAULT '{"country": "Germany", "countryCode": "DE", "city": "Frankfurt", "region": "Hesse"}'::jsonb,
    device_type VARCHAR(32) DEFAULT 'Desktop',
    browser VARCHAR(64) DEFAULT 'Chrome',
    os VARCHAR(64) DEFAULT 'Windows',
    user_agent TEXT DEFAULT 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_revoked ON user_sessions(is_revoked);
CREATE INDEX IF NOT EXISTS idx_user_sessions_hash ON user_sessions(session_token_hash);

-- 3. Admin Audit Logs Table (Immutable Append-Only Trail)
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    ticket_ref VARCHAR(64) DEFAULT NULL,
    details JSONB DEFAULT NULL,
    ip_address VARCHAR(64) DEFAULT '127.0.0.1',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_audit_admin ON admin_audit_logs(admin_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_target ON admin_audit_logs(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_action ON admin_audit_logs(action);

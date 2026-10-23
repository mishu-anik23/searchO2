-- 006_guest_trial_oauth_providers.sql
-- Guest 7-day trial + multi-provider OAuth identity columns

ALTER TABLE users ADD COLUMN IF NOT EXISTS guest_started_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guest_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS guest_trial_days INT NOT NULL DEFAULT 7;
ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_providers JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_github_id ON users(github_id) WHERE github_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id) WHERE facebook_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_whatsapp_phone ON users(whatsapp_phone) WHERE whatsapp_phone IS NOT NULL;

-- Backfill guest trial windows for existing guests (from created_at)
UPDATE users
SET guest_started_at = COALESCE(guest_started_at, created_at, NOW()),
    guest_expires_at = COALESCE(
      guest_expires_at,
      COALESCE(guest_started_at, created_at, NOW()) + (guest_trial_days || ' days')::INTERVAL
    )
WHERE role = 'guest';

-- Optional OTP table for WhatsApp / phone login
CREATE TABLE IF NOT EXISTS auth_otp_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  channel VARCHAR(16) NOT NULL CHECK (channel IN ('whatsapp','sms','email')),
  destination VARCHAR(128) NOT NULL,
  code_hash VARCHAR(128) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_dest ON auth_otp_challenges(destination, created_at DESC);

-- Also ensure refresh_tokens has ip_address and user_agent for session helper
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);
ALTER TABLE refresh_tokens ADD COLUMN IF NOT EXISTS user_agent TEXT;

COMMENT ON COLUMN users.guest_started_at IS 'Browser-synced trial start; set on first guest play';
COMMENT ON COLUMN users.guest_expires_at IS 'After this instant guest must login or farm may be reset';

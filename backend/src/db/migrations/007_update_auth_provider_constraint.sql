-- 007_update_auth_provider_constraint.sql
-- Expand users_auth_provider_check constraint to include github, facebook, whatsapp

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_auth_provider_check;

ALTER TABLE users ADD CONSTRAINT users_auth_provider_check
  CHECK (auth_provider IN ('local', 'google', 'guest', 'github', 'facebook', 'whatsapp'));

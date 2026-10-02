-- searchO2 + OxyForge Database Schema Migration 002
-- Economy, Multi-Asset Wallets, AFC Crypto, Payments, KYC & Mission Schema
-- Compliant with German / EU Regulations (MiCA, GwG, GDPR)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Multi-Asset Game Wallets Table
-- Stores user balances across Game Credits (GC), AFC Crypto Tokens, and EUR Cents
CREATE TABLE IF NOT EXISTS game_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game VARCHAR(32) NOT NULL CHECK (game IN ('searcho2', 'oxyforge', 'shared')),
    asset VARCHAR(16) NOT NULL CHECK (asset IN ('GC', 'AFC', 'EUR')),
    balance_units BIGINT NOT NULL DEFAULT 0 CHECK (balance_units >= 0),
    on_chain_address VARCHAR(128) DEFAULT NULL, -- Pseudonymous Base L2 address (zero PII on-chain)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_game_asset UNIQUE (user_id, game, asset)
);

CREATE INDEX IF NOT EXISTS idx_game_wallets_user ON game_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_game_wallets_address ON game_wallets(on_chain_address);

-- 2. Wallet Ledger (Append-Only Immutable Double-Entry Ledger)
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES game_wallets(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL, -- positive for credit, negative for debit
    balance_after BIGINT NOT NULL,
    transaction_type VARCHAR(64) NOT NULL, -- 'starter_grant', 'fiat_topup', 'afc_exchange', 'mission_debit', 'fpv_debit', 'isru_reward', 'transfer'
    source_game VARCHAR(32) NOT NULL,
    reference_type VARCHAR(64) DEFAULT NULL, -- 'payment_order', 'oxyforge_mission', 'fpv_session', 'guest_merge'
    reference_id VARCHAR(128) DEFAULT NULL,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    metadata JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet ON wallet_ledger(wallet_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_idempotency ON wallet_ledger(idempotency_key);

-- 3. Guest Account Merge Audit Table
-- Tracks cross-browser guest profile claiming into registered accounts
CREATE TABLE IF NOT EXISTS guest_merges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_guest_user_id UUID NOT NULL,
    source_farm_id UUID DEFAULT NULL,
    migrated_plots_count INT NOT NULL DEFAULT 0,
    migrated_money NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    recovery_code_used BOOLEAN NOT NULL DEFAULT FALSE,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reverted')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_merges_target ON guest_merges(target_user_id);
CREATE INDEX IF NOT EXISTS idx_guest_merges_source ON guest_merges(source_guest_user_id);

-- 4. Guest Recovery Secrets Table
-- Salted SHA-256 hashes of high-entropy recovery codes (never store raw code)
CREATE TABLE IF NOT EXISTS guest_recovery_secrets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guest_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    secret_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_guest_recovery_user UNIQUE (guest_user_id)
);

CREATE INDEX IF NOT EXISTS idx_guest_recovery_hash ON guest_recovery_secrets(secret_hash);

-- 5. Payment Orders Table (Stripe & PayPal)
CREATE TABLE IF NOT EXISTS payment_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'manual')),
    provider_order_id VARCHAR(128) UNIQUE,
    payment_method VARCHAR(32) NOT NULL DEFAULT 'card', -- 'card', 'sepa_debit', 'sepa_credit', 'klarna', 'paypal'
    amount_cents BIGINT NOT NULL CHECK (amount_cents > 0),
    currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed')),
    target_product VARCHAR(64) NOT NULL, -- 'afc_tier_1', 'afc_tier_2', 'afc_tier_3', 'commander_pass'
    afc_granted BIGINT NOT NULL DEFAULT 0,
    gc_granted BIGINT NOT NULL DEFAULT 0,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    metadata JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_provider ON payment_orders(provider, provider_order_id);

-- 6. Provider Events Table (Signed Webhook Deduplication)
CREATE TABLE IF NOT EXISTS provider_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(32) NOT NULL,
    event_id VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    processed_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_provider_event UNIQUE (provider, event_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_events_lookup ON provider_events(provider, event_id);

-- 7. KYC Verification Cases Table (Sumsub / Veriff Integration)
CREATE TABLE IF NOT EXISTS kyc_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(32) NOT NULL DEFAULT 'sumsub',
    applicant_id VARCHAR(128) NOT NULL,
    verification_level VARCHAR(64) NOT NULL DEFAULT 'basic_id_liveness',
    status VARCHAR(32) NOT NULL DEFAULT 'init' CHECK (status IN ('init', 'pending', 'approved', 'rejected', 'requires_action')),
    rejection_reason TEXT DEFAULT NULL,
    pep_sanctions_cleared BOOLEAN NOT NULL DEFAULT FALSE,
    risk_score INT DEFAULT NULL,
    id_country_code VARCHAR(3) DEFAULT NULL, -- ISO-3166-1 alpha-3 (e.g. DEU)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_kyc_provider UNIQUE (user_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_kyc_cases_user ON kyc_cases(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_cases_applicant ON kyc_cases(applicant_id);

-- 8. OxyForge Space Missions Table (Server-Authoritative State)
CREATE TABLE IF NOT EXISTS oxyforge_missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    destination VARCHAR(32) NOT NULL CHECK (destination IN ('moon', 'mars')),
    rocket VARCHAR(32) NOT NULL CHECK (rocket IN ('hauler9', 'crewmark3')),
    status VARCHAR(32) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'checklist', 'launch', 'cruise', 'landing', 'surface', 'completed', 'aborted', 'failed')),
    price_gc BIGINT NOT NULL,
    checklist_state JSONB NOT NULL DEFAULT '{"launch_window": false, "propellant": false, "mass_balance": false, "guidance": false, "range_safety": false, "weather": false, "cargo_secure": false, "comms": false}'::jsonb,
    telemetry JSONB DEFAULT NULL,
    oxygen_produced_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payout_gc BIGINT NOT NULL DEFAULT 0,
    idempotency_key VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oxyforge_missions_user ON oxyforge_missions(user_id, created_at DESC);

-- 9. OxyForge FPV Cockpit Sessions Table (Real-Time Metered Billing)
CREATE TABLE IF NOT EXISTS oxyforge_fpv_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES oxyforge_missions(id) ON DELETE CASCADE,
    rate_gc_per_second NUMERIC(6, 2) NOT NULL DEFAULT 15.00,
    seconds_billed INT NOT NULL DEFAULT 0,
    total_cost_gc BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'timeout', 'insufficient_funds')),
    last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at TIMESTAMPTZ DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_fpv_sessions_mission ON oxyforge_fpv_sessions(mission_id);
CREATE INDEX IF NOT EXISTS idx_fpv_sessions_active ON oxyforge_fpv_sessions(status, last_heartbeat);

-- searchO2 Database Schema Migration 001
-- PostgreSQL 18 Production Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    display_name VARCHAR(100) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'user', 'admin')),
    auth_provider VARCHAR(32) NOT NULL DEFAULT 'local' CHECK (auth_provider IN ('local', 'google', 'guest')),
    google_id VARCHAR(255) UNIQUE,
    avatar_url VARCHAR(512),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- 2. Refresh Tokens Table (HTTP-Only Secure Cookie Session Rotation)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    region_code VARCHAR(64) NOT NULL DEFAULT 'germany_grassland',
    name VARCHAR(128) NOT NULL DEFAULT 'My Green Farm',
    money NUMERIC(14, 2) NOT NULL DEFAULT 10000.00,
    total_o2 NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_o2_all_time NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    trees_planted INT NOT NULL DEFAULT 0,
    trees_removed INT NOT NULL DEFAULT 0,
    game_hour NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_tick_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    speed_factor INT NOT NULL DEFAULT 180,
    farm_reputation INT NOT NULL DEFAULT 0,
    demerits INT NOT NULL DEFAULT 0,
    pest_handled INT NOT NULL DEFAULT 0,
    harvest_count INT NOT NULL DEFAULT 0,
    last_paid_day INT NOT NULL DEFAULT 0,
    next_tree_id INT NOT NULL DEFAULT 1,
    storage_state JSONB NOT NULL DEFAULT '{"built": false, "building": false, "buildHours": 0, "capacity": 0, "stored": 0, "level": 0, "expanding": false, "expandHours": 0, "warnedFull": false}'::jsonb,
    buildings_state JSONB NOT NULL DEFAULT '{"garden": {"built": false, "building": false, "buildHours": 0, "flowerType": null, "freshness": 100, "warnedLow": false}, "pond": {"built": false, "building": false, "buildHours": 0, "specialization": null, "freshness": 100, "warnedLow": false}, "coffee_shop": {"built": false, "building": false, "buildHours": 0}, "juice_bar": {"built": false, "building": false, "buildHours": 0}}'::jsonb,
    loan_state JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);

-- 4. Plots Table (6 Barren Plots initial)
CREATE TABLE IF NOT EXISTS plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    plot_index INT NOT NULL CHECK (plot_index >= 0 AND plot_index < 12),
    status VARCHAR(32) NOT NULL DEFAULT 'barren' CHECK (status IN ('barren', 'preparing', 'ready', 'growing', 'overgrown', 'clearing', 'dead', 'removing')),
    tree_type VARCHAR(64) DEFAULT NULL,
    tree_id INT DEFAULT NULL,
    health NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    grow_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    task_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    weed_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    zero_health_streak_hours NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    pending_harvest NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    assigned_worker_id INT DEFAULT NULL,
    accessories JSONB NOT NULL DEFAULT '{"irrigation": false, "fertilizer": false}'::jsonb,
    animal JSONB DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_farm_plot_index UNIQUE (farm_id, plot_index)
);

CREATE INDEX IF NOT EXISTS idx_plots_farm ON plots(farm_id);

-- 5. Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    worker_type VARCHAR(32) NOT NULL CHECK (worker_type IN ('laborer', 'farmer', 'botanist', 'engineer')),
    assigned_plot_index INT DEFAULT NULL,
    daily_wage NUMERIC(10, 2) NOT NULL,
    hired_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workers_farm ON workers(farm_id);

-- 6. Economy Transactions (Append-Only Ledger)
CREATE TABLE IF NOT EXISTS economy_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    transaction_type VARCHAR(64) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'EUR',
    balance_after NUMERIC(14, 2) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_economy_farm_created ON economy_transactions(farm_id, created_at DESC);

-- 7. Achievements Table
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    achievement_code VARCHAR(64) NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_farm_achievement UNIQUE (farm_id, achievement_code)
);

CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);

-- 8. Reports Table (Botanist & Farm Diagnostics)
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    icon VARCHAR(16) NOT NULL DEFAULT '📰',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_farm ON reports(farm_id, created_at DESC);

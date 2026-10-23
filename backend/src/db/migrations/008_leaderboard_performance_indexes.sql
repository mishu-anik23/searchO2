-- 008_leaderboard_performance_indexes.sql
-- Optimizes leaderboard rankings and eliminates table scans for high-frequency polling
CREATE INDEX IF NOT EXISTS idx_farms_leaderboard_o2 ON farms(total_o2_all_time DESC);
CREATE INDEX IF NOT EXISTS idx_farms_leaderboard_money ON farms(money DESC);
CREATE INDEX IF NOT EXISTS idx_farms_leaderboard_reputation ON farms(farm_reputation DESC);

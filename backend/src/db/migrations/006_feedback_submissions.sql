-- 006_feedback_submissions.sql
-- Player feedback and problem reports sent from the Learning Hub (hub/index.html).
-- Rows may hold an optional reply-to email, so this table is NOT readable through
-- PostgREST: migration 005 grants anon/authenticated access to every future table,
-- which we undo here. The backend (table owner / service role) bypasses RLS.

CREATE TABLE IF NOT EXISTS feedback_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kind VARCHAR(16) NOT NULL CHECK (kind IN ('feedback', 'problem')),
    rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
    topic VARCHAR(40),
    area VARCHAR(60),
    severity VARCHAR(16) CHECK (severity IN ('blocker', 'broken', 'visual', 'minor')),
    title VARCHAR(120),
    message TEXT NOT NULL,
    steps TEXT,
    expected TEXT,
    email VARCHAR(255),
    region_id VARCHAR(40),
    diagnostics TEXT,
    hub_version VARCHAR(16),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'seen', 'resolved')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_kind_created ON feedback_submissions(kind, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status, created_at DESC);

ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'REVOKE ALL ON TABLE feedback_submissions FROM anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'REVOKE ALL ON TABLE feedback_submissions FROM authenticated';
  END IF;
END $$;

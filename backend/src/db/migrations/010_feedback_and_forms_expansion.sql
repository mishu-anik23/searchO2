-- 010_feedback_and_forms_expansion.sql
-- Expands feedback_submissions to support:
-- 1. Report a Problem (SearchO2_Forms_Report_a_Problem.docx) with 10 exact questions
-- 2. Chapter Feedback (SearchO2_Forms_Chapter_Feedback.docx) with 8 exact questions
-- 3. Full Playtest Review (SearchO2_Forms_Full_Playtest_Review.docx) with 15 exact questions

ALTER TABLE feedback_submissions ALTER COLUMN kind TYPE VARCHAR(32);

-- Update kind check constraint to include chapter_feedback and playtest_review
ALTER TABLE feedback_submissions DROP CONSTRAINT IF EXISTS feedback_submissions_kind_check;
ALTER TABLE feedback_submissions ADD CONSTRAINT feedback_submissions_kind_check
    CHECK (kind IN ('feedback', 'problem', 'chapter_feedback', 'playtest_review'));

-- Make message nullable / default empty since specialized forms use dedicated fields
ALTER TABLE feedback_submissions ALTER COLUMN message DROP NOT NULL;
ALTER TABLE feedback_submissions ALTER COLUMN message SET DEFAULT '';

-- Widen title and area columns
ALTER TABLE feedback_submissions ALTER COLUMN title TYPE VARCHAR(255);
ALTER TABLE feedback_submissions ALTER COLUMN area TYPE VARCHAR(120);

-- Relax severity check to accommodate user-selected impact statements
ALTER TABLE feedback_submissions DROP CONSTRAINT IF EXISTS feedback_submissions_severity_check;
ALTER TABLE feedback_submissions ALTER COLUMN severity TYPE VARCHAR(64);

-- Add specialized columns for Report a Problem, Chapter Feedback, and Playtest Review
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS game_version VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS chapter VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS trying_to_do TEXT;
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS what_happened TEXT;
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS reproduce VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS impact VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS device_browser VARCHAR(255);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS completed VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS difficulty VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS confusion_source VARCHAR(255);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS continue_intent VARCHAR(64);
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS nps_recommend SMALLINT;
ALTER TABLE feedback_submissions ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;

-- Add performance indexes for common admin filtering and JSON search
CREATE INDEX IF NOT EXISTS idx_feedback_game_version ON feedback_submissions(game_version);
CREATE INDEX IF NOT EXISTS idx_feedback_chapter ON feedback_submissions(chapter);
CREATE INDEX IF NOT EXISTS idx_feedback_payload ON feedback_submissions USING gin (payload);

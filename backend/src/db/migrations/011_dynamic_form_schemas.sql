-- 011_dynamic_form_schemas.sql
-- Stores dynamic form schemas and synced versions from SharePoint / Microsoft Forms
-- Enables automatic zero-downtime updates from SharePoint .docx templates to searcho2.online/hub.

CREATE TABLE IF NOT EXISTS form_definitions (
    id VARCHAR(64) PRIMARY KEY, -- e.g. 'problem', 'chapter_feedback', 'playtest_review'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    version INT NOT NULL DEFAULT 1,
    source_file VARCHAR(255),
    schema JSONB NOT NULL DEFAULT '{}'::jsonb,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(120) DEFAULT 'sharepoint_pipeline'
);

CREATE TABLE IF NOT EXISTS form_definition_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id VARCHAR(64) NOT NULL REFERENCES form_definitions(id) ON DELETE CASCADE,
    version INT NOT NULL,
    source_file VARCHAR(255),
    schema JSONB NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(120)
);

CREATE INDEX IF NOT EXISTS idx_form_definitions_synced ON form_definitions(synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_history_form_ver ON form_definition_history(form_id, version DESC);

-- Public read access so players and guests on searcho2.online/hub can fetch active form schemas
ALTER TABLE form_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_definition_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    EXECUTE 'GRANT SELECT ON TABLE form_definitions TO anon';
    EXECUTE 'GRANT SELECT ON TABLE form_definition_history TO anon';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    EXECUTE 'GRANT SELECT ON TABLE form_definitions TO authenticated';
    EXECUTE 'GRANT SELECT ON TABLE form_definition_history TO authenticated';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'form_definitions' AND policyname = 'Allow public select form definitions'
  ) THEN
    CREATE POLICY "Allow public select form definitions" ON form_definitions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'form_definition_history' AND policyname = 'Allow authenticated select form history'
  ) THEN
    CREATE POLICY "Allow authenticated select form history" ON form_definition_history FOR SELECT USING (true);
  END IF;
END $$;

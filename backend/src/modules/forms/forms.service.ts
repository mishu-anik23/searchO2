import { query } from '../../config/database';
import { parseFormDocx, ParsedForm } from './forms.parser';

export interface FormRow {
  id: string;
  title: string;
  description: string;
  version: number;
  source_file: string;
  schema: any;
  synced_at: string;
  updated_by: string;
}

export const formsService = {
  /**
   * Retrieves active form definition by form ID ('problem', 'chapter_feedback', 'playtest_review').
   */
  async getForm(id: string): Promise<FormRow | null> {
    const res = await query<FormRow>(
      `SELECT id, title, description, version, source_file, schema, synced_at, updated_by
         FROM form_definitions
        WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  },

  /**
   * Lists all registered forms with metadata and version numbers.
   */
  async listForms(): Promise<FormRow[]> {
    const res = await query<FormRow>(
      `SELECT id, title, description, version, source_file, schema, synced_at, updated_by
         FROM form_definitions
        ORDER BY id ASC`
    );
    return res.rows;
  },

  /**
   * Syncs and registers a form directly from an updated docx binary buffer (SharePoint source).
   */
  async syncFromDocx(filename: string, buffer: Buffer, updatedBy = 'sharepoint_pipeline'): Promise<{ form: ParsedForm; version: number; syncedAt: string }> {
    const parsed = parseFormDocx(buffer, filename);
    const existing = await this.getForm(parsed.formId);
    const nextVersion = existing ? existing.version + 1 : 1;

    // Upsert into form_definitions
    const res = await query<FormRow>(
      `INSERT INTO form_definitions (id, title, description, version, source_file, schema, synced_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         version = EXCLUDED.version,
         source_file = EXCLUDED.source_file,
         schema = EXCLUDED.schema,
         synced_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING id, title, description, version, source_file, schema, synced_at, updated_by`,
      [
        parsed.formId,
        parsed.title,
        parsed.description,
        nextVersion,
        filename,
        JSON.stringify(parsed),
        updatedBy
      ]
    );

    // Record audit trail in form_definition_history
    await query(
      `INSERT INTO form_definition_history (form_id, version, source_file, schema, synced_at, updated_by)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [
        parsed.formId,
        nextVersion,
        filename,
        JSON.stringify(parsed),
        updatedBy
      ]
    );

    return {
      form: parsed,
      version: nextVersion,
      syncedAt: res.rows[0].synced_at
    };
  },

  /**
   * Syncs form directly from a JSON schema payload.
   */
  async syncFromJson(formId: string, title: string, schema: any, sourceFile = 'manual_sync', updatedBy = 'admin'): Promise<{ version: number; syncedAt: string }> {
    const existing = await this.getForm(formId);
    const nextVersion = existing ? existing.version + 1 : 1;

    const res = await query<FormRow>(
      `INSERT INTO form_definitions (id, title, description, version, source_file, schema, synced_at, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         version = EXCLUDED.version,
         source_file = EXCLUDED.source_file,
         schema = EXCLUDED.schema,
         synced_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING id, version, synced_at`,
      [
        formId,
        title,
        schema.description || '',
        nextVersion,
        sourceFile,
        JSON.stringify(schema),
        updatedBy
      ]
    );

    await query(
      `INSERT INTO form_definition_history (form_id, version, source_file, schema, synced_at, updated_by)
       VALUES ($1, $2, $3, $4, NOW(), $5)`,
      [
        formId,
        nextVersion,
        sourceFile,
        JSON.stringify(schema),
        updatedBy
      ]
    );

    return {
      version: nextVersion,
      syncedAt: res.rows[0].synced_at
    };
  },

  /**
   * Retrieves audit version history for a form.
   */
  async getHistory(formId: string, limit = 20) {
    const res = await query(
      `SELECT id, form_id, version, source_file, synced_at, updated_by
         FROM form_definition_history
        WHERE form_id = $1
        ORDER BY version DESC
        LIMIT $2`,
      [formId, limit]
    );
    return res.rows;
  }
};

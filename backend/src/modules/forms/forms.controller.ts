import { Router, Request, Response, NextFunction } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { formsService } from './forms.service';
import { authenticate, requireAuth, requireAdmin } from '../../middleware/auth';

export const formsRouter = Router();

const SYNC_SECRET = process.env.FORMS_SYNC_SECRET || 'searcho2_sharepoint_forms_secret_2026';

function verifySyncSecret(req: Request): boolean {
  const secretHeader = req.headers['x-webhook-secret'] || req.headers['x-sync-token'];
  if (secretHeader && secretHeader === SYNC_SECRET) return true;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token === SYNC_SECRET) return true;
  }
  return false;
}

/**
 * GET /api/forms
 * Public list of registered forms and their sync status.
 */
formsRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await formsService.listForms();
    res.json({
      ok: true,
      forms: list.map(f => ({
        id: f.id,
        title: f.title,
        description: f.description,
        version: f.version,
        sourceFile: f.source_file,
        syncedAt: f.synced_at,
        updatedBy: f.updated_by,
        questionsCount: f.schema?.questions?.length || 0,
      }))
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/forms/:id/schema
 * Returns full active schema for a given form (used by hub/hub.js).
 */
formsRouter.get('/:id/schema', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const form = await formsService.getForm(req.params.id);
    if (!form) {
      res.status(404).json({ ok: false, error: `Form '${req.params.id}' not found` });
      return;
    }
    res.json({
      ok: true,
      id: form.id,
      title: form.title,
      description: form.description,
      version: form.version,
      sourceFile: form.source_file,
      syncedAt: form.synced_at,
      schema: form.schema
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/forms/:id/history
 * Returns audit version history. Admins or authorized webhooks.
 */
formsRouter.get('/:id/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await formsService.getHistory(req.params.id);
    res.json({ ok: true, formId: req.params.id, history });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/forms/sync
 * Automated Webhook Pipeline Endpoint.
 * Receives file updates from Microsoft Power Automate, SharePoint Webhooks, or CI/CD pipelines.
 */
formsRouter.post('/sync', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verify sync secret (unless user is authenticated admin)
    const isSecretValid = verifySyncSecret(req);
    const isAdmin = (req as any).user?.role === 'admin';

    if (!isSecretValid && !isAdmin) {
      res.status(401).json({
        ok: false,
        error: 'Unauthorized webhook request. Provide X-Webhook-Secret or Authorization Bearer header.'
      });
      return;
    }

    const body = req.body || {};
    const updatedBy = body.updatedBy || 'sharepoint_webhook';

    // 1. Base64 docx file payload (e.g. from Power Automate "Get file content")
    if (body.contentBase64) {
      const filename = body.filename || 'SearchO2_Forms_Import_04_Report_a_Problem.docx';
      const buffer = Buffer.from(body.contentBase64, 'base64');
      const result = await formsService.syncFromDocx(filename, buffer, updatedBy);
      res.status(200).json({
        ok: true,
        message: 'Successfully parsed and synced form from SharePoint document payload',
        formId: result.form.formId,
        version: result.version,
        title: result.form.title,
        questionsCount: result.form.questions.length,
        syncedAt: result.syncedAt
      });
      return;
    }

    // 2. Direct JSON schema payload
    if (body.formId && body.schema) {
      const formId = body.formId;
      const title = body.title || body.schema.title || 'SearchO₂ Form';
      const result = await formsService.syncFromJson(formId, title, body.schema, body.sourceFile || 'json_api', updatedBy);
      res.status(200).json({
        ok: true,
        message: 'Successfully synced form schema via JSON payload',
        formId,
        version: result.version,
        syncedAt: result.syncedAt
      });
      return;
    }

    res.status(400).json({
      ok: false,
      error: 'Invalid payload. Provide contentBase64 (for docx) or formId + schema (for JSON).'
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/forms/sync/local
 * Developer & Admin helper: syncs the local .docx files from workspace root into database.
 */
formsRouter.post('/sync/local', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const isSecretValid = verifySyncSecret(req);
    const isAdmin = (req as any).user?.role === 'admin';

    // Allow in development or with secret/admin
    if (process.env.NODE_ENV === 'production' && !isSecretValid && !isAdmin) {
      res.status(401).json({ ok: false, error: 'Unauthorized' });
      return;
    }

    const filesToSync = [
      'SearchO2_Forms_Report_a_Problem.docx',
      'SearchO2_Forms_Chapter_Feedback.docx',
      'SearchO2_Forms_Full_Playtest_Review.docx'
    ];

    const results = [];
    const baseDir = path.resolve(__dirname, '../../../../'); // project root

    for (const file of filesToSync) {
      const filePath = path.join(baseDir, file);
      if (fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const synced = await formsService.syncFromDocx(file, buffer, 'local_workspace_sync');
        results.push({
          file,
          formId: synced.form.formId,
          version: synced.version,
          questionsCount: synced.form.questions.length,
          syncedAt: synced.syncedAt
        });
      }
    }

    res.json({
      ok: true,
      message: `Successfully synced ${results.length} local docx templates to database`,
      syncedForms: results
    });
  } catch (err) {
    next(err);
  }
});

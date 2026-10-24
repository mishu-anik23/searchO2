import { query } from '../../config/database';
import { Submission } from './feedback.schemas';

export const feedbackService = {
  async create(s: Submission, userId: string | null): Promise<{ id: string; createdAt: string }> {
    const isProblem = s.type === 'problem';
    const res = await query<{ id: string; created_at: string }>(
      `INSERT INTO feedback_submissions
         (kind, rating, topic, area, severity, title, message, steps, expected,
          email, region_id, diagnostics, hub_version, user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, created_at`,
      [
        s.type,
        s.type === 'feedback' ? s.rating : null,
        s.type === 'feedback' ? s.topic : null,
        isProblem ? s.area : null,
        isProblem ? s.severity : null,
        isProblem ? s.title : null,
        s.type === 'feedback' ? s.message : s.what,
        isProblem ? s.steps : null,
        isProblem ? s.expected : null,
        s.email,
        s.map,
        isProblem ? s.diagnostics : null,
        s.hubVersion,
        userId,
      ]
    );
    return { id: res.rows[0].id, createdAt: res.rows[0].created_at };
  },

  async list(opts: { kind?: string; status?: string; limit: number }) {
    const res = await query(
      `SELECT id, kind, rating, topic, area, severity, title, message, steps, expected,
              email, region_id, diagnostics, hub_version, status, created_at
         FROM feedback_submissions
        WHERE ($1::text IS NULL OR kind = $1) AND ($2::text IS NULL OR status = $2)
        ORDER BY created_at DESC
        LIMIT $3`,
      [opts.kind ?? null, opts.status ?? null, opts.limit]
    );
    return res.rows;
  },
};

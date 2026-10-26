import { query } from '../../config/database';
import { Submission } from './feedback.schemas';

export const feedbackService = {
  async create(s: Submission, userId: string | null): Promise<{ id: string; createdAt: string }> {
    let title: string | null = null;
    let message: string | null = null;
    let area: string | null = null;
    let severity: string | null = null;
    let rating: number | null = null;
    let topic: string | null = null;
    let steps: string | null = null;
    let expected: string | null = null;
    let diagnostics: string | null = null;
    let gameVersion: string | null = null;
    let chapter: string | null = null;
    let tryingToDo: string | null = null;
    let whatHappened: string | null = null;
    let reproduce: string | null = null;
    let impact: string | null = null;
    let deviceBrowser: string | null = null;
    let completed: string | null = null;
    let difficulty: string | null = null;
    let confusionSource: string | null = null;
    let continueIntent: string | null = null;
    let npsRecommend: number | null = null;
    const payload = s.payload || { ...s };

    if (s.type === 'problem') {
      title = s.title;
      gameVersion = s.gameVersion || null;
      area = s.area || null;
      tryingToDo = s.tryingToDo || null;
      whatHappened = s.whatHappened || s.what || '';
      message = whatHappened || title;
      expected = s.expected || null;
      reproduce = s.reproduce || null;
      impact = s.impact || s.severity || null;
      severity = impact;
      deviceBrowser = s.deviceBrowser || null;
      steps = s.steps || null;
      diagnostics = s.diagnostics || null;
    } else if (s.type === 'chapter_feedback') {
      gameVersion = s.gameVersion || null;
      chapter = s.chapter;
      completed = s.completed || null;
      rating = s.clarityRating || null;
      difficulty = s.difficulty || null;
      confusionSource = s.confusionSource || null;
      message = s.clarityFeedback || `Chapter ${s.chapter} feedback (${s.completed || 'reviewed'})`;
      continueIntent = s.continueIntent || null;
      title = `Chapter ${s.chapter} Feedback - ${s.completed || 'Survey'}`;
      area = `Chapter ${s.chapter}`;
    } else if (s.type === 'playtest_review') {
      gameVersion = s.gameVersion || null;
      title = `Playtest Review (${s.gameVersion || 'Build'})`;
      npsRecommend = typeof s.npsRecommend === 'number' ? s.npsRecommend : null;
      message = s.strongestPart ? `Strongest: ${s.strongestPart}` : 'Playtest review submission';
      area = s.visualElementImprovement || 'Overall';
    } else if (s.type === 'feedback') {
      rating = s.rating || null;
      topic = s.topic || null;
      message = s.message || '';
      title = s.topic ? `Feedback: ${s.topic}` : 'Player Feedback';
    }

    const res = await query<{ id: string; created_at: string }>(
      `INSERT INTO feedback_submissions
         (kind, rating, topic, area, severity, title, message, steps, expected,
          email, region_id, diagnostics, hub_version, user_id,
          game_version, chapter, trying_to_do, what_happened, reproduce, impact,
          device_browser, completed, difficulty, confusion_source, continue_intent,
          nps_recommend, payload)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27)
       RETURNING id, created_at`,
      [
        s.type,
        rating,
        topic,
        area,
        severity,
        title,
        message,
        steps,
        expected,
        s.email || null,
        s.map || null,
        diagnostics,
        s.hubVersion || null,
        userId,
        gameVersion,
        chapter,
        tryingToDo,
        whatHappened,
        reproduce,
        impact,
        deviceBrowser,
        completed,
        difficulty,
        confusionSource,
        continueIntent,
        npsRecommend,
        JSON.stringify(payload),
      ]
    );
    return { id: res.rows[0].id, createdAt: res.rows[0].created_at };
  },

  async list(opts: { kind?: string; status?: string; search?: string; limit: number }) {
    const searchPattern = opts.search ? `%${opts.search.toLowerCase()}%` : null;
    const res = await query(
      `SELECT id, user_id, kind, rating, topic, area, severity, title, message, steps, expected,
              email, region_id, diagnostics, hub_version, status, created_at,
              game_version, chapter, trying_to_do, what_happened, reproduce, impact,
              device_browser, completed, difficulty, confusion_source, continue_intent,
              nps_recommend, payload
         FROM feedback_submissions
        WHERE ($1::text IS NULL OR kind = $1)
          AND ($2::text IS NULL OR status = $2)
          AND ($3::text IS NULL OR (
            LOWER(COALESCE(title, '')) LIKE $3 OR
            LOWER(COALESCE(message, '')) LIKE $3 OR
            LOWER(COALESCE(area, '')) LIKE $3 OR
            LOWER(COALESCE(email, '')) LIKE $3 OR
            LOWER(COALESCE(game_version, '')) LIKE $3 OR
            LOWER(COALESCE(chapter, '')) LIKE $3
          ))
        ORDER BY created_at DESC
        LIMIT $4`,
      [opts.kind ?? null, opts.status ?? null, searchPattern, opts.limit]
    );
    return res.rows;
  },

  async updateStatus(id: string, status: 'new' | 'seen' | 'resolved') {
    const res = await query<{ id: string; status: string }>(
      `UPDATE feedback_submissions SET status = $1 WHERE id = $2 RETURNING id, status`,
      [status, id]
    );
    return res.rows[0] || null;
  },
};

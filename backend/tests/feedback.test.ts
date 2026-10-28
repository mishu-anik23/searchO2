import request from 'supertest';

// No Postgres needed: capture what the route would insert.
const mockQuery = jest.fn();
jest.mock('../src/config/database', () => {
  const actual = jest.requireActual('../src/config/database');
  return { ...actual, query: (sql: any, params?: any) => mockQuery(sql, params), checkDatabaseConnection: async () => true };
});

import { app } from '../src/index';
import { pool } from '../src/config/database';

afterAll(async () => { await pool.end().catch(() => {}); });
beforeEach(() => {
  mockQuery.mockReset();
  mockQuery.mockResolvedValue({ rows: [{ id: '11111111-1111-1111-1111-111111111111', created_at: new Date().toISOString() }], rowCount: 1 });
});

// Shapes copied from what hub/hub.js sends.
const feedback = { type: 'feedback', rating: 4, topic: 'Gameplay', message: 'Love the growth slider, more please', email: null, map: 'germany', submittedAt: '2026-10-23T12:00:00Z', hubVersion: '1.0' };
const problem = {
  type: 'problem', area: 'World globe and map', severity: 'broken', title: 'Globe freezes',
  what: 'Clicking Bavaria leaves the page blank for me.', steps: null, expected: null, email: 'kid@example.com',
  map: 'bavaria', diagnostics: 'Page: /hub/\nBrowser: test', submittedAt: '2026-10-23T12:00:00Z', hubVersion: '1.0',
};

describe('POST /api/feedback', () => {
  it('accepts the hub feedback payload', async () => {
    const res = await request(app).post('/api/feedback').send(feedback);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true, id: '11111111-1111-1111-1111-111111111111' });
    const params = mockQuery.mock.calls[0][1];
    expect(params[0]).toBe('feedback');
    expect(params[1]).toBe(4);
    expect(params[6]).toBe(feedback.message);
    expect(params[10]).toBe('germany');
  });

  it('accepts the hub problem payload and stores the description as message', async () => {
    const res = await request(app).post('/api/feedback').send(problem);
    expect(res.status).toBe(201);
    const params = mockQuery.mock.calls[0][1];
    expect(params[0]).toBe('problem');
    expect(params[3]).toBe('World globe and map');
    expect(params[4]).toBe('broken');
    expect(params[6]).toBe(problem.what);
    expect(params[9]).toBe('kid@example.com');
    expect(params[11]).toContain('Browser:');
  });

  it('rejects bad input with field details and does not touch the database', async () => {
    const cases: any[] = [
      { ...feedback, rating: 9 },
      { ...feedback, message: 'short' },
      { ...feedback, email: 'nope' },
      { ...problem, severity: 'catastrophic' },
      { type: 'other' },
    ];
    for (const body of cases) {
      const res = await request(app).post('/api/feedback').send(body);
      expect(res.status).toBe(400);
    }
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('drops unknown fields instead of storing them', async () => {
    await request(app).post('/api/feedback').send({ ...feedback, isAdmin: true, money: 99999 });
    expect(JSON.stringify(mockQuery.mock.calls[0])).not.toContain('99999');
  });

  it('returns a server error (not a crash) when the database fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('db down'));
    const res = await request(app).post('/api/feedback').send(feedback);
    expect(res.status).toBeGreaterThanOrEqual(500);
  });
});

describe('rate limit', () => {
  it('stops a single connection from flooding the inbox (10 per hour)', async () => {
    let limited = 0;
    for (let i = 0; i < 6; i++) {
      const res = await request(app).post('/api/feedback').send(feedback);
      if (res.status === 429) limited++;
    }
    expect(limited).toBeGreaterThan(0);
  });
});

describe('GET /api/feedback/admin', () => {
  it('is not available without a token', async () => {
    const res = await request(app).get('/api/feedback/admin');
    expect(res.status).toBe(401);
    expect(mockQuery).not.toHaveBeenCalled();
  });
});

import request from 'supertest';
import * as fs from 'fs';
import * as path from 'path';

const mockQuery = jest.fn();
jest.mock('../src/config/database', () => {
  const actual = jest.requireActual('../src/config/database');
  return {
    ...actual,
    query: (sql: any, params?: any) => mockQuery(sql, params),
    checkDatabaseConnection: async () => true
  };
});

import { app } from '../src/index';
import { pool } from '../src/config/database';
import { parseFormDocx } from '../src/modules/forms/forms.parser';

afterAll(async () => {
  await pool.end().catch(() => {});
});

beforeEach(() => {
  mockQuery.mockReset();
});

describe('SharePoint Docx Parser (forms.parser)', () => {
  const problemDocxPath = path.resolve(__dirname, '../../SearchO2_Forms_Report_a_Problem.docx');

  it('accurately parses SearchO2_Forms_Report_a_Problem.docx with all 14 areas and questions', () => {
    const buf = fs.readFileSync(problemDocxPath);
    const parsed = parseFormDocx(buf, 'SearchO2_Forms_Report_a_Problem.docx');

    expect(parsed.formId).toBe('problem');
    expect(parsed.title).toContain('Report a Problem');
    expect(parsed.questions.length).toBeGreaterThanOrEqual(8);

    const titleQ = parsed.questions.find(q => q.key === 'title');
    expect(titleQ).toBeDefined();
    expect(titleQ?.required).toBe(true);

    const areaQ = parsed.questions.find(q => q.key === 'area');
    expect(areaQ).toBeDefined();
    expect(areaQ?.options).toContain('Getting started or account');
    expect(areaQ?.options).toContain('Base Farm - Chapter 1');
    expect(areaQ?.options).toContain('Base Farm - Chapter 8');
    expect(areaQ?.options).toContain('Saint Martin - BlueLAb');
    expect(areaQ?.options).toContain('Bavaria - Alpenhof');
    expect(areaQ?.options).toContain('Menus or settings');
    expect(areaQ?.options).toContain('Another location');
    expect(areaQ?.options).toContain('I’m not sure');
    expect(areaQ?.options?.length).toBe(14);

    const tryingQ = parsed.questions.find(q => q.key === 'tryingToDo');
    expect(tryingQ).toBeDefined();

    const whatQ = parsed.questions.find(q => q.key === 'whatHappened');
    expect(whatQ).toBeDefined();

    const expQ = parsed.questions.find(q => q.key === 'expected');
    expect(expQ).toBeDefined();

    const repQ = parsed.questions.find(q => q.key === 'reproduce');
    expect(repQ?.options).toEqual(['Every time', 'Sometimes', 'Only once', 'I haven’t tried again']);

    const impQ = parsed.questions.find(q => q.key === 'impact');
    expect(impQ?.options).toEqual(['Minor inconvenience', 'Made gameplay difficult', 'Blocked my progress', 'Made the game unusable']);

    const devQ = parsed.questions.find(q => q.key === 'deviceBrowser');
    expect(devQ).toBeDefined();

    const emQ = parsed.questions.find(q => q.key === 'email');
    expect(emQ).toBeDefined();
    expect(emQ?.type).toBe('email');
  });

  it('accurately parses SearchO2_Forms_Chapter_Feedback.docx', () => {
    const p = path.resolve(__dirname, '../../SearchO2_Forms_Chapter_Feedback.docx');
    const buf = fs.readFileSync(p);
    const parsed = parseFormDocx(buf, 'SearchO2_Forms_Chapter_Feedback.docx');

    expect(parsed.formId).toBe('chapter_feedback');
    expect(parsed.title).toContain('Chapter Feedback');
    const chapterQ = parsed.questions.find(q => q.key === 'chapter');
    expect(chapterQ).toBeDefined();
  });

  it('accurately parses SearchO2_Forms_Full_Playtest_Review.docx', () => {
    const p = path.resolve(__dirname, '../../SearchO2_Forms_Full_Playtest_Review.docx');
    const buf = fs.readFileSync(p);
    const parsed = parseFormDocx(buf, 'SearchO2_Forms_Full_Playtest_Review.docx');

    expect(parsed.formId).toBe('playtest_review');
    expect(parsed.title).toContain('Playtest Review');
    const freqQ = parsed.questions.find(q => q.key === 'genreFrequency');
    expect(freqQ).toBeDefined();
  });
});

describe('Forms Webhook & Sync API (/api/forms)', () => {
  it('GET /api/forms returns registered forms list', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'problem',
          title: 'SearchO₂ Report a Problem',
          description: 'Use this form...',
          version: 2,
          source_file: 'SearchO2_Forms_Import_04_Report_a_Problem.docx',
          schema: { questions: [{}, {}, {}] },
          synced_at: new Date().toISOString(),
          updated_by: 'sharepoint_webhook'
        }
      ],
      rowCount: 1
    });

    const res = await request(app).get('/api/forms');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.forms[0].id).toBe('problem');
    expect(res.body.forms[0].version).toBe(2);
    expect(res.body.forms[0].questionsCount).toBe(3);
  });

  it('GET /api/forms/:id/schema returns schema for hub client', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'problem',
          title: 'SearchO₂ Report a Problem',
          description: 'Description',
          version: 3,
          source_file: 'SearchO2_Forms_Import_04_Report_a_Problem.docx',
          schema: { formId: 'problem', title: 'SearchO₂ Report a Problem', questions: [{ key: 'title', label: '1. Short title' }] },
          synced_at: new Date().toISOString(),
          updated_by: 'power_automate'
        }
      ],
      rowCount: 1
    });

    const res = await request(app).get('/api/forms/problem/schema');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.version).toBe(3);
    expect(res.body.schema.title).toBe('SearchO₂ Report a Problem');
  });

  it('POST /api/forms/sync rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/forms/sync').send({ formId: 'problem' });
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('POST /api/forms/sync accepts valid webhook secret with docx base64 content', async () => {
    const docxPath = path.resolve(__dirname, '../../SearchO2_Forms_Report_a_Problem.docx');
    const base64 = fs.readFileSync(docxPath).toString('base64');

    // Mock query for check existing, insert definition, insert history
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'problem', version: 1 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ id: 'problem', version: 2, synced_at: new Date().toISOString() }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [], rowCount: 1 });

    const res = await request(app)
      .post('/api/forms/sync')
      .set('X-Webhook-Secret', 'searcho2_sharepoint_forms_secret_2026')
      .send({
        filename: 'SearchO2_Forms_Import_04_Report_a_Problem.docx',
        contentBase64: base64,
        updatedBy: 'PowerAutomate_CogniForge_Flow'
      });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.formId).toBe('problem');
    expect(res.body.version).toBe(2);
    expect(res.body.questionsCount).toBeGreaterThanOrEqual(8);
  });
});

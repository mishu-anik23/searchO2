import { z } from 'zod';

const text = (min: number, max: number) => z.string().trim().min(min).max(max);
const optionalText = (max: number) =>
  z.string().trim().max(max).nullish().transform((v) => (v ? v : null));

const common = {
  email: z
    .string()
    .trim()
    .max(255)
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), 'Invalid email address'),
  map: optionalText(64),
  hubVersion: optionalText(32),
  userId: optionalText(128),
  userName: optionalText(128),
  userRole: optionalText(64),
  authProvider: optionalText(64),
  farmName: optionalText(128),
  stateName: optionalText(128),
  landName: optionalText(128),
  submittedAt: optionalText(64),
  payload: z.record(z.any()).optional(),
};

/** 1. SearchO2 Report a Problem (SearchO2_Forms_Report_a_Problem.docx) */
export const problemSchema = z.object({
  type: z.literal('problem'),
  title: text(3, 255), // Q1. Short title for the problem
  gameVersion: optionalText(64), // Q2. Which SearchO2 game version or build were you using?
  area: optionalText(120), // Q3. Where did the problem happen?
  tryingToDo: optionalText(2000), // Q4. What were you trying to do?
  whatHappened: optionalText(3000), // Q5. What happened?
  what: optionalText(3000), // legacy alias for whatHappened
  expected: optionalText(2000), // Q6. What did you expect to happen?
  reproduce: optionalText(64), // Q7. Can you reproduce the problem?
  impact: optionalText(64), // Q8. How much did the problem affect your play?
  severity: z.enum(['blocker', 'broken', 'visual', 'minor', 'suggestion', 'cosmetic', 'crash', 'Minor inconvenience', 'Made gameplay difficult', 'Blocked my progress', 'Made the game unusable']).optional().nullish().transform((v) => (v ? v : null)), // legacy alias for impact
  deviceBrowser: optionalText(255), // Q9. Which device and browser were you using?
  steps: optionalText(2000), // optional reproduction steps
  diagnostics: optionalText(3000),
  ...common,
});

/** 2. SearchO2 Chapter Feedback (SearchO2_Forms_Chapter_Feedback.docx) */
export const chapterFeedbackSchema = z.object({
  type: z.literal('chapter_feedback'),
  gameVersion: optionalText(64), // Q1. Which SearchO2 game version or build did you play?
  chapter: text(1, 64), // Q2. Which chapter are you reviewing?
  completed: optionalText(64), // Q2. Were you able to complete this chapter?
  completedOther: optionalText(255), // Q2. Other write-in box
  clarityRating: z.coerce.number().int().min(1).max(5).nullish(), // Q3. How clear was what you needed to do? (1-5)
  difficultyRating: z.coerce.number().int().min(1).max(5).nullish(), // Q4. How did the difficulty feel? (1-5)
  difficulty: optionalText(64), // Q4. Difficulty rating label
  confusionSource: optionalText(255), // Q5. What was the main source of confusion or frustration?
  confusionSourceOther: optionalText(255), // Q5. Other write-in box
  clarityFeedback: optionalText(3000), // Q7. What happened, or what would make it clearer?
  continueIntent: optionalText(64), // Q8. Did you want to continue playing afterward?
  ...common,
});

/** 3. SearchO2 Full Playtest Review (SearchO2_Forms_Full_Playtest_Review.docx) */
export const playtestReviewSchema = z.object({
  type: z.literal('playtest_review'),
  gameVersion: optionalText(64), // Q1. Which SearchO2 game version or build did you play most recently?
  genreFrequency: optionalText(64), // Q2. How often do you play simulation or management games?
  rateEaseOfLearning: optionalText(64), // Q3. Ease of learning (Very poor ... Very good)
  rateNavigation: optionalText(64), // Q4. Navigation
  rateVisualReadability: optionalText(64), // Q5. Visual readability
  rateClarityOfObjectives: optionalText(64), // Q6. Clarity of objectives
  rateUnderstandingO2: optionalText(64), // Q7. Understanding of O2 system
  rateEnjoyment: optionalText(64), // Q8. Enjoyment
  rateGameStability: optionalText(64), // Q9. Game stability
  visualDifficulty: optionalText(64), // Q10. Did any visual element make game difficult? (Yes / No / Not sure)
  visualElementImprovement: optionalText(128), // Q11. Which visual element most needs improvement?
  visualElementImprovementOther: optionalText(255), // Q11. Other write-in box
  strongestPart: optionalText(3000), // Q12. What is the strongest part of SearchO2?
  changeOneThing: optionalText(3000), // Q13. If you could change only one thing?
  disappointmentLevel: optionalText(64), // Q14. How disappointed if no longer available?
  npsRecommend: z.coerce.number().int().min(0).max(10).nullish(), // Q15. Likely to recommend (0-10)
  ...common,
});

/** 4. Legacy feedback schema for backward compatibility */
export const legacyFeedbackSchema = z.object({
  type: z.literal('feedback'),
  rating: z.coerce.number().int().min(1).max(5).nullish(),
  topic: optionalText(64),
  message: text(10, 3000),
  ...common,
});

/** Discriminated union across all form types. */
export const submissionSchema = z.discriminatedUnion('type', [
  problemSchema,
  chapterFeedbackSchema,
  playtestReviewSchema,
  legacyFeedbackSchema,
]);
export type Submission = z.infer<typeof submissionSchema>;

export const listQuerySchema = z.object({
  kind: z.enum(['feedback', 'problem', 'chapter_feedback', 'playtest_review']).optional(),
  status: z.enum(['new', 'seen', 'resolved']).optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const updateFeedbackStatusSchema = z.object({
  status: z.enum(['new', 'seen', 'resolved']),
});

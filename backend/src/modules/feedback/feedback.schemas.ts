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
  map: optionalText(40),
  hubVersion: optionalText(16),
};

const feedbackSchema = z.object({
  type: z.literal('feedback'),
  rating: z.number().int().min(1).max(5),
  topic: optionalText(40),
  message: text(10, 2000),
  ...common,
});

const problemSchema = z.object({
  type: z.literal('problem'),
  area: text(2, 60),
  severity: z.enum(['blocker', 'broken', 'visual', 'minor']),
  title: text(5, 120),
  what: text(15, 2000),
  steps: optionalText(2000),
  expected: optionalText(1000),
  diagnostics: optionalText(2000),
  ...common,
});

/** Body of POST /api/feedback. Unknown keys are dropped. */
export const submissionSchema = z.discriminatedUnion('type', [feedbackSchema, problemSchema]);
export type Submission = z.infer<typeof submissionSchema>;

export const listQuerySchema = z.object({
  kind: z.enum(['feedback', 'problem']).optional(),
  status: z.enum(['new', 'seen', 'resolved']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

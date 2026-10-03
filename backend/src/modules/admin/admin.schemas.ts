import { z } from 'zod';

export const queryUsersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(['all', 'guest', 'user', 'admin']).default('all'),
  status: z.enum(['all', 'active', 'suspended', 'banned']).default('all'),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export const updateUserStatusSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  role: z.enum(['guest', 'user', 'admin']).optional(),
  status: z.enum(['active', 'suspended', 'banned']).optional(),
  emailVerified: z.boolean().optional(),
  reason: z.string().min(3, 'Audit reason is mandatory for administrative modifications'),
  ticketRef: z.string().optional(),
});

export const revokeSessionSchema = z.object({
  sessionId: z.string().uuid().optional(),
  revokeAll: z.boolean().default(false),
  reason: z.string().min(3, 'Audit reason is required for session revocation'),
});

export const adjustGameBalanceSchema = z.object({
  farmId: z.string().uuid().optional(),
  deltaMoney: z.number().refine((val) => Number.isFinite(val), 'Delta must be a finite number').optional(),
  amount: z.number().refine((val) => Number.isFinite(val), 'Amount must be a finite number').optional(),
  currency: z.string().default('EUR').optional(),
  reason: z.string().min(5, 'Specific reason required for monetary adjustments per security policy'),
  ticketRef: z.string().min(2, 'Valid support ticket or issue reference required'),
}).refine((data) => data.deltaMoney !== undefined || data.amount !== undefined, {
  message: 'Either deltaMoney or amount must be provided',
});

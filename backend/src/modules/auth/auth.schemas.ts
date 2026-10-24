import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .max(128),
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name cannot exceed 50 characters')
    .regex(/^[a-zA-Z0-9 _-]+$/, 'Display name can only contain letters, numbers, spaces, underscores, or hyphens'),
  guestId: z.string().optional(),
  recoveryCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Email, phone, or username is required').max(255),
  password: z.string().min(1, 'Password is required'),
});

export const socialRegisterSchema = z.object({
  provider: z.enum(['google', 'github', 'whatsapp']),
  identifier: z.string().min(1, 'Identifier required').max(255),
  displayName: z.string().min(1, 'Display name required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  freshStart: z.boolean().optional().default(false),
  guestId: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const googleAuthSchema = z.object({
  idToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
}).refine((data) => data.idToken || data.code, {
  message: 'Either idToken or authorization code is required for Google Sign-In',
});

export const upgradeGuestSchema = z.object({
  provider: z.enum(['local', 'google']),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  displayName: z.string().min(2).max(50).optional(),
  idToken: z.string().optional(),
  code: z.string().optional(),
  redirectUri: z.string().optional(),
}).refine(
  (data) => {
    if (data.provider === 'local') {
      return !!data.email && !!data.password;
    }
    if (data.provider === 'google') {
      return !!data.idToken || !!data.code;
    }
    return false;
  },
  {
    message: 'Invalid credentials for specified upgrade provider',
  }
);

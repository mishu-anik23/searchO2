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
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
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

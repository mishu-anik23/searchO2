import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().default('http://localhost:8080'),

  DATABASE_URL: z.string().default('postgresql://postgres@127.0.0.1:5432/searcho2'),
  PGUSER: z.string().default('postgres'),
  PGPASSWORD: z.string().default(''),
  PGHOST: z.string().default('127.0.0.1'),
  PGPORT: z.string().default('5432').transform((val) => parseInt(val, 10)),
  PGDATABASE: z.string().default('searcho2'),

  REDIS_URL: z.string().default('redis://127.0.0.1:6379'),

  JWT_ACCESS_SECRET: z.string().min(16).default('searchO2_super_secret_access_jwt_key_2026_production_grade'),
  JWT_REFRESH_SECRET: z.string().min(16).default('searchO2_super_secret_refresh_jwt_key_2026_production_grade'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  GOOGLE_CLIENT_ID: z.string().optional().default('mock-google-client-id.apps.googleusercontent.com'),
  GOOGLE_CLIENT_SECRET: z.string().optional().default('mock-google-client-secret'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

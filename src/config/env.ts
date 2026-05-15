import { z } from 'zod';

const envSchema = z.object({
  REDIS_URL: z.url(),
  CACHE_DEFAULT_TTL: z.coerce.number().int().positive().default(60),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) throw new Error('Invalid environment variables');

export const env = parsedEnv.data;

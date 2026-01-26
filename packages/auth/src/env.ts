import { z } from 'zod';

const csvUrlListSchema = z
  .string()
  .optional()
  .transform((value) => {
    if (!value) {
      return [];
    }

    return value
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  })
  .pipe(z.array(z.string().url()));

const authEnvSchema = z.object({
  BETTER_AUTH_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  CORS_ORIGIN: csvUrlListSchema,
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export function getAuthEnv() {
  return authEnvSchema.parse(process.env);
}

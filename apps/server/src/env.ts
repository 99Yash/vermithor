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
  .pipe(z.array(z.url()));

const serverEnvSchema = z.object({
  CORS_ORIGIN: csvUrlListSchema,
  FRONTEND_URL: csvUrlListSchema,
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export function getServerEnv() {
  return serverEnvSchema.parse(process.env);
}

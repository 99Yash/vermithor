import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: '../../apps/server/.env',
});

const databaseEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
});

export function getDatabaseEnv() {
  return databaseEnvSchema.parse(process.env);
}

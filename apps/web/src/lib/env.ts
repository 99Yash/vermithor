import { z } from 'zod';

const webEnvSchema = z.object({
  NEXT_PUBLIC_SERVER_URL: z.string().url(),
});

const webEnv = webEnvSchema.parse({
  NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
});

export const serverUrl = webEnv.NEXT_PUBLIC_SERVER_URL.replace(/\/+$/, '');

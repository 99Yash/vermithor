import { z } from "zod";

const envSchema = z.object({
  REDIS_URI: z.string().url(),
});

export function getRedisEnv() {
  return envSchema.parse(process.env);
}

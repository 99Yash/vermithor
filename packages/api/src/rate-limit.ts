import { TRPCError } from '@trpc/server';
import { getRedisClient } from '@vermithor/redis';

type RateLimitConfig = {
  key: string;
  limit: number;
  windowSeconds: number;
};

const RATE_LIMIT_PREFIX = 'rate-limit';
const RATE_LIMIT_MESSAGE = 'Too many requests. Please try again later.';

export async function assertRateLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitConfig): Promise<void> {
  try {
    const client = await getRedisClient();
    const namespacedKey = `${RATE_LIMIT_PREFIX}:${key}`;
    const count = await client.incr(namespacedKey);

    if (count === 1) {
      await client.expire(namespacedKey, windowSeconds);
    }

    if (count > limit) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: RATE_LIMIT_MESSAGE,
      });
    }
  } catch (error) {
    if (error instanceof TRPCError) {
      throw error;
    }
  }
}

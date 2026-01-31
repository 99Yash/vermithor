import { createClient } from "redis";
import { getRedisEnv } from "./env";

export type RedisClient = ReturnType<typeof createClient>;

export function createRedisClient(): RedisClient {
  const env = getRedisEnv();
  const client = createClient({ url: env.REDIS_URI });
  client.on("error", (error) => {
    console.error("[redis] connection error", error);
  });
  return client;
}

let sharedClient: RedisClient | null = null;

export async function getRedisClient(): Promise<RedisClient> {
  if (sharedClient) {
    return sharedClient;
  }

  const client = createRedisClient();
  await client.connect();
  sharedClient = client;
  return client;
}

export { getRedisEnv };

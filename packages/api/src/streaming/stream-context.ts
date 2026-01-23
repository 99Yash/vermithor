import { createRedisClient } from "@vermithor/redis";
import { createResumableStreamContext } from "resumable-stream";

let streamContext: ReturnType<typeof createResumableStreamContext> | null = null;

export async function getStreamContext() {
  if (!streamContext) {
    const publisher = createRedisClient();
    const subscriber = createRedisClient();

    await Promise.all([publisher.connect(), subscriber.connect()]);

    streamContext = createResumableStreamContext({
      waitUntil: async (promise) => {
        promise.catch((error) => {
          console.error("[stream-context] background task error", error);
        });
      },
      publisher,
      subscriber,
    });
  }

  return streamContext;
}

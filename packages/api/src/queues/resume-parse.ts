import { Queue, Worker } from 'bullmq';
import { getRedisEnv } from '@vermithor/redis';
import {
  processResumeParseJob,
  type ResumeParseJob,
} from '../resume/process-resume';

const QUEUE_NAME = 'resume-parse';
const REDIS_ENABLED =
  process.env.REDIS_ENABLED === 'true' || process.env.NODE_ENV === 'production';

type EnqueueResult =
  | { queued: true; mode: 'queued' }
  | { queued: false; mode: 'inline'; reason: 'disabled' | 'unavailable' };

let resumeParseQueue: Queue<ResumeParseJob> | null = null;

function isRedisConnectionError(error: unknown): boolean {
  if (error instanceof AggregateError) {
    return error.errors.some((entry) => isRedisConnectionError(entry));
  }

  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code?: string }).code;
    return (
      code === 'ECONNREFUSED' ||
      code === 'ENOTFOUND' ||
      code === 'EAI_AGAIN' ||
      code === 'ETIMEDOUT'
    );
  }

  return false;
}

const connection = (() => {
  const { REDIS_URI } = getRedisEnv();
  const url = new URL(REDIS_URI);
  const db = url.pathname ? Number(url.pathname.slice(1)) : undefined;
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 6379,
    username: url.username ? decodeURIComponent(url.username) : undefined,
    password: url.password ? decodeURIComponent(url.password) : undefined,
    db: Number.isFinite(db) ? db : undefined,
    tls: url.protocol === 'rediss:' ? {} : undefined,
  };
})();

export function getResumeParseQueue() {
  if (!resumeParseQueue) {
    resumeParseQueue = new Queue<ResumeParseJob>(QUEUE_NAME, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: 50,
        removeOnFail: 50,
      },
    });
    resumeParseQueue.on('error', () => undefined);
  }

  return resumeParseQueue;
}

export async function enqueueResumeParse(
  jobData: ResumeParseJob,
): Promise<EnqueueResult> {
  if (!REDIS_ENABLED) {
    return { queued: false, mode: 'inline', reason: 'disabled' };
  }

  const queue = getResumeParseQueue();

  try {
    const existingJob = await queue.getJob(jobData.resumeId);

    if (existingJob) {
      const state = await existingJob.getState();
      if (state === 'waiting' || state === 'active' || state === 'delayed') {
        return { queued: true, mode: 'queued' };
      }
      await existingJob.remove();
    }

    await queue.add('parse', jobData, {
      jobId: jobData.resumeId,
    });
    return { queued: true, mode: 'queued' };
  } catch (error) {
    if (isRedisConnectionError(error)) {
      return { queued: false, mode: 'inline', reason: 'unavailable' };
    }

    throw error;
  }
}

export type ResumeParseWorkerHandle = {
  worker: Worker<ResumeParseJob>;
  close: () => Promise<void>;
};

export function createResumeParseWorker(): ResumeParseWorkerHandle {
  const worker = new Worker<ResumeParseJob>(
    QUEUE_NAME,
    async (job) => {
      await processResumeParseJob(job.data);
    },
    {
      connection,
      concurrency: 2,
    },
  );
  worker.on('error', () => undefined);

  return {
    worker,
    close: async () => {
      await worker.close();
    },
  };
}

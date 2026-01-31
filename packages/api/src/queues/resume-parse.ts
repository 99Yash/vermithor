import { Queue, Worker } from 'bullmq';
import { getRedisEnv } from '@vermithor/redis';
import {
  processResumeParseJob,
  type ResumeParseJob,
} from '../resume/process-resume';

const QUEUE_NAME = 'resume-parse';

let resumeParseQueue: Queue<ResumeParseJob> | null = null;

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
  }

  return resumeParseQueue;
}

export async function enqueueResumeParse(jobData: ResumeParseJob) {
  const queue = getResumeParseQueue();
  const existingJob = await queue.getJob(jobData.resumeId);

  if (existingJob) {
    const state = await existingJob.getState();
    if (state === 'waiting' || state === 'active' || state === 'delayed') {
      return existingJob;
    }
    await existingJob.remove();
  }

  return queue.add('parse', jobData, {
    jobId: jobData.resumeId,
  });
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

  return {
    worker,
    close: async () => {
      await worker.close();
    },
  };
}

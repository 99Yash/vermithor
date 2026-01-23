import { getRedisClient } from "@vermithor/redis";
import type { ResumeSession, ResumeUIMessage } from "./types";

const SESSION_KEY_PREFIX = "resume:session:";

function getSessionKey(sessionId: string) {
  return `${SESSION_KEY_PREFIX}${sessionId}`;
}

export async function getResumeSession(sessionId: string): Promise<ResumeSession> {
  const redis = await getRedisClient();
  const raw = await redis.get(getSessionKey(sessionId));

  if (!raw) {
    return { sessionId, messages: [], activeStreamId: null };
  }

  try {
    return JSON.parse(raw) as ResumeSession;
  } catch {
    return { sessionId, messages: [], activeStreamId: null };
  }
}

export async function saveResumeSession(session: ResumeSession) {
  const redis = await getRedisClient();
  await redis.set(getSessionKey(session.sessionId), JSON.stringify(session));
}

export async function upsertResumeMessage(
  sessionId: string,
  message: ResumeUIMessage
) {
  const session = await getResumeSession(sessionId);
  const messages = [...session.messages];
  const existingIndex = messages.findIndex((item) => item.id === message.id);

  if (existingIndex >= 0) {
    messages[existingIndex] = message;
  } else {
    messages.push(message);
  }

  const updatedSession = { ...session, messages };
  await saveResumeSession(updatedSession);
  return updatedSession;
}

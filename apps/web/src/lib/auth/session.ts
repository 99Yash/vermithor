import { headers } from 'next/headers';
type SessionSnapshot = { user?: unknown } | null;
type SessionCacheEntry = {
  session: SessionSnapshot;
  expiresAt: number;
};

const SESSION_CACHE_TTL_MS = 30_000;
const SESSION_TOKEN_SUFFIX = 'session_token';
const sessionCache = new Map<string, SessionCacheEntry>();

function getSessionToken(cookieHeader: string) {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      continue;
    }
    const [name, ...valueParts] = trimmed.split('=');
    if (!name || !name.endsWith(SESSION_TOKEN_SUFFIX)) {
      continue;
    }
    return valueParts.join('=') || null;
  }

  return null;
}

export async function getServerSession() {
  const requestHeaders = await headers();
  const cookieHeader = requestHeaders.get('cookie') ?? '';
  const sessionToken = getSessionToken(cookieHeader);
  const hasSessionTokenCookie = Boolean(sessionToken);
  const referer = requestHeaders.get('referer');
  const requestId =
    requestHeaders.get('x-request-id') ??
    requestHeaders.get('x-vercel-id') ??
    null;
  const cached = sessionToken ? sessionCache.get(sessionToken) : undefined;
  if (cached && cached.expiresAt > Date.now()) {
    return cached.session;
  }

  if (cached && sessionToken) {
    sessionCache.delete(sessionToken);
  }
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
  const start = Date.now();
  const response = await fetch(`${serverUrl}/api/auth/get-session`, {
    method: 'GET',
    headers: cookieHeader ? { cookie: cookieHeader } : undefined,
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    return null;
  }

  const body = (await response.json().catch(() => null)) as
    | Record<string, unknown>
    | null;

  if (!body) {
    return null;
  }

  if ('user' in body) {
    const session = body as SessionSnapshot;
    if (sessionToken && session?.user) {
      sessionCache.set(sessionToken, {
        session,
        expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
      });
    }
    return session;
  }

  if ('data' in body) {
    const session = (body.data as SessionSnapshot) ?? null;
    if (sessionToken && session?.user) {
      sessionCache.set(sessionToken, {
        session,
        expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
      });
    }
    return session;
  }

  if ('session' in body) {
    const session = (body.session as SessionSnapshot) ?? null;
    if (sessionToken && session?.user) {
      sessionCache.set(sessionToken, {
        session,
        expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
      });
    }
    return session;
  }

  return null;
}

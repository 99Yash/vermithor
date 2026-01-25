import { cookies } from 'next/headers';
import { authServer } from '~/lib/auth/server';

const COOKIE_PREFIX = 'vermithor__';
const SESSION_COOKIE_NAMES = [
  `${COOKIE_PREFIX}.session_token`,
  `${COOKIE_PREFIX}session_token`,
  'session_token',
];

type AuthCookieSnapshot = {
  cookieHeader: string;
  hasSessionCookie: boolean;
};

export async function getAuthCookieSnapshot(): Promise<AuthCookieSnapshot> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join('; ');
  const hasSessionCookie = SESSION_COOKIE_NAMES.some((name) =>
    Boolean(cookieStore.get(name))
  );

  return { cookieHeader, hasSessionCookie };
}

export async function getServerSession(cookieHeader?: string) {
  const resolvedCookieHeader =
    cookieHeader ?? (await getAuthCookieSnapshot()).cookieHeader;
  const requestHeaders = new Headers();

  if (resolvedCookieHeader) {
    requestHeaders.set('cookie', resolvedCookieHeader);
  }

  return authServer.api.getSession({ headers: requestHeaders });
}

export async function getServerSessionSnapshot() {
  const snapshot = await getAuthCookieSnapshot();
  const session = await getServerSession(snapshot.cookieHeader);

  return { session, ...snapshot };
}

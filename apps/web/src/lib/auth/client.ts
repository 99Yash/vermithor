import { nextCookies } from 'better-auth/next-js';
import { createAuthClient } from 'better-auth/react';
import { serverUrl } from '~/lib/env';

export const authClient = createAuthClient({
  baseURL: serverUrl,
  plugins: [nextCookies()],
});

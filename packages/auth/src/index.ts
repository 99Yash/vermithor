import { db } from '@vermithor/db';
import * as schema from '@vermithor/db/schema/auth';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { getAuthEnv } from './env';

const env = getAuthEnv();
const isProduction = env.NODE_ENV === 'production';
const trustedOrigins = Array.from(
  new Set([env.BETTER_AUTH_URL, ...env.CORS_ORIGIN])
);

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: env.BETTER_AUTH_URL,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 300,
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins,
  socialProviders: {
    google: {
      display: 'popup',
      prompt: 'select_account',
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: isProduction ? 'none' : 'lax',
      secure: isProduction,
      httpOnly: true,
      path: '/',
    },
    cookiePrefix: 'vermithor__',
  },
});

export function createAuthServerClient(baseURL: string) {
  return betterAuth({
    baseURL,
  });
}

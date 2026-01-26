import { db } from '@vermithor/db';
import * as schema from '@vermithor/db/schema/auth';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

const isProduction = process.env.NODE_ENV === 'production';
const trustedOrigins = [process.env.BETTER_AUTH_URL, process.env.CORS_ORIGIN].filter(
  (origin): origin is string => Boolean(origin)
);

export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
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
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
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

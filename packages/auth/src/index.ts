import { db } from '@vermithor/db';
import * as schema from '@vermithor/db/schema/auth';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

const isProduction = process.env.NODE_ENV === 'production';
const trustedOrigins = [process.env.BETTER_AUTH_URL, process.env.CORS_ORIGIN].filter(
  (origin): origin is string => Boolean(origin)
);

// Server-side auth instance (used in the backend auth server)
// This instance has direct database access and handles authentication
export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
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
    },
    cookiePrefix: 'vermithor__',
  },
});

// Auth client for Next.js Server Components/API routes
// This makes HTTP calls to the auth server instead of connecting to the database
export function createAuthServerClient(baseURL: string) {
  return betterAuth({
    baseURL,
  });
}

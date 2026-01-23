import { db } from '@vermithor/db';
import * as schema from '@vermithor/db/schema/auth';
import { betterAuth, type BetterAuthOptions } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

const rawTrustedOrigins = [
  process.env.CORS_ORIGIN,
  process.env.FRONTEND_URL,
].filter(Boolean);

const trustedOrigins = new Set<string>();

for (const value of rawTrustedOrigins) {
  for (const origin of value.split(',')) {
    const trimmed = origin.trim();
    if (trimmed) {
      trustedOrigins.add(trimmed);
    }
  }
}

if (process.env.NODE_ENV !== 'production') {
  trustedOrigins.add('http://localhost:3000');
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          display: 'popup',
          prompt: 'select_account',
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

// Server-side auth instance (used in the backend auth server)
// This instance has direct database access and handles authentication
export const auth = betterAuth<BetterAuthOptions>({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: Array.from(trustedOrigins),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders,
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    },
  },
});

// Auth client for Next.js Server Components/API routes
// This makes HTTP calls to the auth server instead of connecting to the database
export function createAuthServerClient(baseURL: string) {
  return betterAuth({
    baseURL,
  });
}

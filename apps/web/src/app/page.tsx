import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { LandingClient } from '~/components/landing/landing-client';
import { getServerSessionSnapshot } from '~/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { session, hasSessionCookie } = await getServerSessionSnapshot();

  if (session?.user || hasSessionCookie) {
    redirect('/dashboard' as Route);
  }

  return <LandingClient />;
}

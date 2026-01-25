import type { Route } from 'next';
import { redirect } from 'next/navigation';
import { LandingClient } from '~/components/landing/landing-client';
import { getServerSession } from '~/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getServerSession();

  if (session?.user) {
    redirect('/dashboard' as Route);
  }

  return <LandingClient />;
}

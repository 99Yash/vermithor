import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSessionSnapshot } from '~/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const { session, hasSessionCookie } = await getServerSessionSnapshot();

  if (!session?.user && !hasSessionCookie) {
    redirect('/signin');
  }

  return <>{children}</>;
}

import type { ReactNode } from 'react';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authServer } from '~/lib/auth/server';

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await authServer.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/signin');
  }

  return <>{children}</>;
}

import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { DashboardLayout } from '~/components/layouts/dashboard';
import { getServerSession } from '~/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect('/signin');
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

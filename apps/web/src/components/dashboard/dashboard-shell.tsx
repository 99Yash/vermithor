'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, FolderPlus, Gauge, Home, Library, LogOut, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState, type ComponentProps, type ReactNode } from 'react';
import { toast } from 'sonner';
import { DashboardPanel, DashboardPanelContent } from '~/components/dashboard/dashboard-panel';
import { DashboardSidebarToggle } from '~/components/dashboard/sidebar-toggle';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '~/components/ui/sheet';
import { authClient } from '~/lib/auth/client';
import { siteConfig } from '~/lib/site';
import { cn, getErrorMessage } from '~/lib/utils';

type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: Route;
  disabled?: boolean;
};

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, href: '/dashboard' as Route },
  { id: 'library', label: 'Library', icon: Library, disabled: true },
  { id: 'agent', label: 'Agent', icon: Sparkles, disabled: true },
];

type DashboardShellProps = {
  activeNav?: string;
  children: ReactNode;
};

export function DashboardShell({ activeNav = 'home', children }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-full bg-background" data-dashboard-root>
      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 lg:px-6">
        <aside
          className={cn(
            'sticky top-6 hidden h-[calc(100vh-3rem)] shrink-0 flex-col gap-6 self-start pb-4 transition-[width] duration-200 lg:flex',
            collapsed ? 'w-16 items-center' : 'w-60'
          )}
        >
          <SidebarBrand collapsed={collapsed}>
            <DashboardSidebarToggle
              collapsed={collapsed}
              onToggle={() => setCollapsed((prev) => !prev)}
            />
          </SidebarBrand>

          <SidebarSections collapsed={collapsed} activeNav={activeNav} />
        </aside>

        <main className="flex-1 min-w-0">
          <div className="mb-4 flex items-center gap-3 lg:hidden">
            <DashboardSidebarToggle
              collapsed={false}
              onToggle={() => setMobileOpen(true)}
              label="Open sidebar"
            />
            <div>
              <p className="text-sm font-semibold leading-tight">{siteConfig.name}</p>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-72 bg-background p-4"
        >
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-sm font-semibold">
              {siteConfig.name}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Dashboard navigation
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex h-full flex-col">
            <SidebarSections collapsed={false} activeNav={activeNav} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function SidebarBrand({
  collapsed,
  children,
}: {
  collapsed: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm">
          <img
            src="/favicon.svg"
            alt={`${siteConfig.name} mark`}
            className="h-4 w-4 opacity-80"
          />
        </div>
        <div className={cn(collapsed && 'sr-only')}>
          <p className="text-sm font-semibold leading-tight">{siteConfig.name}</p>
          <p className="text-xs text-muted-foreground">Dashboard</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function SidebarSections({
  collapsed,
  activeNav,
}: {
  collapsed: boolean;
  activeNav: string;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const { error } = await authClient.signOut();
      if (error) {
        throw error;
      }

      router.replace('/signin');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setIsSigningOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-6">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavItemLink
            key={item.id}
            item={item}
            isActive={item.id === activeNav}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className={cn('space-y-3', collapsed && 'hidden')}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Private
        </p>
        <SidebarActionButton
          icon={FolderPlus}
          label="Create folder"
          collapsed={collapsed}
          disabled
        />
      </div>

      <div className="mt-auto space-y-4">
        <SidebarActionButton
          icon={LogOut}
          label={isSigningOut ? 'Signing out...' : 'Log out'}
          collapsed={collapsed}
          onClick={handleSignOut}
          disabled={isSigningOut}
        />
        <div className={cn('space-y-4', collapsed && 'hidden')}>
          <DashboardPanel className="gap-3 py-4">
            <DashboardPanelContent className="space-y-2 px-4 py-0">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Bell className="size-3.5" />
                What's new
              </div>
              <p className="text-xs text-muted-foreground">
                Resume parsing is in preview. Upload a PDF to see structured results.
              </p>
            </DashboardPanelContent>
          </DashboardPanel>

          <DashboardPanel className="gap-3 py-4">
            <DashboardPanelContent className="space-y-2 px-4 py-0">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Gauge className="size-3.5" />
                Plan usage
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Resume analyses</span>
                  <span>0/10</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div className="h-full w-1/12 rounded-full bg-primary" />
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Upgrade
              </Button>
            </DashboardPanelContent>
          </DashboardPanel>
        </div>
      </div>
    </div>
  );
}

type SidebarActionButtonProps = {
  icon: LucideIcon;
  label: string;
  collapsed: boolean;
} & Omit<ComponentProps<typeof Button>, 'children'>;

function SidebarActionButton({
  icon: Icon,
  label,
  collapsed,
  className,
  type = 'button',
  ...props
}: SidebarActionButtonProps) {
  return (
    <Button
      type={type}
      variant="ghost"
      size="sm"
      className={cn(
        'w-full justify-start gap-2 text-muted-foreground hover:text-foreground',
        collapsed && 'w-10 justify-center px-0',
        className
      )}
      title={collapsed ? label : undefined}
      aria-label={collapsed ? label : undefined}
      {...props}
    >
      <Icon className="size-4" />
      <span className={cn(collapsed && 'sr-only')}>{label}</span>
    </Button>
  );
}

function NavItemLink({
  item,
  isActive,
  collapsed,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
}) {
  const baseClassName = cn(
    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
    collapsed && 'justify-center px-2',
    isActive
      ? 'bg-muted text-foreground'
      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
    item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground'
  );

  const content = (
    <>
      <item.icon className="size-4" />
      <span className={cn(collapsed && 'sr-only')}>{item.label}</span>
    </>
  );

  if (!item.href || item.disabled) {
    return (
      <div className={baseClassName} aria-disabled="true" title={collapsed ? item.label : undefined}>
        {content}
      </div>
    );
  }

  return (
    <Link className={baseClassName} href={item.href} title={collapsed ? item.label : undefined}>
      {content}
    </Link>
  );
}

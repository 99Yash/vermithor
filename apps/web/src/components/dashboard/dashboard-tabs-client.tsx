'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

type DashboardTab = 'home' | 'resume';

type DashboardTabsClientProps = {
  initialTab: DashboardTab;
  home: ReactNode;
  resume: ReactNode;
};

const dashboardTabs: { id: DashboardTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'resume', label: 'Resume' },
];

export function DashboardTabsClient({
  initialTab,
  home,
  resume,
}: DashboardTabsClientProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');

    if (tabParam === 'resume' && initialTab !== 'resume') {
      setActiveTab('resume');
      return;
    }

    if (tabParam !== 'resume' && initialTab !== 'home') {
      setActiveTab('home');
    }
  }, [initialTab]);

  const handleTabChange = (nextTab: DashboardTab) => {
    setActiveTab(nextTab);

    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (nextTab === 'resume') {
      url.searchParams.set('tab', 'resume');
    } else {
      url.searchParams.delete('tab');
    }
    url.hash = '';
    window.history.replaceState(null, '', url.toString());
  };

  const handlePanelClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const tabTarget = target.closest<HTMLElement>('[data-tab-target]');

    if (tabTarget) {
      const nextTab = tabTarget.dataset.tabTarget;
      if (nextTab === 'home' || nextTab === 'resume') {
        event.preventDefault();
        handleTabChange(nextTab);
      }
      return;
    }

    const scrollTarget = target.closest<HTMLElement>('[data-scroll-target]');

    if (scrollTarget) {
      const anchor = scrollTarget.dataset.scrollTarget;
      if (anchor) {
        event.preventDefault();
        document.getElementById(anchor)?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  };

  const pageTitle = activeTab === 'resume' ? 'Resume' : 'Home';

  return (
    <div className="relative isolate space-y-8 pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] h-[220px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.95_0.06_95.6)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,oklch(0.3_0.03_85)_0%,transparent_70%)] dark:opacity-50" />

      <header className="relative flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dashboard
          </p>
          <h1 className="text-2xl font-semibold text-foreground">{pageTitle}</h1>
        </div>
        <Button variant="outline" size="sm">
          Upgrade
        </Button>
      </header>

      <nav
        className="flex flex-wrap items-center gap-2 text-sm"
        role="tablist"
        aria-label="Dashboard tabs"
      >
        {dashboardTabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const tabId = `dashboard-tab-${tab.id}`;
          const panelId = `dashboard-panel-${tab.id}`;
          return (
            <button
              key={tab.id}
              id={tabId}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                isActive
                  ? 'border-border bg-muted text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div onClickCapture={handlePanelClick}>
        <section
          id="dashboard-panel-home"
          role="tabpanel"
          aria-labelledby="dashboard-tab-home"
          aria-hidden={activeTab !== 'home'}
          hidden={activeTab !== 'home'}
        >
          {home}
        </section>

        <section
          id="dashboard-panel-resume"
          role="tabpanel"
          aria-labelledby="dashboard-tab-resume"
          aria-hidden={activeTab !== 'resume'}
          hidden={activeTab !== 'resume'}
        >
          {resume}
        </section>
      </div>
    </div>
  );
}

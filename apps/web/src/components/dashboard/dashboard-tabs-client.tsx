'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

type DashboardTab = 'home' | 'resume';

type DashboardTabsClientProps = {
  initialTab: DashboardTab;
  home: ReactNode;
  resume: ReactNode;
};

const isDashboardTab = (value: string): value is DashboardTab =>
  value === 'home' || value === 'resume';

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

  const handleTabValueChange = (nextTab: string) => {
    if (isDashboardTab(nextTab)) {
      handleTabChange(nextTab);
    }
  };

  const handlePanelClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const tabTarget = target.closest<HTMLElement>('[data-tab-target]');

    if (tabTarget) {
      const nextTab = tabTarget.dataset.tabTarget;
      if (nextTab && isDashboardTab(nextTab)) {
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

      <h1 className="text-lg tracking-tight font-semibold text-foreground">
        {pageTitle}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={handleTabValueChange}
        className="gap-6 -mt-[7px]"
      >
        <TabsList aria-label="Dashboard tabs">
          {dashboardTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div onClickCapture={handlePanelClick}>
          <TabsContent
            value="home"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {home}
          </TabsContent>
          <TabsContent
            value="resume"
            forceMount
            className="data-[state=inactive]:hidden"
          >
            {resume}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

import type { Route } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  MessageSquare,
  Sparkles,
  Target,
  Upload,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  DashboardPanel,
  DashboardPanelContent,
} from '~/components/dashboard/dashboard-panel';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

const toRoute = (value: string) => value as Route;

type QuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: Route;
  badge?: string;
};

const quickActions: QuickAction[] = [
  {
    title: 'Upload resume',
    description: 'Add a PDF to kick off parsing.',
    icon: Upload,
    href: toRoute('/resumes/upload'),
  },
  {
    title: 'Set targets',
    description: 'Define roles and locations to match.',
    icon: Target,
    href: toRoute('/dashboard#get-started'),
  },
  {
    title: 'Start matching',
    description: 'Run the first analysis cycle.',
    icon: Sparkles,
    badge: 'Soon',
  },
  {
    title: 'Ask the agent',
    description: 'Draft and refine resume bullets.',
    icon: MessageSquare,
    href: toRoute('/dashboard#agent'),
  },
];

type OnboardingTask = {
  title: string;
  description: string;
  href?: Route;
  done?: boolean;
  cta?: string;
};

const onboardingTasks: OnboardingTask[] = [
  {
    title: 'Upload your resume',
    description: 'PDF only. We validate and parse it automatically.',
    href: toRoute('/resumes/upload'),
    cta: 'Upload',
  },
  {
    title: 'Confirm your targets',
    description: 'Tell us the roles and locations you want.',
    cta: 'Set targets',
  },
  {
    title: 'Review parsed profile',
    description: 'Double-check what we extracted from the resume.',
    cta: 'Review',
  },
  {
    title: 'Kick off matching',
    description: 'Start the first pipeline run.',
    cta: 'Run now',
  },
  {
    title: 'Explore results',
    description: 'Browse curated matches and save favorites.',
    cta: 'Explore',
  },
];

type RecentItem = {
  title: string;
  subtitle: string;
};

const recentItems: RecentItem[] = [
  {
    title: 'No resumes yet',
    subtitle: 'Upload a resume to start your first analysis.',
  },
  {
    title: 'No matches generated',
    subtitle: 'Finish onboarding to unlock matching.',
  },
  {
    title: 'No saved roles',
    subtitle: 'Pin roles to guide future scoring.',
  },
];

const agentChips = ['Mentor', 'Resume mode', '250 words'];

type DashboardPageProps = {
  searchParams?: {
    tab?: string;
  };
};

const dashboardTabs = [
  { id: 'home', label: 'Home', href: toRoute('/dashboard') },
  {
    id: 'resume',
    label: 'Resume',
    href: toRoute('/dashboard?tab=resume'),
  },
];

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const activeTab = searchParams?.tab === 'resume' ? 'resume' : 'home';

  return (
    <div className="relative isolate space-y-8 pb-10">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] h-[220px] rounded-full bg-[radial-gradient(circle_at_center,oklch(0.95_0.06_95.6)_0%,transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle_at_center,oklch(0.3_0.03_85)_0%,transparent_70%)] dark:opacity-50" />

        <header className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Dashboard
            </p>
            <h1 className="text-2xl font-semibold text-foreground">Home</h1>
          </div>
          <Button variant="outline" size="sm">
            Upgrade
          </Button>
        </header>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {dashboardTabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                activeTab === tab.id
                  ? 'border-border bg-muted text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-muted/40',
              )}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

      {activeTab === 'resume' ? <ResumeTab /> : <DashboardHome />}
    </div>
  );
}

function DashboardHome() {
  return (
    <>
      <section aria-labelledby="quick-actions-title" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            id="quick-actions-title"
            className="text-sm font-medium text-muted-foreground"
          >
            Quick actions
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <ActionCard key={action.title} action={action} />
          ))}
        </div>
      </section>

      <section aria-labelledby="agent-title" id="agent" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="agent-title" className="text-sm font-medium text-muted-foreground">
            Agent
          </h2>
        </div>
        <DashboardPanel>
          <DashboardPanelContent className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Resume copilot</p>
              <p className="text-xs text-muted-foreground">
                Understand, research, and write about your career materials.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {agentChips.map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="border-border/60 text-muted-foreground"
                >
                  {chip}
                </Badge>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-background px-3 py-2">
              <Input
                placeholder="Ask the agent to summarize strengths, or rewrite bullets."
                className="h-8 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
              />
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Sparkles className="size-4" />
              </Button>
            </div>
          </DashboardPanelContent>
        </DashboardPanel>
      </section>

      <section
        aria-labelledby="get-started-title"
        id="get-started"
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2
            id="get-started-title"
            className="text-sm font-medium text-muted-foreground"
          >
            Get started
          </h2>
          <Badge variant="outline" className="border-border/60 text-xs">
            0/{onboardingTasks.length} complete
          </Badge>
        </div>
        <DashboardPanel>
          <DashboardPanelContent className="space-y-4">
            {onboardingTasks.map((task) => (
              <ChecklistItem key={task.title} task={task} />
            ))}
          </DashboardPanelContent>
        </DashboardPanel>
      </section>

      <section aria-labelledby="recent-title" id="recent" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="text-sm font-medium text-muted-foreground">
            Recent
          </h2>
          <Button variant="ghost" size="sm" className="text-muted-foreground" disabled>
            View all
          </Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recentItems.map((item) => (
            <DashboardPanel key={item.title}>
              <DashboardPanelContent className="space-y-1">
                <p className="text-sm font-medium text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              </DashboardPanelContent>
            </DashboardPanel>
          ))}
        </div>
      </section>
    </>
  );
}

function ResumeTab() {
  return (
    <section aria-labelledby="resume-tab-title" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 id="resume-tab-title" className="text-sm font-medium text-muted-foreground">
          Resume
        </h2>
        <Badge variant="outline" className="border-border/60 text-xs">
          No file uploaded
        </Badge>
      </div>
      <DashboardPanel>
        <DashboardPanelContent className="space-y-4">
          <div>
            <p className="text-base font-semibold text-foreground">Upload your resume</p>
            <p className="text-sm text-muted-foreground">
              We validate that the document is a real resume before sending it to
              analysis.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={toRoute('/resumes/upload')}>Upload PDF</Link>
            </Button>
            <Button variant="outline" size="sm" disabled>
              Import LinkedIn
            </Button>
          </div>
        </DashboardPanelContent>
      </DashboardPanel>
      <DashboardPanel>
        <DashboardPanelContent className="space-y-3">
          <p className="text-sm font-medium text-foreground">What we validate</p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li>PDF header and content type match.</li>
            <li>Document size and page count are within limits.</li>
            <li>Resume heuristics (skills, experience, education sections).</li>
            <li>Text extraction quality before AI parsing.</li>
          </ul>
        </DashboardPanelContent>
      </DashboardPanel>
    </section>
  );
}

function ActionCard({ action }: { action: QuickAction }) {
  const cardClassName = cn(
    'group flex h-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 shadow-xs transition',
    action.href ? 'hover:-translate-y-0.5 hover:shadow-md' : 'opacity-70'
  );

  const content = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <action.icon className="size-4 text-primary" />
          <span>{action.title}</span>
        </div>
        {action.badge ? (
          <Badge variant="outline" className="border-border/60 text-xs">
            {action.badge}
          </Badge>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{action.description}</p>
      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <span>Open</span>
        <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
      </div>
    </>
  );

  if (action.href) {
    return (
      <Link href={action.href} className={cardClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClassName} aria-disabled="true">
      {content}
    </div>
  );
}

function ChecklistItem({ task }: { task: OnboardingTask }) {
  const iconClassName = task.done ? 'text-emerald-500' : 'text-muted-foreground';
  const Icon = task.done ? CheckCircle2 : Circle;
  const ctaLabel = task.cta ?? 'Open';
  const ctaPill = (
    <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground">
      {ctaLabel}
    </span>
  );

  const content = (
    <>
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 size-4', iconClassName)} />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.description}</p>
        </div>
      </div>
      {task.href ? (
        ctaPill
      ) : (
        <Button variant="outline" size="sm" className="h-7" disabled>
          {ctaLabel}
        </Button>
      )}
    </>
  );

  if (task.href) {
    return (
      <Link
        href={task.href}
        className="group flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 transition hover:bg-muted/50"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-3">
      {content}
    </div>
  );
}

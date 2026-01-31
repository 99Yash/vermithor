import type { Route } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
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
import type { ReactNode } from 'react';
import { DashboardTabsClient } from '~/components/dashboard/dashboard-tabs-client';
import {
  DashboardPanel,
  DashboardPanelContent,
} from '~/components/dashboard/dashboard-panel';
import { ResumeListClient } from '~/components/resumes/resume-list-client';
import { ResumeUploadClient } from '~/components/resumes/resume-upload-client';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { getServerSession } from '~/lib/auth/session';
import { route } from '~/lib/routes';
import { cn } from '~/lib/utils';

type QuickAction = {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: Route;
  tabTarget?: 'home' | 'resume';
  scrollTarget?: string;
  badge?: string;
};

const quickActions: QuickAction[] = [
  {
    title: 'Upload resume',
    description: 'Add a PDF to kick off parsing.',
    icon: Upload,
    tabTarget: 'resume',
  },
  {
    title: 'Set targets',
    description: 'Define roles and locations to match.',
    icon: Target,
    scrollTarget: 'get-started',
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
    scrollTarget: 'agent',
  },
];

type OnboardingTask = {
  title: string;
  description: string;
  href?: Route;
  tabTarget?: 'home' | 'resume';
  scrollTarget?: string;
  done?: boolean;
  cta?: string;
};

const onboardingTasks: OnboardingTask[] = [
  {
    title: 'Upload your resume',
    description: 'PDF only. We validate and parse it automatically.',
    tabTarget: 'resume',
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
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession();

  if (!session?.user) {
    redirect(route('/signin'));
  }

  const initialTab =
    resolvedSearchParams?.tab === 'resume' ? 'resume' : 'home';

  return (
    <DashboardTabsClient
      initialTab={initialTab}
      home={<DashboardHome />}
      resume={<ResumeTab />}
    />
  );
}

type SectionHeaderProps = {
  id: string;
  title: string;
  action?: ReactNode;
};

function SectionHeader({ id, title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-sm font-medium text-muted-foreground">
        {title}
      </h2>
      {action}
    </div>
  );
}

function DashboardHome() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="quick-actions-title" className="space-y-3">
        <SectionHeader id="quick-actions-title" title="Quick actions" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <ActionCard key={action.title} action={action} />
          ))}
        </div>
      </section>

      <section aria-labelledby="agent-title" id="agent" className="space-y-3">
        <SectionHeader id="agent-title" title="Agent" />
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

            <div className="group flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-transparent px-4 py-1 shadow-xs transition hover:border-border/80 focus-within:border-ring/60 focus-within:shadow-sm focus-within:ring-1 focus-within:ring-ring/20">
              <Input
                placeholder="Ask the agent to summarize strengths, or rewrite bullets."
                aria-label="Ask the agent"
                className="h-8 flex-1 border-0 px-0 text-sm text-foreground placeholder:text-muted-foreground/80 shadow-none focus-visible:ring-0 bg-transparent!"
              />
              <Button
                size="icon-sm"
                variant="ghost"
                className="rounded-lg text-muted-foreground transition hover:bg-muted/40 hover:text-foreground"
                aria-label="Send to agent"
              >
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
        <SectionHeader
          id="get-started-title"
          title="Get started"
          action={
            <Badge variant="outline" className="border-border/60 text-xs">
              0/{onboardingTasks.length} complete
            </Badge>
          }
        />
        <DashboardPanel>
          <DashboardPanelContent className="space-y-4">
            {onboardingTasks.map((task) => (
              <ChecklistItem key={task.title} task={task} />
            ))}
          </DashboardPanelContent>
        </DashboardPanel>
      </section>

      <section aria-labelledby="recent-title" id="recent" className="space-y-3">
        <SectionHeader
          id="recent-title"
          title="Recent"
          action={
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled
            >
              View all
            </Button>
          }
        />
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
    </div>
  );
}

function ResumeTab() {
  return (
    <section aria-labelledby="resume-tab-title" className="space-y-8">
      <SectionHeader
        id="resume-tab-title"
        title="Resume"
      />
      <DashboardPanel>
        <DashboardPanelContent className="space-y-4">
          <div>
            <p className="text-base font-semibold text-foreground">Upload your resume</p>
            <p className="text-sm text-muted-foreground">
              We validate that the document is a real resume before sending it to
              analysis.
            </p>
          </div>
          <ResumeUploadClient />
        </DashboardPanelContent>
      </DashboardPanel>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">Your resumes</h3>
        <ResumeListClient />
      </div>

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
    'group flex h-full w-full flex-col justify-between rounded-xl border border-border/60 bg-card p-4 text-left shadow-xs transition',
    action.href || action.tabTarget || action.scrollTarget
      ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
      : 'opacity-70',
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

  if (action.tabTarget) {
    return (
      <button
        type="button"
        data-tab-target={action.tabTarget}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

  if (action.scrollTarget) {
    return (
      <button
        type="button"
        data-scroll-target={action.scrollTarget}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

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

  const isInteractive = Boolean(
    task.href || task.tabTarget || task.scrollTarget,
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
      {isInteractive ? (
        ctaPill
      ) : (
        <Button variant="outline" size="sm" className="h-7" disabled>
          {ctaLabel}
        </Button>
      )}
    </>
  );

  const wrapperClassName = cn(
    'group flex w-full items-center justify-between gap-4 rounded-lg border border-border/60 bg-muted/30 px-3 py-3 text-left',
    isInteractive && 'transition hover:bg-muted/50',
  );

  if (task.tabTarget) {
    return (
      <button
        type="button"
        data-tab-target={task.tabTarget}
        className={wrapperClassName}
      >
        {content}
      </button>
    );
  }

  if (task.scrollTarget) {
    return (
      <button
        type="button"
        data-scroll-target={task.scrollTarget}
        className={wrapperClassName}
      >
        {content}
      </button>
    );
  }

  if (task.href) {
    return (
      <Link href={task.href} className={wrapperClassName}>
        {content}
      </Link>
    );
  }

  return (
    <div className={wrapperClassName} aria-disabled="true">
      {content}
    </div>
  );
}

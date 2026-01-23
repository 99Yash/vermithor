'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { GitHub, LinkedIn, Mail, X } from '~/components/ui/icons';
import { authClient } from '~/lib/auth/client';
import { siteConfig } from '~/lib/site';
import { trpc } from '~/lib/trpc';

const glowOrbs = [
  'pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-rose-400/35 via-pink-400/20 to-transparent blur-3xl dark:from-rose-500/25 dark:via-pink-500/10',
  'pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-violet-400/35 via-purple-400/20 to-transparent blur-3xl dark:from-violet-500/25 dark:via-purple-500/10',
  'pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-cyan-400/35 via-sky-400/20 to-transparent blur-3xl dark:from-cyan-500/25 dark:via-sky-500/10',
  'pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-fuchsia-400/35 via-pink-400/20 to-transparent blur-3xl dark:from-fuchsia-500/25 dark:via-pink-500/10',
  'pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-indigo-400/25 via-blue-400/15 to-transparent blur-3xl dark:from-indigo-500/15 dark:via-blue-500/8',
  'pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-r from-amber-400/20 via-orange-400/10 to-transparent blur-3xl dark:from-amber-500/12 dark:via-orange-500/6',
  'pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-l from-emerald-400/20 via-green-400/10 to-transparent blur-3xl dark:from-emerald-500/12 dark:via-green-500/6',
];

const streamItems = [
  {
    title: 'Design Systems Lead',
    detail: 'Strong overlap in systems, accessibility, and UX leadership.',
    status: 'New',
  },
  {
    title: 'Senior Frontend Engineer',
    detail: 'TypeScript + UI architecture signals align with recent work.',
    status: 'Analyzing',
  },
  {
    title: 'Product Engineer, Growth',
    detail: 'Experimentation mindset + metrics-driven delivery match.',
    status: 'Ready',
  },
];

const workflowSteps = [
  {
    title: 'Upload + validate',
    description:
      'Choose a resume file. We validate format and size before parsing.',
  },
  {
    title: 'Parse + extract profile',
    description:
      'We read the resume and extract roles, skills, and signals into a profile.',
  },
  {
    title: 'Durable job fetch',
    description:
      'A queued workflow fetches jobs, retries safely, and never loses state.',
  },
  {
    title: 'Analyze + stream results',
    description:
      'Analysis runs and streams results into your UI as they are ready.',
  },
];

const durabilityHighlights = [
  {
    title: 'Retry-safe by default',
    description: 'Failures resume at the right stage with backoff built in.',
  },
  {
    title: 'Streaming-first UI',
    description: 'Progressive rendering replaces polling and long waits.',
  },
  {
    title: 'Separated queues',
    description: 'Job discovery and analysis run independently for reliability.',
  },
];

const streamingHighlights = [
  {
    title: 'Live progress',
    description: 'Queued to running to rendered stays visible as you watch.',
  },
  {
    title: 'Durable checkpoints',
    description: 'Each stage persists so you can resume without rework.',
  },
  {
    title: 'Results explore-ready',
    description: 'Matches arrive structured for filters, sort, and search.',
  },
];

const explorationChips = ['Filters', 'Sorts', 'Keyword search', 'Pagination'];

const explorationSteps = [
  'Filters, sorts, and pagination build a clean query state.',
  'Query updates trigger a read-only fetch with no accidental writes.',
  'Results render, then you keep exploring from the same flow.',
];

const resumeSteps = [
  'Stream suggestions directly into the editor.',
  'Validate edits before saving to prevent regressions.',
  'Snapshot versions for undo, compare, and re-run matches.',
];

const socialLinks = [
  { href: siteConfig.links.x, label: 'X', icon: X },
  { href: siteConfig.links.github, label: 'GitHub', icon: GitHub },
  { href: siteConfig.links.linkedin, label: 'LinkedIn', icon: LinkedIn },
  { href: `mailto:${siteConfig.links.mail}`, label: 'Email', icon: Mail },
];

export default function Home() {
  const { data: session } = authClient.useSession();
  const { data: healthCheck, isLoading } = useQuery(
    trpc.healthCheck.queryOptions()
  );
  const firstName = session?.user?.name?.split(' ')[0];
  const statusText = isLoading
    ? 'Checking system status...'
    : healthCheck
      ? `System status: ${healthCheck}`
      : 'System status: unavailable';
  const greeting = firstName
    ? `Welcome back, ${firstName}.`
    : 'Durable workflows with streaming results.';

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      {glowOrbs.map((className, index) => (
        <div key={`glow-${index}`} className={className} aria-hidden="true" />
      ))}

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20 pt-16 lg:px-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <Badge
              variant="secondary"
              className="w-fit bg-secondary/80 text-secondary-foreground/80"
            >
              Resume → Career Matches
            </Badge>
            <div className="space-y-4">
              <h1 className="heading-xl text-balance">
                Turn your resume into{' '}
                <span className="text-gradient-brand">career matches</span> that
                stream in real time.
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                Upload once. We validate, parse, and extract a profile. A durable
                workflow fetches jobs, analyzes fit, and streams results the
                moment they are ready.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="group px-8 py-4 text-base font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              >
                <Link href="/signin">
                  Get started
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8 py-4">
                <Link href="#workflow">See the workflow</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {statusText}
              </span>
              <span>{greeting}</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-linear-to-br from-violet-500/15 via-transparent to-fuchsia-500/15 blur-xl" />
            <div className="relative rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-violet-500/10 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-secondary/70">
                  Live match stream
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Streaming results
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {streamItems.map((item) => (
                  <div
                    key={item.title}
                    className="group rounded-2xl border border-border/60 bg-background/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge
                        variant="outline"
                        className="border-border/60 text-[10px] uppercase tracking-wide"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <div className="mt-3 h-1 w-full rounded-full bg-muted">
                      <div className="shimmer h-full w-2/3 rounded-full bg-linear-to-r from-violet-500/70 via-fuchsia-500/70 to-pink-500/70" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-xs text-muted-foreground">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80" />
                Results update as each analysis step completes.
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="grid gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="heading-lg text-gradient-subtle">
              Workflow built for momentum
            </h2>
            <p className="text-pretty text-base text-muted-foreground">
              The experience follows a clear state machine: validate the resume,
              parse and extract a profile, queue durable job fetches, then stream
              analysis into results you can explore.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {`0${index + 1}`}
                  </span>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <div className="mt-4 h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg">
            <h3 className="text-2xl font-semibold">Durable by design</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Every step is designed to resume safely. Failures retry with
              backoff, and streaming keeps the UI alive while work continues.
            </p>
            <div className="mt-6 grid gap-4">
              {durabilityHighlights.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/60 bg-background/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg">
            <h3 className="text-2xl font-semibold">Stream-first experience</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Progress stays visible as results stream, keeping momentum while
              analysis runs.
            </p>
            <div className="mt-6 space-y-4">
              {streamingHighlights.map((item) => (
                <div
                  key={item.title}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-background/70 p-4"
                >
                  <span className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg">
            <h3 className="text-2xl font-semibold">Results exploration</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Filter, sort, search, and paginate without losing the thread. Your
              query state stays clean and read-only.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {explorationChips.map((chip) => (
                <Badge key={chip} variant="outline" className="bg-background/70">
                  {chip}
                </Badge>
              ))}
            </div>
            <div className="mt-6 grid gap-3 text-xs text-muted-foreground">
              {explorationSteps.map((step) => (
                <div
                  key={step}
                  className="rounded-2xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg">
            <h3 className="text-2xl font-semibold">Resume improvement loop</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Suggestions stream into the editor so you can refine quickly, save
              safely, and re-run matches when you are ready.
            </p>
            <div className="mt-6 grid gap-3">
              {resumeSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <p className="text-xs text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-linear-to-br from-violet-500/10 via-transparent to-fuchsia-500/10 px-6 py-12 text-center shadow-lg sm:px-10">
          <h2 className="heading-md text-balance">
            Ready to stream your next matches?
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            Start with a resume upload, watch the workflow run, and explore
            matches as they arrive.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="group px-8 py-4 text-base font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
            >
              <Link href="/signin">
                Get started
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="px-8 py-4">
              <Link href="#workflow">Revisit the workflow</Link>
            </Button>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>{siteConfig.name} | Resume to career matches</span>
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              const isExternal = link.href.startsWith('http');

              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="group flex items-center gap-2 transition-colors hover:text-foreground"
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </a>
              );
            })}
          </div>
        </footer>
      </main>
    </div>
  );
}

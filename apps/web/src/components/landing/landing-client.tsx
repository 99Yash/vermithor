'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { GitHub, LinkedIn, Mail, X } from '~/components/ui/icons';
import { authClient } from '~/lib/auth/client';
import { siteConfig } from '~/lib/site';
import { trpc } from '~/lib/trpc';

const glowOrbs = [
  'pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-amber-500/25 via-amber-300/10 to-transparent blur-3xl dark:from-amber-300/35 dark:via-amber-200/15 dark:to-transparent',
  'pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-stone-500/20 via-zinc-400/10 to-transparent blur-3xl dark:from-zinc-400/22 dark:via-slate-300/12 dark:to-transparent',
  'pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-amber-400/20 via-yellow-300/10 to-transparent blur-3xl dark:from-orange-300/30 dark:via-amber-200/12 dark:to-transparent',
  'pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-neutral-500/18 via-stone-400/10 to-transparent blur-3xl dark:from-amber-300/18 dark:via-orange-200/10 dark:to-transparent',
  'pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-amber-400/18 via-amber-300/8 to-transparent blur-3xl dark:from-amber-300/25 dark:via-amber-200/12 dark:to-transparent',
];

const streamLetters = Array.from('stream');
const streamLetterStyle = (index: number) =>
  ({
    '--index': index,
    '--offset': index - (streamLetters.length - 1) / 2,
  }) as CSSProperties;

const dragonSketchLines = [
  { d: 'M940 120 C900 90 850 95 810 135', opacity: 0.5 },
  { d: 'M820 160 C860 175 900 190 940 210', opacity: 0.35 },
  {
    d: 'M810 135 C760 190 700 245 640 300 C600 340 560 370 520 400',
    opacity: 0.45,
  },
  {
    d: 'M520 400 C600 360 700 350 800 390 C900 430 980 470 1080 500',
    opacity: 0.35,
  },
  {
    d: 'M520 400 C470 440 420 480 360 520 C300 560 230 600 170 640',
    opacity: 0.4,
    dash: '8 14',
  },
  { d: 'M700 310 C750 340 790 380 820 430', opacity: 0.3 },
];

const streamItems = [
  {
    title: 'Design Systems Lead',
    detail: 'Systems thinking, accessibility, UX leadership.',
    status: 'New',
  },
  {
    title: 'Senior Frontend Engineer',
    detail: 'Frontend craft and UI architecture.',
    status: 'In review',
  },
  {
    title: 'Product Engineer, Growth',
    detail: 'Experimentation and metrics-driven delivery.',
    status: 'Matched',
  },
];

const momentumHighlights = [
  {
    title: 'Focused profile',
    description: 'We translate your résumé into a clear profile for matching.',
  },
  {
    title: 'Live matching',
    description: 'Roles stream in as soon as each stage finishes.',
  },
  {
    title: 'Control built in',
    description: 'Filter, search, and refine without losing your place.',
  },
];

const workflowSteps = [
  {
    title: 'Upload',
    description: 'Start with your résumé.',
  },
  {
    title: 'Profile',
    description: 'We map your strengths into a focused view.',
  },
  {
    title: 'Match',
    description: 'Roles align to your goals and experience.',
  },
  {
    title: 'Stream',
    description: 'Matches arrive as soon as they are ready.',
  },
];

const durabilityHighlights = [
  {
    title: 'Checkpointed stages',
    description: 'Progress persists so work resumes smoothly.',
  },
  {
    title: 'Smart retries',
    description: 'Automatic retries handle small hiccups.',
  },
  {
    title: 'Independent queues',
    description: 'Discovery and analysis stay separate for stability.',
  },
];

const streamingHighlights = [
  {
    title: 'Progress in view',
    description: 'Queued → running → delivered stays visible.',
  },
  {
    title: 'Live by default',
    description: 'Matches stream in as each stage finishes.',
  },
  {
    title: 'Organized output',
    description: 'Matches arrive organized for filtering and search.',
  },
];

const explorationChips = ['Filters', 'Sorts', 'Search', 'Pages'];

const explorationSteps = [
  'One view for filters and sorts.',
  'Results refresh as you tweak.',
  'Keep exploring without a reset.',
];

const resumeSteps = [
  'Inline suggestions as you edit.',
  'Quick checks before you save.',
  'Snapshots to undo, compare, and rerun matches.',
];

const socialLinks = [
  { href: siteConfig.links.x, label: 'X', icon: X },
  { href: siteConfig.links.github, label: 'GitHub', icon: GitHub },
  { href: siteConfig.links.linkedin, label: 'LinkedIn', icon: LinkedIn },
  { href: `mailto:${siteConfig.links.mail}`, label: 'Email', icon: Mail },
];

const primaryCtaClass =
  'group px-8 py-4 text-base font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 dark:shadow-amber-500/30 dark:hover:shadow-amber-400/45';
const secondaryCtaClass =
  'px-8 py-4 dark:border-amber-200/30 dark:text-amber-100/90 dark:hover:border-amber-200/50';
const sectionCardClass =
  'rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg dark:border-amber-200/10 dark:bg-slate-950/60 dark:shadow-amber-500/10';
const featureCardClass =
  'rounded-2xl border border-border/60 bg-card/60 p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-amber-200/10 dark:bg-slate-950/55 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/25';
const surfaceCardClass =
  'rounded-2xl border border-border/60 bg-background/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-amber-200/10 dark:bg-slate-950/60 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/25';
const surfacePanelClass =
  'rounded-2xl border border-border/60 bg-background/60 px-4 py-3 text-xs text-muted-foreground dark:border-amber-200/10 dark:bg-slate-950/50 dark:text-amber-100/70';
const stepBadgeClass =
  'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-amber-500/15 dark:text-amber-100/90';
const miniStepBadgeClass =
  'flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-amber-500/15 dark:text-amber-100/90';

export function LandingClient() {
  const { data: session } = authClient.useSession();
  const { data: healthCheck, isLoading } = useQuery(
    trpc.healthCheck.queryOptions(),
  );
  const firstName = session?.user?.name?.split(' ')[0];
  const statusText = isLoading
    ? 'Checking status...'
    : healthCheck
      ? `Status: ${healthCheck}`
      : 'Status: unavailable';
  const greeting = firstName
    ? `Welcome back, ${firstName}.`
    : 'Always on. Always matching.';

  return (
    <div className="relative min-h-full overflow-hidden bg-background">
      {glowOrbs.map((className, index) => (
        <div key={`glow-${index}`} className={className} aria-hidden="true" />
      ))}
      <svg
        className="dragon-drift pointer-events-none absolute right-[-200px] top-[-140px] h-[600px] w-[900px] opacity-70"
        viewBox="0 0 1200 800"
        fill="none"
        aria-hidden="true"
      >
        <g
          className="text-amber-700/30 dark:text-amber-200/25"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {dragonSketchLines.map((line, index) => (
            <path
              key={`dragon-line-${index}`}
              d={line.d}
              opacity={line.opacity}
              strokeDasharray={line.dash}
            />
          ))}
        </g>
      </svg>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20 pt-16 lg:px-10">
        <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <h1 className="heading-xl text-balance">
                Job matches. <span className="text-gradient-brand">In</span>{' '}
                real time.
              </h1>
              <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
                Upload your résumé once. We build a focused profile and stream
                roles that fit.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" className={primaryCtaClass}>
                <Link href="/signin">
                  Get started
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className={secondaryCtaClass}
              >
                <Link href="#workflow">See the flow</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 dark:border-amber-200/10 dark:bg-slate-950/60 dark:text-amber-100/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 dark:bg-emerald-300/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-300" />
                </span>
                {statusText}
              </span>
              <span>{greeting}</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-linear-to-br from-amber-500/15 via-transparent to-yellow-500/12 blur-xl dark:from-amber-400/25 dark:via-transparent dark:to-amber-300/15 dark:blur-2xl" />
            <div className="relative rounded-3xl border border-border/60 bg-card/80 p-6 shadow-2xl shadow-amber-500/10 backdrop-blur-sm dark:border-amber-200/10 dark:bg-slate-950/60 dark:shadow-amber-400/20">
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="bg-secondary/70 dark:border-amber-200/20 dark:bg-amber-500/10 dark:text-amber-100/80"
                >
                  Match stream
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Live results
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {streamItems.map((item) => (
                  <div key={item.title} className={surfaceCardClass}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <Badge
                        variant="outline"
                        className="border-border/60 text-[10px] uppercase tracking-wide dark:border-amber-200/20 dark:text-amber-100/80"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.detail}
                    </p>
                    <div className="mt-3 h-1 w-full rounded-full bg-muted dark:bg-amber-950/50">
                      <div className="shimmer h-full w-2/3 rounded-full bg-linear-to-r from-amber-600/55 via-orange-500/45 to-amber-400/55 dark:from-amber-300/70 dark:via-amber-200/50 dark:to-orange-200/60" />
                    </div>
                  </div>
                ))}
              </div>
              <div className={surfacePanelClass}>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400/80 dark:bg-emerald-300/80" />
                Updates land as each step finishes.
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="heading-lg text-gradient-subtle">
              Designed for momentum
            </h2>
            <p className="text-pretty text-base text-muted-foreground">
              Everything stays crisp, fast, and moving forward.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {momentumHighlights.map((item) => (
              <div key={item.title} className={featureCardClass}>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="heading-lg text-gradient-subtle">The flow</h2>
            <p className="text-pretty text-base text-muted-foreground">
              Four steps. Always moving.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-amber-200/10 dark:bg-slate-950/60 dark:hover:shadow-amber-500/25"
              >
                <div className="flex items-center gap-3">
                  <span className={stepBadgeClass}>{`0${index + 1}`}</span>
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

        <section className="grid gap-6 lg:grid-cols-2">
          <div className={sectionCardClass}>
            <h3 className="text-2xl font-semibold">Explore with clarity</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Filter, sort, search, and page without losing your place. Your
              choices stay put.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {explorationChips.map((chip) => (
                <Badge
                  key={chip}
                  variant="outline"
                  className="bg-background/70 dark:border-amber-200/20 dark:bg-slate-950/50 dark:text-amber-100/80"
                >
                  {chip}
                </Badge>
              ))}
            </div>
            <div className="mt-6 grid gap-3 text-xs text-muted-foreground">
              {explorationSteps.map((step) => (
                <div key={step} className={surfacePanelClass}>
                  {step}
                </div>
              ))}
            </div>
          </div>
          <div className={sectionCardClass}>
            <h3 className="text-2xl font-semibold">Résumé, refined</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Suggestions land in the editor. Refine quickly, save with
              confidence, and rerun matches.
            </p>
            <div className="mt-6 grid gap-3">
              {resumeSteps.map((step, index) => (
                <div
                  key={step}
                  className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 dark:border-amber-200/10 dark:bg-slate-950/50"
                >
                  <span className={miniStepBadgeClass}>{index + 1}</span>
                  <p className="text-xs text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-8">
          <div className="flex flex-col gap-3">
            <h2 className="heading-lg text-gradient-subtle">
              Engineered for flow
            </h2>
            <p className="text-pretty text-base text-muted-foreground">
              Quiet systems keep everything reliable and fast.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className={sectionCardClass}>
              <h3 className="text-2xl font-semibold">Reliability, built in</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Checkpointed stages and durable queues keep the pipeline moving.
              </p>
              <div className="mt-6 grid gap-4">
                {durabilityHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-border/60 bg-background/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-amber-200/10 dark:bg-slate-950/55 dark:shadow-amber-500/10 dark:hover:shadow-amber-500/20"
                  >
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className={sectionCardClass}>
              <h3 className="text-2xl font-semibold">Live visibility</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Results arrive as they are ready, with progress always visible.
              </p>
              <div className="mt-6 space-y-4">
                {streamingHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 dark:border-amber-200/10 dark:bg-slate-950/55"
                  >
                    <span className="mt-1 h-2 w-2 rounded-full bg-amber-400/80 dark:bg-amber-300/90" />
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
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-linear-to-br from-amber-500/12 via-transparent to-yellow-500/10 px-6 py-12 text-center shadow-lg dark:border-amber-200/10 dark:from-amber-400/20 dark:via-transparent dark:to-amber-200/12 dark:shadow-amber-500/15 sm:px-10">
          <h2 className="heading-md text-balance">
            Ready when you are.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            Upload your résumé and watch the matches arrive in real time.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className={primaryCtaClass}>
              <Link href="/signin">
                Get started
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className={secondaryCtaClass}
            >
              <Link href="#workflow">See the flow</Link>
            </Button>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-4 border-t border-border/60 pt-8 text-sm text-muted-foreground dark:border-amber-200/10 sm:flex-row sm:justify-between">
          <span>{siteConfig.name} | Résumé to matches</span>
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

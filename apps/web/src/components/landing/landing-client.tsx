'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { DragonLines } from '~/components/ornaments/dragon-lines';
import { Button } from '~/components/ui/button';
import { GitHub, LinkedIn, Mail, X } from '~/components/ui/icons';
import { authClient } from '~/lib/auth/client';
import { siteConfig } from '~/lib/site';
import { trpc } from '~/lib/trpc';

const glowOrbs = [
  'pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-stone-400/14 via-stone-300/6 to-transparent blur-3xl dark:from-slate-400/12 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-stone-500/16 via-zinc-400/8 to-transparent blur-3xl dark:from-zinc-400/16 dark:via-slate-300/8 dark:to-transparent',
  'pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-amber-400/10 via-stone-300/6 to-transparent blur-3xl dark:from-amber-200/8 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-neutral-500/12 via-stone-400/6 to-transparent blur-3xl dark:from-stone-300/10 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-amber-300/10 via-amber-200/5 to-transparent blur-3xl dark:from-amber-200/8 dark:via-amber-100/4 dark:to-transparent',
];

const featureHighlights = [
  {
    title: 'Focused profile',
    description: 'Turn your résumé into a clear, searchable profile.',
  },
  {
    title: 'Live matching',
    description:
      'Matches arrive as each stage finishes, not in a nightly batch.',
  },
  {
    title: 'Curated control',
    description: 'Filter, compare, and save roles without losing context.',
  },
];

const workflowSteps = [
  {
    title: 'Upload',
    description: 'Start with your résumé.',
  },
  {
    title: 'Focus',
    description: 'We map experience, preferences, and goals.',
  },
  {
    title: 'Match',
    description: 'Roles align to your criteria.',
  },
  {
    title: 'Stream',
    description: 'Matches arrive with context as they are ready.',
  },
];

const detailBlocks = [
  {
    eyebrow: 'Explore with clarity',
    title: 'Everything you need to compare roles, in one view.',
    description:
      'Filters, notes, and saved views stay pinned as the stream updates.',
    items: [
      'Single view for filters and notes.',
      'Results refresh as you refine.',
      'Saved views for quick return.',
    ],
  },
  {
    eyebrow: 'Refine the résumé',
    title: 'Make edits with guidance, not guesswork.',
    description: 'Inline suggestions and checks keep your story tight.',
    items: [
      'Inline suggestions as you edit.',
      'Quick checks before you rerun matches.',
      'Snapshots to compare and recover.',
    ],
  },
];

const reliabilitySections = [
  {
    title: 'Durability by default',
    description:
      'Checkpointed stages keep progress steady even when data is messy.',
    items: [
      'Checkpointed stages keep flow intact.',
      'Automatic retries for small hiccups.',
      'Independent queues for discovery and analysis.',
    ],
  },
  {
    title: 'Progress stays visible',
    description: 'Every match shows where it sits and what comes next.',
    items: [
      'Queued → running → delivered at a glance.',
      'Live results as each stage finishes.',
      'Organized output for filtering and search.',
    ],
  },
];

const socialLinks = [
  { href: siteConfig.links.x, label: 'X', icon: X },
  { href: siteConfig.links.github, label: 'GitHub', icon: GitHub },
  { href: siteConfig.links.linkedin, label: 'LinkedIn', icon: LinkedIn },
  { href: `mailto:${siteConfig.links.mail}`, label: 'Email', icon: Mail },
];

const trustMarks = [
  'Talent teams',
  'Career coaches',
  'Product orgs',
  'Founders',
  'Studios',
];

const primaryCtaClass =
  'group px-8 py-4 text-base font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 dark:shadow-amber-500/30 dark:hover:shadow-amber-400/45';
const sectionCardClass =
  'rounded-3xl border border-border/50 bg-background/70 p-8 shadow-sm dark:border-amber-200/10 dark:bg-slate-950/55';
const featureCardClass =
  'rounded-2xl border border-border/50 bg-background/60 p-6 shadow-sm dark:border-amber-200/10 dark:bg-slate-950/55';
const surfacePanelClass =
  'rounded-2xl border border-border/50 bg-background/60 px-4 py-3 text-[13px] font-medium tracking-tight text-muted-foreground dark:border-amber-200/10 dark:bg-slate-950/50 dark:text-amber-100/70';
const smallDescriptionClass =
  'text-[13.5px] font-medium tracking-tight text-muted-foreground';
const stepBadgeClass =
  'flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary dark:bg-amber-500/15 dark:text-amber-100/90';
const miniStepBadgeClass =
  'flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary dark:bg-amber-500/15 dark:text-amber-100/90';
const serifDisplayClass =
  "font-['Perfectly_Nineties',serif] font-normal tracking-[-0.06em]";
const serifSectionClass =
  "font-['Perfectly_Nineties',serif] font-normal tracking-[-0.06em]";
const eyebrowClass =
  'text-xs font-semibold uppercase tracking-[0.32em] text-muted-foreground';
const tagClass =
  'rounded-full border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-medium tracking-[-0.01em] text-muted-foreground dark:border-amber-200/10 dark:bg-slate-950/60 dark:text-amber-100/80';
const heroTitleClass = `mx-auto max-w-5xl text-[clamp(2.9rem,6.8vw,5.8rem)] leading-[0.95] ${serifDisplayClass}`;
const heroDescriptionClass =
  'mx-auto max-w-2xl text-pretty text-[17px] leading-[1.6] text-muted-foreground sm:text-lg';
const sectionTitleClass = `text-[clamp(2.1rem,4.6vw,3.6rem)] leading-[1.05] ${serifSectionClass}`;
const sectionDescriptionClass =
  'mx-auto max-w-2xl text-pretty text-base text-muted-foreground';
const finaleGlowClass =
  'pointer-events-none absolute left-1/2 top-[-40%] h-[180%] w-[150%] -translate-x-1/2 rounded-[999px] bg-linear-to-b from-stone-400/10 via-stone-300/4 to-transparent blur-3xl opacity-60 dark:from-slate-400/8 dark:via-slate-300/3 dark:opacity-30';
const ctaPanelClass =
  'relative isolate flex flex-col items-center gap-4 py-12 text-center sm:py-14';
const ctaOrbClass =
  'pointer-events-none absolute left-1/2 top-1/2 -z-10 h-56 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-b from-stone-400/8 via-stone-300/4 to-transparent blur-3xl opacity-60 dark:from-slate-400/7 dark:via-slate-300/3 dark:opacity-30';

const SectionHeader = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center gap-3 text-center">
    <p className={`${eyebrowClass} w-fit`}>{eyebrow}</p>
    <h2 className={`text-gradient-subtle ${sectionTitleClass}`}>{title}</h2>
    <p className={sectionDescriptionClass}>{description}</p>
  </div>
);

export function LandingClient() {
  const { data: session } = authClient.useSession();
  const {
    data: healthCheck,
    isLoading,
    error,
  } = useQuery(trpc.healthCheck.queryOptions());
  const firstName = session?.user?.name?.split(' ')[0];
  const statusText = error
    ? 'Pipeline: offline'
    : isLoading
      ? 'Checking pipeline...'
      : healthCheck
        ? `Pipeline: ${healthCheck}`
        : 'Pipeline: unavailable';
  const greeting = firstName
    ? `Welcome back, ${firstName}.`
    : 'Curated matches, always in motion.';

  return (
    <div className="relative min-h-full bg-background" data-landing-root>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {glowOrbs.map((className, index) => (
          <div key={`glow-${index}`} className={className} aria-hidden="true" />
        ))}
        <DragonLines className="opacity-80" />
        <DragonLines className="top-auto bottom-[-180px] opacity-70" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-28 px-6 pb-20 pt-12 lg:px-10">
        <header className="flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 shadow-sm dark:border-amber-200/20 dark:bg-slate-950/60">
              <img
                src="/favicon.svg"
                alt={`${siteConfig.name} mark`}
                className="h-6 w-6 opacity-90"
              />
            </div>
            <span className="text-sm font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>
        </header>

        <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center lg:gap-10">
          <div className="space-y-6">
            <p className={`${eyebrowClass} mx-auto w-fit`}>
              Career matching, refined
            </p>
            <h1 className={`text-balance ${heroTitleClass}`}>
              The matching workspace for focused career moves.
            </h1>
            <p className={heroDescriptionClass}>
              Save thousands of hours searching and applying to roles you don't
              fit.
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className={primaryCtaClass}>
              <Link href="/signin">
                Get started
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 dark:border-amber-200/10 dark:bg-slate-950/60 dark:text-amber-100/80">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 dark:bg-emerald-300/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-300" />
              </span>
              {statusText}
            </span>
            <span>{greeting}</span>
          </div>
        </section>

        <section id="momentum" className="grid gap-10 scroll-mt-24">
          <SectionHeader
            eyebrow="Designed for focus"
            title="Move with clarity, not noise."
            description="Every step stays crisp, calm, and deliberate."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {featureHighlights.map((item) => (
              <div key={item.title} className={featureCardClass}>
                <h3 className={`text-xl ${serifSectionClass}`}>{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="workflow" className="grid gap-10 scroll-mt-24">
          <SectionHeader
            eyebrow="The flow"
            title="Four steps, always in motion."
            description="From resume to matches in a steady stream."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="group relative overflow-hidden rounded-2xl border border-border/50 bg-background/60 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-amber-200/10 dark:bg-slate-950/60 dark:hover:shadow-amber-500/20"
              >
                <div className="flex items-center gap-3">
                  <span className={stepBadgeClass}>{`0${index + 1}`}</span>
                  <h3 className={`text-lg ${serifSectionClass}`}>
                    {step.title}
                  </h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {step.description}
                </p>
                <div className="mt-4 h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          {detailBlocks.map((block) => (
            <div key={block.title} className={sectionCardClass}>
              <p className={eyebrowClass}>{block.eyebrow}</p>
              <h3 className={`mt-3 text-2xl text-balance ${serifSectionClass}`}>
                {block.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                {block.description}
              </p>
              <div className="mt-6 grid gap-3">
                {block.items.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 py-3 dark:border-amber-200/10 dark:bg-slate-950/50"
                  >
                    <span className={miniStepBadgeClass}>{index + 1}</span>
                    <p className={smallDescriptionClass}>{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section id="reliability" className="grid gap-10 scroll-mt-24">
          <SectionHeader
            eyebrow="Reliability"
            title="Engineered for steady progress."
            description="Quiet systems keep the stream moving even when the data is messy."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {reliabilitySections.map((section) => (
              <div key={section.title} className={sectionCardClass}>
                <h3 className={`text-2xl ${serifSectionClass}`}>
                  {section.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {section.description}
                </p>
                <div className="mt-6 grid gap-4">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-2xl border border-border/60 bg-background/70 p-4 dark:border-amber-200/10 dark:bg-slate-950/55"
                    >
                      <span className="mt-1 h-2 w-2 rounded-full bg-amber-400/80 dark:bg-amber-300/90" />
                      <p className={smallDescriptionClass}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="relative isolate flex flex-col gap-10">
          <div aria-hidden="true" className={finaleGlowClass} />
          <section className={ctaPanelClass}>
            <div aria-hidden="true" className={ctaOrbClass} />
            <h2 className={`heading-md text-balance ${serifSectionClass}`}>
              Ready for your next adventure?
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground">
              Start with a focused profile, then let the matching run in the
              background.
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
            </div>
          </section>

          <footer className="relative grid gap-8 border-t border-border/60 pt-8 text-sm text-muted-foreground dark:border-amber-200/10 sm:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 flex flex-col gap-4 text-center sm:text-left">
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background/70 shadow-sm dark:border-amber-200/20 dark:bg-slate-950/60">
                  <img
                    src="/favicon.svg"
                    alt={`${siteConfig.name} mark`}
                    className="h-6 w-6 opacity-90"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">
                    {siteConfig.name}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Calm matching, deliberate moves.
              </p>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-4 sm:items-end">
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
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

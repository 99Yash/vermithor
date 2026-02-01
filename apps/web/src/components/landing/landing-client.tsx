'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { DragonLines } from '~/components/ornaments/dragon-lines';
import { Button } from '~/components/ui/button';
import { GitHub, LinkedIn, Mail, X } from '~/components/ui/icons';
import { siteConfig } from '~/lib/site';

const glowOrbs = [
  'pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-stone-400/14 via-stone-300/6 to-transparent blur-3xl dark:from-slate-400/12 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-stone-500/16 via-zinc-400/8 to-transparent blur-3xl dark:from-zinc-400/16 dark:via-slate-300/8 dark:to-transparent',
  'pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-amber-400/10 via-stone-300/6 to-transparent blur-3xl dark:from-amber-200/8 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-neutral-500/12 via-stone-400/6 to-transparent blur-3xl dark:from-stone-300/10 dark:via-slate-300/6 dark:to-transparent',
  'pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-amber-300/10 via-amber-200/5 to-transparent blur-3xl dark:from-amber-200/8 dark:via-amber-100/4 dark:to-transparent',
];

const promiseSteps = [
  {
    number: '01',
    title: 'Upload your resume',
    description:
      'We read between the lines—skills you forgot to mention, experience that translates, potential you undersold.',
  },
  {
    number: '02',
    title: 'Match to real roles',
    description:
      'Not job board spam. Positions where your background actually gives you an edge.',
  },
  {
    number: '03',
    title: 'Apply with confidence',
    description:
      'Know exactly why you\'re a fit before you click send.',
  },
];

const socialLinks = [
  { href: siteConfig.links.x, label: 'X', icon: X },
  { href: siteConfig.links.github, label: 'GitHub', icon: GitHub },
  { href: siteConfig.links.linkedin, label: 'LinkedIn', icon: LinkedIn },
  { href: `mailto:${siteConfig.links.mail}`, label: 'Email', icon: Mail },
];

const mockMatchCards = [
  {
    title: 'Senior Frontend Engineer',
    company: 'Stripe',
    matchPercent: 94,
  },
  {
    title: 'Staff Software Engineer',
    company: 'Vercel',
    matchPercent: 91,
  },
  {
    title: 'Product Engineer',
    company: 'Linear',
    matchPercent: 88,
  },
];

const primaryCtaClass =
  'group px-8 py-4 text-base font-semibold tracking-tight shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 dark:shadow-amber-500/30 dark:hover:shadow-amber-400/45 cta-pulse';
const serifDisplayClass =
  "font-['Perfectly_Nineties',serif] font-normal tracking-[-0.06em]";
const serifSectionClass =
  "font-['Perfectly_Nineties',serif] font-normal tracking-[-0.06em]";
const heroTitleClass = `mx-auto max-w-4xl text-[clamp(2.6rem,6vw,5rem)] leading-[1.05] ${serifDisplayClass}`;
const heroDescriptionClass =
  'mx-auto max-w-xl text-pretty tracking-tight text-[15px] leading-[1.65] text-muted-foreground sm:text-lg';
const heroOrbClass =
  'pointer-events-none absolute left-1/2 top-0 -z-10 h-[480px] w-[600px] -translate-x-1/2 -translate-y-[30%] rounded-full bg-linear-to-b from-amber-300/18 via-stone-200/8 to-transparent blur-3xl opacity-80 dark:from-amber-200/14 dark:via-slate-200/6 dark:opacity-50';
const sectionTitleClass = `text-[clamp(2rem,4.2vw,3.2rem)] leading-[1.1] ${serifSectionClass}`;
const finaleGlowClass =
  'pointer-events-none absolute left-1/2 top-[-40%] h-[180%] w-[150%] -translate-x-1/2 rounded-[999px] bg-linear-to-b from-stone-400/10 via-stone-300/4 to-transparent blur-3xl opacity-60 dark:from-slate-400/8 dark:via-slate-300/3 dark:opacity-30';
const ctaPanelClass =
  'relative isolate flex flex-col items-center gap-4 py-12 text-center sm:py-14';
const ctaOrbClass =
  'pointer-events-none absolute left-1/2 top-1/2 -z-10 h-56 w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-linear-to-b from-stone-400/8 via-stone-300/4 to-transparent blur-3xl opacity-60 dark:from-slate-400/7 dark:via-slate-300/3 dark:opacity-30';
const revealStyle = (delayMs: number): CSSProperties =>
  ({ '--reveal-delay': `${delayMs}ms` }) as CSSProperties;

const PrimaryCtaButton = ({ showMicroCopy = false }: { showMicroCopy?: boolean }) => (
  <div className="flex flex-col items-center gap-3">
    <Button asChild size="lg" className={primaryCtaClass}>
      <Link href="/signin">
        Start matching
        <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">
          →
        </span>
      </Link>
    </Button>
    {showMicroCopy && (
      <p className="text-xs text-muted-foreground/80 tracking-tight">
        Free to try. No credit card. 2 minutes to your first match.
      </p>
    )}
  </div>
);

const ProductPreviewMockup = () => (
  <div
    className="relative mt-8 w-full max-w-md mx-auto landing-reveal"
    style={revealStyle(520)}
  >
    <div className="relative transform perspective-1000 rotate-x-2 hover:rotate-x-0 transition-transform duration-500">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent rounded-2xl blur-xl" />
      <div className="relative space-y-3 rounded-2xl border border-border/40 bg-background/80 p-4 shadow-2xl shadow-amber-500/10 backdrop-blur-sm dark:border-amber-200/10 dark:bg-slate-950/70 dark:shadow-amber-400/15">
        {mockMatchCards.map((card, index) => (
          <div
            key={card.title}
            className={`flex items-center justify-between rounded-xl border border-border/50 bg-background/60 px-4 py-3 transition-all duration-300 dark:border-amber-200/5 dark:bg-slate-900/50 ${
              index === 0 ? 'ring-1 ring-amber-500/20 dark:ring-amber-400/30' : ''
            }`}
            style={{ opacity: 1 - index * 0.12 }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground/90">
                {card.title}
              </span>
              <span className="text-xs text-muted-foreground">{card.company}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                {card.matchPercent}%
              </span>
              <span className="text-xs text-muted-foreground/70">match</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PromiseStep = ({
  step,
  index,
}: {
  step: (typeof promiseSteps)[0];
  index: number;
}) => (
  <div
    className="promise-step group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-background/60 p-6 transition-all duration-300 dark:border-amber-200/10 dark:bg-slate-950/55 landing-reveal"
    style={revealStyle(600 + index * 100)}
  >
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
        {step.number}
      </span>
      <h3 className={`text-xl ${serifSectionClass}`}>{step.title}</h3>
    </div>
    <p className="text-[14px] leading-relaxed text-muted-foreground pl-[60px]">
      {step.description}
    </p>
  </div>
);

export function LandingClient() {
  return (
    <div className="relative min-h-full bg-background" data-landing-root>
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {glowOrbs.map((className, index) => (
          <div key={`glow-${index}`} className={className} aria-hidden="true" />
        ))}
        <DragonLines className="opacity-90" primaryClassName="opacity-80" />
        <DragonLines className="top-auto bottom-[-180px] opacity-70" />
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-32 px-6 pb-20 pt-12 lg:px-10">
        {/* Header */}
        <header
          className="flex items-center justify-between gap-6 landing-reveal"
          style={revealStyle(40)}
        >
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

        {/* Hero Section */}
        <section className="relative isolate mx-auto flex max-w-4xl flex-col items-center gap-8 text-center lg:gap-10">
          <div aria-hidden="true" className={heroOrbClass} />
          <div className="space-y-6">
            <h1
              className={`text-balance ${heroTitleClass} landing-reveal`}
              style={revealStyle(120)}
            >
              <span className="text-gradient-subtle">AI should land you jobs.</span>
              <br />
              <span className="text-gradient-brand">Not take them.</span>
            </h1>
            <p
              className={`${heroDescriptionClass} landing-reveal`}
              style={revealStyle(200)}
            >
              While everyone worries about AI taking jobs, you'll use it to find yours.
              <br className="hidden sm:block" />
              Upload your resume. Get matched to roles that actually fit.
            </p>
          </div>
          <div
            className="flex flex-col items-center justify-center gap-4 landing-reveal"
            style={revealStyle(280)}
          >
            <PrimaryCtaButton showMicroCopy />
          </div>
          <ProductPreviewMockup />
        </section>

        {/* The Promise Section */}
        <section id="promise" className="grid gap-12 scroll-mt-24">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2
              className={`text-gradient-subtle ${sectionTitleClass} landing-reveal`}
              style={revealStyle(500)}
            >
              Three steps. Zero guesswork.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {promiseSteps.map((step, index) => (
              <PromiseStep key={step.title} step={step} index={index} />
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <div className="relative isolate flex flex-col gap-10">
          <div aria-hidden="true" className={finaleGlowClass} />
          <section className={ctaPanelClass}>
            <div aria-hidden="true" className={ctaOrbClass} />
            <h2
              className={`text-gradient-subtle text-balance ${sectionTitleClass} landing-reveal`}
              style={revealStyle(900)}
            >
              Your next role is waiting.
            </h2>
            <p
              className="mt-2 text-pretty text-base text-muted-foreground landing-reveal"
              style={revealStyle(980)}
            >
              Most users see their first matches within 2 minutes.
            </p>
            <div
              className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row landing-reveal"
              style={revealStyle(1060)}
            >
              <PrimaryCtaButton />
            </div>
          </section>

          {/* Footer */}
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
                AI-powered career matching.
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
                      aria-label={link.label}
                      title={link.label}
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

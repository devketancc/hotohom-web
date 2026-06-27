'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { FleetProgressionHero } from '@/components/fleet/redesign/FleetProgressionHero';
import { FleetTierLadder } from '@/components/fleet/redesign/FleetTierLadder';
import { FleetClassChapter } from '@/components/fleet/redesign/FleetClassChapter';
import { FleetComparison } from '@/components/fleet/redesign/FleetComparison';
import { FleetSharedFeatures } from '@/components/fleet/redesign/FleetSharedFeatures';
import { getFleetClassesInOrder } from '@/config/fleet-classes';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';
import type { FleetClassSummary } from '@/types/fleet';

export default function FleetPage() {
  const { classes, isError, refetch } = useFleetCatalog();

  // Editorial content is local + always available; real API stats merge in by code.
  const orderedClasses = useMemo(() => getFleetClassesInOrder(), []);

  const summaryByCode = useMemo<Record<string, FleetClassSummary | null>>(() => {
    const map: Record<string, FleetClassSummary | null> = {};
    for (const c of classes) {
      map[c.klass.code.toUpperCase()] = c;
    }
    return map;
  }, [classes]);

  return (
    <main className="min-h-screen bg-surface-0 text-ink">
      <Navbar />

      <FleetProgressionHero classCount={orderedClasses.length} />

      <FleetTierLadder classes={orderedClasses} />

      {isError && (
        <div className="mx-auto mt-6 flex max-w-2xl items-center justify-between gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4">
          <span className="inline-flex items-center gap-2 font-body text-sm text-ink-muted">
            <AlertCircle className="size-4 text-red-400" />
            Live availability and unit counts could not load. Class details below
            still apply.
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <RefreshCw className="size-3.5" /> Retry
          </button>
        </div>
      )}

      {orderedClasses.map((content) => (
        <FleetClassChapter
          key={content.code}
          content={content}
          summary={summaryByCode[content.code] ?? null}
        />
      ))}

      <FleetComparison classes={orderedClasses} summaryByCode={summaryByCode} />

      <FleetSharedFeatures />

      {/* Closing CTA */}
      <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24 md:py-28">
        <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-10 px-6 text-center md:px-12">
          <Reveal as="div" className="max-w-2xl">
            <span className="label-mono text-gold">The next chapter</span>
            <h2 className="mt-5 font-heading text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink">
              Found your class? Pair it with a journey.
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-ink-muted">
              Designed routes, hand-picked stops, and crew who know the road,
              built around the class you choose.
            </p>
          </Reveal>
          <Reveal as="div" delay={0.12} className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.32}>
              <Link
                href="/packages"
                className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-ink shadow-glow-gold transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
              >
                Explore journeys
                <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <Link
              href="/select-caravan"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/90 transition-[transform,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
            >
              Check availability
              <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}

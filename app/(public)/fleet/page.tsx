'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { FleetStoryScroll, type FleetStoryScene } from '@/components/fleet/FleetStoryScroll';
import { getFleetExperience } from '@/config/fleet-experience';
import { buildFleetLandingScene } from '@/lib/fleet-story-scenes';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';

export default function FleetPage() {
  const { classes, isLoading, isError, refetch } = useFleetCatalog();

  const scenes = useMemo(() => {
    const out: FleetStoryScene[] = [];
    classes.forEach((summary, i) => {
      const exp = getFleetExperience(summary.klass.code);
      if (!exp) return;
      out.push(buildFleetLandingScene(summary, exp, i));
    });
    return out;
  }, [classes]);

  return (
    <main className="bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />

      <section className="section-ambient-warm relative border-b border-[var(--color-line)] pb-14 pt-36 md:pb-16 md:pt-44">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.08),transparent_55%)]" />
        <div className="relative mx-auto max-w-screen-xl px-6 md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/92">
              The MotoHom Fleet
            </span>
            <h1 className="mt-5 font-headline text-4xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-5xl lg:text-[3.35rem]">
              Four ways the road becomes home.
            </h1>
            <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-lg">
              From coastal loops to high-altitude circuits, each MotoHom class is built for a
              different way to move through the world, and a different way to arrive.
            </p>
          </Reveal>
        </div>
      </section>

      {isLoading && (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 py-24">
          <Loader2 className="size-10 animate-spin text-stitch-primary" />
          <span className="font-body text-sm text-stitch-on-surface-variant">Curating the fleet…</span>
        </div>
      )}

      {isError && (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-24 text-center">
          <AlertCircle className="size-10 text-red-400" />
          <p className="font-body text-stitch-on-surface-variant">Could not load the fleet right now.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:border-stitch-primary hover:text-stitch-primary"
          >
            <RefreshCw className="size-4" />
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && classes.length === 0 && (
        <p className="py-24 text-center font-body text-stitch-on-surface-variant px-6">
          No fleet classes available yet.
        </p>
      )}

      {!isLoading && !isError && scenes.length > 0 && (
        <FleetStoryScroll
          scenes={scenes}
          topEyebrow="The Fleet Experience"
          staticEyebrow="The Fleet Experience"
          staticTitle={`${classes.length === 4 ? 'Four' : String(classes.length)} silhouettes staged like home.`}
          scrollIntroRibbon={false}
          staticShowHeader={false}
        />
      )}

      <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24 md:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.08),transparent_55%)]" />
        <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-10 px-6 text-center md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
              The next chapter
            </span>
            <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
              Pair any class with a curated journey.
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-stitch-on-surface-variant/80">
              Designed routes, hand-picked stops, and concierge support — built around the silhouette you choose.
            </p>
          </Reveal>
          <Reveal as="div" delay={0.12} className="flex flex-wrap items-center justify-center gap-4">
            <MagneticButton strength={0.32}>
              <Link
                href="/packages"
                className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
              >
                Explore journeys
                <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
              </Link>
            </MagneticButton>
            <Link
              href="/select-caravan"
              className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-[transform,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] hover:text-stitch-on-background"
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

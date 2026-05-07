'use client';

import Link from 'next/link';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  PawPrint,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';
import type { FleetClassSummary } from '@/types/fleet';

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=2400&auto=format&fit=crop';

export default function FleetPage() {
  const { classes, isLoading, isError, refetch } = useFleetCatalog();

  return (
    <main className="bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />

      <section className="section-ambient-warm relative pt-36 pb-20 md:pt-44 md:pb-24">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          <Reveal as="div" className="max-w-3xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
              The Motohom Fleet
            </span>
            <h1 className="mt-6 font-headline text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-6xl lg:text-[4.25rem]">
              Four signatures.{' '}
              <span className="font-light italic text-stitch-primary-container/95">
                One way to move.
              </span>
            </h1>
            <p className="mt-8 max-w-xl font-body text-base leading-relaxed text-stitch-on-surface-variant/85 md:text-lg">
              Each class is a distinct expression of how the road can feel —
              compact and nimble, cinematic and spacious, family-soft, or
              quietly off-grid. Choose the silhouette that matches your kind of
              journey.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative pb-32 md:pb-40">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-10">
          {isLoading && (
            <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
              <Loader2 className="size-10 animate-spin text-stitch-primary" />
              <span className="font-body text-sm text-stitch-on-surface-variant">
                Curating the fleet…
              </span>
            </div>
          )}

          {isError && (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
              <AlertCircle className="size-10 text-red-400" />
              <p className="font-body text-stitch-on-surface-variant">
                Could not load the fleet right now.
              </p>
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
            <p className="py-16 text-center font-body text-stitch-on-surface-variant">
              No fleet classes available yet.
            </p>
          )}

          {!isLoading && !isError && classes.length > 0 && (
            <RevealStagger className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              {classes.map((summary) => (
                <RevealItem key={summary.klass.id}>
                  <FleetClassCard summary={summary} />
                </RevealItem>
              ))}
            </RevealStagger>
          )}
        </div>
      </section>

      <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-8 px-6 text-center md:px-10">
          <Reveal as="div" className="max-w-2xl">
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
              The next chapter
            </span>
            <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
              Pair any class with a curated journey.
            </h2>
            <p className="mt-5 font-body text-base leading-relaxed text-stitch-on-surface-variant/80">
              Designed routes, hand-picked stops, and concierge support — built
              around the silhouette you choose.
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

function FleetClassCard({ summary }: { summary: FleetClassSummary }) {
  const { klass, unitCount, coverImage } = summary;
  const cover = coverImage ?? FALLBACK_COVER;
  const amenityPreview = klass.amenities.slice(0, 3);

  return (
    <Link
      href={`/fleet/${klass.code}`}
      className="card-lift group block overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm transition-shadow duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-luxury-lg"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={cover}
          alt={klass.name}
          className="h-full w-full object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-stitch-background/55 via-transparent to-stitch-primary-container/12" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-stitch-background/85 to-transparent" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2 md:left-7 md:top-7">
          <span className="rounded-full border border-white/12 bg-stitch-background/40 px-4 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.22em] text-stitch-primary-container backdrop-blur-md">
            Class {klass.code}
          </span>
          {klass.is_pet_friendly && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/8 bg-black/40 px-3 py-1.5 font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
              <PawPrint className="size-3" />
              Pet friendly
            </span>
          )}
        </div>

        <div className="absolute inset-x-5 bottom-5 z-10 md:inset-x-7 md:bottom-7">
          <h3 className="font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-[2.25rem]">
            {klass.name}
          </h3>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-7 md:p-9">
        <p className="font-body text-base leading-relaxed text-stitch-on-surface-variant/85 line-clamp-3">
          {klass.description || 'A signature silhouette in the Motohom fleet.'}
        </p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--color-line)] pt-5 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-on-surface-variant/80">
          <span className="inline-flex items-center gap-2">
            <Users className="size-4 text-stitch-primary-container" />
            {klass.full_capacity} guests
          </span>
          {klass.capacity_pets > 0 && (
            <span className="inline-flex items-center gap-2">
              <PawPrint className="size-4 text-stitch-primary-container" />
              {klass.capacity_pets} pets
            </span>
          )}
          <span className="text-stitch-on-surface-variant/60">
            {unitCount} {unitCount === 1 ? 'unit' : 'units'} across hubs
          </span>
        </div>

        {amenityPreview.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {amenityPreview.map((amenity) => (
              <li
                key={amenity}
                className="inline-flex items-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/10 px-3 py-1.5 font-body text-[11px] font-medium tracking-wide text-stitch-primary-container"
              >
                {amenity}
              </li>
            ))}
            {klass.amenities.length > amenityPreview.length && (
              <li className="inline-flex items-center rounded-full border border-white/10 px-3 py-1.5 font-body text-[11px] font-medium tracking-wide text-stitch-on-surface-variant/70">
                +{klass.amenities.length - amenityPreview.length} more
              </li>
            )}
          </ul>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span className="font-headline text-[11px] font-semibold uppercase tracking-[0.24em] text-stitch-on-surface-variant/65">
            Discover {klass.name}
          </span>
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/12 text-stitch-primary-container transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-stitch-primary-container/45 group-hover:bg-stitch-primary-container/20">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

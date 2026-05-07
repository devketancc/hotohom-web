'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Loader2,
  MapPin,
  PawPrint,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import { RevealStagger, RevealItem } from '@/components/shared/RevealStagger';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { useFleetClass } from '@/hooks/useFleetClass';
import type { CaravanMediaItem } from '@/types/fleet';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1496950866446-3253e1470e8e?q=80&w=2400&auto=format&fit=crop';

export default function FleetClassDetailPage() {
  const params = useParams();
  const code = typeof params.code === 'string' ? params.code : '';

  const { summary, isLoading, isError, notFound, refetch } = useFleetClass(
    code || undefined
  );

  const galleryItems = useMemo<string[]>(() => {
    if (!summary) return [];
    const klassImages = summary.klass.media
      .filter((m: CaravanMediaItem) => m.media_type === 'image' && Boolean(m.url))
      .sort((a, b) => a.order - b.order)
      .map((m) => m.url);

    if (klassImages.length >= 4) return klassImages;
    const merged = [...klassImages, ...summary.unitThumbnails];
    return Array.from(new Set(merged));
  }, [summary]);

  const heroImage = summary?.coverImage ?? FALLBACK_HERO;

  return (
    <main className="bg-stitch-background text-stitch-on-background min-h-screen">
      <Navbar />

      {isLoading && (
        <div className="flex min-h-[80vh] items-center justify-center pt-28">
          <Loader2 className="size-10 animate-spin text-stitch-primary" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[60vh] items-center justify-center px-6 pt-32">
          <div className="flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-10 text-center">
            <AlertCircle className="size-10 text-red-400" />
            <p className="font-body text-stitch-on-surface-variant">
              Could not load this class right now.
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
        </div>
      )}

      {!isLoading && !isError && (notFound || !summary) && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 pt-28 text-center">
          <h1 className="font-headline text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Class not found
          </h1>
          <p className="max-w-md font-body text-stitch-on-surface-variant">
            We could not find a fleet class for{' '}
            <span className="font-semibold text-stitch-on-background">“{code}”</span>.
            It may be inactive or renamed.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:border-stitch-primary hover:text-stitch-primary"
          >
            <ArrowLeft className="size-4" />
            Back to fleet
          </Link>
        </div>
      )}

      {summary && (
        <>
          <section className="hero-vignette relative isolate min-h-[78svh] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt={summary.klass.name}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/55 to-stitch-background/15" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-stitch-background/65 via-stitch-background/10 to-transparent" />

            <div className="relative z-10 mx-auto flex min-h-[78svh] max-w-screen-2xl flex-col px-6 pb-16 pt-32 md:px-10 md:pb-20 md:pt-36">
              <div className="flex items-center justify-between">
                <Link
                  href="/fleet"
                  className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-stitch-background/40 px-4 py-2 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] text-stitch-on-background/80 backdrop-blur-md transition-colors hover:border-white/25 hover:text-stitch-on-background"
                >
                  <ArrowLeft className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5" />
                  All classes
                </Link>
                <span className="rounded-full border border-white/12 bg-stitch-background/40 px-4 py-2 font-headline text-[11px] font-semibold uppercase tracking-[0.28em] text-stitch-primary-container backdrop-blur-md">
                  Class {summary.klass.code}
                </span>
              </div>

              <div className="mt-auto max-w-3xl">
                <Reveal as="div" className="surface-glass rounded-[2rem] border border-white/8 px-7 py-8 md:px-10 md:py-10">
                  <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                    A signature silhouette
                  </span>
                  <h1 className="mt-5 font-headline text-5xl font-semibold leading-[0.98] tracking-[-0.035em] text-stitch-on-background md:text-6xl lg:text-[4.25rem]">
                    {summary.klass.name}
                  </h1>

                  <ul className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-3 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] text-stitch-on-surface-variant/80">
                    <li className="inline-flex items-center gap-2">
                      <Users className="size-4 text-stitch-primary-container" />
                      {summary.klass.full_capacity} guests
                    </li>
                    {summary.klass.capacity_pets > 0 && (
                      <li className="inline-flex items-center gap-2">
                        <PawPrint className="size-4 text-stitch-primary-container" />
                        {summary.klass.capacity_pets} pets
                      </li>
                    )}
                    {summary.klass.is_pet_friendly && (
                      <li className="inline-flex items-center gap-2 text-stitch-primary-container">
                        Pet friendly
                      </li>
                    )}
                    <li className="inline-flex items-center gap-2 text-stitch-on-surface-variant/65">
                      {summary.unitCount}{' '}
                      {summary.unitCount === 1 ? 'unit' : 'units'} in fleet
                    </li>
                  </ul>

                  <div className="mt-9 flex flex-wrap items-center gap-3">
                    <MagneticButton strength={0.32}>
                      <Link
                        href={`/packages?class=${summary.klass.code}`}
                        className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
                      >
                        Plan a journey
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
                  </div>
                </Reveal>
              </div>
            </div>
          </section>

          <section className="section-ambient-warm relative py-28 md:py-36">
            <div className="mx-auto max-w-screen-xl px-6 md:px-10">
              <div className="grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:gap-20">
                <Reveal as="div">
                  <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                    The character
                  </span>
                  <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                    Designed for a particular kind of road.
                  </h2>
                </Reveal>
                <Reveal as="div" delay={0.12}>
                  <p className="font-body text-lg leading-relaxed text-stitch-on-surface-variant/85 md:text-xl">
                    {summary.klass.description ||
                      'A signature silhouette in the Motohom fleet — quietly confident, unmistakably premium.'}
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {summary.klass.amenities.length > 0 && (
            <section className="relative border-t border-[var(--color-line)] py-24 md:py-32">
              <div className="mx-auto max-w-screen-xl px-6 md:px-10">
                <Reveal as="div" className="mb-12 max-w-2xl">
                  <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                    On board
                  </span>
                  <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                    Curated comforts.
                  </h2>
                </Reveal>
                <RevealStagger className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {summary.klass.amenities.map((amenity) => (
                    <RevealItem key={amenity}>
                      <span className="block rounded-full border border-stitch-primary-container/25 bg-stitch-primary-container/8 px-4 py-2.5 text-center font-body text-sm tracking-wide text-stitch-on-background/90 ring-1 ring-[var(--color-line)] transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-stitch-primary-container/45 hover:bg-stitch-primary-container/14">
                        {amenity}
                      </span>
                    </RevealItem>
                  ))}
                </RevealStagger>
              </div>
            </section>
          )}

          {galleryItems.length > 0 && (
            <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24 md:py-32">
              <div className="mx-auto max-w-screen-2xl">
                <div className="mb-10 px-6 md:mb-14 md:px-10">
                  <Reveal as="div" className="max-w-2xl">
                    <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                      In the wild
                    </span>
                    <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                      Through the lens.
                    </h2>
                  </Reveal>
                </div>
                <Reveal as="div">
                  <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:gap-7 md:px-10">
                    {galleryItems.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="card-lift relative aspect-[4/5] w-[78vw] flex-shrink-0 snap-start overflow-hidden rounded-[1.75rem] ring-1 ring-[var(--color-line)] sm:w-[52vw] md:w-[36vw] lg:w-[28vw]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`${summary.klass.name} — frame ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform duration-[1500ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.05]"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background/40 via-transparent to-transparent" />
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
            </section>
          )}

          {summary.units.length > 0 && (
            <section className="relative border-t border-[var(--color-line)] py-24 md:py-32">
              <div className="mx-auto max-w-screen-xl px-6 md:px-10">
                <Reveal as="div" className="mb-12 max-w-2xl">
                  <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                    Across the fleet
                  </span>
                  <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                    Units in service.
                  </h2>
                </Reveal>
                <RevealStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {summary.units.map((unit) => (
                    <RevealItem key={unit.id}>
                      <article className="card-lift flex h-full flex-col justify-between gap-5 rounded-2xl border border-[var(--color-line)] bg-white/[0.015] p-6">
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="font-headline text-lg font-semibold tracking-tight text-stitch-on-background">
                              {unit.name}
                            </h3>
                            {unit.is_available ? (
                              <span className="inline-flex items-center rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-headline text-[10px] font-semibold uppercase tracking-[0.18em] text-stitch-on-surface-variant/70">
                                On the road
                              </span>
                            )}
                          </div>
                          <p className="mt-2 font-body text-xs uppercase tracking-[0.22em] text-stitch-on-surface-variant/60">
                            {unit.registration_no}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-body text-sm text-stitch-on-surface-variant/85">
                          <span className="inline-flex items-center gap-2">
                            <CalendarDays className="size-4 text-stitch-primary-container/80" />
                            {unit.year}
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <MapPin className="size-4 text-stitch-primary-container/80" />
                            {unit.home_hub_name}
                          </span>
                        </div>
                      </article>
                    </RevealItem>
                  ))}
                </RevealStagger>
              </div>
            </section>
          )}

          <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-28">
            <div className="mx-auto max-w-screen-xl px-6 md:px-10">
              <Reveal as="div">
                <Link
                  href={`/packages?class=${summary.klass.code}`}
                  className="card-lift group flex flex-col gap-6 overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-white/[0.02] p-10 ring-1 ring-stitch-primary-container/15 transition-[border-color,box-shadow] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-stitch-primary-container/35 md:flex-row md:items-center md:justify-between md:p-14"
                >
                  <div className="max-w-2xl">
                    <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                      The next chapter
                    </span>
                    <h2 className="mt-4 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                      Curated journeys for Class {summary.klass.code}.
                    </h2>
                    <p className="mt-4 font-body text-base leading-relaxed text-stitch-on-surface-variant/80">
                      Hand-picked stops, considered pacing, and concierge
                      support — designed around this silhouette.
                    </p>
                  </div>
                  <span className="inline-flex size-14 flex-shrink-0 items-center justify-center rounded-full border border-stitch-primary-container/30 bg-stitch-primary-container/12 text-stitch-primary-container transition-[transform,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-stitch-primary-container/55 group-hover:bg-stitch-primary-container/22">
                    <ArrowUpRight className="size-5" />
                  </span>
                </Link>
              </Reveal>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}

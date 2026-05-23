'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import {
  FleetDetailGalleryMosaic,
  FleetDetailHero,
  FleetDetailIntro,
  FleetDetailSpecifications,
  FleetStoryScroll,
  FleetUnitsPresence,
} from '@/components/fleet';
import { MagneticButton } from '@/components/shared/MagneticButton';
import type { FleetClassCode } from '@/config/fleet-experience';
import { AMENITY_SMART_KEYS, getFleetExperience } from '@/config/fleet-experience';
import { buildFleetDetailSpecRows } from '@/lib/fleet-detail-specs';
import { buildFleetDetailScenes } from '@/lib/fleet-story-scenes';
import { buildFleetImagePlan } from '@/lib/fleet-media';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';
import { useFleetClass } from '@/hooks/useFleetClass';

const FALLBACK_HERO =
  'https://images.unsplash.com/photo-1496950866446-3253e1470e8e?q=80&w=2400&auto=format&fit=crop';

export default function FleetClassDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const { classes } = useFleetCatalog();
  const { summary, isLoading, isError, notFound, refetch } = useFleetClass(
    slug || undefined
  );

  const experience = useMemo(
    () => (summary ? getFleetExperience(summary.klass.code) : null),
    [summary]
  );

  const images = useMemo(() => {
    if (!summary) return null;
    return buildFleetImagePlan(summary, FALLBACK_HERO);
  }, [summary]);

  const smartHighlights = useMemo(() => {
    if (!summary) return [];
    return summary.klass.amenities
      .filter((a) => AMENITY_SMART_KEYS.test(a))
      .slice(0, 5);
  }, [summary]);

  const scenes = useMemo(() => {
    if (!summary || !experience || !images) return [];
    return buildFleetDetailScenes({
      summary,
      exp: experience,
      hero: images.hero,
      interior: images.interior,
      technology: images.technology,
      living: images.living,
      smartHighlights,
    });
  }, [summary, experience, images, smartHighlights]);

  const specRows = useMemo(() => {
    if (!summary || !experience) return [];
    return buildFleetDetailSpecRows(summary, experience.code as FleetClassCode);
  }, [summary, experience]);

  const specSideImages = useMemo((): [string, string] | null => {
    if (!images) return null;
    const g = images.gallery;
    if (g.length >= 2) return [g[1], g[0]];
    return [images.technology, images.hero];
  }, [images]);

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
          <div className="flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-24 text-center">
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

      {!isLoading && !isError && classes.length === 0 && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 pt-28 text-center">
          <h1 className="font-headline text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Fleet coming soon
          </h1>
          <p className="max-w-md font-body text-stitch-on-surface-variant">
            No fleet classes are available yet. Please check back shortly.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:border-stitch-primary hover:text-stitch-primary"
          >
            <ArrowLeft className="size-4" />
            Home
          </Link>
        </div>
      )}

      {!isLoading &&
        !isError &&
        classes.length > 0 &&
        (notFound || !summary || !experience || !images) && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 pt-28 text-center">
            <h1 className="font-headline text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
              Fleet experience not found
            </h1>
            <p className="max-w-md font-body text-stitch-on-surface-variant">
              We couldn&apos;t match{' '}
              <span className="font-semibold text-stitch-on-background">&ldquo;{slug}&rdquo;</span> to
              an active MotoHom silhouette.
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

      {summary && experience && images && scenes.length > 0 && specSideImages && (
        <>
          <FleetDetailHero
            imageUrl={images.hero}
            imageAlt={`${experience.headline} — fleet hero`}
            title={experience.headline}
            seriesLabel={experience.seriesLabel}
            slug={experience.slug}
          />

          <FleetDetailIntro
            summary={summary}
            displayName={experience.headline}
            tagline={experience.sections.heroTagline}
            heroSecondaryUrl={images.interior}
            heroSecondaryAlt={`${experience.headline} — exterior and living volume`}
          />

          <section className="border-b border-[var(--color-line)] bg-stitch-background/90">
            <div className="mx-auto flex max-w-screen-xl flex-wrap gap-3 px-6 py-8 md:gap-4 md:px-10">
              <MagneticButton strength={0.32}>
                <Link
                  href={`/packages?class=${summary.klass.code}`}
                  className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-6 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
                >
                  Plan a journey
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                </Link>
              </MagneticButton>
              <Link
                href="/select-caravan"
                className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-6 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-[transform,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04]"
              >
                Availability
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </section>

          <FleetStoryScroll
            scenes={scenes}
            topEyebrow={experience.seriesLabel}
            staticEyebrow={experience.seriesLabel}
            staticTitle={`The ${experience.headline} story`}
            scrollIntroRibbon={false}
            staticShowHeader={false}
          />

          <FleetDetailGalleryMosaic
            id="fleet-gallery"
            eyebrow="Gallery"
            title="Interior architecture, road presence, and the quiet details that define this class."
            images={images.gallery}
            imageBaseAlt={experience.headline}
          />

          <FleetDetailSpecifications
            rows={specRows}
            sideImages={specSideImages}
            imageAltBase={experience.headline}
          />

          <section className="relative border-y border-[var(--color-line)] bg-stitch-background py-14 md:py-16">
            <div className="mx-auto flex max-w-screen-xl flex-col gap-6 px-6 md:flex-row md:items-center md:justify-between md:px-10">
              <div className="max-w-xl">
                <h3 className="font-headline text-lg font-semibold tracking-[-0.02em] text-stitch-on-background md:text-xl">
                  Hubs & journey coverage
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-stitch-on-surface-variant/85 md:text-[0.9375rem]">
                  Explore how this silhouette rotates through MotoHom depots and the routes we stage
                  for multi-day charters.
                </p>
              </div>
              <Link
                href="/journey/map"
                className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-white/15 px-6 py-3 font-headline text-[11px] font-semibold uppercase tracking-[0.2em] text-stitch-on-background/92 transition-colors hover:border-stitch-primary-container/35 hover:text-stitch-primary-container"
              >
                Open journey map
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </section>

          <FleetUnitsPresence
            unitNames={summary.units.map((u) => u.name)}
            count={summary.unitCount}
          />

          <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24 md:py-28">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.08),transparent_55%)]" />
            <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-10 px-6 text-center md:px-10">
              <Reveal as="div" className="max-w-2xl">
                <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/90">
                  {experience.sections.ctaEyebrow}
                </span>
                <h2 className="mt-5 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                  {experience.sections.ctaTitle}
                </h2>
                <p className="mt-5 font-body text-base leading-relaxed text-stitch-on-surface-variant/80">
                  {experience.sections.ctaBody}
                </p>
              </Reveal>
              <Reveal as="div" delay={0.08} className="flex flex-wrap items-center justify-center gap-4">
                <MagneticButton strength={0.32}>
                  <Link
                    href={`/packages?class=${summary.klass.code}`}
                    className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06]"
                  >
                    Curated journeys
                    <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                  </Link>
                </MagneticButton>
                <Link
                  href="/select-caravan"
                  className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-[transform,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04]"
                >
                  Check availability
                  <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
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

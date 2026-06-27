'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Loader2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Reveal } from '@/components/shared/Reveal';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { FleetDetailCover } from '@/components/fleet/redesign/FleetDetailCover';
import { FleetDetailGallery } from '@/components/fleet/redesign/FleetDetailGallery';
import { FleetDetailSpecs, type SpecRow } from '@/components/fleet/redesign/FleetDetailSpecs';
import { FleetViceroyExperience } from '@/components/fleet/redesign/FleetViceroyExperience';
import { getFleetClassContent } from '@/config/fleet-classes';
import { EDITORIAL_BY_CODE } from '@/lib/fleet-detail-specs';
import { getFleetImageList } from '@/lib/fleet-media';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';
import { useFleetClass } from '@/hooks/useFleetClass';
import { cn } from '@/lib/utils';

// Local stand-in frames used when a class has no marketing media yet. Real
// MotoHom photography — clearly surfaced as placeholders by <MediaSlot>.
const FALLBACK_IMAGES = [
  '/exp-case/mh1.png',
  '/exp-case/mh2.png',
  '/exp-case/mh3.png',
  '/exp-case/mh4.png',
  '/exp-case/mh5.png',
];

export default function FleetClassDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug : '';

  const { classes } = useFleetCatalog();
  const { summary, isLoading, isError, notFound, refetch } = useFleetClass(
    slug || undefined
  );

  const content = useMemo(
    () => (summary ? getFleetClassContent(summary.klass.code) : null),
    [summary]
  );

  const media = useMemo(() => {
    if (!summary || !content) return null;
    const realImages = getFleetImageList(summary);
    const imagesArePlaceholder = realImages.length === 0;
    const images = imagesArePlaceholder
      ? [content.fallbackImage, ...FALLBACK_IMAGES.filter((f) => f !== content.fallbackImage)]
      : realImages;
    const video =
      summary.klass.media.find((m) => m.media_type === 'video' && m.url)?.url ?? null;
    const tour360 =
      summary.klass.media.find((m) => m.media_type === 'tour360' && m.url)?.url ?? null;
    return { images, video, tour360, imagesArePlaceholder };
  }, [summary, content]);

  const specGroups = useMemo(() => {
    if (!summary || !content) return null;
    const { klass, units } = summary;
    const hubs = [...new Set(units.map((u) => u.home_hub_name).filter(Boolean))].sort();
    const hubLine =
      hubs.length === 0
        ? 'MotoHom network'
        : hubs.length <= 3
          ? hubs.join(' · ')
          : `${hubs.slice(0, 2).join(' · ')} · +${hubs.length - 2} more`;

    const confirmed: SpecRow[] = [
      { label: 'Class', value: `${content.classLabel} · ${content.name}` },
      { label: 'Guest capacity', value: `Up to ${klass.full_capacity} guests` },
      {
        label: 'Pet policy',
        value: klass.is_pet_friendly
          ? `Up to ${klass.capacity_pets} pet${klass.capacity_pets === 1 ? '' : 's'}`
          : 'Not on this class',
      },
      { label: 'Hub presence', value: hubLine },
    ];

    const toConfirm: SpecRow[] = EDITORIAL_BY_CODE[content.code] ?? [];
    return { confirmed, toConfirm };
  }, [summary, content]);

  const ready = summary && content && media && specGroups;

  return (
    <main className="min-h-screen bg-surface-0 text-ink">
      <Navbar />

      {isLoading && (
        <div className="flex min-h-[80vh] items-center justify-center pt-28">
          <Loader2 className="size-10 animate-spin text-gold" />
        </div>
      )}

      {isError && (
        <div className="flex min-h-[60vh] items-center justify-center px-6 pt-32">
          <div className="flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/5 px-6 py-24 text-center">
            <AlertCircle className="size-10 text-red-400" />
            <p className="font-body text-ink-muted">Could not load this class right now.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm font-bold uppercase tracking-wider transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              <RefreshCw className="size-4" /> Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && (notFound || (classes.length > 0 && !ready)) && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 pt-28 text-center">
          <h1 className="font-heading text-3xl font-semibold tracking-[-0.02em] md:text-4xl">
            Fleet class not found
          </h1>
          <p className="max-w-md font-body text-ink-muted">
            We couldn&apos;t match{' '}
            <span className="font-semibold text-ink">&ldquo;{slug}&rdquo;</span> to an
            active MotoHom class.
          </p>
          <Link
            href="/fleet"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 font-heading text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <ArrowLeft className="size-4" /> Back to fleet
          </Link>
        </div>
      )}

      {/* Flagship gets its own ultra-luxury, media-led experience. */}
      {ready && content.code === 'V' && (
        <FleetViceroyExperience
          content={content}
          summary={summary}
          media={media}
          specGroups={specGroups}
        />
      )}

      {ready && content.code !== 'V' && (
        <>
          <FleetDetailCover
            content={content}
            summary={summary}
            heroImage={summary.coverImage ?? content.fallbackImage}
            heroVideo={media.video}
          />

          {/* Why this class */}
          <section className="relative border-t border-[var(--color-line)] bg-surface-0 py-20 md:py-28">
            <div className="mx-auto grid max-w-screen-2xl gap-12 px-6 md:px-12 lg:grid-cols-[1.5fr_1fr] lg:gap-20">
              <Reveal as="div">
                <span className="label-mono text-gold">Why {content.name}</span>
                <div className="mt-5 space-y-5">
                  {content.positioning.map((para) => (
                    <p
                      key={para}
                      className="max-w-2xl font-body text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-ink-muted"
                    >
                      {para}
                    </p>
                  ))}
                  <p className="max-w-2xl border-l-2 border-gold/50 pl-4 font-body text-[clamp(1.05rem,1.8vw,1.35rem)] leading-relaxed text-ink">
                    {content.differentiator}
                  </p>
                </div>
              </Reveal>
              <Reveal as="div" delay={0.1}>
                <div className="rounded-2xl border border-[var(--color-line)] bg-surface-1 p-7">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    What this tier adds
                  </h3>
                  <ul className="mt-5 flex flex-col divide-y divide-[var(--color-line)]">
                    {content.signatures.map((s, i) => (
                      <li key={s} className="flex items-start gap-3 py-3.5">
                        <span className="mt-0.5 font-mono text-[11px] text-gold">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="font-body text-[14px] leading-snug text-ink">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </section>

          <FleetDetailGallery media={media} name={content.name} />

          <FleetDetailSpecs
            confirmed={specGroups.confirmed}
            toConfirm={specGroups.toConfirm}
            amenities={summary.klass.amenities}
            sideImage={media.images[1] ?? media.images[0]}
            sideIsPlaceholder={media.imagesArePlaceholder}
            name={content.name}
          />

          {/* Closing CTA — tier-correct (V = request) */}
          <section className="section-ambient-warm relative border-t border-[var(--color-line)] py-24 md:py-28">
            <div className="relative mx-auto flex max-w-screen-xl flex-col items-center gap-9 px-6 text-center md:px-12">
              <Reveal as="div" className="max-w-2xl">
                <span className="label-mono text-gold">
                  {content.ctaKind === 'enquiry' ? 'By invitation' : 'Plan your trip'}
                </span>
                <h2 className="mt-5 font-heading text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-0.025em] text-ink">
                  {content.ctaKind === 'enquiry'
                    ? `Enquire about the ${content.name}.`
                    : `Take the ${content.name} on your next journey.`}
                </h2>
                <p className="mt-5 font-body text-base leading-relaxed text-ink-muted">
                  {content.ctaKind === 'enquiry'
                    ? 'Received by request, on terms set around privacy. A single private point of contact will be in touch.'
                    : 'Pair this class with a curated route, or check live availability across hubs.'}
                </p>
              </Reveal>
              <Reveal as="div" delay={0.08} className="flex flex-wrap items-center justify-center gap-4">
                <MagneticButton strength={0.32}>
                  <Link
                    href={content.ctaHref}
                    className={cn(
                      'group inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] transition-[transform,filter,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                      content.ctaKind === 'enquiry'
                        ? 'border border-[var(--color-line-gold)] bg-white/[0.03] text-ink hover:border-gold/60 hover:bg-white/[0.06]'
                        : 'bg-gold text-gold-ink shadow-glow-gold hover:brightness-[1.05]'
                    )}
                  >
                    {content.ctaKind === 'enquiry' && <Lock className="size-3.5" aria-hidden />}
                    {content.ctaLabel}
                  </Link>
                </MagneticButton>
                {content.ctaKind !== 'enquiry' && (
                  <Link
                    href="/packages"
                    className="inline-flex items-center gap-2 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-surface-0"
                  >
                    Explore journeys
                  </Link>
                )}
              </Reveal>
            </div>
          </section>
        </>
      )}

      <Footer />
    </main>
  );
}

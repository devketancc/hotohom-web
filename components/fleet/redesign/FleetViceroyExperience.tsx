'use client';

import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Lock, Users, Dog } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { MediaSlot } from '@/components/fleet/redesign/MediaSlot';
import { FleetDetailGallery, type FleetGalleryMedia } from '@/components/fleet/redesign/FleetDetailGallery';
import { FleetDetailSpecs, type SpecRow } from '@/components/fleet/redesign/FleetDetailSpecs';
import type { FleetClassContent } from '@/config/fleet-classes';
import type { FleetClassSummary } from '@/types/fleet';

/**
 * Bespoke, media-led experience for the flagship Class V (Viceroy). The other
 * classes share the standard detail template; the Viceroy gets its own
 * ultra-luxury, beauty-forward layout while keeping the discretion-first
 * (request, never "book") behaviour.
 *
 * Imagery: the cinematic cover + showcase band feature the real Viceroy studio
 * shot at VICEROY_HERO (drop the supplied file at /public/fleet/viceroy/hero.jpg).
 * If that file is missing, <MediaSlot> gracefully falls back to a /public/exp-case
 * frame. Interior/feature tiles still use exp-case stand-ins, tagged as
 * placeholders, until class-specific Viceroy interiors/film arrive.
 */

// Real Viceroy exterior studio shot. Save the supplied image to this path.
const VICEROY_HERO = '/fleet/viceroy/hero.jpg';

// Brief-confirmed discretion guarantees (qualitative, not fabricated specs).
const VICEROY_GUARANTEES: { title: string; body: string }[] = [
  { title: 'Vetted, discretion-bound crew', body: 'Every crew member is selected and briefed for privacy before anything else.' },
  { title: 'No public visibility, ever', body: 'The Viceroy is never listed or shown. Your travel stays entirely yours.' },
  { title: 'A single private point of contact', body: 'One line handles the journey end to end, on your terms.' },
  { title: 'Received strictly by request', body: 'Guests are welcomed by invitation, on terms set around privacy.' },
];

// Beauty showcase — evocative, qualitative copy (no invented numbers).
const VICEROY_FEATURES: { kicker: string; title: string; body: string; imageIndex: number }[] = [
  { kicker: 'Interior', title: 'Residential volume', body: 'Lounge architecture and sightlines composed to make you slow down.', imageIndex: 1 },
  { kicker: 'Ambience', title: 'Light, staged by the hour', body: 'Scenes that move from dawn silver to midnight brass.', imageIndex: 2 },
  { kicker: 'Wellbeing', title: 'Spa-grade wet zones', body: 'A partitioned vanity and a rainfall shower, onboard.', imageIndex: 3 },
];

const FADE = (reduced: boolean | null, delay = 0) =>
  reduced
    ? {}
    : {
        initial: { opacity: 0, y: 22 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-12% 0px' },
        transition: { duration: 0.9, ease: luxuryEase, delay },
      };

/** Full-bleed parallax band with an overlaid statement. */
function ShowcaseBand({
  image,
  fallbackSrc,
  isPlaceholder,
  name,
}: {
  image: string;
  fallbackSrc?: string;
  isPlaceholder: boolean;
  name: string;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <section ref={ref} className="relative h-[80vh] min-h-[520px] w-full overflow-hidden border-y border-[var(--color-line-gold)]">
      <motion.div className="absolute inset-0 h-[116%] w-full" style={reduced ? undefined : { y }}>
        <MediaSlot
          kind="image"
          src={image}
          fallbackSrc={fallbackSrc}
          alt={`${name}, exterior in studio light`}
          isPlaceholder={isPlaceholder}
          focus="50% 60%"
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-0 via-surface-0/30 to-surface-0/55" />
      <div className="hero-grain pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative z-10 mx-auto flex h-full max-w-screen-2xl flex-col justify-end px-6 pb-16 md:px-12 md:pb-20">
        <motion.p
          {...FADE(reduced)}
          className="max-w-2xl font-fleet-serif text-[clamp(1.6rem,3.4vw,2.75rem)] italic leading-[1.2] text-ink"
        >
          The kind of hush wealth usually reserves for yachts, now measured in
          miles instead of nautical ones.
        </motion.p>
      </div>
    </section>
  );
}

export function FleetViceroyExperience({
  content,
  summary,
  media,
  specGroups,
}: {
  content: FleetClassContent;
  summary: FleetClassSummary;
  media: FleetGalleryMedia;
  specGroups: { confirmed: SpecRow[]; toConfirm: SpecRow[] };
}) {
  const reduced = useReducedMotion();

  // Cover parallax
  const coverRef = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: coverRef,
    offset: ['start start', 'end start'],
  });
  const coverY = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.16]);

  // Prefer real API media, then the supplied Viceroy studio shot, then a stand-in.
  const heroImage = summary.coverImage ?? VICEROY_HERO;
  const heroVideo = media.video;
  const pick = (i: number) => media.images[i % media.images.length];

  return (
    <>
      {/* 1. Cinematic cover */}
      <section
        ref={coverRef}
        className="relative isolate min-h-[100dvh] w-full overflow-hidden bg-surface-0"
      >
        <motion.div
          className="absolute inset-0 z-0"
          style={reduced ? undefined : { y: coverY, scale: coverScale }}
        >
          <MediaSlot
            kind={heroVideo ? 'video' : 'image'}
            src={heroVideo ?? heroImage}
            poster={heroImage}
            fallbackSrc={content.fallbackImage}
            alt={`${content.name}, ${content.audience}`}
            isPlaceholder={false}
            focus="42% 52%"
            priority
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-surface-0 via-surface-0/40 to-surface-0/70" />
        <div className="pointer-events-none absolute inset-0 z-[1] fleet-glow-champagne" />
        <div className="hero-grain pointer-events-none absolute inset-0 z-[1] opacity-60" />

        <div className="relative z-10 mx-auto flex min-h-[100dvh] max-w-screen-2xl flex-col justify-end px-6 pb-16 pt-32 md:px-12 md:pb-24">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: luxuryEase }}
          >
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted/70"
            >
              <Link href="/" className="transition-colors hover:text-ink">MotoHom</Link>
              <ChevronRight className="size-3 text-ink-faint" aria-hidden />
              <Link href="/fleet" className="transition-colors hover:text-ink">Fleet</Link>
              <ChevronRight className="size-3 text-ink-faint" aria-hidden />
              <span className="text-gold">{content.name}</span>
            </nav>

            <span className="mt-7 inline-flex items-center gap-2 rounded-full border border-[var(--color-line-gold)] bg-gold/[0.06] px-3.5 py-1.5">
              <Lock className="size-3 text-gold" aria-hidden />
              <span className="label-mono text-gold">{content.classLabel} · The flagship · By invitation</span>
            </span>

            <h1 className="mt-6 font-heading text-[clamp(3rem,9vw,7.5rem)] font-semibold leading-[0.92] tracking-[-0.04em] text-ink">
              {content.name}
            </h1>
            <p className="mt-5 max-w-2xl font-fleet-serif text-[clamp(1.25rem,2.4vw,1.9rem)] italic text-gold-soft/90">
              {content.tagline}
            </p>

            {summary.klass.is_pet_friendly && (
              <dl className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
                <div className="inline-flex items-center gap-2">
                  <Users className="size-4 text-gold/80" aria-hidden />
                  <dd className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    Up to {summary.klass.full_capacity} guests
                  </dd>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Dog className="size-4 text-gold/80" aria-hidden />
                  <dd className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    Pet-friendly option
                  </dd>
                </div>
              </dl>
            )}

            <div className="mt-9 flex flex-wrap items-center gap-4">
              <MagneticButton strength={0.3}>
                <Link
                  href={content.ctaHref}
                  className="group inline-flex items-center gap-3 rounded-full border border-[var(--color-line-gold)] bg-white/[0.03] px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-[transform,filter,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
                >
                  <Lock className="size-3.5" aria-hidden />
                  {content.ctaLabel}
                </Link>
              </MagneticButton>
              <Link
                href="#gallery"
                className="inline-flex items-center gap-2 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-surface-0"
              >
                See the gallery
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Manifesto */}
      <section className="relative border-t border-[var(--color-line)] bg-surface-0 py-24 md:py-32">
        <div className="fleet-glow-champagne pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
          <motion.span {...FADE(reduced)} className="label-mono text-gold">
            The Viceroy
          </motion.span>
          <motion.div {...FADE(reduced, 0.06)} className="mt-7 space-y-6">
            {content.positioning.map((para) => (
              <p
                key={para}
                className="font-body text-[clamp(1.15rem,2.2vw,1.6rem)] leading-relaxed text-ink-muted"
              >
                {para}
              </p>
            ))}
            <p className="font-body text-[clamp(1.15rem,2.2vw,1.6rem)] leading-relaxed text-ink">
              {content.differentiator}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3. Full-bleed showcase band — the supplied studio shot, recropped */}
      <ShowcaseBand
        image={VICEROY_HERO}
        fallbackSrc={pick(4)}
        isPlaceholder={false}
        name={content.name}
      />

      {/* 4. Signature features (beauty) */}
      <section className="relative border-t border-[var(--color-line)] bg-surface-0 py-20 md:py-28">
        <div className="mx-auto max-w-screen-2xl px-6 md:px-12">
          <motion.header {...FADE(reduced)} className="max-w-2xl">
            <span className="label-mono text-gold">Signature</span>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-ink">
              Built to be seen only by those inside it.
            </h2>
          </motion.header>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {VICEROY_FEATURES.map((f, i) => (
              <motion.figure
                key={f.title}
                {...FADE(reduced, (i % 3) * 0.06)}
                className="group relative overflow-hidden rounded-[1.5rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm"
              >
                <div className="aspect-[4/5]">
                  <MediaSlot
                    kind="image"
                    src={pick(f.imageIndex)}
                    alt={`${content.name}, ${f.title}`}
                    isPlaceholder={media.imagesArePlaceholder}
                    zoomOnHover
                  />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-0 via-surface-0/70 to-transparent px-5 pb-5 pt-16">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold/80">
                    {f.kicker}
                  </span>
                  <h3 className="mt-1.5 font-heading text-lg font-semibold tracking-tight text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-muted">
                    {f.body}
                  </p>
                </figcaption>
              </motion.figure>
            ))}
          </div>

          {/* Discretion guarantees */}
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[var(--color-line-gold)] bg-[var(--color-line)] sm:grid-cols-2">
            {VICEROY_GUARANTEES.map((g, i) => (
              <motion.div
                key={g.title}
                {...FADE(reduced, (i % 2) * 0.05)}
                className="flex flex-col gap-2 bg-surface-1 p-6 md:p-8"
              >
                <div className="flex items-center gap-2.5">
                  <Lock className="size-4 text-gold" aria-hidden />
                  <h3 className="font-heading text-[15px] font-semibold tracking-tight text-ink">
                    {g.title}
                  </h3>
                </div>
                <p className="font-body text-[13.5px] leading-relaxed text-ink-muted">{g.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Media-heavy gallery */}
      <FleetDetailGallery media={media} name={content.name} />

      {/* 6. Specs */}
      <FleetDetailSpecs
        confirmed={specGroups.confirmed}
        toConfirm={specGroups.toConfirm}
        amenities={summary.klass.amenities}
        sideImage={pick(1)}
        sideIsPlaceholder={media.imagesArePlaceholder}
        name={content.name}
      />

      {/* 7. Enquiry CTA */}
      <section className="section-ambient-warm relative border-t border-[var(--color-line-gold)] py-24 md:py-32">
        <div className="fleet-glow-champagne pointer-events-none absolute inset-0 opacity-70" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-7 px-6 text-center md:px-12">
          <motion.span {...FADE(reduced)} className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-gold)] bg-gold/[0.06] px-3.5 py-1.5">
            <Lock className="size-3 text-gold" aria-hidden />
            <span className="label-mono text-gold">By invitation</span>
          </motion.span>
          <motion.h2
            {...FADE(reduced, 0.06)}
            className="font-heading text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.03em] text-ink"
          >
            Enquire about the Viceroy.
          </motion.h2>
          <motion.p {...FADE(reduced, 0.1)} className="max-w-md font-body text-base leading-relaxed text-ink-muted">
            Received by request, on terms set around privacy. A single private
            point of contact will be in touch.
          </motion.p>
          <motion.div {...FADE(reduced, 0.14)}>
            <MagneticButton strength={0.32}>
              <Link
                href={content.ctaHref}
                className="group inline-flex items-center gap-3 rounded-full border border-[var(--color-line-gold)] bg-white/[0.03] px-8 py-4 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-ink transition-[transform,filter,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
              >
                <Lock className="size-3.5" aria-hidden />
                {content.ctaLabel}
              </Link>
            </MagneticButton>
          </motion.div>
        </div>
      </section>
    </>
  );
}

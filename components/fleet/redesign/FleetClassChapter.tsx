'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Lock, Users, Dog } from 'lucide-react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { cn } from '@/lib/utils';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { MediaSlot } from '@/components/fleet/redesign/MediaSlot';
import type { FleetClassContent } from '@/config/fleet-classes';
import type { FleetClassSummary } from '@/types/fleet';

const GLOW_BY_TONE: Record<FleetClassContent['accentTone'], string> = {
  warm: 'fleet-glow-warm',
  cool: 'fleet-glow-cool',
  champagne: 'fleet-glow-champagne',
};

/** Parallax-wrapped media: drifts within its frame as the section scrolls. */
function ParallaxMedia({
  content,
  summary,
  rounded = true,
  className,
}: {
  content: FleetClassContent;
  summary: FleetClassSummary | null;
  rounded?: boolean;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);

  const realImage = summary?.coverImage ?? null;
  const realVideo =
    summary?.klass.media.find((m) => m.media_type === 'video' && m.url)?.url ??
    null;
  const image = realImage ?? content.fallbackImage;

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-full w-full overflow-hidden ring-1 ring-[var(--color-line)]',
        rounded && 'rounded-[1.75rem]',
        className
      )}
    >
      <motion.div
        className="absolute inset-0 h-[112%] w-full"
        style={reduced ? undefined : { y }}
      >
        <MediaSlot
          kind={realVideo ? 'video' : 'image'}
          src={realVideo ?? image}
          poster={image}
          alt={`${content.name}, ${content.audience}`}
          isPlaceholder={!realImage && !realVideo}
          focus="center"
          zoomOnHover={false}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface-0/55 via-transparent to-transparent" />
    </div>
  );
}

/** Real, API-backed stats. Render nothing while the catalog is still loading. */
function RealStats({ summary }: { summary: FleetClassSummary | null }) {
  if (!summary) return null;
  const { klass } = summary;
  const stats: { icon: typeof Users; label: string }[] = [
    { icon: Users, label: `Up to ${klass.full_capacity} guests` },
  ];
  if (klass.is_pet_friendly) {
    stats.push({ icon: Dog, label: 'Pet-friendly option' });
  }
  return (
    <dl className="flex flex-wrap gap-x-6 gap-y-2.5">
      {stats.map(({ icon: Icon, label }) => (
        <div key={label} className="inline-flex items-center gap-2">
          <Icon className="size-3.5 text-gold/80" aria-hidden />
          <dd className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
            {label}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Placeholder spec chips. Each carries a visible "to confirm" marker so nothing
 * unconfirmed reads as a real figure. Search `placeholderSpecs` to replace.
 */
function PlaceholderStats({ content }: { content: FleetClassContent }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Specifications to be confirmed">
      {content.placeholderSpecs.map((spec) => (
        <li
          key={spec.label}
          data-media-placeholder="true"
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--color-line-strong)] bg-white/[0.015] px-3 py-1.5"
          title="Placeholder value, to be confirmed"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {spec.label}
          </span>
          <span className="font-heading text-[12px] font-semibold text-ink-muted">
            {spec.value}
          </span>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-gold/60">
            tbc
          </span>
        </li>
      ))}
    </ul>
  );
}

function ClassCta({ content }: { content: FleetClassContent }) {
  const enquiry = content.ctaKind === 'enquiry';
  return (
    <div className="flex flex-wrap items-center gap-4">
      <MagneticButton strength={0.3}>
        <Link
          href={content.ctaHref}
          className={cn(
            'group inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] transition-[transform,filter,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
            enquiry
              ? 'border border-[var(--color-line-gold)] bg-white/[0.02] text-ink hover:border-gold/60 hover:bg-white/[0.05]'
              : 'bg-gold text-gold-ink shadow-glow-gold hover:brightness-[1.05]'
          )}
        >
          {enquiry && <Lock className="size-3.5" aria-hidden />}
          {content.ctaLabel}
          {enquiry ? (
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          ) : (
            <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
          )}
        </Link>
      </MagneticButton>
      {content.secondaryLabel && content.secondaryHref && (
        <Link
          href={content.secondaryHref}
          className="inline-flex items-center gap-2 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-muted transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4 focus-visible:ring-offset-surface-0"
        >
          {content.secondaryLabel}
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/** Oversized, low-opacity tier numeral that grows with the tier. */
function TierWatermark({ tier }: { tier: number }) {
  const size = 7 + tier; // 8 -> 11rem-ish scale via clamp below
  return (
    <span
      aria-hidden
      className="pointer-events-none select-none font-heading font-semibold leading-none text-white/[0.04]"
      style={{ fontSize: `clamp(5rem, ${size}vw, ${size + 4}rem)` }}
    >
      {String(tier).padStart(2, '0')}
    </span>
  );
}

function ClassHeader({ content }: { content: FleetClassContent }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="flex size-7 items-center justify-center rounded-full border border-[var(--color-line-gold)] bg-gold/10 font-heading text-xs font-semibold text-gold">
          {content.code}
        </span>
        <span className="label-mono text-gold">
          {content.classLabel} · {content.audience}
        </span>
      </div>
      <h3 className="mt-5 font-heading text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-ink">
        {content.name}
      </h3>
      <p className="mt-3 font-fleet-serif text-lg italic text-gold-soft/85 md:text-xl">
        {content.tagline}
      </p>
    </>
  );
}

const FADE = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-12% 0px' },
  transition: { duration: 0.9, ease: luxuryEase, delay },
});

export function FleetClassChapter({
  content,
  summary,
}: {
  content: FleetClassContent;
  summary: FleetClassSummary | null;
}) {
  const reduced = useReducedMotion();
  const fade = (delay = 0) => (reduced ? {} : FADE(delay));

  // Layout escalates with the tier so the progression reads as deliberate:
  //   T  -> split, media left
  //   M  -> split, media right
  //   U  -> full-bleed cinematic band (clear shift in format)
  //   V  -> discretion showcase: dark, centred, sealed, minimal
  const variant =
    content.tier === 1
      ? 'split-left'
      : content.tier === 2
        ? 'split-right'
        : content.tier === 3
          ? 'band'
          : 'showcase';

  const sectionId = `class-${content.code}`;
  const glow = GLOW_BY_TONE[content.accentTone];

  if (variant === 'band') {
    return (
      <section
        id={sectionId}
        className="relative scroll-mt-28 overflow-hidden border-t border-[var(--color-line)] py-20 md:py-28"
      >
        <div className={cn('pointer-events-none absolute inset-0', glow)} />
        <div className="relative mx-auto max-w-screen-2xl px-6 md:px-12">
          <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)]">
            <ParallaxMedia content={content} summary={summary} rounded={false} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-surface-0 via-surface-0/80 to-surface-0/30" />
            <motion.div
              {...fade()}
              className="relative z-10 max-w-xl px-6 py-16 md:px-14 md:py-24"
            >
              <ClassHeader content={content} />
              <p className="mt-6 max-w-md font-body text-[15px] leading-relaxed text-ink-muted">
                {content.positioning[0]}
              </p>
              <p className="mt-5 border-l-2 border-gold/50 pl-4 font-body text-[15px] leading-relaxed text-ink">
                {content.differentiator}
              </p>
              <div className="mt-7 space-y-4">
                <RealStats summary={summary} />
                <PlaceholderStats content={content} />
              </div>
              <div className="mt-9">
                <ClassCta content={content} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  if (variant === 'showcase') {
    // V — discretion-first. Quiet, centred, sealed, the most negative space.
    return (
      <section
        id={sectionId}
        className="relative scroll-mt-28 overflow-hidden border-t border-[var(--color-line-gold)] bg-surface-0 py-24 md:py-36"
      >
        <div className={cn('pointer-events-none absolute inset-0', glow)} />
        <div className="hero-grain pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-3xl px-6 text-center md:px-12">
          <motion.div {...fade()} className="flex flex-col items-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line-gold)] bg-gold/[0.06] px-3.5 py-1.5">
              <Lock className="size-3 text-gold" aria-hidden />
              <span className="label-mono text-gold">{content.classLabel} · By invitation</span>
            </span>
            <h3 className="mt-7 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
              {content.name}
            </h3>
            <p className="mt-4 font-fleet-serif text-xl italic text-gold-soft/85 md:text-2xl">
              {content.tagline}
            </p>
          </motion.div>

          <motion.div {...fade(0.08)} className="mx-auto mt-10 max-w-xl space-y-5">
            {content.positioning.map((para) => (
              <p key={para} className="font-body text-[15px] leading-relaxed text-ink-muted">
                {para}
              </p>
            ))}
            <p className="font-body text-[15px] leading-relaxed text-ink">
              {content.differentiator}
            </p>
          </motion.div>

          <motion.ul
            {...fade(0.14)}
            className="mx-auto mt-10 flex max-w-lg flex-col divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]"
          >
            {content.signatures.map((s) => (
              <li key={s} className="py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-muted">
                {s}
              </li>
            ))}
          </motion.ul>

          <motion.div {...fade(0.2)} className="mt-10 flex flex-col items-center gap-4">
            <PlaceholderStats content={content} />
            {/* V leads with "Explore" (into the bespoke showcase page); the
                discretion enquiry stays available as the secondary action. */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
              <MagneticButton strength={0.3}>
                <Link
                  href={content.secondaryHref ?? `/fleet/${content.slug}`}
                  className="group inline-flex items-center gap-3 rounded-full bg-gold px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] text-gold-ink shadow-glow-gold transition-[transform,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
                >
                  {content.secondaryLabel ?? 'Explore the Viceroy'}
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                </Link>
              </MagneticButton>
              <Link
                href={content.ctaHref}
                className="group inline-flex items-center gap-2.5 rounded-full border border-[var(--color-line-gold)] bg-white/[0.02] px-6 py-3 font-heading text-[12px] font-semibold uppercase tracking-[0.16em] text-ink transition-[transform,border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0"
              >
                <Lock className="size-3.5" aria-hidden />
                {content.ctaLabel}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // split-left / split-right
  const mediaRight = variant === 'split-right';
  return (
    <section
      id={sectionId}
      className="relative scroll-mt-28 overflow-hidden border-t border-[var(--color-line)] py-20 md:py-28"
    >
      <div className={cn('pointer-events-none absolute inset-0', glow)} />
      <div className="relative mx-auto grid max-w-screen-2xl items-center gap-10 px-6 md:px-12 lg:grid-cols-2 lg:gap-16">
        {/* Media */}
        <motion.div
          {...fade()}
          className={cn(
            'relative order-1 aspect-[4/5] sm:aspect-[16/11] lg:aspect-[4/5]',
            mediaRight ? 'lg:order-2' : 'lg:order-1'
          )}
        >
          <div className="absolute -top-6 left-2 z-10 md:-top-4">
            <TierWatermark tier={content.tier} />
          </div>
          <ParallaxMedia content={content} summary={summary} className="h-full" />
        </motion.div>

        {/* Copy */}
        <motion.div
          {...fade(0.08)}
          className={cn('order-2', mediaRight ? 'lg:order-1' : 'lg:order-2')}
        >
          <ClassHeader content={content} />
          <div className="mt-6 space-y-4">
            {content.positioning.map((para) => (
              <p key={para} className="max-w-xl font-body text-[15px] leading-relaxed text-ink-muted">
                {para}
              </p>
            ))}
          </div>
          <p className="mt-5 max-w-xl border-l-2 border-gold/50 pl-4 font-body text-[15px] leading-relaxed text-ink">
            {content.differentiator}
          </p>
          <div className="mt-7 space-y-4">
            <RealStats summary={summary} />
            <PlaceholderStats content={content} />
          </div>
          <div className="mt-9">
            <ClassCta content={content} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

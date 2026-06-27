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
import { cn } from '@/lib/utils';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { MediaSlot } from '@/components/fleet/redesign/MediaSlot';
import type { FleetClassContent } from '@/config/fleet-classes';
import type { FleetClassSummary } from '@/types/fleet';

/** Full-bleed cinematic cover for a single class. Parallax film, breadcrumb,
 *  tier framing, real key stats, and the tier-correct CTA (V = request). */
export function FleetDetailCover({
  content,
  summary,
  heroImage,
  heroVideo,
}: {
  content: FleetClassContent;
  summary: FleetClassSummary | null;
  heroImage: string;
  heroVideo: string | null;
}) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '16%']);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1.14]);

  const realImage = Boolean(summary?.coverImage);
  const enquiry = content.ctaKind === 'enquiry';

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[88vh] w-full overflow-hidden border-b border-[var(--color-line)] bg-surface-0"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={reduced ? undefined : { y, scale }}
      >
        <MediaSlot
          kind={heroVideo ? 'video' : 'image'}
          src={heroVideo ?? heroImage}
          poster={heroImage}
          alt={`${content.name}, ${content.audience}`}
          isPlaceholder={!realImage && !heroVideo}
          focus="55% 40%"
          priority
        />
      </motion.div>

      {/* grade */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-surface-0 via-surface-0/45 to-surface-0/65" />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-surface-0/85 via-surface-0/25 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[88vh] max-w-screen-2xl flex-col justify-end px-6 pb-14 pt-32 md:px-12 md:pb-20">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: luxuryEase }}
        >
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-muted/70"
          >
            <Link href="/" className="transition-colors hover:text-ink">
              MotoHom
            </Link>
            <ChevronRight className="size-3 text-ink-faint" aria-hidden />
            <Link href="/fleet" className="transition-colors hover:text-ink">
              Fleet
            </Link>
            <ChevronRight className="size-3 text-ink-faint" aria-hidden />
            <span className="text-gold">{content.name}</span>
          </nav>

          <div className="mt-6 flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-full border border-[var(--color-line-gold)] bg-gold/10 font-heading text-sm font-semibold text-gold">
              {content.code}
            </span>
            <span className="label-mono text-gold">
              {String(content.tier).padStart(2, '0')} / 04 · {content.classLabel}
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl font-heading text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.035em] text-ink">
            {content.name}
          </h1>
          <p className="mt-4 max-w-xl font-fleet-serif text-xl italic text-gold-soft/85 md:text-2xl">
            {content.tagline}
          </p>

          {/* real key stats */}
          {summary && (
            <dl className="mt-7 flex flex-wrap gap-x-7 gap-y-3">
              {[
                { icon: Users, label: `Up to ${summary.klass.full_capacity} guests` },
                ...(summary.klass.is_pet_friendly
                  ? [{ icon: Dog, label: 'Pet-friendly option' }]
                  : []),
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-gold/80" aria-hidden />
                  <dd className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                    {label}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <MagneticButton strength={0.3}>
              <Link
                href={content.ctaHref}
                className={cn(
                  'group inline-flex items-center gap-3 rounded-full px-7 py-3.5 font-heading text-[12px] font-semibold uppercase tracking-[0.18em] transition-[transform,filter,background-color,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                  enquiry
                    ? 'border border-[var(--color-line-gold)] bg-white/[0.03] text-ink hover:border-gold/60 hover:bg-white/[0.06]'
                    : 'bg-gold text-gold-ink shadow-glow-gold hover:brightness-[1.05]'
                )}
              >
                {enquiry && <Lock className="size-3.5" aria-hidden />}
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
  );
}

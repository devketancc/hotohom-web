'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import type { FleetExperienceTier } from '@/config/fleet-experience';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { cn } from '@/lib/utils';
import { ArrowLeft, ArrowRight, ArrowUpRight, PawPrint, Users } from 'lucide-react';

export function FleetCinematicHero({
  imageUrl,
  imageAlt,
  eyebrow,
  title,
  flagship = false,
  meta,
  tier,
  backHref = '/fleet',
  primaryCta,
  secondaryCta,
}: {
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  flagship?: boolean;
  meta: { guests: number; pets?: number; petFriendly?: boolean; unitLabel: string };
  tier: FleetExperienceTier;
  backHref?: string;
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
}) {
  const reduced = useReducedMotion();
  const heroScaleStart =
    tier === 'flagship' ? 1.09 : tier === 'family' ? 1.04 : tier === 'urbania' ? 1.065 : 1.055;
  const titleClass = cn(
    'font-headline font-semibold leading-[0.98] tracking-[-0.038em] text-stitch-on-background',
    flagship ? 'text-5xl md:text-[4.25rem] lg:text-[5.25rem]' : 'text-5xl md:text-6xl lg:text-[4.25rem]'
  );

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={reduced ? false : { scale: heroScaleStart }}
        animate={reduced ? undefined : { scale: 1 }}
        transition={{ duration: 24, ease: luxuryEase }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={imageAlt} className="h-full w-full object-cover" />
      </motion.div>

      {!reduced && (
        <div className="pointer-events-none absolute inset-0 animate-fleetHeroVignette" aria-hidden />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/[0.72] via-45% to-stitch-background/[0.2]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-stitch-background/80 via-transparent to-stitch-background/25" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-screen-2xl flex-col px-6 pb-14 pt-[calc(10rem-env(safe-area-inset-top,0px))] md:px-10 md:pb-20 md:pt-40">
        <div className="flex items-start justify-between gap-4">
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 rounded-full border border-white/12 bg-stitch-background/40 px-4 py-2 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] text-stitch-on-background/80 backdrop-blur-md transition-colors hover:border-white/25 hover:text-stitch-on-background"
          >
            <ArrowLeft className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-0.5" />
            Fleet
          </Link>
        </div>

        <div className="mt-auto max-w-4xl">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 28 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: luxuryEase, delay: 0.08 }}
            className="fleet-glass-plate rounded-[2rem] border border-white/[0.08] px-7 py-9 md:px-11 md:py-11"
          >
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
              {eyebrow}
            </span>
            <h1 className={cn('mt-5', titleClass)}>{title}</h1>

            <ul className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 font-headline text-[11px] font-semibold uppercase tracking-[0.22em] text-stitch-on-surface-variant/80">
              <li className="inline-flex items-center gap-2">
                <Users className="size-4 text-stitch-primary-container" />
                {meta.guests} guests
              </li>
              {meta.pets != null && meta.pets > 0 && (
                <li className="inline-flex items-center gap-2">
                  <PawPrint className="size-4 text-stitch-primary-container" />
                  {meta.pets} pets
                </li>
              )}
              {meta.petFriendly && (
                <li className="inline-flex items-center gap-2 text-stitch-primary-container">Pet friendly</li>
              )}
              <li className="text-stitch-on-surface-variant/65">{meta.unitLabel}</li>
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <MagneticButton strength={0.32}>
                <Link
                  href={primaryCta.href}
                  className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
                >
                  {primaryCta.label}
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                </Link>
              </MagneticButton>
              <Link
                href={secondaryCta.href}
                className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-[transform,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] hover:text-stitch-on-background"
              >
                {secondaryCta.label}
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MagneticButton } from '@/components/shared/MagneticButton';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export function FleetLuxuryCTA({
  eyebrow,
  title,
  body,
  classCode,
}: {
  eyebrow: string;
  title: string;
  body: string;
  classCode: string;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative border-t border-[var(--color-line)] py-28 md:py-36">
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 26 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-15% 0px' }}
          transition={{ duration: 1.15, ease: luxuryEase }}
          className="relative overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-white/[0.02] p-10 ring-1 ring-stitch-primary-container/12 md:p-14"
        >
          <div className="pointer-events-none absolute -right-20 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-stitch-primary-container/10 blur-[100px]" />
          <div className="relative flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
                {eyebrow}
              </span>
              <h2 className="mt-4 font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
                {title}
              </h2>
              <p className="mt-5 font-body text-base leading-relaxed text-stitch-on-surface-variant/82 md:text-lg">
                {body}
              </p>
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center gap-3 md:justify-end">
              <MagneticButton strength={0.32}>
                <Link
                  href={`/packages?class=${classCode}`}
                  className="group inline-flex items-center gap-3 rounded-full border border-stitch-primary-container/35 bg-stitch-primary-container px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-primary-container shadow-[0_12px_36px_-16px_rgba(229,185,92,0.55)] transition-[transform,box-shadow,filter] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-[1.06] hover:shadow-[0_18px_50px_-18px_rgba(229,185,92,0.65)]"
                >
                  Curated journeys
                  <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5" />
                </Link>
              </MagneticButton>
              <Link
                href="/select-caravan"
                className="group inline-flex items-center gap-3 rounded-full border border-white/15 px-7 py-3.5 font-headline text-[12px] font-semibold uppercase tracking-[0.18em] text-stitch-on-background/90 transition-[transform,border-color,background-color,color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.04] hover:text-stitch-on-background"
              >
                Availability
                <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';

export function FleetDetailHero({
  imageUrl,
  imageAlt,
  title,
  seriesLabel,
  slug,
}: {
  imageUrl: string;
  imageAlt: string;
  title: string;
  seriesLabel: string;
  slug: string;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative isolate min-h-[min(52vh,560px)] overflow-hidden border-b border-[var(--color-line)] pb-px">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={imageAlt}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stitch-background via-stitch-background/[0.76] via-55% to-stitch-background/[0.35]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-stitch-background/90 via-stitch-background/40 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex min-h-[min(52vh,560px)] max-w-screen-2xl flex-col justify-end px-6 pb-12 pt-[calc(7.5rem-env(safe-area-inset-top,0px))] md:px-10 md:pb-16 md:pt-36">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.95, ease: luxuryEase }}
        >
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 font-headline text-[10px] font-semibold uppercase tracking-[0.22em] text-white/55">
            <Link href="/" className="transition-colors hover:text-white/90">
              MotoHom
            </Link>
            <ChevronRight className="size-3 text-white/40" aria-hidden />
            <Link href="/fleet" className="transition-colors hover:text-white/90">
              Fleet
            </Link>
            <ChevronRight className="size-3 text-white/40" aria-hidden />
            <span className="text-stitch-primary-container/95">{slug}</span>
          </nav>

          <p className="mt-6 font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
            Fleet details · {seriesLabel}
          </p>
          <h1 className="mt-4 max-w-4xl font-headline text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-stitch-on-background md:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>
        </motion.div>
      </div>
    </section>
  );
}

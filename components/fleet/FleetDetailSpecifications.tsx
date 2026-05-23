'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { FleetDetailSpecRow } from '@/lib/fleet-detail-specs';
import { luxuryEase } from '@/components/fleet/luxury-motion';

export function FleetDetailSpecifications({
  rows,
  sideImages,
  imageAltBase,
}: {
  rows: FleetDetailSpecRow[];
  sideImages: [string, string];
  imageAltBase: string;
}) {
  const reduced = useReducedMotion();
  const [a, b] = sideImages;

  return (
    <section className="section-ambient-warm relative scroll-mt-28 border-t border-[var(--color-line)] py-20 md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(229,185,92,0.05),transparent_50%)]" />
      <div className="relative mx-auto max-w-screen-2xl px-6 md:px-10">
        <motion.h2
          initial={reduced ? false : { opacity: 0, y: 14 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: luxuryEase }}
          className="font-headline text-3xl font-semibold tracking-[-0.026em] text-stitch-on-background md:text-[2.125rem]"
        >
          Specifications
        </motion.h2>
        <p className="mt-3 max-w-xl font-body text-sm leading-relaxed text-stitch-on-surface-variant/82 md:text-base">
          A full equipment readout merges live catalogue data with editorial context. Values reflect
          this silhouette&apos;s MotoHom staging — confirm with concierge for your departure profile.
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,360px)] lg:gap-16 lg:items-start">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: luxuryEase }}
            className="overflow-hidden rounded-2xl border border-[var(--color-line)] bg-stitch-background/40"
          >
            <dl className="divide-y divide-[var(--color-line)]">
              {rows.map(({ label, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-1 gap-1 px-5 py-4 sm:grid-cols-[minmax(0,42%)_minmax(0,1fr)] sm:gap-8 sm:px-7 sm:py-5"
                >
                  <dt className="font-headline text-[10px] font-semibold uppercase tracking-[0.2em] text-stitch-on-surface-variant">
                    {label}
                  </dt>
                  <dd className="font-body text-sm leading-relaxed text-stitch-on-background/92 md:text-[0.9375rem]">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div
            initial={reduced ? false : { opacity: 0, y: 22 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: luxuryEase, delay: 0.05 }}
            className="flex flex-col gap-5 lg:sticky lg:top-32"
          >
            <div className="relative overflow-hidden rounded-[1.65rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a}
                alt={`${imageAltBase} — specification visual A`}
                className="aspect-[3/5] max-h-[320px] w-full object-cover sm:max-h-[380px]"
              />
            </div>
            <div className="relative ml-auto w-[88%] overflow-hidden rounded-[1.65rem] ring-1 ring-[var(--color-line)] shadow-luxury-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b}
                alt={`${imageAltBase} — specification visual B`}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

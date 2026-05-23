'use client';

import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';

export function FleetUnitsPresence({
  unitNames,
  count,
}: {
  unitNames: string[];
  count: number;
}) {
  const reduced = useReducedMotion();
  const label = `${count} curated ${count === 1 ? 'unit' : 'units'} in circulation`;

  if (count === 0) return null;

  const displayNames = unitNames.filter(Boolean);
  const marquee =
    displayNames.length > 0 ? displayNames : ['MotoHom curated silhouette'];

  return (
    <section className="section-ambient-warm border-t border-[var(--color-line)] bg-stitch-background py-16 md:py-20">
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <motion.p
          initial={reduced ? false : { opacity: 0, y: 12 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: luxuryEase }}
          className="font-headline text-[10px] font-semibold uppercase tracking-[0.32em] text-stitch-primary-container/85"
        >
          Fleet presence
        </motion.p>
        <p className="mt-3 font-body text-sm text-stitch-on-surface-variant/75 md:text-base">{label}</p>
        <div className="mt-8 overflow-hidden">
          <motion.div
            className="flex gap-8 whitespace-nowrap font-headline text-xs font-medium uppercase tracking-[0.2em] text-white/28 md:text-sm"
            animate={reduced ? undefined : { x: [0, -120] }}
            transition={
              reduced
                ? undefined
                : { duration: 28, repeat: Infinity, ease: 'linear', repeatType: 'loop' }
            }
          >
            {[...marquee, ...marquee].map((name, i) => (
              <span key={`${name}-${i}`} className="inline-flex items-center gap-3">
                <span className="text-stitch-primary-container/40">·</span>
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

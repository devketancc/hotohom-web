'use client';

import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { cn } from '@/lib/utils';

export function FleetFeatureStack({
  id,
  eyebrow,
  headline,
  lines,
  align = 'left',
}: {
  id?: string;
  eyebrow: string;
  headline: string;
  lines: string[];
  align?: 'left' | 'right';
}) {
  const reduced = useReducedMotion();

  return (
    <section
      id={id}
      className={cn(
        'fleet-feature-stack scroll-mt-28 border-t border-[var(--color-line)] py-24 md:py-32',
        align === 'right' && 'fleet-editorial-section'
      )}
    >
      <div className="mx-auto max-w-screen-xl px-6 md:px-10">
        <div className={cn('grid gap-14 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] md:gap-20', align === 'right' && 'md:[&>*:first-child]:order-2')}>
          <motion.div
            initial={reduced ? false : { opacity: 0, x: align === 'right' ? 16 : -16 }}
            whileInView={reduced ? undefined : { opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1.05, ease: luxuryEase }}
            className="border-l border-stitch-primary-container/35 pl-6"
          >
            <span className="font-headline text-[10px] font-semibold uppercase tracking-[0.42em] text-stitch-primary-container/90">
              {eyebrow}
            </span>
            <h2 className="mt-5 max-w-md text-balance font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.025em] text-stitch-on-background md:text-4xl">
              {headline}
            </h2>
          </motion.div>

          <ul className="space-y-8">
            {lines.map((line, i) => (
              <motion.li
                key={`${line}-${i}`}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-8% 0px' }}
                transition={{ duration: 0.95, ease: luxuryEase, delay: i * 0.07 }}
                className="group flex gap-5 border-b border-[var(--color-line)] pb-8 last:border-0 last:pb-0"
              >
                <span className="font-fleet-serif text-2xl leading-none text-stitch-primary-container/35 transition-colors duration-500 group-hover:text-stitch-primary-container/55">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="flex-1 font-body text-base leading-relaxed text-stitch-on-surface-variant/88 md:text-lg">
                  {line}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

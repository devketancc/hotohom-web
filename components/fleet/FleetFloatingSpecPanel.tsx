'use client';

import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { cn } from '@/lib/utils';

export interface FleetSpecChip {
  label: string;
  value: string;
}

export function FleetFloatingSpecPanel({
  chips,
  intro,
  className,
  dock = 'floating',
}: {
  chips: FleetSpecChip[];
  intro: string;
  className?: string;
  /** `floating`: in-flow glass panel · `dock`: fixed bottom on wide screens */
  dock?: 'floating' | 'dock';
}) {
  const reduced = useReducedMotion();

  const inner = (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.05, ease: luxuryEase }}
      className={cn(
        'fleet-glass-plate border border-white/[0.08] p-8 md:p-10',
        dock === 'floating' ? 'rounded-[2rem]' : 'rounded-t-[2rem] md:rounded-[2rem]',
        dock === 'dock' && 'md:relative md:border md:rounded-[2rem]'
      )}
    >
      <p className="font-fleet-serif text-lg italic leading-snug tracking-tight text-stitch-primary-container/90 md:text-xl">
        {intro}
      </p>
      <dl className="mt-10 flex flex-wrap gap-3">
        {chips.map((c) => (
          <div
            key={c.label}
            className="flex min-w-[140px] flex-1 flex-col gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-5 py-4 backdrop-blur-md transition-[border-color,background-color] duration-500 hover:border-stitch-primary-container/25 hover:bg-stitch-primary-container/[0.06]"
          >
            <dt className="font-headline text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
              {c.label}
            </dt>
            <dd className="font-headline text-sm font-semibold tracking-tight text-stitch-on-background">
              {c.value}
            </dd>
          </div>
        ))}
      </dl>
    </motion.div>
  );

  if (dock === 'dock') {
    return (
      <div
        className={cn(
          'pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:pointer-events-auto md:relative md:inset-auto md:z-10 md:p-0',
          className
        )}
      >
        <div className="pointer-events-auto">{inner}</div>
      </div>
    );
  }

  return <div className={cn('relative', className)}>{inner}</div>;
}

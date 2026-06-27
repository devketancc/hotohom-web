'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useFleetSectionSpy } from '@/components/fleet/useFleetSectionSpy';
import type { FleetClassContent } from '@/config/fleet-classes';

/**
 * Sticky progression ladder. Renders the four classes as an ascending stepper
 * (T -> M -> U -> V) and keeps the active class lit via scrollspy. Doubles as
 * in-page navigation. Horizontally scrollable on mobile, full stepper on desktop.
 */
export function FleetTierLadder({ classes }: { classes: FleetClassContent[] }) {
  const reduced = useReducedMotion();
  const ids = classes.map((c) => `class-${c.code}`);
  const activeId = useFleetSectionSpy(ids);
  const activeIndex = Math.max(
    0,
    classes.findIndex((c) => `class-${c.code}` === activeId)
  );
  const fillPct =
    classes.length > 1 ? (activeIndex / (classes.length - 1)) * 100 : 0;

  return (
    <nav
      aria-label="Fleet classes"
      className="sticky top-[76px] z-30 border-y border-[var(--color-line)] bg-surface-0/80 backdrop-blur-xl md:top-[92px]"
    >
      <div className="mx-auto max-w-screen-2xl px-4 md:px-12">
        <ol className="relative flex items-stretch gap-1 overflow-x-auto scrollbar-custom md:grid md:grid-cols-4 md:gap-0">
          {/* progression track (desktop) */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-[var(--color-line-strong)] md:block"
          />
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-gold-deep to-gold md:block"
            initial={false}
            animate={{ width: `${fillPct}%` }}
            transition={
              reduced ? { duration: 0 } : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
            }
          />

          {classes.map((c) => {
            const id = `class-${c.code}`;
            const active = id === activeId;
            return (
              <li key={c.code} className="relative shrink-0 md:shrink">
                <Link
                  href={`#${id}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'group relative flex items-center gap-3 px-3 py-3.5 md:flex-col md:items-start md:gap-1 md:px-4 md:py-4',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset rounded-lg'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full border font-heading text-sm font-semibold transition-colors duration-500 md:size-10',
                      active
                        ? 'border-gold bg-gold text-gold-ink'
                        : 'border-[var(--color-line-strong)] bg-surface-1 text-ink-muted group-hover:border-gold/40 group-hover:text-ink'
                    )}
                  >
                    {c.code}
                  </span>
                  <span className="flex flex-col leading-tight">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ink-faint">
                      {String(c.tier).padStart(2, '0')} / {c.classLabel}
                    </span>
                    <span
                      className={cn(
                        'font-heading text-[13px] font-semibold tracking-tight transition-colors duration-500',
                        active ? 'text-ink' : 'text-ink-muted group-hover:text-ink'
                      )}
                    >
                      {c.name}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Minus, Lock } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import type { FleetClassContent } from '@/config/fleet-classes';
import type { FleetClassSummary } from '@/types/fleet';

type SummaryByCode = Record<string, FleetClassSummary | null>;

interface RowDef {
  label: string;
  /** Marks the whole row as not-yet-confirmed (placeholder data). */
  placeholder?: boolean;
  render: (c: FleetClassContent, s: FleetClassSummary | null) => React.ReactNode;
}

function realOrDash(value: string | null | undefined) {
  return value ? (
    <span className="font-heading text-[13px] font-semibold text-ink">{value}</span>
  ) : (
    <Minus className="size-3.5 text-ink-faint" aria-label="Not specified" />
  );
}

function placeholderCell(value: string) {
  // Visible "to confirm" marker so unconfirmed values never read as real.
  return (
    <span
      data-media-placeholder="true"
      className="inline-flex items-center gap-1.5"
      title="Placeholder value, to be confirmed"
    >
      <span className="font-heading text-[13px] font-semibold text-ink-muted">{value}</span>
      <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-gold/60">tbc</span>
    </span>
  );
}

const ROWS: RowDef[] = [
  { label: 'Best for', render: (c) => <span className="text-[13px] text-ink-muted">{c.audience}</span> },
  {
    label: 'Guests',
    render: (_c, s) => realOrDash(s ? `Up to ${s.klass.full_capacity}` : null),
  },
  {
    label: 'Sleeps',
    placeholder: true,
    render: (c) => placeholderCell(c.placeholderSpecs.find((p) => p.label === 'Sleeps')?.value ?? 'TBC'),
  },
  {
    label: 'Ride & finish',
    placeholder: true,
    render: (c) =>
      placeholderCell(c.placeholderSpecs.find((p) => p.label === 'Ride & finish')?.value ?? 'TBC'),
  },
  {
    label: 'Onboard crew',
    render: () => <span className="text-[13px] text-ink-muted">Driver + helper</span>,
  },
  {
    label: 'Pet-friendly',
    render: (_c, s) =>
      s?.klass.is_pet_friendly ? (
        <Check className="size-4 text-gold" aria-label="Available" />
      ) : (
        <Minus className="size-3.5 text-ink-faint" aria-label="Not available" />
      ),
  },
  {
    label: 'How to book',
    render: (c) =>
      c.ctaKind === 'enquiry' ? (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-gold">
          <Lock className="size-3" aria-hidden /> By request
        </span>
      ) : (
        <span className="text-[13px] text-ink-muted">Instant booking</span>
      ),
  },
];

export function FleetComparison({
  classes,
  summaryByCode,
}: {
  classes: FleetClassContent[];
  summaryByCode: SummaryByCode;
}) {
  const reduced = useReducedMotion();

  return (
    <section
      id="compare"
      className="section-ambient-warm relative scroll-mt-24 border-t border-[var(--color-line)] py-20 md:py-28"
    >
      <div className="relative mx-auto max-w-screen-2xl px-6 md:px-12">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 18 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="max-w-2xl"
        >
          <span className="label-mono text-gold">Compare the four</span>
          <h2 className="mt-4 font-heading text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-ink">
            One palette, four tiers, a clear step up at each.
          </h2>
          <p className="mt-4 font-body text-[15px] leading-relaxed text-ink-muted">
            The essentials are standard across every class. The table shows what
            actually changes as you move from Traveller to Viceroy.
          </p>
        </motion.header>

        {/* Scroll container: a true side-by-side matrix that scrolls on mobile,
            with the row-label column pinned left. */}
        <div className="relative mt-12">
          <div className="overflow-x-auto scrollbar-custom">
            <div className="grid min-w-[760px] grid-cols-[140px_repeat(4,1fr)] md:min-w-0">
              {/* Header row */}
              <div className="sticky left-0 z-10 bg-surface-0/60 backdrop-blur-md" />
              {classes.map((c) => {
                const mostBooked = c.code === 'T';
                return (
                  <div
                    key={c.code}
                    className={cn(
                      'relative flex flex-col gap-1 border-b border-[var(--color-line)] px-4 pb-5 pt-4',
                      mostBooked && 'rounded-t-2xl bg-gold/[0.04] ring-1 ring-[var(--color-line-gold)] ring-offset-0'
                    )}
                  >
                    {mostBooked && (
                      <span className="absolute -top-2.5 left-4 rounded-full bg-gold px-2 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-gold-ink">
                        Most booked
                      </span>
                    )}
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-ink-faint">
                      {String(c.tier).padStart(2, '0')} · {c.code}
                    </span>
                    <Link
                      href={`/fleet/${c.slug}`}
                      className="font-heading text-base font-semibold tracking-tight text-ink transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold rounded"
                    >
                      {c.name}
                    </Link>
                  </div>
                );
              })}

              {/* Data rows */}
              {ROWS.map((row) => (
                <React.Fragment key={row.label}>
                  <div className="sticky left-0 z-10 flex items-center border-b border-[var(--color-line)] bg-surface-0/85 px-4 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint backdrop-blur-md">
                    {row.label}
                  </div>
                  {classes.map((c) => (
                    <div
                      key={c.code + row.label}
                      className={cn(
                        'flex items-center border-b border-[var(--color-line)] px-4 py-4',
                        c.code === 'T' && 'bg-gold/[0.025]'
                      )}
                    >
                      {row.render(c, summaryByCode[c.code] ?? null)}
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* CTA row */}
              <div className="sticky left-0 z-10 bg-surface-0/85 px-4 py-5 backdrop-blur-md" />
              {classes.map((c) => (
                <div
                  key={c.code + 'cta'}
                  className={cn('px-4 py-5', c.code === 'T' && 'rounded-b-2xl bg-gold/[0.04]')}
                >
                  <Link
                    href={c.ctaHref}
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-2 rounded-full px-3 py-2.5 text-center font-heading text-[10.5px] font-semibold uppercase tracking-[0.14em] transition-[transform,filter,background-color] duration-500 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-surface-0',
                      c.ctaKind === 'enquiry'
                        ? 'border border-[var(--color-line-gold)] text-ink hover:bg-white/[0.05]'
                        : 'bg-gold text-gold-ink hover:brightness-[1.05]'
                    )}
                  >
                    {c.ctaKind === 'enquiry' ? 'Request' : 'Check dates'}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          {/* edge fade hints horizontal scroll on small screens */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-surface-0 to-transparent md:hidden" />
        </div>
      </div>
    </section>
  );
}

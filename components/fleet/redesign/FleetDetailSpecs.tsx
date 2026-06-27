'use client';

import { Check, Sparkles } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { MediaSlot } from '@/components/fleet/redesign/MediaSlot';

export interface SpecRow {
  label: string;
  value: string;
}

/**
 * Specifications, split honestly into API-confirmed values and editorial rows
 * that are NOT yet confirmed (rendered under a clearly-labelled "To confirm"
 * group with a marker). Replace the placeholder group with real data — or, if
 * these should become real fields, add them to the caravan-class API (backend
 * dependency; backend is read-only for this task).
 */
export function FleetDetailSpecs({
  confirmed,
  toConfirm,
  amenities,
  sideImage,
  sideIsPlaceholder,
  name,
}: {
  confirmed: SpecRow[];
  toConfirm: SpecRow[];
  amenities: string[];
  sideImage: string;
  sideIsPlaceholder: boolean;
  name: string;
}) {
  const reduced = useReducedMotion();

  return (
    <section className="relative border-t border-[var(--color-line)] bg-surface-1 py-20 md:py-28">
      <div className="mx-auto max-w-screen-2xl px-6 md:px-12">
        <motion.header
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.85, ease: luxuryEase }}
          className="max-w-2xl"
        >
          <span className="label-mono text-gold">Specifications</span>
          <h2 className="mt-4 font-heading text-[clamp(1.8rem,3.6vw,2.75rem)] font-semibold leading-[1.06] tracking-[-0.025em] text-ink">
            The detail, kept honest.
          </h2>
        </motion.header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          {/* Spec groups */}
          <div className="space-y-12">
            {/* Confirmed */}
            <div>
              <div className="flex items-center gap-2.5 border-b border-[var(--color-line-strong)] pb-3">
                <Check className="size-4 text-gold" aria-hidden />
                <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                  Confirmed
                </h3>
              </div>
              <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                {confirmed.map((row) => (
                  <div key={row.label} className="flex flex-col gap-1">
                    <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      {row.label}
                    </dt>
                    <dd className="font-heading text-[15px] font-semibold tracking-tight text-ink">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* To confirm — placeholder editorial figures */}
            {toConfirm.length > 0 && (
              <div data-media-placeholder="true">
                <div className="flex items-center gap-2.5 border-b border-dashed border-[var(--color-line-strong)] pb-3">
                  <Sparkles className="size-4 text-gold/70" aria-hidden />
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-muted">
                    To confirm
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-gold/60">
                    placeholder figures
                  </span>
                </div>
                <dl className="mt-6 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
                  {toConfirm.map((row) => (
                    <div key={row.label} className="flex flex-col gap-1">
                      <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                        {row.label}
                      </dt>
                      <dd className="inline-flex items-center gap-1.5">
                        <span className="font-heading text-[15px] font-semibold tracking-tight text-ink-muted">
                          {row.value}
                        </span>
                        <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-gold/60">
                          tbc
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Amenities — real API */}
            {amenities.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 border-b border-[var(--color-line-strong)] pb-3">
                  <Check className="size-4 text-gold" aria-hidden />
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink">
                    Amenities
                  </h3>
                </div>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {amenities.map((a) => (
                    <li
                      key={a}
                      className="rounded-full border border-[var(--color-line-strong)] bg-white/[0.02] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-muted"
                    >
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Side visual */}
          <div className="relative">
            <div className="sticky top-28 overflow-hidden rounded-[1.75rem] ring-1 ring-[var(--color-line)]">
              <div className="aspect-[3/4]">
                <MediaSlot
                  kind="image"
                  src={sideImage}
                  alt={`${name} detail`}
                  isPlaceholder={sideIsPlaceholder}
                  zoomOnHover
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

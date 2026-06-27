'use client';

import {
  Users,
  BedDouble,
  Sofa,
  ShowerHead,
  Utensils,
  Sun,
  Wind,
  Dog,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { luxuryEase } from '@/components/fleet/luxury-motion';
import { FLEET_SHARED_FEATURES } from '@/config/fleet-classes';

const ICONS: LucideIcon[] = [Users, BedDouble, Sofa, ShowerHead, Utensils, Sun, Wind, Dog];

/**
 * "Standard across the fleet" band. Lets the per-class chapters focus on what
 * differs by pulling the shared baseline (crew, beds, washroom, kitchen, deck,
 * AC, pets) into one quiet grid.
 */
export function FleetSharedFeatures() {
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
          <span className="label-mono text-gold">Standard across the fleet</span>
          <h2 className="mt-4 font-heading text-[clamp(1.9rem,4vw,3rem)] font-semibold leading-[1.04] tracking-[-0.025em] text-ink">
            Every class starts fully equipped.
          </h2>
          <p className="mt-4 font-body text-[15px] leading-relaxed text-ink-muted">
            These come with every MotoHom, Traveller to Viceroy. Choosing a class
            is about how far above this baseline you want to go.
          </p>
        </motion.header>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line)] md:grid-cols-4">
          {FLEET_SHARED_FEATURES.map((feature, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <motion.div
                key={feature.label}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-6% 0px' }}
                transition={{ duration: 0.7, ease: luxuryEase, delay: (i % 4) * 0.05 }}
                className="group flex flex-col gap-3 bg-surface-1 p-5 transition-colors duration-500 hover:bg-surface-2 md:p-7"
              >
                <Icon className="size-5 text-gold/85" aria-hidden strokeWidth={1.5} />
                <div>
                  <h3 className="font-heading text-[15px] font-semibold tracking-tight text-ink">
                    {feature.label}
                  </h3>
                  <p className="mt-1.5 font-body text-[13px] leading-relaxed text-ink-muted">
                    {feature.note}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

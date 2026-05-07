'use client';

import {
  Home,
  Layers,
  MapPin,
  PawPrint,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { FleetClassSummary } from '@/types/fleet';
import { luxuryEase } from '@/components/fleet/luxury-motion';

function QuickChip({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--color-line)] bg-stitch-background/55 p-4 backdrop-blur-md">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
        <Icon className="size-5 text-stitch-primary-container" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="font-headline text-[9px] font-semibold uppercase tracking-[0.26em] text-stitch-on-surface-variant">
          {label}
        </p>
        <p className="mt-1 truncate font-headline text-sm font-semibold tracking-[-0.02em] text-stitch-on-background md:text-base">
          {value}
        </p>
      </div>
    </div>
  );
}

export function FleetDetailIntro({
  summary,
  displayName,
  tagline,
  heroSecondaryUrl,
  heroSecondaryAlt,
}: {
  summary: FleetClassSummary;
  displayName: string;
  tagline: string;
  heroSecondaryUrl: string;
  heroSecondaryAlt: string;
}) {
  const reduced = useReducedMotion();
  const { klass, units } = summary;
  const hubs = [...new Set(units.map((u) => u.home_hub_name).filter(Boolean))];

  const hubSummary =
    hubs.length === 0
      ? 'Network placement'
      : hubs.length <= 2
        ? hubs.join(' · ')
        : `${hubs.slice(0, 2).join(' · ')} +${hubs.length - 2}`;

  const petSummary =
    klass.capacity_pets > 0
      ? `${klass.capacity_pets} pet ${klass.capacity_pets === 1 ? 'spot' : 'spots'}`
      : 'Guests only';

  const rawDesc = klass.description?.trim();
  const body =
    rawDesc ||
    `${displayName} is configured across the MotoHom network with concierge-backed preparation and staged amenities for your itinerary.`;

  return (
    <section className="section-ambient-warm relative scroll-mt-24 border-b border-[var(--color-line)] py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(229,185,92,0.06),transparent_55%)]" />
      <div className="relative mx-auto grid max-w-screen-xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16 lg:items-start px-6 md:px-10">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 22 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 0.9, ease: luxuryEase }}
        >
          <h2 className="font-headline text-3xl font-semibold leading-[1.05] tracking-[-0.028em] text-stitch-on-background md:text-[2.125rem]">
            {klass.name}
          </h2>
          <p className="mt-4 font-body text-sm font-medium uppercase tracking-[0.18em] text-stitch-primary-container/90">
            {tagline}
          </p>
          <p className="mt-6 font-body text-base leading-relaxed text-stitch-on-surface-variant/88 md:text-lg">
            {body}
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <QuickChip icon={Users} label="Guests" value={`${klass.full_capacity} configured`} />
            <QuickChip icon={PawPrint} label="Pets" value={petSummary} />
            <QuickChip icon={MapPin} label="Hub spread" value={hubSummary} />
            <QuickChip
              icon={Sparkles}
              label="Amenities"
              value={`${klass.amenities.length} listed`}
            />
            <QuickChip
              icon={Home}
              label="Fleet footprint"
              value={`${summary.unitCount} curated ${summary.unitCount === 1 ? 'van' : 'vans'}`}
            />
            <QuickChip
              icon={Layers}
              label="Class code"
              value={klass.code}
            />
          </div>
        </motion.div>

        <motion.div
          initial={reduced ? false : { opacity: 0, y: 28 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 1, ease: luxuryEase, delay: 0.06 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-[2rem] ring-1 ring-[var(--color-line)] shadow-luxury-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroSecondaryUrl}
              alt={heroSecondaryAlt}
              className="aspect-[4/5] h-auto w-full object-cover md:aspect-[16/11] lg:aspect-auto lg:min-h-[440px]"
            />
          </div>
          <div className="pointer-events-none absolute -bottom-8 -left-6 hidden h-28 w-28 rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-stitch-primary-container/25 to-transparent blur-2xl md:block" />
        </motion.div>
      </div>
    </section>
  );
}

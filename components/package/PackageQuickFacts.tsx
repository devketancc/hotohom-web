'use client';

import { Car, Clock, Gauge, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TravelPackage } from '@/types/package';

type PackageQuickFactsProps = {
  pkg: TravelPackage;
  className?: string;
};

const facts = [
  {
    key: 'hub',
    icon: MapPin,
    label: 'Departure hub',
    value: (p: TravelPackage) => p.home_hub_name,
  },
  {
    key: 'duration',
    icon: Clock,
    label: 'Duration',
    value: (p: TravelPackage) =>
      `${p.duration_days} ${p.duration_days === 1 ? 'day' : 'days'}`,
  },
  {
    key: 'km',
    icon: Gauge,
    label: 'Included km',
    value: (p: TravelPackage) => `${p.included_km.toLocaleString('en-IN')} km`,
  },
  {
    key: 'class',
    icon: Car,
    label: 'Caravan class',
    value: (p: TravelPackage) => `Class ${p.caravan_class_code}`,
  },
] as const;

export function PackageQuickFacts({ pkg, className }: PackageQuickFactsProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4',
        className
      )}
    >
      {facts.map(({ key, icon: Icon, label, value }) => (
        <div
          key={key}
          className="glass-card rounded-xl border border-white/10 p-4 md:p-5"
        >
          <Icon className="mb-2 size-5 text-stitch-primary" aria-hidden />
          <p className="text-[10px] font-black uppercase tracking-widest text-stitch-on-surface-variant font-headline">
            {label}
          </p>
          <p className="mt-1 text-sm font-bold text-stitch-on-background font-body md:text-base">
            {value(pkg)}
          </p>
        </div>
      ))}
    </div>
  );
}

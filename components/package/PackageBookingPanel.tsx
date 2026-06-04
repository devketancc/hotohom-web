'use client';

import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { PackageStartDateCalendar } from '@/components/package/PackageStartDateCalendar';
import type { TravelPackage } from '@/types/package';
import { packageBasePriceNumber } from '@/utils/packageGallery';
import { formatCurrency } from '@/utils/format';

export type PackageBookingPanelProps = {
  pkg: TravelPackage;
  startDate: Date | null;
  onSelectDate: (date: Date | null) => void;
  onProceed: () => void;
  canProceed: boolean;
  hubAvailable: boolean;
  id?: string;
  className?: string;
};

export function PackageBookingPanel({
  pkg,
  startDate,
  onSelectDate,
  onProceed,
  canProceed,
  hubAvailable,
  id = 'package-booking-panel',
  className,
}: PackageBookingPanelProps) {
  const price = packageBasePriceNumber(pkg.base_price);

  return (
    <aside
      id={id}
      className={cn(
        'glass-card rounded-2xl border border-white/10 p-6 shadow-2xl lg:sticky lg:top-28 lg:self-start',
        className
      )}
    >
      {price != null && (
        <div className="mb-6 border-b border-white/10 pb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-stitch-on-surface-variant font-headline">
            Package from
          </p>
          <p className="text-3xl font-bold text-stitch-primary font-headline">{formatCurrency(price)}</p>
          <p className="mt-1 text-xs text-stitch-on-surface-variant font-body">
            {pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'} ·{' '}
            {pkg.included_km.toLocaleString('en-IN')} km included
          </p>
        </div>
      )}

      <h2 className="text-xs font-black uppercase tracking-widest text-stitch-primary mb-4 font-headline">
        Trip start date
      </h2>
      <p className="text-sm text-stitch-on-surface-variant mb-4 font-body">
        Choose when your package starts (tomorrow through the next 6 months). Your trip window is{' '}
        {pkg.duration_days} {pkg.duration_days === 1 ? 'day' : 'days'}.
      </p>
      <PackageStartDateCalendar selected={startDate} onSelect={onSelectDate} />
      {startDate && (
        <p className="mt-4 text-sm text-stitch-on-surface-variant font-body">
          Selected:{' '}
          <strong className="text-stitch-on-background">{format(startDate, 'd MMM yyyy')}</strong>
        </p>
      )}
      <button
        type="button"
        disabled={!canProceed || !hubAvailable}
        onClick={onProceed}
        className="mt-8 w-full rounded-xl bg-stitch-primary py-4 font-headline font-bold text-sm uppercase tracking-widest text-stitch-on-primary hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        Proceed to pickup &amp; drop-off
      </button>
      {!hubAvailable && (
        <p className="mt-3 text-xs text-amber-500/90 font-body">
          Hub location is unavailable; refresh the page or try again later.
        </p>
      )}
    </aside>
  );
}

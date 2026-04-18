'use client';

import { cn } from '@/lib/utils';
import { PackageStartDateCalendar } from '@/components/package/PackageStartDateCalendar';
import { useBookingStore } from '@/store/bookingStore';

export type PackageTripDatePanelProps = {
  onComplete?: () => void;
  className?: string;
};

/** Context bar: change package trip start only (end follows package duration). */
export function PackageTripDatePanel({ onComplete, className }: PackageTripDatePanelProps) {
  const dates = useBookingStore((s) => s.dates);
  const setPackageTripStart = useBookingStore((s) => s.setPackageTripStart);

  return (
    <div className={cn(className)}>
      <p className="text-[11px] text-stitch-on-surface-variant mb-3 px-1">
        Trip length stays fixed for this package. Pick a new <strong>start</strong> date only.
      </p>
      <PackageStartDateCalendar
        selected={dates.start}
        onSelect={(date) => {
          setPackageTripStart(date);
          onComplete?.();
        }}
      />
    </div>
  );
}

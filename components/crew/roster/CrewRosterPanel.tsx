'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { addDays, format, startOfToday } from 'date-fns';
import { CalendarOff } from 'lucide-react';
import { RosterColumnLegend } from '@/components/admin/roster/AdminRosterPanel';
import { RosterDateGroup } from '@/components/admin/roster/RosterDateGroup';
import { CrewRosterFilterBar } from '@/components/crew/roster/CrewRosterFilterBar';
import { groupBookingsByLocalDay } from '@/lib/rosterGrouping';
import {
  useCrewCalendarRoster,
  type RosterPreset,
  type RosterValidation,
} from '@/hooks/useCrewCalendarRoster';

function validationMessage(v: RosterValidation): string | null {
  if (v.ok) return null;
  switch (v.reason) {
    case 'invalid_date':
      return 'Enter valid dates (YYYY-MM-DD).';
    case 'date_order':
      return 'Start date must be on or before end date.';
    case 'range_exceeded':
      return 'Date range cannot exceed 90 days.';
    default:
      return 'Check your date range.';
  }
}

function formatQueryError(err: unknown): string {
  if (!(err instanceof Error)) return 'Something went wrong.';
  const code = (err as Error & { code?: string }).code;
  if (code === 'INVALID_DATE') return err.message || 'Dates must be in YYYY-MM-DD format.';
  if (code === 'RANGE_TOO_LARGE') return err.message || 'Date range cannot exceed 90 days.';
  return err.message;
}

function RosterListSkeleton() {
  return (
    <div className="flex flex-col gap-2" aria-busy aria-label="Loading roster">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md border border-border/40 bg-muted/25" />
      ))}
    </div>
  );
}

export function CrewRosterPanel() {
  const router = useRouter();
  const today = startOfToday();
  const [preset, setPreset] = useState<RosterPreset>('7d');
  const [startYmd, setStartYmd] = useState(() => format(today, 'yyyy-MM-dd'));
  const [endYmd, setEndYmd] = useState(() => format(addDays(today, 7), 'yyyy-MM-dd'));
  const [compactMode, setCompactMode] = useState(true);

  const filters = useMemo(() => ({ startYmd, endYmd }), [startYmd, endYmd]);

  const { data, isPending, error, validation } = useCrewCalendarRoster(filters);
  const rangeError = validationMessage(validation);

  const applyPreset = useCallback((p: RosterPreset) => {
    setPreset(p);
    const start = format(startOfToday(), 'yyyy-MM-dd');
    if (p === '7d') {
      setStartYmd(start);
      setEndYmd(format(addDays(startOfToday(), 7), 'yyyy-MM-dd'));
    } else if (p === '30d') {
      setStartYmd(start);
      setEndYmd(format(addDays(startOfToday(), 30), 'yyyy-MM-dd'));
    }
  }, []);

  const onStartChange = useCallback((v: string) => {
    setPreset('custom');
    setStartYmd(v);
  }, []);

  const onEndChange = useCallback((v: string) => {
    setPreset('custom');
    setEndYmd(v);
  }, []);

  const onPresetChange = useCallback(
    (p: RosterPreset) => {
      if (p === '7d' || p === '30d') applyPreset(p);
      else setPreset('custom');
    },
    [applyPreset]
  );

  const grouped = useMemo(() => groupBookingsByLocalDay(data ?? []), [data]);
  const now = new Date();

  const onSelectBooking = useCallback(
    (booking: { booking_id: string }) => {
      router.push(`/crew/bookings/${encodeURIComponent(booking.booking_id)}?from=roster`);
    },
    [router]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setCompactMode((v) => !v)}
          className="rounded-md border border-white/10 bg-zinc-900/55 px-2 py-1 text-[11px] text-zinc-400 transition-colors hover:bg-zinc-800/70 hover:text-zinc-100"
        >
          Density: {compactMode ? 'Compact' : 'Comfortable'}
        </button>
      </div>
      <CrewRosterFilterBar
        preset={preset}
        onPresetChange={onPresetChange}
        startYmd={startYmd}
        endYmd={endYmd}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        rangeError={rangeError}
      />

      {error ? (
        <div
          className="rounded-md border border-red-500/20 bg-red-900/10 px-3 py-2 text-xs text-red-300"
          role="alert"
        >
          {formatQueryError(error)}
        </div>
      ) : null}

      {isPending && !error ? <RosterListSkeleton /> : null}

      {!isPending && !error && validation.ok && (data?.length ?? 0) === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-border/50 bg-muted/10 px-4 py-10 text-center">
          <CalendarOff className="mb-2 size-7 text-muted-foreground/70" aria-hidden />
          <p className="text-sm font-medium text-foreground">No bookings found</p>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">
            Try widening the date range or check back later for new assignments.
          </p>
        </div>
      ) : null}

      {!isPending && !error && validation.ok && (data?.length ?? 0) > 0 ? (
        <div className="relative flex flex-col gap-1">
          <RosterColumnLegend compact={compactMode} />
          {grouped.map(({ dayKey, items }) => (
            <RosterDateGroup
              key={dayKey}
              dayKey={dayKey}
              bookings={items}
              now={now}
              compact={compactMode}
              onSelectBooking={onSelectBooking}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

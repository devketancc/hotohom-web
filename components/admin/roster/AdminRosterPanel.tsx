'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { addDays, format, parseISO, startOfToday } from 'date-fns';
import { CalendarOff } from 'lucide-react';
import { AssignStaffSheet } from '@/components/admin/roster/AssignStaffSheet';
import { RosterDateGroup } from '@/components/admin/roster/RosterDateGroup';
import { RosterFilterBar } from '@/components/admin/roster/RosterFilterBar';
import { adminQueryKeys, listAdminHubs } from '@/services/admin.service';
import {
  useAdminCalendarRoster,
  type RosterPreset,
  type RosterValidation,
} from '@/hooks/useAdminCalendarRoster';
import type { AdminRosterBooking } from '@/types/admin';

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

function groupBookingsByLocalDay(bookings: AdminRosterBooking[]): { dayKey: string; items: AdminRosterBooking[] }[] {
  const sorted = [...bookings].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const map = new Map<string, AdminRosterBooking[]>();
  for (const b of sorted) {
    const key = format(parseISO(b.start), 'yyyy-MM-dd');
    const list = map.get(key);
    if (list) list.push(b);
    else map.set(key, [b]);
  }
  const keys = [...map.keys()].sort();
  return keys.map((dayKey) => ({ dayKey, items: map.get(dayKey)! }));
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

export function RosterColumnLegend({ compact }: { compact: boolean }) {
  return (
    <div className="hidden rounded-md border border-white/10 bg-zinc-950/80 px-2.5 py-1.5 sm:block">
      <div
        className={
          compact
            ? 'grid grid-cols-[7.5rem_minmax(10rem,1.25fr)_minmax(10rem,1.2fr)_minmax(5.5rem,0.8fr)_minmax(7.5rem,1fr)_minmax(7.5rem,1fr)_minmax(9rem,1.1fr)] items-center gap-1.5'
            : 'grid grid-cols-[9rem_minmax(11rem,1.3fr)_minmax(11rem,1.25fr)_minmax(6rem,0.85fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(10rem,1.15fr)] items-center gap-1.5'
        }
      >
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Date</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Customer</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Caravan</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Hub</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Driver</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Helper</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">Status / Alerts</span>
      </div>
    </div>
  );
}

export function AdminRosterPanel() {
  const today = startOfToday();
  const [preset, setPreset] = useState<RosterPreset>('7d');
  const [startYmd, setStartYmd] = useState(() => format(today, 'yyyy-MM-dd'));
  const [endYmd, setEndYmd] = useState(() => format(addDays(today, 7), 'yyyy-MM-dd'));
  const [hubId, setHubId] = useState('');
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [compactMode, setCompactMode] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: hubs = [], isPending: hubsLoading } = useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
  });

  const filters = useMemo(
    () => ({ startYmd, endYmd, hubId, alertsOnly }),
    [startYmd, endYmd, hubId, alertsOnly]
  );

  const { data, isPending, error, validation } = useAdminCalendarRoster(filters);
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

  // Derived from fresh roster data so the aside reflects reassignments after refetch.
  const selectedBooking = useMemo(
    () => data?.find((b) => b.booking_id === selectedBookingId) ?? null,
    [data, selectedBookingId]
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
      <RosterFilterBar
        preset={preset}
        onPresetChange={onPresetChange}
        startYmd={startYmd}
        endYmd={endYmd}
        onStartChange={onStartChange}
        onEndChange={onEndChange}
        hubs={hubs}
        hubId={hubId}
        onHubChange={setHubId}
        alertsOnly={alertsOnly}
        onAlertsOnlyChange={setAlertsOnly}
        rangeError={rangeError}
        hubsLoading={hubsLoading}
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
            Try widening the date range, choosing &quot;All hubs&quot;, or turning off the alerts filter.
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
              onSelectBooking={(booking) => {
                setSelectedBookingId(booking.booking_id);
              }}
            />
          ))}
        </div>
      ) : null}

      {selectedBooking ? (
        <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-border/60 bg-card/95 p-4 shadow-2xl backdrop-blur sm:p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">{selectedBooking.customer_name}</h3>
              <p className="text-xs text-muted-foreground">
                {selectedBooking.caravan.registration} ({selectedBooking.caravan.class_code})
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedBookingId(null);
              }}
              className="rounded-md border border-border/60 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
          <div className="space-y-2 text-xs">
            <p>
              <span className="text-muted-foreground">Schedule: </span>
              {format(parseISO(selectedBooking.start), 'MMM d, p')} - {format(parseISO(selectedBooking.end), 'MMM d, p')}
            </p>
            <p>
              <span className="text-muted-foreground">Hub: </span>
              {selectedBooking.caravan.hub || '—'}
            </p>
            <p>
              <span className="text-muted-foreground">Driver: </span>
              {selectedBooking.driver?.name || 'No Driver Assigned'}
            </p>
            <p>
              <span className="text-muted-foreground">Helper: </span>
              {selectedBooking.helper?.name || 'No Helper Assigned'}
            </p>
            <p>
              <span className="text-muted-foreground">Status: </span>
              {selectedBooking.status || 'unknown'}
            </p>
            {selectedBooking.open_alerts.includes('eot_approval_pending') ? (
              <p className="text-amber-200/90">Review and approve EOT on the full booking page.</p>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => setAssignOpen(true)}
              className="rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-foreground hover:bg-background"
            >
              Assign staff
            </button>
            <Link
              href={`/admin/bookings/${encodeURIComponent(selectedBooking.booking_id)}`}
              className="rounded-md border border-border/60 bg-background/80 px-3 py-1.5 text-xs text-foreground hover:bg-background"
            >
              Open Full Booking
            </Link>
          </div>
        </aside>
      ) : null}

      {selectedBooking ? (
        <AssignStaffSheet open={assignOpen} onOpenChange={setAssignOpen} booking={selectedBooking} />
      ) : null}
    </div>
  );
}

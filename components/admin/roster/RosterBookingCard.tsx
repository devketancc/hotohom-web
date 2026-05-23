'use client';

import { addHours, differenceInCalendarDays, format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AdminRosterBooking } from '@/types/admin';

function alertLabel(code: string): string {
  if (code === 'no_driver') return 'No Driver';
  if (code === 'no_helper') return 'No Helper';
  if (code === 'eot_approval_pending') return 'EOT approval';
  return code.replace(/_/g, ' ');
}

function getDateRangeParts(startIso: string, endIso: string): { label: string; durationText: string } {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const durationDays = Math.max(1, differenceInCalendarDays(startOfDay(end), startOfDay(start)) + 1);
  const durationText = `${durationDays} ${durationDays === 1 ? 'Day' : 'Days'}`;

  if (isSameDay(start, end)) {
    return { label: `${format(start, 'd MMM')}`, durationText };
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return { label: `${format(start, 'd')}–${format(end, 'd MMM')}`, durationText };
  }
  return { label: `${format(start, 'd MMM')}–${format(end, 'd MMM')}`, durationText };
}

export function rosterEmphasisFlags(booking: AdminRosterBooking, now: Date): { today: boolean; soon: boolean } {
  const start = parseISO(booking.start);
  const today = isSameDay(startOfDay(start), startOfDay(now));
  const horizon = addHours(now, 24);
  const t0 = start.getTime();
  const soon = t0 >= now.getTime() && t0 <= horizon.getTime();
  return { today, soon };
}

export function RosterBookingCard({
  booking,
  emphasisToday,
  emphasisSoon,
  compact = true,
  onClick,
}: {
  booking: AdminRosterBooking;
  emphasisToday: boolean;
  emphasisSoon: boolean;
  compact?: boolean;
  onClick?: () => void;
}) {
  const hasDriver = Boolean(booking.driver?.name);
  const hasHelper = Boolean(booking.helper?.name);
  const caravanLine = `${booking.caravan.registration} (${booking.caravan.class_code || '—'})`;
  const statusText = booking.status ? booking.status.replace(/_/g, ' ') : 'unknown';
  const hasAlerts = booking.open_alerts.length > 0;
  const { label: dateRange, durationText } = getDateRangeParts(booking.start, booking.end);
  const firstAlert = booking.open_alerts[0];
  const secondAlert = booking.open_alerts[1];

  return (
    <div
      role="button"
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group w-full rounded-md border border-white/10 bg-zinc-900/70 text-left text-card-foreground transition-colors hover:bg-zinc-800/75',
        compact ? 'px-2.5 py-2' : 'px-4 py-3',
        hasAlerts && 'bg-amber-900/10',
        (emphasisToday || emphasisSoon) && 'bg-zinc-800/85'
      )}
    >
      <div
        className={cn(
          'grid items-center gap-1.5',
          compact
            ? 'grid-cols-1 sm:grid-cols-[7.5rem_minmax(10rem,1.25fr)_minmax(10rem,1.2fr)_minmax(5.5rem,0.8fr)_minmax(7.5rem,1fr)_minmax(7.5rem,1fr)_minmax(9rem,1.1fr)]'
            : 'grid-cols-1 sm:grid-cols-[9rem_minmax(11rem,1.3fr)_minmax(11rem,1.25fr)_minmax(6rem,0.85fr)_minmax(8rem,1fr)_minmax(8rem,1fr)_minmax(10rem,1.15fr)]'
        )}
      >
        <div className="min-w-0">
          <p className="font-mono text-[11px] font-medium text-zinc-100">{dateRange}</p>
          <p className="text-[10px] font-medium text-zinc-300">{durationText}</p>
        </div>

        <div className="min-w-0 pr-1">
          <p className="truncate text-sm font-medium text-zinc-100">{booking.customer_name}</p>
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] leading-tight text-zinc-400">{caravanLine}</p>
        </div>

        <div className="min-w-0 text-center sm:text-left">
          <span className="truncate text-[10px] font-medium uppercase tracking-wide text-zinc-300">
            {booking.caravan.hub || '—'}
          </span>
        </div>

        <div className="min-w-0">
          <p className={cn('truncate text-[12px] text-zinc-200', !hasDriver && 'text-amber-300')}>
            {booking.driver?.name || 'No Driver'}
          </p>
        </div>

        <div className="min-w-0">
          <p className={cn('truncate text-[12px] text-zinc-200', !hasHelper && 'text-amber-300')}>
            {booking.helper?.name || 'No Helper'}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="inline-flex rounded-md border border-white/10 bg-zinc-800/80 px-1.5 py-0.5 text-[10px] font-medium capitalize text-zinc-300">
              {statusText}
            </span>
            <span className="h-3 w-px shrink-0 bg-white/10" aria-hidden />
            {hasAlerts ? (
              <>
                {firstAlert ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300">
                    <AlertTriangle className="size-2.5 shrink-0" aria-hidden />
                    {alertLabel(firstAlert)}
                  </span>
                ) : null}
                {secondAlert ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300">
                    <AlertTriangle className="size-2.5 shrink-0" aria-hidden />
                    {alertLabel(secondAlert)}
                  </span>
                ) : null}
                {booking.open_alerts.length > 2 ? (
                  <span className="text-[10px] text-amber-300">+{booking.open_alerts.length - 2}</span>
                ) : null}
              </>
            ) : (
              <span className="text-[10px] text-zinc-500">No alerts</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

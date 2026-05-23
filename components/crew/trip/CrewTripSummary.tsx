'use client';

import { Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { crewTripStatusLabel, crewTripStatusPillClass, normalizeTripStatus } from '@/lib/crewTripUi';
import { CrewExpenseTimeline } from '@/components/crew/trip/CrewExpenseTimeline';
import type { CrewTrip, CrewTripExpenseLog } from '@/types/crew';

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function sortedEvents(trip: CrewTrip) {
  return [...trip.events].sort((a, b) => {
    const ta = a.occurred_at ? new Date(a.occurred_at).getTime() : 0;
    const tb = b.occurred_at ? new Date(b.occurred_at).getTime() : 0;
    return tb - ta;
  });
}

export function CrewTripSummary({
  trip,
  expenseLogs = [],
}: {
  trip: CrewTrip | null;
  expenseLogs?: CrewTripExpenseLog[];
}) {
  if (!trip) return null;

  const status = normalizeTripStatus(trip.status);
  const showOperational =
    status === 'active' || status === 'eot_pending' || status === 'completed' || trip.odometer_start != null;

  if (!showOperational && trip.events.length === 0 && expenseLogs.length === 0) return null;

  const events = sortedEvents(trip);

  return (
    <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold tracking-tight">
          <Car className="size-4 text-primary" aria-hidden />
          Trip status
        </h2>
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset',
            crewTripStatusPillClass(status)
          )}
        >
          {crewTripStatusLabel(status)}
        </span>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        {trip.odometer_start != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">Odometer start</dt>
            <dd className="font-medium">{trip.odometer_start} km</dd>
          </div>
        ) : null}
        {trip.odometer_end != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">Odometer end</dt>
            <dd className="font-medium">{trip.odometer_end} km</dd>
          </div>
        ) : null}
        {trip.actual_km != null ? (
          <div>
            <dt className="text-xs text-muted-foreground">Actual km</dt>
            <dd className="font-medium">{trip.actual_km} km</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-muted-foreground">Started</dt>
          <dd className="font-medium">{formatWhen(trip.actual_start)}</dd>
        </div>
        {(status === 'eot_pending' || status === 'completed') && trip.actual_end ? (
          <div>
            <dt className="text-xs text-muted-foreground">Ended</dt>
            <dd className="font-medium">{formatWhen(trip.actual_end)}</dd>
          </div>
        ) : null}
        {status === 'eot_pending' && trip.eot_submitted_at ? (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">EOT submitted</dt>
            <dd className="font-medium">{formatWhen(trip.eot_submitted_at)}</dd>
          </div>
        ) : null}
      </dl>

      {status === 'eot_pending' ? (
        <p className="mt-3 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-2 text-sm text-blue-100/90">
          Submitted — awaiting operations approval.
        </p>
      ) : null}

      {(status === 'eot_pending' || status === 'completed') &&
      (trip.ac_hours !== '0' || trip.gen_hours !== '0' || trip.driver_notes?.trim()) ? (
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          {trip.ac_hours !== '0' ? (
            <p>
              <span className="text-muted-foreground">AC hours:</span> {trip.ac_hours}
            </p>
          ) : null}
          {trip.gen_hours !== '0' ? (
            <p>
              <span className="text-muted-foreground">Generator hours:</span> {trip.gen_hours}
            </p>
          ) : null}
          {trip.driver_notes?.trim() ? (
            <p>
              <span className="text-muted-foreground">Notes:</span> {trip.driver_notes}
            </p>
          ) : null}
        </div>
      ) : null}

      {events.length > 0 ? (
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent events</h3>
          <ul className="space-y-2">
            {events.slice(0, 8).map((ev) => (
              <li key={ev.id} className="rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-semibold capitalize">{ev.event_type.replace(/_/g, ' ')}</span>
                  <span className="text-xs text-muted-foreground">{formatWhen(ev.occurred_at)}</span>
                </div>
                {ev.notes?.trim() ? <p className="mt-1 text-muted-foreground">{ev.notes}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : status === 'active' ? (
        <p className="mt-3 text-sm text-muted-foreground">No events logged yet.</p>
      ) : null}

      <CrewExpenseTimeline logs={expenseLogs} />
    </section>
  );
}

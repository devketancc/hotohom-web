'use client';

import { routeSummary } from '@/lib/customerBookingUi';
import { formatTripElapsed, odometerProgress } from '@/lib/crewBookingUi';
import { crewTripStatusLabel, crewTripStatusPillClass } from '@/lib/crewTripUi';
import { cn } from '@/lib/utils';
import { CrewCollapsibleSection } from '@/components/crew/trip/CrewCollapsibleSection';
import type { CrewBookingDetail, CrewTripStatus } from '@/types/crew';

export function CrewTripStatusStrip({
  booking,
  status,
}: {
  booking: CrewBookingDetail;
  status: CrewTripStatus;
}) {
  const trip = booking.trip;
  const route = routeSummary(booking.stops);
  const elapsed = trip?.actual_start ? formatTripElapsed(trip.actual_start) : null;
  const progress = odometerProgress(trip?.actual_km, booking.buffered_km);

  const subtitle = [
    crewTripStatusLabel(status),
    elapsed,
    `${route.pickup} → ${route.dropoff}`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <CrewCollapsibleSection title="Trip status" subtitle={subtitle} defaultCollapsed={false}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</p>
          <span
            className={cn(
              'mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
              crewTripStatusPillClass(status)
            )}
          >
            {crewTripStatusLabel(status)}
          </span>
          {elapsed ? <p className="mt-1 text-xs text-muted-foreground">{elapsed}</p> : null}
          {trip?.actual_start ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Started {new Date(trip.actual_start).toLocaleString()}
            </p>
          ) : null}
        </div>

        <div className="sm:border-l sm:border-border sm:pl-4 lg:border-x lg:px-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Route</p>
          <p className="mt-1 text-sm font-medium leading-snug break-words">
            {route.pickup} → {route.dropoff}
          </p>
          {route.waypointCount > 0 ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              +{route.waypointCount} stop{route.waypointCount === 1 ? '' : 's'} en route
            </p>
          ) : null}
        </div>

        <div className="sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Odometer</p>
          {progress ? (
            <>
              <p className="mt-1 text-sm font-medium">{progress.label}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </>
          ) : trip?.odometer_start != null ? (
            <p className="mt-1 text-sm text-muted-foreground">Start: {trip.odometer_start} km</p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">—</p>
          )}
        </div>
      </div>
    </CrewCollapsibleSection>
  );
}

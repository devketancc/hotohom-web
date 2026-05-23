'use client';

import { useState } from 'react';
import { Flag, Fuel, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCrewTripActions } from '@/hooks/useCrewTripActions';
import { crewTripStatusLabel, crewTripStatusPillClass } from '@/lib/crewTripUi';
import type { CrewBookingDetail } from '@/types/crew';
import { StartTripDialog } from '@/components/crew/trip/StartTripDialog';
import { LogTripEventDialog } from '@/components/crew/trip/LogTripEventDialog';
import { EndTripWizard } from '@/components/crew/trip/EndTripWizard';

export function CrewTripActionBar({ booking }: { booking: CrewBookingDetail }) {
  const {
    trip,
    status,
    actions,
    hasTrip,
    startTrip,
    endTrip,
    logEvent,
    isStarting,
    isEnding,
    isLoggingEvent,
    isBusy,
  } = useCrewTripActions(booking);

  const [startOpen, setStartOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  if (!hasTrip) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        No trip record for this booking yet.
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          'sticky top-14 z-30 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:top-14'
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Trip actions</p>
            <span
              className={cn(
                'mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                crewTripStatusPillClass(status)
              )}
            >
              {crewTripStatusLabel(status)}
            </span>
            {status === 'active' && trip?.actual_start ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                Started {new Date(trip.actual_start).toLocaleString()}
                {trip.odometer_start != null ? ` · ${trip.odometer_start} km` : ''}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {actions.canStart ? (
              <Button type="button" size="lg" className="gap-2" disabled={isBusy} onClick={() => setStartOpen(true)}>
                <Play className="size-4" aria-hidden />
                Start trip
              </Button>
            ) : null}
            {actions.canEnd ? (
              <Button
                type="button"
                size="lg"
                variant="default"
                className="gap-2"
                disabled={isBusy}
                onClick={() => setEndOpen(true)}
              >
                <Square className="size-4" aria-hidden />
                End trip
              </Button>
            ) : null}
            {actions.canLogEvent ? (
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="gap-2"
                disabled={isBusy}
                onClick={() => setLogOpen(true)}
              >
                <Fuel className="size-4" aria-hidden />
                Log event
              </Button>
            ) : null}
            {actions.isReadOnly && status === 'eot_pending' ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground">
                <Flag className="size-4 shrink-0" aria-hidden />
                Awaiting approval
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <StartTripDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        pending={isStarting}
        onConfirm={async (odometer_start) => {
          await startTrip({ odometer_start });
        }}
      />

      <LogTripEventDialog
        open={logOpen}
        onOpenChange={setLogOpen}
        pending={isLoggingEvent}
        onSubmit={async (payload) => {
          await logEvent(payload);
        }}
      />

      <EndTripWizard
        open={endOpen}
        onOpenChange={setEndOpen}
        odometerStart={trip?.odometer_start ?? null}
        pending={isEnding}
        onSubmit={async (payload) => {
          await endTrip(payload);
        }}
      />
    </>
  );
}

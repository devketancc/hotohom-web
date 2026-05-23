'use client';

import { useState } from 'react';
import { Flag, Fuel, Play, Receipt, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCrewTripActions } from '@/hooks/useCrewTripActions';
import { crewTripStatusLabel, crewTripStatusPillClass } from '@/lib/crewTripUi';
import type { CrewBookingDetail, CrewTripExpenseLog } from '@/types/crew';
import { StartTripDialog } from '@/components/crew/trip/StartTripDialog';
import { LogTripEventDialog } from '@/components/crew/trip/LogTripEventDialog';
import { LogTripExpenseSheet } from '@/components/crew/trip/LogTripExpenseSheet';
import { EndTripWizard } from '@/components/crew/trip/EndTripWizard';

export function CrewTripActionBar({
  booking,
  expenseOpen: expenseOpenControlled,
  onExpenseOpenChange,
  recentExpenseLogs = [],
}: {
  booking: CrewBookingDetail;
  expenseOpen?: boolean;
  onExpenseOpenChange?: (open: boolean) => void;
  recentExpenseLogs?: CrewTripExpenseLog[];
}) {
  const {
    trip,
    tripId,
    status,
    actions,
    hasTrip,
    startTrip,
    endTrip,
    logEvent,
    logExpense,
    isStarting,
    isEnding,
    isLoggingEvent,
    isLoggingExpense,
    isBusy,
  } = useCrewTripActions(booking);

  const [startOpen, setStartOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [expenseOpenInternal, setExpenseOpenInternal] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const expenseOpen = expenseOpenControlled ?? expenseOpenInternal;
  const setExpenseOpenWrapped = (open: boolean) => {
    setExpenseOpenInternal(open);
    onExpenseOpenChange?.(open);
  };

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
        <div className="mx-auto flex max-w-6xl flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
              {actions.canLogExpense ? (
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  disabled={isBusy}
                  onClick={() => setExpenseOpenWrapped(true)}
                >
                  <Receipt className="size-4" aria-hidden />
                  Log expense
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

          {status === 'active' ? (
            <p className="text-xs text-muted-foreground">
              <strong className="font-semibold text-foreground/90">Expenses</strong> count toward the customer bill.{' '}
              <strong className="font-semibold text-foreground/90">Events</strong> are for ops history (fuel, breakdown).
            </p>
          ) : null}
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

      <LogTripExpenseSheet
        open={expenseOpen}
        onOpenChange={setExpenseOpenWrapped}
        pending={isLoggingExpense}
        recentLogs={recentExpenseLogs}
        onSubmit={async (payload) => {
          await logExpense(payload);
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
        tripId={tripId}
        odometerStart={trip?.odometer_start ?? null}
        pending={isEnding}
        onRequestLogExpense={() => setExpenseOpenWrapped(true)}
        onSubmit={async (payload) => {
          await endTrip(payload);
        }}
      />
    </>
  );
}

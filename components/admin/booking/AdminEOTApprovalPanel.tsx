'use client';

import { useState } from 'react';
import { CheckCircle2, Clock, FileCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminTripExpenseReview } from '@/components/admin/booking/AdminTripExpenseReview';
import { EndTripWizard } from '@/components/crew/trip/EndTripWizard';
import { MoneyLine, formatIsoDateTime } from '@/components/booking/BookingDetailAtoms';
import { useAdminTripEOTActions } from '@/hooks/useAdminTripEOTActions';
import { useAdminTripExpenses } from '@/hooks/useAdminTripExpenses';
import {
  buildEOTChargeLines,
  canApproveEOT,
  canSubmitEOT,
  canSubmitEOTForTrip,
  canViewTripExpenses,
  isEOTPending,
  shouldShowAdminEOTPanel,
} from '@/lib/adminEotUi';
import { formatInr } from '@/utils/format';
import type { AdminBookingDetail } from '@/types/admin';

function parseMoney(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function AdminEOTApprovalPanel({
  booking,
  userRole,
}: {
  booking: AdminBookingDetail;
  userRole: string | undefined;
}) {
  const trip = booking.trip;
  const tripId = trip?.id ?? '';
  const bookingId = booking.id;

  const [approveOpen, setApproveOpen] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const showPanel = shouldShowAdminEOTPanel(trip);
  const eotPending = isEOTPending(trip);
  const canSubmitForTrip = canSubmitEOTForTrip(trip);
  const showApprove = canApproveEOT(userRole) && eotPending;
  const showSubmit = canSubmitEOT(userRole) && canSubmitForTrip;
  const showExpenses = canViewTripExpenses(userRole);

  const expensesEnabled = showPanel && showExpenses && Boolean(tripId);
  const { logs, aggregated, isLoading: expensesLoading } = useAdminTripExpenses(
    tripId,
    userRole,
    expensesEnabled
  );

  const { approve, submit, isApproving, isSubmitting, isBusy } = useAdminTripEOTActions(
    bookingId,
    tripId
  );

  if (!trip || !showPanel) {
    if (trip?.status === 'completed' && trip.eot_submitted_at) {
      return (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-100">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          EOT completed
          {trip.eot_submitted_at ? (
            <span className="text-emerald-200/80">· submitted {formatIsoDateTime(trip.eot_submitted_at)}</span>
          ) : null}
        </div>
      );
    }
    return null;
  }

  const chargeLines = buildEOTChargeLines(trip);
  const totalExtra = parseMoney(trip.total_extra_charge);

  return (
    <>
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm md:p-5">
        {eotPending ? (
          <div className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-950/25 px-4 py-3">
            <Clock className="mt-0.5 size-5 shrink-0 text-blue-300" aria-hidden />
            <div>
              <p className="font-semibold text-blue-100">Awaiting EOT approval</p>
              <p className="mt-1 text-sm text-blue-100/80">
                Driver submitted end-of-trip on {formatIsoDateTime(trip.eot_submitted_at)}.
                {trip.driver_notes?.trim() ? (
                  <span className="mt-1 block italic">Driver note: {trip.driver_notes.trim()}</span>
                ) : null}
              </p>
            </div>
          </div>
        ) : canSubmitForTrip ? (
          <div className="flex gap-3 rounded-lg border border-amber-500/30 bg-amber-950/20 px-4 py-3">
            <FileCheck className="mt-0.5 size-5 shrink-0 text-amber-300" aria-hidden />
            <div>
              <p className="font-semibold text-amber-100">Trip still active</p>
              <p className="mt-1 text-sm text-amber-100/80">
                Submit EOT on behalf of crew when the trip has ended.
              </p>
            </div>
          </div>
        ) : null}

        <div>
          <h2 className="text-sm font-bold tracking-tight">EOT charge breakdown</h2>
          <div className="mt-3 space-y-1 rounded-lg border border-border/80 bg-muted/10 p-3">
            {chargeLines.map((line) => (
              <MoneyLine
                key={line.label}
                label={line.label}
                amount={line.amount}
                emphasize={line.emphasize}
              />
            ))}
          </div>
        </div>

        {showExpenses ? (
          <AdminTripExpenseReview logs={logs} aggregated={aggregated} isLoading={expensesLoading} />
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          {showApprove ? (
            <Button type="button" disabled={isBusy} onClick={() => setApproveOpen(true)}>
              Approve EOT
            </Button>
          ) : null}
          {showSubmit ? (
            <Button type="button" variant={showApprove ? 'outline' : 'default'} disabled={isBusy} onClick={() => setSubmitOpen(true)}>
              Submit EOT
            </Button>
          ) : null}
        </div>
      </section>

      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve end of trip?</DialogTitle>
            <DialogDescription>
              This completes the trip and booking. Extra charges total{' '}
              <span className="font-semibold text-foreground">{formatInr(totalExtra)}</span>.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Send the Razorpay payment link to the customer after approval.
          </p>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button type="button" variant="outline" disabled={isApproving} onClick={() => setApproveOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isApproving}
              onClick={() => {
                void approve().then(() => setApproveOpen(false));
              }}
            >
              {isApproving ? 'Approving…' : 'Approve EOT'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tripId ? (
        <EndTripWizard
          open={submitOpen}
          onOpenChange={setSubmitOpen}
          tripId={tripId}
          odometerStart={trip.odometer_start ?? null}
          pending={isSubmitting}
          eotSummary={aggregated}
          summaryLoading={expensesLoading && submitOpen}
          sheetTitle="Submit EOT (ops)"
          sheetDescription="Submit end-of-trip readings and charges on behalf of the crew."
          onSubmit={async (payload) => {
            await submit(payload);
          }}
        />
      ) : null}
    </>
  );
}

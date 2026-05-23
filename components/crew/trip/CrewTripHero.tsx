'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Fuel, MessageCircle, Phone, Play, Receipt, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { crewContactLinks } from '@/lib/crewTeam';
import { telUrl, whatsappUrl } from '@/lib/crewBookingUi';
import type { CrewBookingFrom } from '@/lib/crewBookingAccess';
import { crewBookingBackHref, crewBookingBackLabel } from '@/lib/crewBookingAccess';
import { crewTripStatusLabel, crewTripStatusPillClass } from '@/lib/crewTripUi';
import { useCrewTripActions } from '@/hooks/useCrewTripActions';
import { ConfirmAddonsBeforeStartDialog } from '@/components/crew/trip/ConfirmAddonsBeforeStartDialog';
import { StartTripDialog } from '@/components/crew/trip/StartTripDialog';
import { LogTripEventDialog } from '@/components/crew/trip/LogTripEventDialog';
import { LogTripExpenseSheet } from '@/components/crew/trip/LogTripExpenseSheet';
import { EndTripWizard } from '@/components/crew/trip/EndTripWizard';
import { CrewMobileTripActionBar } from '@/components/crew/trip/CrewMobileTripActionBar';
import { useAuthStore } from '@/store/authStore';
import type { CrewBookingDetail, CrewTripExpenseLog } from '@/types/crew';

function ContactButton({
  href,
  label,
  icon: Icon,
  variant = 'outline',
}: {
  href: string;
  label: string;
  icon: typeof Phone;
  variant?: 'outline' | 'default';
}) {
  if (!href) return null;
  return (
    <a
      href={href}
      className={cn(
        'inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
        variant === 'default'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </a>
  );
}

export function CrewTripHero({
  booking,
  from,
  expenseOpen,
  onExpenseOpenChange,
  recentExpenseLogs = [],
}: {
  booking: CrewBookingDetail;
  from: CrewBookingFrom;
  expenseOpen?: boolean;
  onExpenseOpenChange?: (open: boolean) => void;
  recentExpenseLogs?: CrewTripExpenseLog[];
}) {
  const user = useAuthStore((s) => s.user);
  const { customer, teammate } = crewContactLinks(booking, user);
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

  const [addonsConfirmOpen, setAddonsConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const bookingItems = booking.items ?? [];
  const [logOpen, setLogOpen] = useState(false);
  const [expenseOpenInternal, setExpenseOpenInternal] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const expenseSheetOpen = expenseOpen ?? expenseOpenInternal;
  const setExpenseSheetOpen = (open: boolean) => {
    setExpenseOpenInternal(open);
    onExpenseOpenChange?.(open);
  };

  const caravanTitle = [booking.caravan_name, booking.caravan_class_name || booking.caravan_class]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <header className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:space-y-4 sm:p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={crewBookingBackHref(from)}
            className="font-medium text-primary hover:underline"
          >
            ← {crewBookingBackLabel(from)}
          </Link>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-lg font-bold tracking-tight text-foreground sm:text-xl md:text-2xl">
                {caravanTitle || 'Trip'}
              </h1>
              {hasTrip ? (
                <span
                  className={cn(
                    'inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ring-inset',
                    crewTripStatusPillClass(status)
                  )}
                >
                  {status === 'active' ? 'On trip' : crewTripStatusLabel(status)}
                </span>
              ) : null}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground sm:text-xs break-all">{booking.id}</p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {customer?.phone ? (
                <>
                  <ContactButton
                    href={telUrl(customer.phone)}
                    label={`Call ${customer.name || 'customer'}`}
                    icon={Phone}
                  />
                  <ContactButton
                    href={whatsappUrl(customer.phone)}
                    label="WhatsApp"
                    icon={MessageCircle}
                  />
                </>
              ) : null}
              {teammate?.phone ? (
                <ContactButton
                  href={telUrl(teammate.phone)}
                  label={`Call ${teammate.name}`}
                  icon={Phone}
                />
              ) : null}
            </div>

            {hasTrip ? (
              <>
              {actions.canStart ? (
                <div className="flex w-full lg:hidden">
                  <Button
                    type="button"
                    className="h-11 w-full gap-2"
                    disabled={isBusy}
                    onClick={() => setAddonsConfirmOpen(true)}
                  >
                    <Play className="size-4" aria-hidden />
                    Start trip
                  </Button>
                </div>
              ) : null}
              <div className="hidden flex-wrap gap-2 lg:flex">
                {actions.canStart ? (
                  <Button
                    type="button"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => setAddonsConfirmOpen(true)}
                  >
                    <Play className="size-4" aria-hidden />
                    Start trip
                  </Button>
                ) : null}
                {actions.canLogExpense ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => setExpenseSheetOpen(true)}
                  >
                    <Receipt className="size-4" aria-hidden />
                    Log expense
                  </Button>
                ) : null}
                {actions.canLogEvent ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    disabled={isBusy}
                    onClick={() => setLogOpen(true)}
                  >
                    <Fuel className="size-4" aria-hidden />
                    Log event
                  </Button>
                ) : null}
                {actions.canEnd ? (
                  <Button type="button" className="gap-2" disabled={isBusy} onClick={() => setEndOpen(true)}>
                    <Square className="size-4" aria-hidden />
                    End trip
                  </Button>
                ) : null}
              </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No trip record for this booking yet.</p>
            )}
          </div>
        </div>
      </header>

      <CrewMobileTripActionBar
        actions={actions}
        disabled={isBusy}
        onLogExpense={() => setExpenseSheetOpen(true)}
        onLogEvent={() => setLogOpen(true)}
        onEndTrip={() => setEndOpen(true)}
      />

      <ConfirmAddonsBeforeStartDialog
        open={addonsConfirmOpen}
        onOpenChange={setAddonsConfirmOpen}
        items={bookingItems}
        onConfirm={() => setStartOpen(true)}
      />

      <StartTripDialog
        open={startOpen}
        onOpenChange={setStartOpen}
        pending={isStarting}
        onConfirm={async (odometer_start) => {
          await startTrip({ odometer_start });
        }}
      />

      <LogTripExpenseSheet
        open={expenseSheetOpen}
        onOpenChange={setExpenseSheetOpen}
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

      {tripId ? (
        <EndTripWizard
          open={endOpen}
          onOpenChange={setEndOpen}
          tripId={tripId}
          odometerStart={trip?.odometer_start ?? null}
          pending={isEnding}
          onRequestLogExpense={() => setExpenseSheetOpen(true)}
          onSubmit={async (payload) => {
            await endTrip(payload);
          }}
        />
      ) : null}
    </>
  );
}

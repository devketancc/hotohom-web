'use client';

import { useState } from 'react';
import { CrewActivityTimeline } from '@/components/crew/trip/CrewActivityTimeline';
import { CrewBookingSideRail } from '@/components/crew/trip/CrewBookingSideRail';
import { CrewLoggedExpensesSection } from '@/components/crew/trip/CrewLoggedExpensesSection';
import { CrewTripHero } from '@/components/crew/trip/CrewTripHero';
import { CrewPreStartPanel } from '@/components/crew/trip/CrewPreStartPanel';
import { CrewTripStatusStrip } from '@/components/crew/trip/CrewTripStatusStrip';
import { useCrewTripExpenses } from '@/hooks/useCrewTripExpenses';
import { cn } from '@/lib/utils';
import type { CrewBookingFrom } from '@/lib/crewBookingAccess';
import { tripHasStarted } from '@/lib/crewBookingUi';
import { normalizeTripStatus } from '@/lib/crewTripUi';
import type { CrewBookingDetail } from '@/types/crew';

export function CrewBookingCommandCenter({
  booking,
  from,
}: {
  booking: CrewBookingDetail;
  from: CrewBookingFrom;
}) {
  const tripId = booking.trip?.id ?? '';
  const status = normalizeTripStatus(booking.trip?.status);
  const started = tripHasStarted(status);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  const { logs, aggregated, isLoading } = useCrewTripExpenses(tripId, status, started);

  const showMobileActionPadding = started && status === 'active';

  return (
    <div className={cn('space-y-4', showMobileActionPadding && 'pb-24 lg:pb-0')}>
      <CrewTripHero
        booking={booking}
        from={from}
        expenseOpen={expenseSheetOpen}
        onExpenseOpenChange={setExpenseSheetOpen}
        recentExpenseLogs={logs}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-4">
          {!started && booking.trip ? <CrewPreStartPanel booking={booking} /> : null}
          {started ? (
            <>
              <CrewTripStatusStrip booking={booking} status={status} />
              <CrewActivityTimeline
                events={booking.trip?.events ?? []}
                expenseLogs={logs}
                canQuickExpense={status === 'active'}
                onQuickExpense={() => setExpenseSheetOpen(true)}
              />
              <CrewLoggedExpensesSection
                summary={aggregated}
                logs={logs}
                isLoading={isLoading && !expenseSheetOpen}
              />
            </>
          ) : null}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <CrewBookingSideRail booking={booking} hideAddons={!started} tripStarted={started} />
        </aside>
      </div>
    </div>
  );
}

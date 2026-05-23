'use client';

import { useState } from 'react';
import { CrewExpenseTotalsBanner } from '@/components/crew/trip/CrewExpenseTotalsBanner';
import { CrewTripActionBar } from '@/components/crew/trip/CrewTripActionBar';
import { CrewTripSummary } from '@/components/crew/trip/CrewTripSummary';
import { useCrewTripExpenses } from '@/hooks/useCrewTripExpenses';
import { normalizeTripStatus } from '@/lib/crewTripUi';
import type { CrewBookingDetail } from '@/types/crew';

export function CrewBookingTripPanel({ booking }: { booking: CrewBookingDetail }) {
  const tripId = booking.trip?.id ?? '';
  const status = normalizeTripStatus(booking.trip?.status);
  const [expenseSheetOpen, setExpenseSheetOpen] = useState(false);

  const showExpenseUi = Boolean(tripId) && (status === 'active' || status === 'eot_pending' || status === 'completed');

  const { logs, aggregated, isLoading, canLog } = useCrewTripExpenses(
    tripId,
    status,
    showExpenseUi
  );

  const openExpenseSheet = () => setExpenseSheetOpen(true);

  return (
    <>
      <CrewTripActionBar
        booking={booking}
        expenseOpen={expenseSheetOpen}
        onExpenseOpenChange={setExpenseSheetOpen}
        recentExpenseLogs={logs}
      />
      {showExpenseUi ? (
        <CrewExpenseTotalsBanner
          summary={aggregated}
          isLoading={isLoading && !expenseSheetOpen}
          canLog={canLog}
          onLogExpense={canLog ? openExpenseSheet : undefined}
        />
      ) : null}
      <CrewTripSummary trip={booking.trip} expenseLogs={showExpenseUi ? logs : []} />
    </>
  );
}

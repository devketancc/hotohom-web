'use client';

import { Receipt } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { expenseTotalsChips, summaryHasAnyCharges } from '@/lib/crewExpenseUi';
import type { CrewTripEOTSummary } from '@/types/crew';

export function CrewExpenseTotalsBanner({
  summary,
  isLoading,
  onLogExpense,
  canLog,
}: {
  summary: CrewTripEOTSummary;
  isLoading?: boolean;
  onLogExpense?: () => void;
  canLog?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  const chips = expenseTotalsChips(summary);
  const hasCharges = summaryHasAnyCharges(summary);

  return (
    <section className="rounded-xl border border-border bg-card p-4 text-card-foreground shadow-sm">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight">
          <Receipt className="size-4 text-primary" aria-hidden />
          Logged expenses
        </h2>
        {canLog && onLogExpense ? (
          <button
            type="button"
            onClick={onLogExpense}
            className="text-xs font-semibold text-primary hover:underline"
          >
            + Log expense
          </button>
        ) : null}
      </div>

      {hasCharges ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge key={chip.type} variant="secondary" className="text-xs font-medium">
              {chip.label} {chip.display}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {canLog
            ? 'No expenses logged yet — tap Log expense when toll, parking, or AC applies.'
            : 'No expenses were logged for this trip.'}
        </p>
      )}
    </section>
  );
}

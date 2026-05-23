'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { flattenExpenseLogs, formatExpenseRowWhen } from '@/lib/crewBookingUi';
import { expenseTotalsChips } from '@/lib/crewExpenseUi';
import type { CrewTripEOTSummary, CrewTripExpenseLog } from '@/types/crew';

const EXPENSE_CHIP_COLORS: Record<string, string> = {
  toll_charge: 'bg-blue-500/15 text-blue-200 ring-blue-500/30',
  parking_charge: 'bg-violet-500/15 text-violet-200 ring-violet-500/30',
  ac_hours: 'bg-cyan-500/15 text-cyan-200 ring-cyan-500/30',
  gen_hours: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  damage_charge: 'bg-red-500/15 text-red-200 ring-red-500/30',
  other_charge: 'bg-zinc-500/15 text-zinc-200 ring-zinc-500/30',
};

export function AdminTripExpenseReview({
  logs,
  aggregated,
  isLoading,
}: {
  logs: CrewTripExpenseLog[];
  aggregated: CrewTripEOTSummary;
  isLoading?: boolean;
}) {
  const chips = expenseTotalsChips(aggregated);
  const rows = flattenExpenseLogs(logs);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Driver expense logs
      </h3>

      {chips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <Badge
              key={chip.type}
              variant="secondary"
              className={EXPENSE_CHIP_COLORS[chip.type] ?? ''}
            >
              {chip.label} {chip.display}
            </Badge>
          ))}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No driver expense logs for this trip.</p>
      ) : (
        <ul className="max-h-48 space-y-2 overflow-y-auto">
          {rows.slice(0, 15).map((row) => (
            <li
              key={row.id}
              className="rounded-lg border border-border/80 bg-muted/15 px-3 py-2 text-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold">{row.label}</span>
                <span className="shrink-0 font-bold text-violet-300">{row.display}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatExpenseRowWhen(row.occurredAt)} · {row.recordedBy}
              </p>
              {row.description !== '—' ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{row.description}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
      {rows.length > 15 ? (
        <p className="text-xs text-muted-foreground">Showing 15 of {rows.length} line items</p>
      ) : null}
    </div>
  );
}

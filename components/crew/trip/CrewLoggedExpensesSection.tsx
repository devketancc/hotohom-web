'use client';

import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { expenseTotalsChips, summaryHasAnyCharges } from '@/lib/crewExpenseUi';
import { flattenExpenseLogs, formatExpenseRowWhen } from '@/lib/crewBookingUi';
import { CrewCollapsibleSection } from '@/components/crew/trip/CrewCollapsibleSection';
import type { CrewTripEOTSummary, CrewTripExpenseLog } from '@/types/crew';

const EXPENSE_CHIP_COLORS: Record<string, string> = {
  toll_charge: 'bg-blue-500/15 text-blue-200 ring-blue-500/30',
  parking_charge: 'bg-violet-500/15 text-violet-200 ring-violet-500/30',
  ac_hours: 'bg-cyan-500/15 text-cyan-200 ring-cyan-500/30',
  gen_hours: 'bg-amber-500/15 text-amber-200 ring-amber-500/30',
  damage_charge: 'bg-red-500/15 text-red-200 ring-red-500/30',
  other_charge: 'bg-zinc-500/15 text-zinc-200 ring-zinc-500/30',
};

function moneyTotal(summary: CrewTripEOTSummary): string {
  const total = [
    summary.toll_charge,
    summary.parking_charge,
    summary.damage_charge,
    summary.other_charge,
  ].reduce((s, v) => s + (Number.parseFloat(v) || 0), 0);
  const hours =
    Number.parseFloat(summary.ac_hours) > 0 || Number.parseFloat(summary.gen_hours) > 0;
  return `₹${total.toLocaleString()}${hours ? ' + hours' : ''}`;
}

export function CrewLoggedExpensesSection({
  summary,
  logs,
  isLoading,
}: {
  summary: CrewTripEOTSummary;
  logs: CrewTripExpenseLog[];
  isLoading?: boolean;
}) {
  const chips = expenseTotalsChips(summary);
  const rows = flattenExpenseLogs(logs);
  const hasCharges = summaryHasAnyCharges(summary);

  if (isLoading) {
    return (
      <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <Skeleton className="mb-3 h-4 w-40" />
        <Skeleton className="h-24 w-full" />
      </section>
    );
  }

  const subtitle = hasCharges
    ? `${rows.length} line items · ${moneyTotal(summary)}`
    : 'No expenses logged yet';

  return (
    <CrewCollapsibleSection
      title="Logged expenses"
      subtitle={subtitle}
      defaultCollapsed
      contentClassName="pt-2 sm:pt-3"
    >
      {hasCharges ? (
        <p className="mb-3 text-sm font-bold text-primary lg:hidden">Total logged: {moneyTotal(summary)}</p>
      ) : null}

      {chips.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
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
      ) : (
        <p className="mb-4 text-sm text-muted-foreground">No expenses logged for this trip.</p>
      )}

      {rows.length > 0 ? (
        <>
          <ul className="space-y-2 md:hidden">
            {rows.slice(0, 20).map((row) => (
              <li
                key={row.id}
                className="rounded-lg border border-border/80 bg-muted/15 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="shrink-0 text-sm font-bold text-violet-300">{row.display}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatExpenseRowWhen(row.occurredAt)}</p>
                {row.description !== '—' ? (
                  <p className="mt-1 text-xs text-muted-foreground break-words">{row.description}</p>
                ) : null}
                <p className="mt-1 text-[10px] text-muted-foreground">{row.recordedBy}</p>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-0 text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 pr-3 font-semibold">Type</th>
                  <th className="pb-2 pr-3 font-semibold">When</th>
                  <th className="pb-2 pr-3 font-semibold">Note</th>
                  <th className="pb-2 pr-3 font-semibold">Amount</th>
                  <th className="pb-2 font-semibold">Logged by</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row) => (
                  <tr key={row.id} className="border-b border-border/40 last:border-0">
                    <td className="py-2.5 pr-3 font-medium">{row.label}</td>
                    <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">
                      {formatExpenseRowWhen(row.occurredAt)}
                    </td>
                    <td className="max-w-[200px] truncate py-2.5 pr-3 text-muted-foreground">{row.description}</td>
                    <td className="py-2.5 pr-3 font-semibold text-violet-300">{row.display}</td>
                    <td className="py-2.5 text-muted-foreground">{row.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > 20 ? (
            <p className="mt-2 text-xs text-muted-foreground">Showing 20 of {rows.length} line items</p>
          ) : null}
        </>
      ) : null}

      {hasCharges ? (
        <p className="mt-3 hidden text-sm font-bold text-primary lg:block">Total logged: {moneyTotal(summary)}</p>
      ) : null}
    </CrewCollapsibleSection>
  );
}

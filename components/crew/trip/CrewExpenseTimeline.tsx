'use client';

import { expenseTypeLabel, formatExpenseValue } from '@/lib/crewExpenseUi';
import type { CrewTripExpenseLog } from '@/types/crew';

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function CrewExpenseTimeline({
  logs,
  maxItems = 10,
}: {
  logs: CrewTripExpenseLog[];
  maxItems?: number;
}) {
  if (logs.length === 0) return null;

  const sorted = [...logs].sort((a, b) => {
    const ta = new Date(a.occurred_at).getTime();
    const tb = new Date(b.occurred_at).getTime();
    return tb - ta;
  });

  const visible = sorted.slice(0, maxItems);

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Logged expenses</h3>
      <ul className="relative space-y-0">
        {visible.map((log, index) => (
          <li key={log.id} className="relative flex gap-3 pb-4 last:pb-0">
            {index < visible.length - 1 ? (
              <span
                className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-border"
                aria-hidden
              />
            ) : null}
            <span
              className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-primary bg-background"
              aria-hidden
            />
            <div className="min-w-0 flex-1 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs text-muted-foreground">{formatWhen(log.occurred_at)}</span>
                {log.recorded_by_name ? (
                  <span className="text-xs font-medium text-muted-foreground">{log.recorded_by_name}</span>
                ) : null}
              </div>
              <ul className="mt-2 space-y-1">
                {log.items.map((item) => (
                  <li key={item.id} className="flex flex-wrap gap-x-1">
                    <span className="font-semibold">{expenseTypeLabel(item.expense_type)}</span>
                    <span className="text-muted-foreground">·</span>
                    <span>{formatExpenseValue(item.expense_type, item.value)}</span>
                    {item.description?.trim() ? (
                      <span className="w-full text-xs text-muted-foreground">{item.description}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {log.notes?.trim() ? (
                <p className="mt-2 text-xs text-muted-foreground italic">{log.notes}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {sorted.length > maxItems ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing {maxItems} of {sorted.length} sessions
        </p>
      ) : null}
    </div>
  );
}

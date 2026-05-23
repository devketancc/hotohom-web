'use client';

import { Fuel, Plus, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatFeedWhen, mergeCrewActivityFeed, type CrewActivityFeedItem } from '@/lib/crewBookingUi';
import { CrewCollapsibleSection } from '@/components/crew/trip/CrewCollapsibleSection';
import type { BookingTripEvent } from '@/types/bookingDetail';
import type { CrewTripExpenseLog } from '@/types/crew';

function feedIcon(item: CrewActivityFeedItem) {
  if (item.kind === 'expense') return Receipt;
  const t = item.eventType;
  if (t === 'refueling') return Fuel;
  return Fuel;
}

function feedAccent(item: CrewActivityFeedItem): string {
  if (item.kind === 'expense') return 'border-l-emerald-500';
  if (item.eventType === 'trip_started') return 'border-l-emerald-500';
  if (item.eventType === 'refueling') return 'border-l-blue-500';
  if (item.eventType === 'rest_stop') return 'border-l-violet-500';
  if (item.eventType === 'breakdown') return 'border-l-red-500';
  return 'border-l-amber-500';
}

export function CrewActivityTimeline({
  events,
  expenseLogs,
  canQuickExpense,
  onQuickExpense,
}: {
  events: BookingTripEvent[];
  expenseLogs: CrewTripExpenseLog[];
  canQuickExpense?: boolean;
  onQuickExpense?: () => void;
}) {
  const feed = mergeCrewActivityFeed(events, expenseLogs);
  const subtitle =
    feed.length === 0
      ? 'No activity yet'
      : `${feed.length} ${feed.length === 1 ? 'entry' : 'entries'} · latest ${formatFeedWhen(feed[0]?.occurredAt ?? '')}`;

  return (
    <CrewCollapsibleSection
      title="Live activity & timeline"
      subtitle={subtitle}
      defaultCollapsed={false}
      contentClassName="pt-2 sm:pt-3"
      headerAction={
        canQuickExpense && onQuickExpense ? (
          <Button type="button" size="sm" className="gap-1.5 max-lg:h-8 max-lg:px-2" onClick={onQuickExpense}>
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Quick expense</span>
            <span className="sm:hidden">Add</span>
          </Button>
        ) : undefined
      }
    >
      {feed.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity logged yet.</p>
      ) : (
        <ul className="space-y-2">
          {feed.map((item) => {
            const Icon = feedIcon(item);
            return (
              <li
                key={item.id}
                className={cn(
                  'rounded-lg border border-border/80 border-l-4 bg-muted/15 px-3 py-2.5',
                  feedAccent(item)
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-3">
                  <div className="flex items-center gap-2 sm:shrink-0">
                    <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                      {formatFeedWhen(item.occurredAt)}
                    </span>
                    <span className="flex size-7 items-center justify-center rounded-md bg-background/60 sm:hidden">
                      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 gap-3">
                    <span className="hidden size-7 shrink-0 items-center justify-center rounded-md bg-background/60 sm:flex">
                      <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold break-words">{item.title}</p>
                      {item.subtitle ? (
                        <p className="mt-0.5 text-xs text-muted-foreground break-words">{item.subtitle}</p>
                      ) : null}
                      {item.kind === 'expense' && item.recordedBy ? (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">{item.recordedBy}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CrewCollapsibleSection>
  );
}

'use client';

import { Fuel, Receipt, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CrewTripUiActions } from '@/lib/crewTripUi';

export function CrewMobileTripActionBar({
  actions,
  disabled,
  onLogExpense,
  onLogEvent,
  onEndTrip,
}: {
  actions: CrewTripUiActions;
  disabled?: boolean;
  onLogExpense: () => void;
  onLogEvent: () => void;
  onEndTrip: () => void;
}) {
  const buttons: {
    key: string;
    label: string;
    icon: typeof Receipt;
    variant: 'outline' | 'default';
    onClick: () => void;
  }[] = [];
  if (actions.canLogExpense) {
    buttons.push({ key: 'expense', label: 'Expense', icon: Receipt, variant: 'outline', onClick: onLogExpense });
  }
  if (actions.canLogEvent) {
    buttons.push({ key: 'event', label: 'Event', icon: Fuel, variant: 'outline', onClick: onLogEvent });
  }
  if (actions.canEnd) {
    buttons.push({ key: 'end', label: 'End trip', icon: Square, variant: 'default', onClick: onEndTrip });
  }

  if (buttons.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
      role="toolbar"
      aria-label="Trip actions"
    >
      <div
        className="mx-auto grid max-w-lg gap-2"
        style={{ gridTemplateColumns: `repeat(${buttons.length}, minmax(0, 1fr))` }}
      >
        {buttons.map((btn) => (
          <Button
            key={btn.key}
            type="button"
            variant={btn.variant}
            size="sm"
            className="h-11 flex-col gap-0.5 px-1 text-[10px] font-semibold"
            disabled={disabled}
            onClick={btn.onClick}
          >
            <btn.icon className="size-4" aria-hidden />
            {btn.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

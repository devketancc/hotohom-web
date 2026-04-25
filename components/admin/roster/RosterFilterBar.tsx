'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AdminHub } from '@/types/admin';
import type { RosterPreset } from '@/hooks/useAdminCalendarRoster';

export function RosterFilterBar({
  preset,
  onPresetChange,
  startYmd,
  endYmd,
  onStartChange,
  onEndChange,
  hubs,
  hubId,
  onHubChange,
  alertsOnly,
  onAlertsOnlyChange,
  rangeError,
  hubsLoading,
}: {
  preset: RosterPreset;
  onPresetChange: (p: RosterPreset) => void;
  startYmd: string;
  endYmd: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  hubs: AdminHub[];
  hubId: string;
  onHubChange: (id: string) => void;
  alertsOnly: boolean;
  onAlertsOnlyChange: (v: boolean) => void;
  rangeError: string | null;
  hubsLoading: boolean;
}) {
  const presetBtnClass = (active: boolean) =>
    cn(
      'h-7 border px-2 text-xs transition-colors',
      active
        ? 'border-zinc-500 bg-zinc-200 text-zinc-900 hover:bg-zinc-100'
        : 'border-white/10 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'
    );

  const dateInputClass =
    'h-8 min-w-0 rounded-md border border-white/10 bg-zinc-900/55 px-2 text-xs text-zinc-200 outline-none focus-visible:border-white/20';

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 px-0.5 py-1 text-card-foreground">
        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant={preset === '7d' ? 'default' : 'ghost'}
            className={presetBtnClass(preset === '7d')}
            onClick={() => onPresetChange('7d')}
          >
            Next 7d
          </Button>
          <Button
            type="button"
            size="sm"
            variant={preset === '30d' ? 'default' : 'ghost'}
            className={presetBtnClass(preset === '30d')}
            onClick={() => onPresetChange('30d')}
          >
            30d
          </Button>
          <Button
            type="button"
            size="sm"
            variant={preset === 'custom' ? 'default' : 'ghost'}
            className={presetBtnClass(preset === 'custom')}
            onClick={() => onPresetChange('custom')}
          >
            Custom
          </Button>
        </div>

        <span className="hidden text-zinc-600 sm:inline">|</span>
        <div className="flex min-w-0 items-center gap-1">
          <input
            id="roster-start"
            type="date"
            className={dateInputClass}
            value={startYmd}
            onChange={(e) => onStartChange(e.target.value)}
          />
          <span className="text-xs text-zinc-500">-</span>
          <input
            id="roster-end"
            type="date"
            className={dateInputClass}
            value={endYmd}
            onChange={(e) => onEndChange(e.target.value)}
          />
        </div>
        <span className="hidden text-zinc-600 sm:inline">|</span>
        <div className="flex min-w-[10rem] items-center">
          <select
            id="roster-hub"
            className={cn(dateInputClass, 'pr-8')}
            value={hubId}
            onChange={(e) => onHubChange(e.target.value)}
            disabled={hubsLoading}
          >
            <option value="">All hubs</option>
            {hubs.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>

        <span className="hidden text-zinc-600 sm:inline">|</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            role="switch"
            aria-checked={alertsOnly}
            onClick={() => onAlertsOnlyChange(!alertsOnly)}
            className={cn(
              'relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              alertsOnly ? 'bg-zinc-700' : 'bg-zinc-900/60'
            )}
          >
            <span
              className={cn(
                'pointer-events-none absolute top-0.5 left-0.5 size-5 rounded-full bg-background shadow transition-transform',
                alertsOnly && 'translate-x-4'
              )}
            />
          </button>
          <span className="text-xs text-zinc-300">Show only bookings with alerts</span>
        </div>
      </div>
      {rangeError ? (
        <p className="text-xs font-medium text-destructive" role="alert">
          {rangeError}
        </p>
      ) : null}
    </div>
  );
}

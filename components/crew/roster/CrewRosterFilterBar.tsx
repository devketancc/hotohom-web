'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RosterPreset } from '@/hooks/useCrewCalendarRoster';

export function CrewRosterFilterBar({
  preset,
  onPresetChange,
  startYmd,
  endYmd,
  onStartChange,
  onEndChange,
  rangeError,
}: {
  preset: RosterPreset;
  onPresetChange: (p: RosterPreset) => void;
  startYmd: string;
  endYmd: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  rangeError: string | null;
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

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startYmd}
            onChange={(e) => onStartChange(e.target.value)}
            className={dateInputClass}
            aria-label="Start date"
          />
          <span className="text-xs text-zinc-500">to</span>
          <input
            type="date"
            value={endYmd}
            onChange={(e) => onEndChange(e.target.value)}
            className={dateInputClass}
            aria-label="End date"
          />
        </div>
      </div>

      {rangeError ? (
        <p className="px-0.5 text-xs text-red-300" role="alert">
          {rangeError}
        </p>
      ) : null}
    </div>
  );
}

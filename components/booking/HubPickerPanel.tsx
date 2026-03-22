'use client';

import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { locationService } from '@/services/location.service';
import type { LocationHub } from '@/types/location';
import { cn } from '@/lib/utils';

export type HubPickerPanelProps = {
  selectedHubId: string | null;
  onSelect: (hub: LocationHub) => void;
  className?: string;
};

export function HubPickerPanel({ selectedHubId, onSelect, className }: HubPickerPanelProps) {
  const { data: hubs, isLoading } = useQuery({
    queryKey: ['hubs'],
    queryFn: () => locationService.getHubs(),
    staleTime: 1000 * 60 * 30,
  });

  return (
    <div className={cn('overflow-hidden rounded-2xl bg-zinc-900 border border-white/10', className)}>
      {isLoading ? (
        <div className="p-8 flex flex-col items-center justify-center gap-3">
          <Loader2 className="size-6 text-stitch-primary animate-spin" />
          <span className="text-xs font-medium text-stitch-on-surface-variant">Searching for hubs...</span>
        </div>
      ) : (
        <div className="max-h-64 overflow-y-auto">
          {hubs?.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'w-full px-5 py-4 flex flex-col items-start gap-1 hover:bg-stitch-primary hover:text-stitch-on-primary transition-colors border-b border-white/5 last:border-0 text-left',
                selectedHubId === item.id && 'bg-stitch-primary/10 text-stitch-primary'
              )}
            >
              <span className="font-bold text-sm uppercase tracking-wider">{item.name}</span>
              <span className="text-[10px] opacity-70 font-medium">
                {item.city} • {item.address ?? item.formatted_address ?? ''}
              </span>
            </button>
          ))}
          {(!hubs || hubs.length === 0) && !isLoading && (
            <div className="p-8 text-center text-xs text-stitch-on-surface-variant font-medium">
              No hubs found in your area.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

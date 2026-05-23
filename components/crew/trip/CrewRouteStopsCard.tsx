'use client';

import { useState } from 'react';
import { ChevronDown, CircleDot, Flag, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { routeSummary, sortedStops } from '@/lib/customerBookingUi';
import { CrewCollapsibleSection } from '@/components/crew/trip/CrewCollapsibleSection';
import { formatIsoDateTime } from '@/components/booking/BookingDetailAtoms';
import type { AdminBookingStop } from '@/types/admin';

function StopIcon({ type }: { type: string }) {
  const t = type.toLowerCase();
  if (t === 'pickup') return <MapPin className="size-4 text-primary" aria-hidden />;
  if (t === 'dropoff') return <Flag className="size-4 text-primary" aria-hidden />;
  return <CircleDot className="size-4 text-primary/80" aria-hidden />;
}

function stopTypeLabel(type: string): string {
  const t = type.toLowerCase();
  if (t === 'pickup') return 'Pickup';
  if (t === 'dropoff') return 'Dropoff';
  if (t === 'waypoint') return 'Waypoint';
  return type;
}

export function CrewRouteStopsCard({ stops }: { stops: AdminBookingStop[] }) {
  const [expanded, setExpanded] = useState(false);
  const summary = routeSummary(stops);
  const ordered = sortedStops(stops);
  const hasMany = summary.waypointCount > 0;

  const collapsedLine = hasMany
    ? `${summary.pickup} → +${summary.waypointCount} stop${summary.waypointCount === 1 ? '' : 's'} → ${summary.dropoff}`
    : `${summary.pickup} → ${summary.dropoff}`;

  return (
    <CrewCollapsibleSection title="Route & stops" subtitle={collapsedLine} defaultCollapsed={false}>
      {hasMany || ordered.length > 2 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-3 h-8 gap-1 px-0 text-primary hover:bg-transparent"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Hide full route' : 'View full route'}
          <ChevronDown className={cn('size-4 transition-transform', expanded && 'rotate-180')} aria-hidden />
        </Button>
      ) : null}

      {expanded || (!hasMany && ordered.length <= 2) ? (
        <ul className={cn('space-y-3', hasMany && expanded && 'border-t border-border pt-4')}>
          {ordered.map((stop) => (
            <li key={stop.id} className="flex gap-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40">
                <StopIcon type={stop.stop_type} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  {stopTypeLabel(stop.stop_type)}
                </p>
                <p className="break-words font-medium text-foreground">{stop.location_name || stop.location}</p>
                {stop.estimated_arrival ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Est. {formatIsoDateTime(stop.estimated_arrival)}
                  </p>
                ) : null}
                {stop.notes?.trim() ? (
                  <p className="mt-1 text-xs text-muted-foreground break-words">{stop.notes}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </CrewCollapsibleSection>
  );
}

'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Navigation, Trash2 } from 'lucide-react';
import type { JourneyStop, JourneyStopLocation } from '@/types/booking';
import { PlacesAutocompleteInput } from '@/components/booking/PlacesAutocompleteInput';
import { cn } from '@/lib/utils';

interface SortableWaypointRowProps {
  stop: JourneyStop;
  indexLabel: number;
  onLocationChange: (loc: JourneyStopLocation | null) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export function SortableWaypointRow({
  stop,
  indexLabel,
  onLocationChange,
  onRemove,
  canRemove,
}: SortableWaypointRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stop.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex gap-2 items-start rounded-xl border border-transparent',
        isDragging && 'opacity-70 z-10 border-stitch-primary/30 bg-stitch-surface/40'
      )}
    >
      <button
        type="button"
        className="mt-8 p-1 text-stitch-outline hover:text-stitch-primary cursor-grab active:cursor-grabbing touch-none shrink-0"
        aria-label="Reorder stop"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} />
      </button>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center justify-between gap-2 ml-1">
          <label className="block text-[10px] uppercase tracking-[0.1em] text-stitch-outline">
            Stop {indexLabel}
          </label>
          {canRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label="Remove stop"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <PlacesAutocompleteInput
          stopId={stop.id}
          location={stop.location}
          onResolved={onLocationChange}
          placeholder="Search a place in India"
          icon={<Navigation className="rotate-45" size={20} />}
        />
      </div>
    </div>
  );
}

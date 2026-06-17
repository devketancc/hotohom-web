'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CREW_TRIP_EVENT_PRESETS } from '@/lib/crewTripUi';
import { AttachmentUploader } from '@/components/crew/trip/AttachmentUploader';
import type { CrewTripEventType, CrewTripEventWritePayload } from '@/types/crew';

function toDatetimeLocalValue(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function LogTripEventDialog({
  open,
  onOpenChange,
  onSubmit,
  pending,
  tripId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CrewTripEventWritePayload) => Promise<void>;
  pending: boolean;
  tripId: string;
}) {
  const [eventType, setEventType] = useState<CrewTripEventType>('refueling');
  const [occurredAt, setOccurredAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const attachmentRequired = eventType === 'refueling';

  useEffect(() => {
    if (open) {
      setOccurredAt(toDatetimeLocalValue(new Date()));
      setEventType('refueling');
      setNotes('');
      setImages([]);
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    const at = new Date(occurredAt);
    if (Number.isNaN(at.getTime())) {
      setError('Enter a valid date and time.');
      return;
    }
    if (attachmentRequired && images.length === 0) {
      setError('Add a fuel bill / photo to log a refueling event.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        event_type: eventType,
        occurred_at: at.toISOString(),
        notes: notes.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      });
      setNotes('');
      setImages([]);
      onOpenChange(false);
    } catch {
      // toast from mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log event</DialogTitle>
          <DialogDescription>Record something that happened during the active trip.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Event type</Label>
            <div className="grid grid-cols-2 gap-2">
              {CREW_TRIP_EVENT_PRESETS.map((preset) => (
                <button
                  key={preset.type}
                  type="button"
                  onClick={() => {
                    setEventType(preset.type);
                    setError(null);
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors',
                    eventType === preset.type
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="crew-event-time">When</Label>
            <input
              id="crew-event-time"
              type="datetime-local"
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="crew-event-notes">Notes (optional)</Label>
            <Textarea
              id="crew-event-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Short description…"
            />
          </div>

          <AttachmentUploader
            value={images}
            onChange={setImages}
            entityType="trip_event"
            entityId={tripId}
            required={attachmentRequired}
            disabled={pending}
            label={attachmentRequired ? 'Attach fuel bill' : 'Attach photo'}
          />

          {error ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" disabled={pending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending || (attachmentRequired && images.length === 0)}
            onClick={() => void handleSubmit()}
          >
            {pending ? 'Saving…' : 'Save event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

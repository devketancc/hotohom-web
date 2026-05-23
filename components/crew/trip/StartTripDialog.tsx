'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CREW_TRIP_CONFIRM_COPY } from '@/lib/crewTripUi';

export function StartTripDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (odometerStart: number) => Promise<void>;
  pending: boolean;
}) {
  const [odometer, setOdometer] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setConfirmStep(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOdometer('');
      reset();
    }
    onOpenChange(next);
  };

  const parsed = Number.parseInt(odometer, 10);
  const odometerValid = Number.isFinite(parsed) && parsed >= 0;

  const handlePrimary = async () => {
    if (!confirmStep) {
      if (!odometerValid) {
        setError('Enter a valid odometer reading (0 or higher).');
        return;
      }
      setError(null);
      setConfirmStep(true);
      return;
    }
    try {
      await onConfirm(parsed);
      setOdometer('');
      reset();
      onOpenChange(false);
    } catch {
      // toast from mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{confirmStep ? 'Confirm start trip' : 'Start trip'}</DialogTitle>
          <DialogDescription>
            {confirmStep ? CREW_TRIP_CONFIRM_COPY : 'Record the odometer reading when you begin the trip.'}
          </DialogDescription>
        </DialogHeader>

        {!confirmStep ? (
          <div className="space-y-2">
            <Label htmlFor="crew-odometer-start">Odometer start (km)</Label>
            <Input
              id="crew-odometer-start"
              type="number"
              min={0}
              inputMode="numeric"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              placeholder="e.g. 45230"
              className="h-11"
            />
            {error ? (
              <p className="text-xs font-medium text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Odometer start: <span className="font-semibold text-foreground">{parsed} km</span>
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => {
              if (confirmStep) {
                setConfirmStep(false);
              } else {
                handleOpenChange(false);
              }
            }}
          >
            {confirmStep ? 'Back' : 'Cancel'}
          </Button>
          <Button type="button" disabled={pending || (!confirmStep && !odometerValid)} onClick={() => void handlePrimary()}>
            {pending ? 'Starting…' : confirmStep ? 'Start trip' : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
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
import { validateImageFile } from '@/services/media.service';

export function StartTripDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (odometerStart: number, imageFile: File | null) => Promise<void>;
  pending: boolean;
}) {
  const [odometer, setOdometer] = useState('');
  const [confirmStep, setConfirmStep] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reset = () => {
    setConfirmStep(false);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setOdometer('');
      clearImage();
      reset();
    }
    onOpenChange(next);
  };

  const handleFileChange = (file: File | null) => {
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
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
      await onConfirm(parsed, imageFile);
      setOdometer('');
      clearImage();
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
          <div className="space-y-4">
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
            </div>

            <div className="space-y-2">
              <Label>Odometer photo (optional)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                <div className="group relative size-20 overflow-hidden rounded-lg border border-border bg-muted/20">
                  <Image src={previewUrl} alt="Odometer photo" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-opacity hover:bg-background"
                    aria-label="Remove photo"
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="size-4" aria-hidden />
                  Add photo
                </Button>
              )}
            </div>

            {error ? (
              <p className="text-xs font-medium text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Odometer start: <span className="font-semibold text-foreground">{parsed} km</span>
            {imageFile ? (
              <>
                <br />
                Photo attached: <span className="font-semibold text-foreground">{imageFile.name}</span>
              </>
            ) : null}
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

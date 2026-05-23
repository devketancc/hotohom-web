'use client';

import { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CREW_TRIP_CONFIRM_COPY } from '@/lib/crewTripUi';
import type { CrewTripEndPayload } from '@/types/crew';

const STEPS = ['Odometer', 'Hours', 'Charges', 'Notes'] as const;

type Step = (typeof STEPS)[number];

const emptyCharges = {
  toll_charge: '0',
  parking_charge: '0',
  damage_charge: '0',
  other_charge: '0',
  other_charge_note: '',
};

export function EndTripWizard({
  open,
  onOpenChange,
  odometerStart,
  onSubmit,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  odometerStart: number | null;
  onSubmit: (payload: CrewTripEndPayload) => Promise<void>;
  pending: boolean;
}) {
  const [step, setStep] = useState<Step>('Odometer');
  const [confirmStep, setConfirmStep] = useState(false);
  const [odometerEnd, setOdometerEnd] = useState('');
  const [acHours, setAcHours] = useState('0');
  const [genHours, setGenHours] = useState('0');
  const [charges, setCharges] = useState(emptyCharges);
  const [driverNotes, setDriverNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep('Odometer');
      setConfirmStep(false);
      setOdometerEnd('');
      setAcHours('0');
      setGenHours('0');
      setCharges(emptyCharges);
      setDriverNotes('');
      setError(null);
    }
  }, [open]);

  const parseNum = (v: string, label: string): number | null => {
    const n = Number.parseFloat(v);
    if (!Number.isFinite(n) || n < 0) {
      setError(`Enter a valid ${label} (0 or higher).`);
      return null;
    }
    return n;
  };

  const buildPayload = (): CrewTripEndPayload | null => {
    const end = parseNum(odometerEnd, 'odometer end');
    if (end === null) return null;
    if (odometerStart != null && end < odometerStart) {
      setError(`Odometer end must be at least ${odometerStart} km (start reading).`);
      return null;
    }
    const ac = parseNum(acHours, 'AC hours');
    if (ac === null) return null;
    const gen = parseNum(genHours, 'generator hours');
    if (gen === null) return null;
    const toll = parseNum(charges.toll_charge, 'toll');
    if (toll === null) return null;
    const parking = parseNum(charges.parking_charge, 'parking');
    if (parking === null) return null;
    const damage = parseNum(charges.damage_charge, 'damage');
    if (damage === null) return null;
    const other = parseNum(charges.other_charge, 'other charge');
    if (other === null) return null;

    return {
      odometer_end: Math.round(end),
      ac_hours: ac,
      gen_hours: gen,
      toll_charge: toll,
      parking_charge: parking,
      damage_charge: damage,
      other_charge: other,
      other_charge_note: charges.other_charge_note.trim(),
      driver_notes: driverNotes.trim(),
    };
  };

  const stepIndex = STEPS.indexOf(step);

  const goNext = () => {
    setError(null);
    if (step === 'Odometer') {
      const end = parseNum(odometerEnd, 'odometer end');
      if (end === null) return;
      if (odometerStart != null && end < odometerStart) {
        setError(`Odometer end must be at least ${odometerStart} km.`);
        return;
      }
      setStep('Hours');
      return;
    }
    if (step === 'Hours') {
      if (parseNum(acHours, 'AC hours') === null) return;
      if (parseNum(genHours, 'generator hours') === null) return;
      setStep('Charges');
      return;
    }
    if (step === 'Charges') {
      if (parseNum(charges.toll_charge, 'toll') === null) return;
      if (parseNum(charges.parking_charge, 'parking') === null) return;
      if (parseNum(charges.damage_charge, 'damage') === null) return;
      if (parseNum(charges.other_charge, 'other charge') === null) return;
      setStep('Notes');
    }
  };

  const goBack = () => {
    setError(null);
    if (confirmStep) {
      setConfirmStep(false);
      return;
    }
    if (stepIndex <= 0) {
      onOpenChange(false);
      return;
    }
    setStep(STEPS[stepIndex - 1]);
  };

  const handleFinal = async () => {
    if (!confirmStep) {
      const payload = buildPayload();
      if (!payload) return;
      setConfirmStep(true);
      return;
    }
    const payload = buildPayload();
    if (!payload) return;
    try {
      await onSubmit(payload);
      onOpenChange(false);
    } catch {
      // toast from mutation
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[min(92vh,720px)] overflow-y-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>{confirmStep ? 'Confirm end trip' : 'End trip (EOT)'}</SheetTitle>
          <SheetDescription>
            {confirmStep
              ? CREW_TRIP_CONFIRM_COPY
              : `Step ${stepIndex + 1} of ${STEPS.length}: ${step}`}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-2">
          {!confirmStep && step === 'Odometer' ? (
            <div className="space-y-2">
              <Label htmlFor="crew-odometer-end">Odometer end (km)</Label>
              <Input
                id="crew-odometer-end"
                type="number"
                min={odometerStart ?? 0}
                inputMode="numeric"
                value={odometerEnd}
                onChange={(e) => setOdometerEnd(e.target.value)}
                className="h-11"
              />
              {odometerStart != null ? (
                <p className="text-xs text-muted-foreground">Started at {odometerStart} km</p>
              ) : null}
            </div>
          ) : null}

          {!confirmStep && step === 'Hours' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="crew-ac-hours">AC hours</Label>
                <Input
                  id="crew-ac-hours"
                  type="number"
                  min={0}
                  step="0.1"
                  value={acHours}
                  onChange={(e) => setAcHours(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="crew-gen-hours">Generator hours</Label>
                <Input
                  id="crew-gen-hours"
                  type="number"
                  min={0}
                  step="0.1"
                  value={genHours}
                  onChange={(e) => setGenHours(e.target.value)}
                  className="h-11"
                />
              </div>
            </div>
          ) : null}

          {!confirmStep && step === 'Charges' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ['toll_charge', 'Toll (₹)'],
                  ['parking_charge', 'Parking (₹)'],
                  ['damage_charge', 'Damage (₹)'],
                  ['other_charge', 'Other (₹)'],
                ] as const
              ).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={`crew-${key}`}>{label}</Label>
                  <Input
                    id={`crew-${key}`}
                    type="number"
                    min={0}
                    step="0.01"
                    value={charges[key]}
                    onChange={(e) => setCharges((c) => ({ ...c, [key]: e.target.value }))}
                    className="h-11"
                  />
                </div>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="crew-other-note">Other charge note</Label>
                <Input
                  id="crew-other-note"
                  value={charges.other_charge_note}
                  onChange={(e) => setCharges((c) => ({ ...c, other_charge_note: e.target.value }))}
                  placeholder="What was the other charge for?"
                />
              </div>
            </div>
          ) : null}

          {!confirmStep && step === 'Notes' ? (
            <div className="space-y-2">
              <Label htmlFor="crew-driver-notes">Driver notes (optional)</Label>
              <Textarea
                id="crew-driver-notes"
                value={driverNotes}
                onChange={(e) => setDriverNotes(e.target.value)}
                rows={4}
                placeholder="Anything ops should know…"
              />
            </div>
          ) : null}

          {confirmStep ? (
            <p className="rounded-lg border border-border bg-muted/30 px-3 py-3 text-sm text-muted-foreground">
              Submit end-of-trip readings and charges. This cannot be undone from the crew portal.
            </p>
          ) : null}

          {error ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <SheetFooter className="flex-row gap-2 border-t border-border pt-4">
          <Button type="button" variant="outline" className="flex-1" disabled={pending} onClick={goBack}>
            {confirmStep || stepIndex > 0 ? 'Back' : 'Cancel'}
          </Button>
          {!confirmStep && step !== 'Notes' ? (
            <Button type="button" className="flex-1" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button type="button" className="flex-1" disabled={pending} onClick={() => void handleFinal()}>
              {pending ? 'Submitting…' : confirmStep ? 'Submit EOT' : 'Review & submit'}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

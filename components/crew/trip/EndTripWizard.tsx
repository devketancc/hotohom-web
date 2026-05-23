'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Check, ChevronRight, Gauge, Receipt, StickyNote } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  CREW_TRIP_CONFIRM_COPY,
  END_TRIP_STEPS,
  type EndTripStepId,
} from '@/lib/crewTripUi';
import { useCrewTripEOTSummary } from '@/hooks/useCrewTripEOTSummary';
import type { CrewTripEndPayload, CrewTripEOTSummary } from '@/types/crew';

const STEP_IDS = END_TRIP_STEPS.map((s) => s.id);

type Step = EndTripStepId;

const emptyCharges = {
  toll_charge: '0',
  parking_charge: '0',
  damage_charge: '0',
  other_charge: '0',
  other_charge_note: '',
};

function MobileStepBar({ stepIndex, confirmStep }: { stepIndex: number; confirmStep: boolean }) {
  const total = END_TRIP_STEPS.length;
  const activeIndex = confirmStep ? total : stepIndex;
  return (
    <div className="flex gap-1 px-4 pt-2 md:hidden" aria-hidden>
      {END_TRIP_STEPS.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i <= activeIndex ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

function EndTripStepSidebar({
  step,
  stepIndex,
  confirmStep,
  onGoTo,
}: {
  step: Step;
  stepIndex: number;
  confirmStep: boolean;
  onGoTo: (id: EndTripStepId) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-muted/10 p-4 md:flex md:flex-col">
      <nav className="space-y-1" aria-label="End trip steps">
        {END_TRIP_STEPS.map((s, i) => {
          const done = confirmStep || i < stepIndex;
          const active = !confirmStep && s.id === step;
          return (
            <button
              key={s.id}
              type="button"
              disabled={confirmStep || i > stepIndex}
              onClick={() => {
                if (!confirmStep && i <= stepIndex) onGoTo(s.id);
              }}
              className={cn(
                'flex w-full gap-3 rounded-lg px-2 py-2.5 text-left transition-colors',
                active && 'bg-primary/15',
                !active && i <= stepIndex && !confirmStep && 'hover:bg-muted/40',
                (confirmStep || i > stepIndex) && 'cursor-not-allowed opacity-40'
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                  active && 'bg-primary text-primary-foreground',
                  done && !active && 'bg-primary/25 text-primary',
                  !active && !done && 'bg-muted text-muted-foreground'
                )}
              >
                {done && !active ? <Check className="size-3.5" aria-hidden /> : i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="block text-xs text-muted-foreground">{s.subtitle}</span>
              </span>
            </button>
          );
        })}
      </nav>
      {confirmStep ? (
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Final confirmation before submit.
        </p>
      ) : null}
    </aside>
  );
}

export function EndTripWizard({
  open,
  onOpenChange,
  tripId,
  odometerStart,
  onSubmit,
  onRequestLogExpense,
  pending,
  eotSummary: externalEotSummary,
  summaryLoading: externalSummaryLoading,
  sheetTitle = 'End trip (EOT)',
  sheetDescription = 'Submit end-of-trip readings and charges for ops review.',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  odometerStart: number | null;
  onSubmit: (payload: CrewTripEndPayload) => Promise<void>;
  onRequestLogExpense?: () => void;
  pending: boolean;
  /** When set, pre-fill from this summary instead of crew eot-summary API. */
  eotSummary?: CrewTripEOTSummary;
  summaryLoading?: boolean;
  sheetTitle?: string;
  sheetDescription?: string;
}) {
  const hasExternalSummary = externalEotSummary !== undefined;
  const { data: crewEotSummary, isPending: crewSummaryLoading } = useCrewTripEOTSummary(
    tripId,
    open && !hasExternalSummary
  );
  const eotSummary = hasExternalSummary ? externalEotSummary : crewEotSummary;
  const summaryLoading = hasExternalSummary ? Boolean(externalSummaryLoading) : crewSummaryLoading;

  const [step, setStep] = useState<Step>('odometer');
  const [confirmStep, setConfirmStep] = useState(false);
  const [odometerEnd, setOdometerEnd] = useState('');
  const [acHours, setAcHours] = useState('0');
  const [genHours, setGenHours] = useState('0');
  const [charges, setCharges] = useState(emptyCharges);
  const [driverNotes, setDriverNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [summaryApplied, setSummaryApplied] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep('odometer');
      setConfirmStep(false);
      setOdometerEnd('');
      setAcHours('0');
      setGenHours('0');
      setCharges(emptyCharges);
      setDriverNotes('');
      setError(null);
      setSummaryApplied(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !eotSummary || summaryApplied) return;
    setAcHours(eotSummary.ac_hours);
    setGenHours(eotSummary.gen_hours);
    setCharges({
      toll_charge: eotSummary.toll_charge,
      parking_charge: eotSummary.parking_charge,
      damage_charge: eotSummary.damage_charge,
      other_charge: eotSummary.other_charge,
      other_charge_note: '',
    });
    setSummaryApplied(true);
  }, [open, eotSummary, summaryApplied]);

  const stepIndex = STEP_IDS.indexOf(step);

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

  const otherChargeNum = Number.parseFloat(charges.other_charge);
  const showOtherNote = Number.isFinite(otherChargeNum) && otherChargeNum > 0;

  const goNext = () => {
    setError(null);
    if (step === 'odometer') {
      const end = parseNum(odometerEnd, 'odometer end');
      if (end === null) return;
      if (odometerStart != null && end < odometerStart) {
        setError(`Odometer end must be at least ${odometerStart} km.`);
        return;
      }
      setStep('charges');
      return;
    }
    if (step === 'charges') {
      if (parseNum(acHours, 'AC hours') === null) return;
      if (parseNum(genHours, 'generator hours') === null) return;
      if (parseNum(charges.toll_charge, 'toll') === null) return;
      if (parseNum(charges.parking_charge, 'parking') === null) return;
      if (parseNum(charges.damage_charge, 'damage') === null) return;
      if (parseNum(charges.other_charge, 'other charge') === null) return;
      setStep('notes');
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
    setStep(STEP_IDS[stepIndex - 1] as Step);
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

  const handleRequestLogExpense = () => {
    onOpenChange(false);
    onRequestLogExpense?.();
  };

  const goToStep = (id: EndTripStepId) => {
    setError(null);
    setStep(id);
  };

  const currentMeta = confirmStep
    ? { title: 'Confirm end trip', subtitle: CREW_TRIP_CONFIRM_COPY }
    : END_TRIP_STEPS[stepIndex];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex h-[min(94vh,880px)] max-h-[94vh] w-full max-w-3xl flex-col gap-0 overflow-hidden overflow-x-hidden rounded-t-2xl border-t p-0 md:mb-2 md:rounded-2xl md:border"
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-4 text-left">
          <SheetTitle>{sheetTitle}</SheetTitle>
          <SheetDescription>{sheetDescription}</SheetDescription>
        </SheetHeader>

        <MobileStepBar stepIndex={stepIndex} confirmStep={confirmStep} />

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <EndTripStepSidebar
            step={step}
            stepIndex={stepIndex}
            confirmStep={confirmStep}
            onGoTo={goToStep}
          />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="flex-1 px-4 py-4 md:px-6">
              <p className="mb-4 md:hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {confirmStep ? 'Confirm' : `Step ${stepIndex + 1} of ${END_TRIP_STEPS.length}`}
                </span>
                <span className="mt-0.5 block text-lg font-semibold">{currentMeta.title}</span>
                {!confirmStep ? (
                  <span className="mt-0.5 block text-sm text-muted-foreground">{currentMeta.subtitle}</span>
                ) : null}
              </p>

              <div className="mx-auto w-full max-w-lg space-y-4">
                {!confirmStep && step === 'odometer' ? (
                  <div className="space-y-4">
                    <p className="hidden text-sm text-muted-foreground md:block">
                      {END_TRIP_STEPS[0].subtitle}
                    </p>
                    <div className="rounded-xl border border-border bg-muted/15 p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <Gauge className="size-5" aria-hidden />
                        </span>
                        <div>
                          <Label htmlFor="crew-odometer-end" className="text-base">
                            Odometer end (km)
                          </Label>
                          {odometerStart != null ? (
                            <p className="text-xs text-muted-foreground">Started at {odometerStart} km</p>
                          ) : null}
                        </div>
                      </div>
                      <Input
                        id="crew-odometer-end"
                        type="number"
                        min={odometerStart ?? 0}
                        inputMode="numeric"
                        value={odometerEnd}
                        onChange={(e) => setOdometerEnd(e.target.value)}
                        className="mt-4 h-14 text-2xl font-semibold tabular-nums"
                        placeholder="e.g. 45230"
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Late charges and extra KM are calculated automatically when you submit.
                    </p>
                  </div>
                ) : null}

                {!confirmStep && step === 'charges' ? (
                  <div className="space-y-4">
                    <p className="hidden text-sm text-muted-foreground md:block">
                      {END_TRIP_STEPS[1].subtitle}
                    </p>
                    <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 px-3 py-3 text-sm">
                      <Receipt className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                      <p className="text-foreground/90">
                        Totals from expenses you logged during the trip. Adjust if something was missed.
                      </p>
                    </div>
                    {summaryLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="h-11 w-full" />
                        <Skeleton className="h-11 w-full" />
                      </div>
                    ) : null}
                    {onRequestLogExpense ? (
                      <Button type="button" variant="outline" size="sm" onClick={handleRequestLogExpense}>
                        Log another expense
                      </Button>
                    ) : null}
                    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Hours
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                    </div>
                    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Charges (₹)
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(
                          [
                            ['toll_charge', 'Toll'],
                            ['parking_charge', 'Parking'],
                            ['damage_charge', 'Damage'],
                            ['other_charge', 'Other'],
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
                      </div>
                    </div>
                  </div>
                ) : null}

                {!confirmStep && step === 'notes' ? (
                  <div className="space-y-4">
                    <p className="hidden text-sm text-muted-foreground md:block">
                      {END_TRIP_STEPS[2].subtitle}
                    </p>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <StickyNote className="size-4 text-muted-foreground" aria-hidden />
                        <p className="text-sm font-semibold">Trip notes</p>
                      </div>
                      {showOtherNote ? (
                        <div className="mb-4 space-y-2">
                          <Label htmlFor="crew-other-note">Other charge note</Label>
                          <Input
                            id="crew-other-note"
                            value={charges.other_charge_note}
                            onChange={(e) =>
                              setCharges((c) => ({ ...c, other_charge_note: e.target.value }))
                            }
                            placeholder="What was the other charge for?"
                            className="h-11"
                          />
                        </div>
                      ) : null}
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
                    </div>
                  </div>
                ) : null}

                {confirmStep ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{CREW_TRIP_CONFIRM_COPY}</p>
                    <div className="rounded-xl border border-border bg-muted/20 p-4 text-sm">
                      <p className="font-semibold text-foreground">Summary</p>
                      <ul className="mt-2 space-y-1 text-muted-foreground">
                        <li>
                          Odometer end:{' '}
                          <span className="font-medium text-foreground">{odometerEnd} km</span>
                        </li>
                        <li>
                          AC / Gen:{' '}
                          <span className="font-medium text-foreground">
                            {acHours}h / {genHours}h
                          </span>
                        </li>
                        <li>
                          Toll / Parking:{' '}
                          <span className="font-medium text-foreground">
                            ₹{charges.toll_charge} / ₹{charges.parking_charge}
                          </span>
                        </li>
                      </ul>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Submit end-of-trip readings and charges. This cannot be undone from the crew
                        portal.
                      </p>
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p className="text-sm font-medium text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
              <div className="mx-auto flex max-w-lg gap-2">
                <Button type="button" variant="outline" disabled={pending} onClick={goBack} className="gap-1">
                  {confirmStep || stepIndex > 0 ? (
                    <>
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </>
                  ) : (
                    'Cancel'
                  )}
                </Button>
                {!confirmStep && step !== 'notes' ? (
                  <Button type="button" className="min-w-0 flex-1 gap-1" onClick={goNext}>
                    Continue
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="min-w-0 flex-1 gap-1"
                    disabled={pending}
                    onClick={() => void handleFinal()}
                  >
                    {pending ? 'Submitting…' : confirmStep ? 'Submit EOT' : 'Review & submit'}
                    {!pending && !confirmStep ? <ChevronRight className="size-4" aria-hidden /> : null}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  CREW_EXPENSE_PRESETS,
  expensePresetFor,
  expenseRequiresAttachment,
  expenseTypeLabel,
  formatExpenseValue,
  LOG_EXPENSE_STEPS,
  recentExpenseLines,
  type LogExpenseStepId,
} from '@/lib/crewExpenseUi';
import { AttachmentUploader } from '@/components/crew/trip/AttachmentUploader';
import type {
  CrewExpenseType,
  CrewTripExpenseLog,
  CrewTripExpenseWriteItem,
  CrewTripExpenseWritePayload,
} from '@/types/crew';

type QueuedItem = CrewTripExpenseWriteItem & { key: string; images: string[] };

const STEP_IDS = LOG_EXPENSE_STEPS.map((s) => s.id);

function toDatetimeLocalValue(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

function newKey(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function readGeolocation(): Promise<{ lat: number; lng: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
}

function formatRecentWhen(iso: string): string {
  try {
    return format(new Date(iso), 'MMM d, h:mm a');
  } catch {
    return '';
  }
}

function StepSidebar({
  step,
  stepIndex,
  recent,
  onGoTo,
}: {
  step: LogExpenseStepId;
  stepIndex: number;
  recent: ReturnType<typeof recentExpenseLines>;
  onGoTo: (id: LogExpenseStepId) => void;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-muted/10 p-4 md:flex md:flex-col">
      <nav className="space-y-1" aria-label="Expense steps">
        {LOG_EXPENSE_STEPS.map((s, i) => {
          const done = i < stepIndex;
          const active = s.id === step;
          return (
            <button
              key={s.id}
              type="button"
              disabled={i > stepIndex}
              onClick={() => {
                if (i <= stepIndex) onGoTo(s.id);
              }}
              className={cn(
                'flex w-full gap-3 rounded-lg px-2 py-2.5 text-left transition-colors',
                active && 'bg-primary/15',
                !active && i <= stepIndex && 'hover:bg-muted/40',
                i > stepIndex && 'cursor-not-allowed opacity-40'
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

      {recent.length > 0 ? (
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent</p>
          <ul className="mt-2 space-y-2">
            {recent.map((line) => (
              <li key={line.id} className="text-xs">
                <span className="font-semibold text-foreground">{line.label}</span>
                <span className="text-muted-foreground"> · {line.display}</span>
                <span className="mt-0.5 block text-[10px] text-muted-foreground">
                  {formatRecentWhen(line.occurredAt)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}

function MobileStepBar({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex gap-1 px-4 pt-2 md:hidden" aria-hidden>
      {LOG_EXPENSE_STEPS.map((s, i) => (
        <div
          key={s.id}
          className={cn(
            'h-1 flex-1 rounded-full transition-colors',
            i <= stepIndex ? 'bg-primary' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}

export function LogTripExpenseSheet({
  open,
  onOpenChange,
  onSubmit,
  pending,
  tripId,
  recentLogs = [],
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: CrewTripExpenseWritePayload) => Promise<void>;
  pending: boolean;
  tripId: string;
  recentLogs?: CrewTripExpenseLog[];
}) {
  const [step, setStep] = useState<LogExpenseStepId>('type');
  const [expenseType, setExpenseType] = useState<CrewExpenseType>('toll_charge');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [occurredAt, setOccurredAt] = useState(() => toDatetimeLocalValue(new Date()));
  const [queue, setQueue] = useState<QueuedItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const preset = expensePresetFor(expenseType)!;
  const stepIndex = STEP_IDS.indexOf(step);
  const recent = useMemo(() => recentExpenseLines(recentLogs, 3), [recentLogs]);

  const currentDraft = useMemo((): CrewTripExpenseWriteItem | null => {
    const value = Number.parseFloat(amount);
    if (!Number.isFinite(value) || value <= 0) return null;
    return {
      expense_type: expenseType,
      value,
      description: description.trim() || undefined,
    };
  }, [amount, expenseType, description]);

  const resetWizard = () => {
    setStep('type');
    setExpenseType('toll_charge');
    setAmount('');
    setDescription('');
    setImages([]);
    setSessionNotes('');
    setOccurredAt(toDatetimeLocalValue(new Date()));
    setQueue([]);
    setError(null);
  };

  useEffect(() => {
    if (!open) return;
    resetWizard();
  }, [open]);

  const parseAmount = (): number | null => {
    const n = Number.parseFloat(amount);
    if (!Number.isFinite(n) || n < 0) {
      setError(preset.unit === 'hours' ? 'Enter valid hours (0 or higher).' : 'Enter a valid amount.');
      return null;
    }
    if (n === 0) {
      setError('Amount must be greater than zero.');
      return null;
    }
    return n;
  };

  const goNext = () => {
    setError(null);
    if (step === 'type') {
      setStep('amount');
      return;
    }
    if (step === 'amount') {
      if (parseAmount() === null) return;
      setStep('details');
      return;
    }
    if (step === 'details') {
      if (preset.requiresAttachment && images.length === 0) {
        setError(`${preset.label} needs a photo of the receipt.`);
        return;
      }
      setStep('review');
    }
  };

  const goBack = () => {
    setError(null);
    if (stepIndex <= 0) {
      onOpenChange(false);
      return;
    }
    setStep(STEP_IDS[stepIndex - 1]);
  };

  const addCurrentToQueue = () => {
    setError(null);
    const value = parseAmount();
    if (value === null) return;
    if (preset.requiresAttachment && images.length === 0) {
      setError(`${preset.label} needs a photo of the receipt.`);
      return;
    }
    setQueue((q) => [
      ...q,
      {
        key: newKey(),
        expense_type: expenseType,
        value,
        description: description.trim() || undefined,
        images,
      },
    ]);
    setExpenseType('toll_charge');
    setAmount('');
    setDescription('');
    setImages([]);
    setStep('type');
  };

  const allItems = (): CrewTripExpenseWriteItem[] => {
    const items: CrewTripExpenseWriteItem[] = queue.map(({ expense_type, value, description: desc }) => ({
      expense_type,
      value,
      description: desc,
    }));
    if (currentDraft) items.push(currentDraft);
    return items;
  };

  /** Backend stores attachments at the log level — flatten + dedupe across items. */
  const allImages = (): string[] => {
    const urls = new Set<string>();
    for (const item of queue) {
      for (const url of item.images) urls.add(url);
    }
    if (currentDraft) {
      for (const url of images) urls.add(url);
    }
    return [...urls];
  };

  const handleSave = async () => {
    setError(null);
    const items = allItems();
    if (items.length === 0) {
      setError('Add at least one expense before saving.');
      return;
    }
    if (currentDraft && preset.requiresAttachment && images.length === 0) {
      setError(`${preset.label} needs a photo of the receipt.`);
      return;
    }
    const at = new Date(occurredAt);
    if (Number.isNaN(at.getTime())) {
      setError('Invalid date.');
      return;
    }
    const imgs = allImages();
    const geo = await readGeolocation();
    try {
      await onSubmit({
        occurred_at: at.toISOString(),
        lat: geo?.lat ?? null,
        lng: geo?.lng ?? null,
        notes: sessionNotes.trim() || undefined,
        images: imgs.length > 0 ? imgs : undefined,
        items,
      });
      onOpenChange(false);
    } catch {
      // toast from mutation
    }
  };

  const applyQuickAmount = (delta: number) => {
    const current = Number.parseFloat(amount);
    const base = Number.isFinite(current) ? current : 0;
    const next = preset.unit === 'hours' ? base + delta : base + delta;
    setAmount(String(preset.unit === 'hours' ? Math.round(next * 10) / 10 : Math.round(next)));
    setError(null);
  };

  const Icon = preset.icon;
  const displayAmount =
    amount.trim() === ''
      ? preset.unit === 'hours'
        ? '0h'
        : '₹0'
      : formatExpenseValue(expenseType, amount);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto flex h-[min(94vh,880px)] max-h-[94vh] w-full max-w-3xl flex-col gap-0 overflow-hidden overflow-x-hidden rounded-t-2xl border-t p-0 md:mb-2 md:rounded-2xl md:border"
      >
        <SheetHeader className="shrink-0 border-b border-border px-4 py-4 text-left">
          <SheetTitle>Log expense</SheetTitle>
          <SheetDescription>
            Billable extras for this trip — saved to the customer bill.
          </SheetDescription>
        </SheetHeader>

        <MobileStepBar stepIndex={stepIndex} />

        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <StepSidebar step={step} stepIndex={stepIndex} recent={recent} onGoTo={setStep} />

          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <div className="flex-1 px-4 py-4 md:px-6">
              <p className="mb-4 md:hidden">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Step {stepIndex + 1} of {LOG_EXPENSE_STEPS.length}
                </span>
                <span className="mt-0.5 block text-lg font-semibold">
                  {LOG_EXPENSE_STEPS[stepIndex].title}
                </span>
              </p>

              {step === 'type' ? (
                <div className="space-y-3">
                  <p className="hidden text-sm text-muted-foreground md:block">
                    {LOG_EXPENSE_STEPS[0].subtitle}
                  </p>
                  <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
                    {CREW_EXPENSE_PRESETS.map((p) => {
                      const PIcon = p.icon;
                      const selected = expenseType === p.type;
                      return (
                        <button
                          key={p.type}
                          type="button"
                          onClick={() => {
                            setExpenseType(p.type);
                            setAmount('');
                            setDescription('');
                            setImages([]);
                            setError(null);
                          }}
                          className={cn(
                            'relative flex gap-3 rounded-xl border p-4 text-left transition-colors',
                            selected
                              ? 'border-primary bg-primary/10 ring-1 ring-primary/40'
                              : 'border-border bg-card hover:border-primary/30 hover:bg-muted/20'
                          )}
                        >
                          {selected ? (
                            <span className="absolute top-3 right-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Check className="size-3" aria-hidden />
                            </span>
                          ) : null}
                          <span
                            className={cn(
                              'flex size-10 shrink-0 items-center justify-center rounded-lg',
                              selected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                            )}
                          >
                            <PIcon className="size-5" aria-hidden />
                          </span>
                          <span className="min-w-0 pr-6">
                            <span className="block font-semibold">{p.label}</span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {p.description}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {step === 'amount' ? (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex-1 space-y-3">
                      <Label htmlFor="crew-expense-amount" className="text-base">
                        {preset.unit === 'hours' ? 'Hours' : 'Amount'}
                      </Label>
                      <div className="relative">
                        {preset.unit === 'inr' ? (
                          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-muted-foreground">
                            ₹
                          </span>
                        ) : null}
                        <Input
                          id="crew-expense-amount"
                          type="number"
                          min={0}
                          step={preset.unit === 'hours' ? '0.1' : '1'}
                          inputMode="decimal"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={cn(
                            'h-16 text-3xl font-semibold tabular-nums',
                            preset.unit === 'inr' && 'pl-10'
                          )}
                          placeholder={preset.amountPlaceholder}
                          autoFocus
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {preset.quickAmounts.map((q) => (
                          <Button
                            key={q}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => applyQuickAmount(q)}
                          >
                            +{preset.unit === 'hours' ? `${q}h` : `₹${q}`}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/15 p-4 sm:w-48">
                      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Preview
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <Icon className="size-4" aria-hidden />
                        </span>
                        <div>
                          <p className="font-semibold">{preset.label}</p>
                          <p className="text-lg font-bold text-primary">{displayAmount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 'details' ? (
                <div className="mx-auto max-w-lg space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crew-expense-note">Note (optional)</Label>
                    <Textarea
                      id="crew-expense-note"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder={preset.notePlaceholder}
                    />
                  </div>
                  <AttachmentUploader
                    value={images}
                    onChange={(urls) => {
                      setImages(urls);
                      setError(null);
                    }}
                    entityType="trip_expense"
                    entityId={tripId}
                    required={preset.requiresAttachment}
                    disabled={pending}
                    label={`${preset.label} receipt`}
                  />
                  {queue.length === 0 ? (
                    <div className="space-y-2">
                      <Label htmlFor="crew-expense-session">Trip note (optional)</Label>
                      <Textarea
                        id="crew-expense-session"
                        value={sessionNotes}
                        onChange={(e) => setSessionNotes(e.target.value)}
                        rows={2}
                        placeholder="e.g. Rest stop near highway"
                      />
                      <p className="text-xs text-muted-foreground">
                        Applies to this save only. Location is captured automatically when allowed.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {step === 'review' ? (
                <div className="mx-auto max-w-lg space-y-4">
                  <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
                    <p className="text-sm text-muted-foreground">You are saving</p>
                    <ul className="mt-3 space-y-2">
                      {queue.map((item) => (
                        <li
                          key={item.key}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span>
                            <span className="font-semibold">{expenseTypeLabel(item.expense_type)}</span>
                            {' · '}
                            {formatExpenseValue(item.expense_type, item.value)}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Remove"
                            onClick={() => setQueue((q) => q.filter((x) => x.key !== item.key))}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </li>
                      ))}
                      {currentDraft ? (
                        <li className="flex items-center gap-2 border-t border-border/60 pt-2 text-sm font-semibold">
                          <Icon className="size-4 text-primary" aria-hidden />
                          {preset.label} · {formatExpenseValue(expenseType, currentDraft.value)}
                          {currentDraft.description ? (
                            <span className="block w-full text-xs font-normal text-muted-foreground">
                              {currentDraft.description}
                            </span>
                          ) : null}
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    disabled={!currentDraft}
                    onClick={addCurrentToQueue}
                  >
                    <Plus className="size-4" aria-hidden />
                    Add another expense
                  </Button>
                </div>
              ) : null}

              {error ? (
                <p className="mt-4 text-sm font-medium text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={pending} onClick={goBack} className="gap-1">
                  {stepIndex === 0 ? (
                    'Cancel'
                  ) : (
                    <>
                      <ArrowLeft className="size-4" aria-hidden />
                      Back
                    </>
                  )}
                </Button>
                {step !== 'review' ? (
                  <Button type="button" className="min-w-0 flex-1 gap-1" onClick={goNext}>
                    Continue
                    <ChevronRight className="size-4" aria-hidden />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="min-w-0 flex-1 gap-1"
                    disabled={pending || allItems().length === 0}
                    onClick={() => void handleSave()}
                  >
                    {pending ? 'Saving…' : 'Save expenses'}
                    {!pending ? <ArrowRight className="size-4" aria-hidden /> : null}
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

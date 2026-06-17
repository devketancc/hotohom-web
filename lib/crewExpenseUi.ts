import type { LucideIcon } from 'lucide-react';
import {
  CircleParking,
  IndianRupee,
  MoreHorizontal,
  Snowflake,
  TriangleAlert,
  Zap,
} from 'lucide-react';
import type { CrewExpenseType, CrewTripEOTSummary, CrewTripExpenseLog } from '@/types/crew';

export type CrewExpensePreset = {
  type: CrewExpenseType;
  label: string;
  unit: 'hours' | 'inr';
  description: string;
  icon: LucideIcon;
  quickAmounts: number[];
  amountPlaceholder: string;
  notePlaceholder: string;
  /** Disputable charges that must be backed by a receipt/photo. */
  requiresAttachment: boolean;
};

/** Order matches crew UX: toll & parking first, then hours-based charges. */
export const CREW_EXPENSE_PRESETS: CrewExpensePreset[] = [
  {
    type: 'toll_charge',
    label: 'Toll',
    unit: 'inr',
    description: 'Highway, expressway, or bridge tolls',
    icon: IndianRupee,
    quickAmounts: [50, 100, 200, 500],
    amountPlaceholder: '85',
    notePlaceholder: 'e.g. Mumbai–Pune expressway',
    requiresAttachment: true,
  },
  {
    type: 'parking_charge',
    label: 'Parking',
    unit: 'inr',
    description: 'Parking fees at stops or destinations',
    icon: CircleParking,
    quickAmounts: [50, 100, 200, 500],
    amountPlaceholder: '100',
    notePlaceholder: 'e.g. Mall parking, overnight',
    requiresAttachment: true,
  },
  {
    type: 'ac_hours',
    label: 'AC hours',
    unit: 'hours',
    description: 'Air conditioning usage during the trip',
    icon: Snowflake,
    quickAmounts: [0.5, 1, 2, 3],
    amountPlaceholder: '2',
    notePlaceholder: 'e.g. Customer requested AC at rest stop',
    requiresAttachment: false,
  },
  {
    type: 'gen_hours',
    label: 'Generator',
    unit: 'hours',
    description: 'Generator runtime hours',
    icon: Zap,
    quickAmounts: [0.5, 1, 2, 3],
    amountPlaceholder: '1',
    notePlaceholder: 'e.g. Backup power at campsite',
    requiresAttachment: false,
  },
  {
    type: 'damage_charge',
    label: 'Damage',
    unit: 'inr',
    description: 'Damage-related charges',
    icon: TriangleAlert,
    quickAmounts: [500, 1000, 2000, 5000],
    amountPlaceholder: '500',
    notePlaceholder: 'Describe the damage briefly',
    requiresAttachment: true,
  },
  {
    type: 'other_charge',
    label: 'Other',
    unit: 'inr',
    description: 'Any other billable expense',
    icon: MoreHorizontal,
    quickAmounts: [100, 250, 500, 1000],
    amountPlaceholder: '250',
    notePlaceholder: 'What was this charge for?',
    requiresAttachment: false,
  },
];

export const LOG_EXPENSE_STEPS = [
  { id: 'type', title: 'Expense type', subtitle: 'What is this expense for?' },
  { id: 'amount', title: 'Amount', subtitle: 'Enter the value' },
  { id: 'details', title: 'Details', subtitle: 'Optional note' },
  { id: 'review', title: 'Review & save', subtitle: 'Confirm and save' },
] as const;

export type LogExpenseStepId = (typeof LOG_EXPENSE_STEPS)[number]['id'];

export function expensePresetFor(type: CrewExpenseType): CrewExpensePreset | undefined {
  return CREW_EXPENSE_PRESETS.find((p) => p.type === type);
}

export function formatExpenseValue(type: CrewExpenseType, value: string | number): string {
  const n = typeof value === 'number' ? value : Number.parseFloat(value);
  const safe = Number.isFinite(n) ? n : 0;
  const preset = expensePresetFor(type);
  if (preset?.unit === 'hours') {
    return `${safe}h`;
  }
  return `₹${safe}`;
}

export function expenseTypeLabel(type: CrewExpenseType): string {
  return expensePresetFor(type)?.label ?? type.replace(/_/g, ' ');
}

export function expenseRequiresAttachment(type: CrewExpenseType): boolean {
  return expensePresetFor(type)?.requiresAttachment ?? false;
}

const ZERO_SUMMARY: CrewTripEOTSummary = {
  ac_hours: '0',
  gen_hours: '0',
  parking_charge: '0',
  damage_charge: '0',
  toll_charge: '0',
  other_charge: '0',
};

export function aggregateExpenseLogs(logs: CrewTripExpenseLog[]): CrewTripEOTSummary {
  const totals: Record<CrewExpenseType, number> = {
    ac_hours: 0,
    gen_hours: 0,
    parking_charge: 0,
    damage_charge: 0,
    toll_charge: 0,
    other_charge: 0,
  };

  for (const log of logs) {
    for (const item of log.items) {
      const n = Number.parseFloat(item.value);
      if (Number.isFinite(n)) {
        totals[item.expense_type] += n;
      }
    }
  }

  return {
    ac_hours: String(totals.ac_hours),
    gen_hours: String(totals.gen_hours),
    parking_charge: String(totals.parking_charge),
    damage_charge: String(totals.damage_charge),
    toll_charge: String(totals.toll_charge),
    other_charge: String(totals.other_charge),
  };
}

export function summaryHasAnyCharges(summary: CrewTripEOTSummary): boolean {
  const keys = Object.keys(ZERO_SUMMARY) as (keyof CrewTripEOTSummary)[];
  return keys.some((k) => Number.parseFloat(summary[k]) > 0);
}

export type ExpenseTotalsChip = { type: CrewExpenseType; label: string; display: string };

export function expenseTotalsChips(summary: CrewTripEOTSummary): ExpenseTotalsChip[] {
  const chips: ExpenseTotalsChip[] = [];
  for (const preset of CREW_EXPENSE_PRESETS) {
    const raw = summary[preset.type];
    const n = Number.parseFloat(raw);
    if (!Number.isFinite(n) || n <= 0) continue;
    chips.push({
      type: preset.type,
      label: preset.label,
      display: formatExpenseValue(preset.type, raw),
    });
  }
  return chips;
}

export function descriptionSuggestedFor(type: CrewExpenseType): boolean {
  return true;
}

export type RecentExpenseLine = {
  id: string;
  type: CrewExpenseType;
  label: string;
  display: string;
  occurredAt: string;
  description?: string;
};

export function recentExpenseLines(logs: CrewTripExpenseLog[], limit = 3): RecentExpenseLine[] {
  const lines: RecentExpenseLine[] = [];
  const sorted = [...logs].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()
  );
  for (const log of sorted) {
    for (const item of log.items) {
      lines.push({
        id: item.id || `${log.id}-${item.expense_type}`,
        type: item.expense_type,
        label: expenseTypeLabel(item.expense_type),
        display: formatExpenseValue(item.expense_type, item.value),
        occurredAt: log.occurred_at,
        description: item.description?.trim() || undefined,
      });
      if (lines.length >= limit) return lines;
    }
  }
  return lines;
}

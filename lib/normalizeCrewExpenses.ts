import type {
  CrewExpenseType,
  CrewTripEOTSummary,
  CrewTripExpenseItem,
  CrewTripExpenseLog,
} from '@/types/crew';

const EXPENSE_TYPES: CrewExpenseType[] = [
  'ac_hours',
  'gen_hours',
  'parking_charge',
  'damage_charge',
  'toll_charge',
  'other_charge',
];

function isExpenseType(v: string): v is CrewExpenseType {
  return (EXPENSE_TYPES as string[]).includes(v);
}

export function normalizeCrewExpenseItem(raw: unknown): CrewTripExpenseItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const type = r.expense_type != null ? String(r.expense_type) : '';
  if (!isExpenseType(type)) return null;
  if (r.value == null) return null;
  return {
    id: r.id != null ? String(r.id) : '',
    expense_type: type,
    value: String(r.value),
    description: r.description != null ? String(r.description) : '',
  };
}

export function normalizeCrewExpenseLog(raw: unknown): CrewTripExpenseLog | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.id == null || r.occurred_at == null) return null;
  const itemsRaw = Array.isArray(r.items) ? r.items : [];
  const items = itemsRaw
    .map(normalizeCrewExpenseItem)
    .filter((item): item is CrewTripExpenseItem => item !== null);

  return {
    id: String(r.id),
    occurred_at: String(r.occurred_at),
    lat: r.lat != null ? String(r.lat) : null,
    lng: r.lng != null ? String(r.lng) : null,
    notes: r.notes != null ? String(r.notes) : '',
    recorded_by_name: r.recorded_by_name != null ? String(r.recorded_by_name) : '',
    items,
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

export function normalizeCrewEOTSummary(raw: unknown): CrewTripEOTSummary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    ac_hours: r.ac_hours != null ? String(r.ac_hours) : '0',
    gen_hours: r.gen_hours != null ? String(r.gen_hours) : '0',
    parking_charge: r.parking_charge != null ? String(r.parking_charge) : '0',
    damage_charge: r.damage_charge != null ? String(r.damage_charge) : '0',
    toll_charge: r.toll_charge != null ? String(r.toll_charge) : '0',
    other_charge: r.other_charge != null ? String(r.other_charge) : '0',
  };
}

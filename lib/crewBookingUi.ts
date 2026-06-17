import { format } from 'date-fns';
import { expenseTypeLabel, formatExpenseValue } from '@/lib/crewExpenseUi';
import type { BookingTripEvent } from '@/types/bookingDetail';
import type { CrewTripExpenseLog } from '@/types/crew';

export function normalizePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function whatsappUrl(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return '';
  const intl = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${intl}`;
}

export function telUrl(phone: string): string {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:${digits}` : '';
}

export function formatTripElapsed(actualStart: string | null): string | null {
  if (!actualStart) return null;
  const start = new Date(actualStart);
  if (Number.isNaN(start.getTime())) return null;
  const ms = Date.now() - start.getTime();
  if (ms < 0) return null;
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m elapsed`;
  return `${hours}h ${minutes}m elapsed`;
}

export function odometerProgress(
  actualKm: number | null | undefined,
  bufferedKm: number | null | undefined
): { percent: number; label: string } | null {
  if (actualKm == null || bufferedKm == null || bufferedKm <= 0) return null;
  const percent = Math.min(100, Math.round((actualKm / bufferedKm) * 100));
  return {
    percent,
    label: `${actualKm.toLocaleString()} km / ${bufferedKm.toLocaleString()} km (odometer)`,
  };
}

export function pricingModeLabel(pricingMode: string): string {
  if (pricingMode === 'day') return 'Day-wise';
  if (pricingMode === 'km') return 'KM-wise';
  if (pricingMode === 'package') return 'Package';
  return pricingMode ? pricingMode.replace(/_/g, ' ') : '—';
}

export type CrewActivityFeedItem =
  | {
      kind: 'event';
      id: string;
      occurredAt: string;
      title: string;
      subtitle?: string;
      eventType: string;
      images: string[];
    }
  | {
      kind: 'expense';
      id: string;
      occurredAt: string;
      title: string;
      subtitle?: string;
      recordedBy: string;
      itemCount: number;
      images: string[];
    };

function eventTitle(eventType: string): string {
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mergeCrewActivityFeed(
  events: BookingTripEvent[],
  expenseLogs: CrewTripExpenseLog[]
): CrewActivityFeedItem[] {
  const feed: CrewActivityFeedItem[] = [];

  for (const ev of events) {
    if (!ev.occurred_at) continue;
    feed.push({
      kind: 'event',
      id: `event-${ev.id}`,
      occurredAt: ev.occurred_at,
      eventType: ev.event_type,
      title: eventTitle(ev.event_type),
      subtitle: ev.notes?.trim() || undefined,
      images: [...(ev.images ?? []), ...(ev.bill_url ? [ev.bill_url] : [])],
    });
  }

  for (const log of expenseLogs) {
    if (!log.occurred_at) continue;
    const lines = log.items.map((item) => {
      const label = expenseTypeLabel(item.expense_type);
      const val = formatExpenseValue(item.expense_type, item.value);
      return item.description?.trim() ? `${label} ${val} — ${item.description}` : `${label} ${val}`;
    });
    feed.push({
      kind: 'expense',
      id: `expense-${log.id}`,
      occurredAt: log.occurred_at,
      title: log.items.length === 1 ? lines[0] ?? 'Expense logged' : `${log.items.length} expenses logged`,
      subtitle:
        log.items.length > 1
          ? lines.join(' · ')
          : log.notes?.trim() || undefined,
      recordedBy: log.recorded_by_name,
      itemCount: log.items.length,
      images: log.images ?? [],
    });
  }

  return feed.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

export function formatFeedWhen(iso: string): string {
  try {
    return format(new Date(iso), 'HH:mm');
  } catch {
    return '';
  }
}

export function formatExpenseRowWhen(iso: string): string {
  try {
    return format(new Date(iso), 'MMM d, HH:mm');
  } catch {
    return iso;
  }
}

export type FlatExpenseRow = {
  id: string;
  logId: string;
  expenseType: import('@/types/crew').CrewExpenseType;
  label: string;
  display: string;
  description: string;
  occurredAt: string;
  recordedBy: string;
  /** Attachments are stored per log — populated on the first row of each log only. */
  images: string[];
};

export function flattenExpenseLogs(logs: CrewTripExpenseLog[]): FlatExpenseRow[] {
  const rows: FlatExpenseRow[] = [];
  for (const log of logs) {
    log.items.forEach((item, i) => {
      rows.push({
        id: item.id || `${log.id}-${item.expense_type}`,
        logId: log.id,
        expenseType: item.expense_type,
        label: expenseTypeLabel(item.expense_type),
        display: formatExpenseValue(item.expense_type, item.value),
        description: item.description?.trim() || log.notes?.trim() || '—',
        occurredAt: log.occurred_at,
        recordedBy: log.recorded_by_name || '—',
        images: i === 0 ? log.images ?? [] : [],
      });
    });
  }
  return rows.sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
  );
}

/** Trip has started (active, eot pending, or completed). */
export function tripHasStarted(status: string): boolean {
  return status === 'active' || status === 'eot_pending' || status === 'completed';
}

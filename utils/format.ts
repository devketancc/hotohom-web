// utils/format.ts
import { format, parseISO } from 'date-fns';
import type { BookingData } from '@/types/booking';

/** e.g. "19 May – 22 May (3 days)" for the booking travel window */
export function formatBookingTravelWindow(dates: BookingData['dates']): string {
  if (dates.start && dates.end) {
    return `${format(new Date(dates.start), 'd MMM')} – ${format(new Date(dates.end), 'd MMM')} (${dates.totalDays} ${dates.totalDays === 1 ? 'day' : 'days'})`;
  }
  if (dates.start) {
    return `${format(new Date(dates.start), 'd MMM')} – Select end`;
  }
  return 'Select dates';
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** INR amount with grouping and 2 decimals (matches payment-style totals). */
export function formatInr(amount: string | number): string {
  const n = typeof amount === 'string' ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** e.g. "8 Jun 2026 – 11 Jun 2026 (3 days)" from API ISO datetimes */
export function formatIsoDateRange(startIso: string, endIso: string, totalDays: number): string {
  const start = parseISO(startIso);
  const end = parseISO(endIso);
  const dayLabel = totalDays === 1 ? 'day' : 'days';
  return `${format(start, 'd MMM yyyy')} – ${format(end, 'd MMM yyyy')} (${totalDays} ${dayLabel})`;
}

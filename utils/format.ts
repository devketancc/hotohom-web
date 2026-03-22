// utils/format.ts
import { format } from 'date-fns';
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

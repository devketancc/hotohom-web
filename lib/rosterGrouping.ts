import { format, parseISO } from 'date-fns';
import type { AdminRosterBooking } from '@/types/admin';

export function groupBookingsByLocalDay(bookings: AdminRosterBooking[]): { dayKey: string; items: AdminRosterBooking[] }[] {
  const sorted = [...bookings].sort(
    (a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime()
  );
  const map = new Map<string, AdminRosterBooking[]>();
  for (const b of sorted) {
    const key = format(parseISO(b.start), 'yyyy-MM-dd');
    const list = map.get(key);
    if (list) list.push(b);
    else map.set(key, [b]);
  }
  const keys = [...map.keys()].sort();
  return keys.map((dayKey) => ({ dayKey, items: map.get(dayKey)! }));
}

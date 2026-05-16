import type { AdminRosterBooking, AdminStaffCalendarEvent } from '@/types/admin';

function partyFromBookingInfo(
  raw: { id: string; name?: string; phone?: string } | null | undefined
): AdminRosterBooking['driver'] {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    name: raw.name ?? '',
    phone: raw.phone ?? '',
  };
}

/**
 * Build roster rows from crew calendar events when GET /crew/roster/ is unavailable.
 */
export function calendarEventsToRosterBookings(events: AdminStaffCalendarEvent[]): AdminRosterBooking[] {
  const byBookingId = new Map<string, AdminRosterBooking>();

  for (const event of events) {
    if (event.reason !== 'booking') continue;
    const info = event.booking_info;
    if (!info?.id) continue;

    if (byBookingId.has(info.id)) continue;

    const infoRecord = info as AdminStaffCalendarEvent['booking_info'] & {
      start?: string;
      end?: string;
      caravan?: { id?: string; registration?: string; class_code?: string; hub?: string | null };
    };

    const start =
      infoRecord.start && infoRecord.start.length > 10
        ? infoRecord.start
        : `${event.start}T00:00:00`;
    const end =
      infoRecord.end && infoRecord.end.length > 10 ? infoRecord.end : `${event.end}T23:59:59`;

    const caravanRaw = infoRecord.caravan;
    const caravanId = caravanRaw?.id ?? info.id;

    byBookingId.set(info.id, {
      booking_id: info.id,
      customer_name: info.customer_name || 'Customer',
      start,
      end,
      status: info.status || '',
      caravan: {
        id: caravanId,
        registration: caravanRaw?.registration?.trim() || '—',
        class_code: caravanRaw?.class_code?.trim() || '',
        hub: caravanRaw?.hub ?? null,
      },
      driver: partyFromBookingInfo(info.driver),
      helper: partyFromBookingInfo(info.helper),
      open_alerts: [],
    });
  }

  return [...byBookingId.values()].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );
}

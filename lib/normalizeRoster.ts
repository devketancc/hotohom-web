import type { AdminRosterBooking, AdminRosterCaravan, AdminRosterPartyMember } from '@/types/admin';

function normalizeRosterPartyMember(raw: unknown): AdminRosterPartyMember | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const name = r.name != null ? String(r.name) : '';
  if (!name) return null;
  return {
    id,
    name,
    phone: r.phone != null ? String(r.phone) : '',
  };
}

function normalizeRosterCaravan(raw: unknown): AdminRosterCaravan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const registration = r.registration != null ? String(r.registration) : '';
  const class_code = r.class_code != null ? String(r.class_code) : '';
  if (!id || !registration) return null;
  return {
    id,
    registration,
    class_code,
    hub: r.hub != null && typeof r.hub === 'string' ? r.hub : null,
  };
}

/** Normalized row from crew or admin calendar roster APIs. */
export function normalizeRosterBooking(raw: unknown): AdminRosterBooking | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const booking_id = r.booking_id != null ? String(r.booking_id) : '';
  const customer_name = r.customer_name != null ? String(r.customer_name) : '';
  const start = r.start != null ? String(r.start) : '';
  const end = r.end != null ? String(r.end) : '';
  const status = r.status != null ? String(r.status) : '';
  const caravan = normalizeRosterCaravan(r.caravan);
  if (!booking_id || !start || !end || !caravan) return null;

  const alertsRaw = r.open_alerts;
  const open_alerts = Array.isArray(alertsRaw)
    ? alertsRaw.filter((a): a is string => typeof a === 'string')
    : [];

  return {
    booking_id,
    customer_name,
    start,
    end,
    status,
    caravan,
    driver: normalizeRosterPartyMember(r.driver),
    helper: normalizeRosterPartyMember(r.helper),
    open_alerts,
  };
}

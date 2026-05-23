import type {
  AdminCalendarBookingInfo,
  AdminCalendarBookingPartyMember,
  AdminStaffCalendarEvent,
  AdminStaffCalendarReason,
  AdminStaffCalendarResource,
  AdminStaffRole,
} from '@/types/admin';

function normalizeStaffRole(raw: unknown): AdminStaffRole {
  const v = raw != null ? String(raw).toLowerCase() : '';
  return v === 'helper' ? 'helper' : 'driver';
}

function normalizeStaffCalendarReason(raw: unknown): AdminStaffCalendarReason {
  const v = raw != null ? String(raw).toLowerCase() : '';
  if (v === 'booking') return 'booking';
  if (v === 'leave') return 'leave';
  if (v === 'training') return 'training';
  return 'other';
}

function normalizeCalendarBookingPartyMember(raw: unknown): AdminCalendarBookingPartyMember | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  const name = r.name != null ? String(r.name) : '';
  if (!id || !name) return null;
  return {
    id,
    name,
    phone: r.phone != null ? String(r.phone) : '',
  };
}

function normalizeCalendarBookingInfo(raw: unknown): AdminCalendarBookingInfo | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    customer_id: r.customer_id != null ? String(r.customer_id) : '',
    customer_name: r.customer_name != null ? String(r.customer_name) : '',
    status: r.status != null ? String(r.status) : '',
    driver: normalizeCalendarBookingPartyMember(r.driver),
    helper: normalizeCalendarBookingPartyMember(r.helper),
  };
}

function normalizeStaffCalendarEvent(raw: unknown): AdminStaffCalendarEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const blockout_id = r.blockout_id != null ? String(r.blockout_id) : '';
  const start = r.start != null ? String(r.start) : '';
  const end = r.end != null ? String(r.end) : '';
  if (!blockout_id || !start || !end) return null;
  const booking = normalizeCalendarBookingInfo(r.booking_info);
  return {
    blockout_id,
    start,
    end,
    reason: normalizeStaffCalendarReason(r.reason),
    notes: r.notes != null ? String(r.notes) : '',
    ...(booking ? { booking_info: booking } : {}),
  };
}

/** Normalized crew or admin staff calendar resource. */
export function normalizeStaffCalendarResource(raw: unknown): AdminStaffCalendarResource | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const staff_id = r.staff_id != null ? String(r.staff_id) : '';
  if (!staff_id) return null;

  const eventsRaw = Array.isArray(r.events) ? r.events : [];
  const events = eventsRaw.map(normalizeStaffCalendarEvent).filter((e): e is AdminStaffCalendarEvent => e !== null);

  return {
    staff_id,
    name: r.name != null ? String(r.name) : '',
    phone: r.phone != null ? String(r.phone) : '',
    role: normalizeStaffRole(r.role),
    hub: r.hub != null ? String(r.hub) : null,
    events,
  };
}

export type CrewBookingFrom = 'roster' | 'calendar';

const CREW_BOOKING_FROM = new Set<CrewBookingFrom>(['roster', 'calendar']);

export function parseCrewBookingFrom(value: string | string[] | null | undefined): CrewBookingFrom | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') return null;
  const normalized = raw.toLowerCase();
  return CREW_BOOKING_FROM.has(normalized as CrewBookingFrom) ? (normalized as CrewBookingFrom) : null;
}

export function crewBookingBackHref(from: CrewBookingFrom): string {
  return from === 'calendar' ? '/crew/calendar' : '/crew/roster';
}

export function crewBookingBackLabel(from: CrewBookingFrom): string {
  return from === 'calendar' ? 'Back to calendar' : 'Back to roster';
}

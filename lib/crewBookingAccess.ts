export const CREW_BOOKING_FROM = ['roster', 'calendar'] as const;

export type CrewBookingFrom = (typeof CREW_BOOKING_FROM)[number];

export function parseCrewBookingFrom(raw: string | null | undefined): CrewBookingFrom | null {
  if (raw === 'roster' || raw === 'calendar') return raw;
  return null;
}

export function crewBookingBackHref(from: CrewBookingFrom): string {
  return from === 'calendar' ? '/crew/calendar' : '/crew/roster';
}

export function crewBookingBackLabel(from: CrewBookingFrom): string {
  return from === 'calendar' ? 'Back to calendar' : 'Back to roster';
}

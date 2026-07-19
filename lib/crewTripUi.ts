import type { CrewTripStatus } from '@/types/crew';

export type CrewTripUiActions = {
  canStart: boolean;
  canLogEvent: boolean;
  canLogExpense: boolean;
  canEnd: boolean;
  isReadOnly: boolean;
};

export function normalizeTripStatus(status: string | undefined | null): CrewTripStatus {
  return status?.trim() || 'pending';
}

export function crewTripStatusLabel(status: CrewTripStatus): string {
  switch (status) {
    case 'pending':
      return 'Ready to start';
    case 'active':
      return 'On trip';
    case 'eot_pending':
      return 'Awaiting approval';
    case 'completed':
      return 'Trip complete';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function crewTripStatusPillClass(status: CrewTripStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-amber-500/20 text-amber-100 ring-amber-500/40';
    case 'active':
      return 'bg-emerald-500/20 text-emerald-100 ring-emerald-500/40';
    case 'eot_pending':
      return 'bg-blue-500/20 text-blue-100 ring-blue-500/40';
    case 'completed':
      return 'bg-zinc-500/20 text-zinc-200 ring-zinc-400/40';
    default:
      return 'bg-zinc-500/15 text-zinc-300 ring-zinc-500/30';
  }
}

export function crewTripActions(status: CrewTripStatus): CrewTripUiActions {
  switch (status) {
    case 'pending':
      return { canStart: true, canLogEvent: false, canLogExpense: false, canEnd: false, isReadOnly: false };
    case 'active':
      return { canStart: false, canLogEvent: true, canLogExpense: true, canEnd: true, isReadOnly: false };
    case 'eot_pending':
    case 'completed':
      return { canStart: false, canLogEvent: false, canLogExpense: false, canEnd: false, isReadOnly: true };
    default:
      return { canStart: false, canLogEvent: false, canLogExpense: false, canEnd: false, isReadOnly: true };
  }
}

export const CREW_TRIP_EVENT_PRESETS: { type: import('@/types/crew').CrewTripEventType; label: string }[] = [
  { type: 'arrived_at_pickup', label: 'Arrived at pickup' },
  { type: 'passenger_pickup', label: 'Passenger pickup' },
  { type: 'passenger_drop', label: 'Passenger drop' },
  { type: 'refueling', label: 'Refueling' },
  { type: 'rest_stop', label: 'Rest stop' },
  { type: 'breakdown', label: 'Breakdown' },
  { type: 'custom', label: 'Other' },
];

export const CREW_TRIP_CONFIRM_COPY =
  'Only one crew member should start or end this trip. Continue if you are doing this now.';

export const END_TRIP_STEPS = [
  { id: 'odometer', title: 'Odometer', subtitle: 'End reading (km)' },
  { id: 'charges', title: 'Review charges', subtitle: 'From logged expenses' },
  { id: 'notes', title: 'Notes', subtitle: 'Optional details' },
] as const;

export type EndTripStepId = (typeof END_TRIP_STEPS)[number]['id'];

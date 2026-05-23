import type { BookingTripCore } from '@/types/bookingDetail';

const APPROVE_ROLES = new Set(['superadmin', 'ops', 'finance']);
const SUBMIT_ROLES = new Set(['superadmin', 'ops']);
const EXPENSE_VIEW_ROLES = new Set(['superadmin', 'ops', 'support']);

function normalizeRole(role: string | undefined): string {
  return role?.trim().toLowerCase() ?? '';
}

export function canApproveEOT(role: string | undefined): boolean {
  return APPROVE_ROLES.has(normalizeRole(role));
}

export function canSubmitEOT(role: string | undefined): boolean {
  return SUBMIT_ROLES.has(normalizeRole(role));
}

export function canViewTripExpenses(role: string | undefined): boolean {
  return EXPENSE_VIEW_ROLES.has(normalizeRole(role));
}

export function isEOTPending(trip: BookingTripCore | null | undefined): boolean {
  return trip?.status === 'eot_pending';
}

export function canSubmitEOTForTrip(trip: BookingTripCore | null | undefined): boolean {
  return trip?.status === 'active';
}

export type EOTChargeLine = {
  label: string;
  amount: string;
  emphasize?: boolean;
};

export function buildEOTChargeLines(trip: BookingTripCore): EOTChargeLine[] {
  const lines: EOTChargeLine[] = [
    { label: 'Extra KM charge', amount: trip.extra_km_charge },
    { label: 'AC charge', amount: trip.ac_charge },
    { label: 'Generator charge', amount: trip.gen_charge },
    { label: 'Late charge', amount: trip.late_charge },
    { label: 'Parking', amount: trip.parking_charge },
    { label: 'Toll (EOT)', amount: trip.toll_charge },
    { label: 'Fuel (hub return)', amount: trip.fuel_charge },
    { label: 'Damage', amount: trip.damage_charge },
    { label: 'Other', amount: trip.other_charge },
    { label: 'Total extra', amount: trip.total_extra_charge, emphasize: true },
  ];
  return lines;
}

export function shouldShowAdminEOTPanel(trip: BookingTripCore | null | undefined): boolean {
  if (!trip) return false;
  return trip.status === 'active' || trip.status === 'eot_pending';
}

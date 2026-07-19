import type { BookingTripCore } from '@/types/bookingDetail';

const SETTLEMENT_VIEW_ROLES = new Set(['superadmin', 'ops', 'finance']);
const BALANCE_LINK_ROLES = new Set(['superadmin', 'ops', 'finance']);
// Refund endpoints exclude ops — do not merge with the sets above.
const REFUND_ROLES = new Set(['superadmin', 'finance']);

function normalizeRole(role: string | undefined): string {
  return role?.trim().toLowerCase() ?? '';
}

export function canViewSettlement(role: string | undefined): boolean {
  return SETTLEMENT_VIEW_ROLES.has(normalizeRole(role));
}

export function canCreateBalanceLink(role: string | undefined): boolean {
  return BALANCE_LINK_ROLES.has(normalizeRole(role));
}

export function canRefund(role: string | undefined): boolean {
  return REFUND_ROLES.has(normalizeRole(role));
}

/** Backend serves settlement only once EOT is submitted (eot_pending) or approved (completed). */
export function shouldShowSettlementPanel(trip: BookingTripCore | null | undefined): boolean {
  return trip?.status === 'eot_pending' || trip?.status === 'completed';
}

/** Payment/refund actions are meaningful only after EOT approval. */
export function settlementActionsEnabled(trip: BookingTripCore | null | undefined): boolean {
  return trip?.status === 'completed';
}

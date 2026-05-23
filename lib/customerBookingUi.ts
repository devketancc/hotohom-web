import type { CustomerBookingStop } from '@/types/customerBooking';

export function sortedStops(stops: CustomerBookingStop[]): CustomerBookingStop[] {
  return [...stops].sort((a, b) => a.order - b.order);
}

export function routeSummary(stops: CustomerBookingStop[]) {
  const ordered = sortedStops(stops);
  const pickup = ordered.find((s) => s.stop_type === 'pickup');
  const dropoff = ordered.find((s) => s.stop_type === 'dropoff');
  const waypointCount = ordered.filter((s) => s.stop_type === 'waypoint').length;
  return {
    pickup: pickup?.location_name ?? '—',
    dropoff: dropoff?.location_name ?? '—',
    waypointCount,
  };
}

export function statusPillClass(status: string): string {
  const s = status.toLowerCase();
  if (s === 'cancelled' || s === 'canceled')
    return 'bg-red-500/15 text-red-200 ring-1 ring-red-500/25';
  if (s === 'confirmed' || s === 'completed')
    return 'bg-stitch-primary/15 text-stitch-primary-container';
  if (s === 'pending') return 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-500/20';
  return 'bg-white/10 text-stitch-on-surface-variant';
}

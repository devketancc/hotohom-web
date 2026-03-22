/** Buffer shown in Journey Summary (hub-to-hub distance / on-wheel time). Stored `distanceKm` stays actual. */
export const ROUTE_DISPLAY_BUFFER = 0.15;

function formatKmValue(km: number): string {
  if (km < 1) return km.toFixed(1);
  return String(Math.round(km));
}

export function formatEstimatedKmRange(actualKm: number): string {
  if (!Number.isFinite(actualKm) || actualKm <= 0) return 'N/A';
  const high = actualKm * (1 + ROUTE_DISPLAY_BUFFER);
  return `${formatKmValue(actualKm)}km–${formatKmValue(high)}km`;
}

/** Single on-wheel duration for display: minutes if under 1h, else "Xh Ymin". */
function formatOnWheelMinutesValue(minutes: number): string {
  const m = Math.round(minutes);
  if (m < 60) return `${m}min`;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return min > 0 ? `${h}h ${min}min` : `${h}h`;
}

export function formatEstimatedMinutesRange(actualMinutes: number): string {
  if (!Number.isFinite(actualMinutes) || actualMinutes <= 0) return 'N/A';
  const high = actualMinutes * (1 + ROUTE_DISPLAY_BUFFER);
  const lowR = Math.round(actualMinutes);
  const highR = Math.round(high);
  if (highR < 60) {
    return `${lowR}min–${highR}min`;
  }
  return `${formatOnWheelMinutesValue(actualMinutes)}–${formatOnWheelMinutesValue(high)}`;
}

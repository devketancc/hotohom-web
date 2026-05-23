/** Convert API ISO string to `datetime-local` input value (local). */
export function isoToDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Convert `datetime-local` value to ISO string for API. */
export function datetimeLocalToIso(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) throw new Error('Invalid date');
  return d.toISOString();
}

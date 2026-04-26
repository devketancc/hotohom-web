'use client';

import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatInr } from '@/utils/format';

export function formatIsoDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return format(parseISO(iso), 'd MMM yyyy, p');
  } catch {
    return iso;
  }
}

function parseMoney(s: string): number {
  const n = Number.parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export function MoneyLine({
  label,
  amount,
  emphasize,
  negative,
}: {
  label: string;
  amount: string;
  emphasize?: boolean;
  negative?: boolean;
}) {
  const n = parseMoney(amount);
  const muted = !emphasize && n === 0;
  return (
    <p
      className={cn(
        'flex justify-between gap-4 font-body text-sm',
        muted ? 'text-stitch-on-surface-variant/50' : 'text-stitch-on-surface-variant',
        emphasize && 'border-t border-white/10 pt-2 font-headline font-bold text-stitch-on-background'
      )}
    >
      <span>{label}</span>
      <span className="shrink-0 tabular-nums text-stitch-on-background">
        {negative && n > 0 ? '−₹' : '₹'}
        {formatInr(amount)}
      </span>
    </p>
  );
}

export function DetailRow({
  label,
  value,
  muted,
}: {
  label: string;
  value: string | number | null | undefined;
  muted?: boolean;
}) {
  const str =
    value === null || value === undefined || value === ''
      ? '—'
      : String(value);
  const isEmpty = str === '—';
  return (
    <div
      className={cn(
        'flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4',
        muted || isEmpty ? 'text-stitch-on-surface-variant/55' : 'text-stitch-on-surface-variant'
      )}
    >
      <span className="font-body text-xs font-semibold uppercase tracking-wide text-stitch-on-surface-variant">
        {label}
      </span>
      <span className="font-body text-sm text-stitch-on-background sm:text-right">{str}</span>
    </div>
  );
}

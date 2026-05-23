'use client';

import { ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { CouponDetails } from '@/components/admin/coupons/CouponDetails';
import { CouponDiscountBadge } from '@/components/admin/coupons/CouponDiscountBadge';
import { CouponStatusBadge } from '@/components/admin/coupons/CouponStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { AdminCoupon } from '@/types/coupon';

function fmtShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.valueOf())) return '—';
  return format(d, 'dd MMM yyyy');
}

function usageLine(coupon: AdminCoupon): string {
  const used = coupon.used_count;
  const max = coupon.max_uses;
  if (max == null) return `${used} / ∞`;
  return `${used} / ${max}`;
}

export function CouponCard({
  coupon,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  togglingActive,
  classNameByCode,
  locationNameById,
}: {
  coupon: AdminCoupon;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: (next: boolean) => void;
  togglingActive?: boolean;
  classNameByCode?: Record<string, string>;
  locationNameById?: Record<string, string>;
}) {
  return (
    <Card
      className={cn(
        'overflow-hidden border-border/80 shadow-sm transition-shadow hover:shadow-md',
        expanded && 'ring-1 ring-primary/25'
      )}
    >
      <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} details for coupon ${coupon.code}`}
          className="flex min-w-0 flex-1 cursor-pointer flex-col gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
          onClick={onToggleExpand}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onToggleExpand();
            }
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p className="font-mono text-base font-bold tracking-tight text-foreground sm:text-lg">{coupon.code}</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Valid {fmtShort(coupon.valid_from)} → {fmtShort(coupon.valid_until)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CouponDiscountBadge coupon={coupon} />
              <CouponStatusBadge coupon={coupon} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:text-sm">
            <span>
              Usage <span className="font-medium tabular-nums text-foreground">{usageLine(coupon)}</span>
            </span>
            <span className="hidden h-3 w-px bg-border sm:inline" aria-hidden />
            <span className="inline-flex items-center gap-1">
              <ChevronDown
                className={cn('size-4 transition-transform duration-200', expanded && 'rotate-180')}
                aria-hidden
              />
              {expanded ? 'Hide details' : 'Show details'}
            </span>
          </div>
        </div>

        <div
          className="flex shrink-0 flex-row items-center justify-end gap-2 border-t border-border/60 bg-muted/15 px-4 py-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:border-l sm:px-4"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 rounded-lg bg-background/50 px-2 py-1 ring-1 ring-border/60">
            <span className="text-xs text-muted-foreground">Active</span>
            <Switch
              checked={coupon.is_active}
              disabled={togglingActive}
              onCheckedChange={(v) => onToggleActive(Boolean(v))}
              aria-label={`Toggle active for ${coupon.code}`}
            />
          </div>
          <div className="flex gap-1">
            <Button type="button" variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit ${coupon.code}`}>
              <Pencil className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={onDelete}
              aria-label={`Delete ${coupon.code}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <CouponDetails
            coupon={coupon}
            classNameByCode={classNameByCode}
            locationNameById={locationNameById}
          />
        </div>
      </div>
    </Card>
  );
}

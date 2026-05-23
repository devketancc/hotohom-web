import { cn } from '@/lib/utils';
import { getCouponLifecycleStatus, type CouponLifecycleStatus } from '@/lib/coupons/coupon-status';
import type { AdminCoupon } from '@/types/coupon';

const STYLES: Record<CouponLifecycleStatus, string> = {
  active: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
  inactive: 'bg-muted text-muted-foreground ring-border',
  expired: 'bg-rose-500/15 text-rose-300 ring-rose-500/35',
  upcoming: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
};

const LABELS: Record<CouponLifecycleStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  expired: 'Expired',
  upcoming: 'Upcoming',
};

export function CouponStatusBadge({
  coupon,
  className,
}: {
  coupon: AdminCoupon;
  className?: string;
}) {
  const status = getCouponLifecycleStatus(coupon);
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        STYLES[status],
        className
      )}
    >
      {LABELS[status]}
    </span>
  );
}

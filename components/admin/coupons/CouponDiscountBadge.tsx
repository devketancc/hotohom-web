import { cn } from '@/lib/utils';
import type { AdminCoupon } from '@/types/coupon';

export function CouponDiscountBadge({ coupon, className }: { coupon: AdminCoupon; className?: string }) {
  const isPercent = coupon.discount_type === 'percent';
  const label = isPercent ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums ring-1 ring-inset',
        isPercent
          ? 'bg-sky-500/15 text-sky-200 ring-sky-500/35'
          : 'bg-amber-500/15 text-amber-200 ring-amber-500/35',
        className
      )}
    >
      <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">{isPercent ? '%' : '₹'}</span>
      {label}
    </span>
  );
}

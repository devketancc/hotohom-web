import type { AdminCoupon } from '@/types/coupon';

export type CouponLifecycleStatus = 'active' | 'inactive' | 'expired' | 'upcoming';

export function getCouponLifecycleStatus(coupon: AdminCoupon, now: Date = new Date()): CouponLifecycleStatus {
  if (!coupon.is_active) return 'inactive';
  const until = new Date(coupon.valid_until);
  const from = new Date(coupon.valid_from);
  if (Number.isNaN(until.valueOf()) || Number.isNaN(from.valueOf())) return 'inactive';
  if (until < now) return 'expired';
  if (from > now) return 'upcoming';
  return 'active';
}

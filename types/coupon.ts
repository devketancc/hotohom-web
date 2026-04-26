import type { AdminPaginated } from '@/types/admin';

export type CouponDiscountType = 'flat' | 'percent';
export type CouponApplicableOn = 'cart' | 'addons' | 'base';

/** Coupon row from admin list/detail serializers. */
export interface AdminCoupon {
  id: string;
  code: string;
  description: string;
  user: string | null;
  discount_type: CouponDiscountType;
  discount_value: string;
  max_discount_cap: string | null;
  applicable_on: CouponApplicableOn;
  min_booking_value: string;
  max_uses: number | null;
  used_count: number;
  per_user_limit: number;
  valid_from: string;
  valid_until: string;
  applicable_classes: string[];
  applicable_destinations: string[];
  is_first_booking_only: boolean;
  is_referral_coupon: boolean;
  is_active: boolean;
  created_at: string;
}

/** Payload for POST create / PATCH update (CouponWriteSerializer). */
export interface AdminCouponWritePayload {
  code: string;
  description?: string;
  user?: string | null;
  discount_type: CouponDiscountType;
  discount_value: number;
  max_discount_cap?: number | null;
  applicable_on?: CouponApplicableOn;
  min_booking_value?: number;
  max_uses?: number | null;
  per_user_limit?: number;
  valid_from: string;
  valid_until: string;
  applicable_classes?: string[];
  applicable_destinations?: string[];
  is_first_booking_only?: boolean;
  is_referral_coupon?: boolean;
  is_active?: boolean;
}

export interface AdminCouponListQuery {
  /** When true, only active coupons; when false, only inactive. Omit = all. */
  is_active?: boolean;
  code?: string;
  page?: number;
  page_size?: number;
}

export type AdminCouponListResponse = AdminPaginated<AdminCoupon>;

/** Waypoint / hub option for destination multi-select. */
export interface AdminCouponLocationOption {
  id: string;
  name: string;
  location_type: string;
  is_active: boolean;
}

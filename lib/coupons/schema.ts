import { z } from 'zod';
import type { AdminCoupon, AdminCouponWritePayload } from '@/types/coupon';
import { datetimeLocalToIso, isoToDatetimeLocalValue } from '@/lib/coupons/datetime';

const discountTypeSchema = z.enum(['flat', 'percent']);
const applicableOnSchema = z.enum(['cart', 'addons', 'base']);

export const couponFormSchema = z
  .object({
    code: z.string().min(1, 'Code is required.').max(50, 'Max 50 characters.'),
    description: z.string(),
    user: z.string(),
    discount_type: discountTypeSchema,
    discount_value: z.string().min(1, 'Discount value is required.'),
    max_discount_cap: z.string(),
    applicable_on: applicableOnSchema,
    min_booking_value: z.string(),
    max_uses: z.string(),
    per_user_limit: z.string(),
    valid_from: z.string().min(1, 'Start date is required.'),
    valid_until: z.string().min(1, 'End date is required.'),
    applicable_classes: z.array(z.string()),
    applicable_destinations: z.array(z.string()),
    is_first_booking_only: z.boolean(),
    is_referral_coupon: z.boolean(),
    is_active: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const dv = Number(val.discount_value);
    if (!Number.isFinite(dv) || dv <= 0) {
      ctx.addIssue({ code: 'custom', message: 'Enter a positive amount.', path: ['discount_value'] });
    }
    if (val.discount_type === 'percent' && Number.isFinite(dv) && dv > 100) {
      ctx.addIssue({ code: 'custom', message: 'Percent cannot exceed 100.', path: ['discount_value'] });
    }

    const minBooking = val.min_booking_value.trim() === '' ? 0 : Number(val.min_booking_value);
    if (!Number.isFinite(minBooking) || minBooking < 0) {
      ctx.addIssue({ code: 'custom', message: 'Must be zero or positive.', path: ['min_booking_value'] });
    }

    const capRaw = val.max_discount_cap.trim();
    if (capRaw) {
      const cap = Number(capRaw);
      if (!Number.isFinite(cap) || cap < 0) {
        ctx.addIssue({ code: 'custom', message: 'Must be zero or positive.', path: ['max_discount_cap'] });
      }
    }

    const perUser = val.per_user_limit.trim() === '' ? 1 : Number(val.per_user_limit);
    if (!Number.isFinite(perUser) || perUser < 1 || !Number.isInteger(perUser)) {
      ctx.addIssue({ code: 'custom', message: 'Must be an integer ≥ 1.', path: ['per_user_limit'] });
    }

    const maxUsesRaw = val.max_uses.trim();
    if (maxUsesRaw) {
      const mu = Number(maxUsesRaw);
      if (!Number.isFinite(mu) || mu < 1 || !Number.isInteger(mu)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Must be a positive integer or leave empty for unlimited.',
          path: ['max_uses'],
        });
      }
    }

    const from = new Date(val.valid_from);
    const until = new Date(val.valid_until);
    if (Number.isNaN(from.valueOf())) {
      ctx.addIssue({ code: 'custom', message: 'Invalid start date.', path: ['valid_from'] });
    }
    if (Number.isNaN(until.valueOf())) {
      ctx.addIssue({ code: 'custom', message: 'Invalid end date.', path: ['valid_until'] });
    }
    if (!Number.isNaN(from.valueOf()) && !Number.isNaN(until.valueOf()) && until.getTime() <= from.getTime()) {
      ctx.addIssue({ code: 'custom', message: 'End must be after start.', path: ['valid_until'] });
    }

    const uid = val.user.trim();
    if (uid) {
      const r = z.string().uuid().safeParse(uid);
      if (!r.success) {
        ctx.addIssue({ code: 'custom', message: 'Invalid user UUID.', path: ['user'] });
      }
    }
  });

export type CouponFormValues = z.infer<typeof couponFormSchema>;

export function defaultCouponFormValues(): CouponFormValues {
  return {
    code: '',
    description: '',
    user: '',
    discount_type: 'percent',
    discount_value: '',
    max_discount_cap: '',
    applicable_on: 'cart',
    min_booking_value: '0',
    max_uses: '',
    per_user_limit: '1',
    valid_from: '',
    valid_until: '',
    applicable_classes: [],
    applicable_destinations: [],
    is_first_booking_only: false,
    is_referral_coupon: false,
    is_active: true,
  };
}

export function adminCouponToFormValues(coupon: AdminCoupon): CouponFormValues {
  return {
    code: coupon.code,
    description: coupon.description ?? '',
    user: coupon.user ?? '',
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    max_discount_cap: coupon.max_discount_cap ?? '',
    applicable_on: coupon.applicable_on,
    min_booking_value: coupon.min_booking_value,
    max_uses: coupon.max_uses != null ? String(coupon.max_uses) : '',
    per_user_limit: String(coupon.per_user_limit),
    valid_from: isoToDatetimeLocalValue(coupon.valid_from),
    valid_until: isoToDatetimeLocalValue(coupon.valid_until),
    applicable_classes: [...coupon.applicable_classes],
    applicable_destinations: [...coupon.applicable_destinations],
    is_first_booking_only: coupon.is_first_booking_only,
    is_referral_coupon: coupon.is_referral_coupon,
    is_active: coupon.is_active,
  };
}

export function couponFormValuesToPayload(values: CouponFormValues): AdminCouponWritePayload {
  const maxUsesRaw = values.max_uses.trim();
  const max_discount_cap = values.max_discount_cap.trim();
  const userTrim = values.user.trim();

  return {
    code: values.code.trim().toUpperCase(),
    description: values.description.trim() || undefined,
    user: userTrim ? userTrim : null,
    discount_type: values.discount_type,
    discount_value: Number(values.discount_value),
    max_discount_cap: max_discount_cap ? Number(max_discount_cap) : null,
    applicable_on: values.applicable_on,
    min_booking_value: values.min_booking_value.trim() === '' ? 0 : Number(values.min_booking_value),
    max_uses: maxUsesRaw ? Number(maxUsesRaw) : null,
    per_user_limit: values.per_user_limit.trim() === '' ? 1 : Number(values.per_user_limit),
    valid_from: datetimeLocalToIso(values.valid_from),
    valid_until: datetimeLocalToIso(values.valid_until),
    applicable_classes: values.applicable_classes,
    applicable_destinations: values.applicable_destinations,
    is_first_booking_only: values.is_first_booking_only,
    is_referral_coupon: values.is_referral_coupon,
    is_active: values.is_active,
  };
}

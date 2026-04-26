'use client';

import { AlertCircle } from 'lucide-react';
import { CouponCard } from '@/components/admin/coupons/CouponCard';
import { CouponsEmptyState } from '@/components/admin/coupons/CouponsEmptyState';
import { CouponsPagination } from '@/components/admin/coupons/CouponsPagination';
import { CouponsSkeletons } from '@/components/admin/coupons/CouponsSkeletons';
import type { AdminCoupon } from '@/types/coupon';

export function CouponsList({
  coupons,
  isLoading,
  isError,
  errorMessage,
  expandedId,
  onToggleExpand,
  onEdit,
  onDelete,
  onToggleActive,
  togglingCouponId,
  page,
  pageSize,
  total,
  onPageChange,
  onCreate,
  classNameByCode,
  locationNameById,
}: {
  coupons: AdminCoupon[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
  onEdit: (coupon: AdminCoupon) => void;
  onDelete: (coupon: AdminCoupon) => void;
  onToggleActive: (coupon: AdminCoupon, next: boolean) => void;
  togglingCouponId: string | null;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (p: number) => void;
  onCreate: () => void;
  classNameByCode?: Record<string, string>;
  locationNameById?: Record<string, string>;
}) {
  if (isLoading && !coupons.length) {
    return <CouponsSkeletons />;
  }

  if (isError) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
        <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div>
          <p className="font-medium">Could not load coupons</p>
          <p className="mt-1 text-destructive/90">{errorMessage ?? 'Something went wrong. Try again.'}</p>
        </div>
      </div>
    );
  }

  if (!coupons.length) {
    return <CouponsEmptyState onCreate={onCreate} />;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {coupons.map((c) => (
          <CouponCard
            key={c.id}
            coupon={c}
            expanded={expandedId === c.id}
            onToggleExpand={() => onToggleExpand(c.id)}
            onEdit={() => onEdit(c)}
            onDelete={() => onDelete(c)}
            onToggleActive={(next) => onToggleActive(c, next)}
            togglingActive={togglingCouponId === c.id}
            classNameByCode={classNameByCode}
            locationNameById={locationNameById}
          />
        ))}
      </div>
      {total > pageSize ? (
        <CouponsPagination page={page} pageSize={pageSize} total={total} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}

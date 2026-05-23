import { useMemo } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listAdminCoupons } from '@/services/coupon.service';
import type { AdminCouponListQuery } from '@/types/coupon';

export const couponQueryKeys = {
  list: (params: AdminCouponListQuery) => ['admin', 'coupons', 'list', params] as const,
  detail: (id: string) => ['admin', 'coupons', 'detail', id] as const,
};

export type UseCouponsInput = {
  /** When true → active only; false → inactive only; undefined → all (no query param). */
  isActiveFilter: boolean | undefined;
  codeSearch: string;
  page: number;
  pageSize: number;
};

export function useCoupons({ isActiveFilter, codeSearch, page, pageSize }: UseCouponsInput) {
  const debouncedCode = useDebouncedValue(codeSearch, 300);

  const queryParams = useMemo((): AdminCouponListQuery => {
    const q: AdminCouponListQuery = {
      page,
      page_size: pageSize,
    };
    if (isActiveFilter !== undefined) {
      q.is_active = isActiveFilter;
    }
    const c = debouncedCode.trim();
    if (c) q.code = c;
    return q;
  }, [isActiveFilter, debouncedCode, page, pageSize]);

  return useQuery({
    queryKey: couponQueryKeys.list(queryParams),
    queryFn: () => listAdminCoupons(queryParams),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

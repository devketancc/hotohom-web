import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createAdminCoupon, deleteAdminCoupon, updateAdminCoupon } from '@/services/coupon.service';
import type { AdminCouponWritePayload } from '@/types/coupon';

export function useCouponMutations() {
  const qc = useQueryClient();

  const invalidateCoupons = () =>
    qc.invalidateQueries({
      queryKey: ['admin', 'coupons'],
    });

  const createMutation = useMutation({
    mutationFn: (payload: AdminCouponWritePayload) => createAdminCoupon(payload),
    onSuccess: () => {
      toast.success('Coupon created');
      void invalidateCoupons();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminCouponWritePayload> }) =>
      updateAdminCoupon(id, payload),
    onSuccess: () => {
      toast.success('Coupon updated');
      void invalidateCoupons();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminCoupon(id),
    onSuccess: () => {
      toast.success('Coupon deleted');
      void invalidateCoupons();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to delete coupon';
      toast.error(msg);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateAdminCoupon(id, { is_active }),
    onSuccess: (_data, { is_active }) => {
      toast.success(is_active ? 'Coupon activated' : 'Coupon deactivated');
      void invalidateCoupons();
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Could not update status';
      toast.error(msg);
    },
  });

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    toggleActiveMutation,
    invalidateCoupons,
  };
}

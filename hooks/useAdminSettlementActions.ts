'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errorHandler';
import {
  adminQueryKeys,
  createAdminTripBalanceLink,
  refundAdminDeposit,
  refundAdminPayment,
} from '@/services/admin.service';
import type { AdminRefundPayload } from '@/types/admin';

export function useAdminSettlementActions(bookingId: string, tripId: string) {
  const queryClient = useQueryClient();

  const invalidateAfterMutation = async () => {
    if (bookingId) {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
    }
    if (tripId) {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tripSettlement(tripId) });
    }
  };

  const onError = (err: unknown) => {
    toast.error(handleApiError(err));
  };

  const balanceLinkMutation = useMutation({
    mutationFn: () => createAdminTripBalanceLink(tripId),
    onSuccess: async (result) => {
      if (result.linkNeeded) {
        toast.success(result.alreadyExists ? 'Existing payment link retrieved' : 'Payment link created');
      } else {
        toast.success(result.message ?? 'No payment link needed — nothing due');
      }
      await invalidateAfterMutation();
    },
    onError,
  });

  const refundDepositMutation = useMutation({
    mutationFn: (payload: AdminRefundPayload) => refundAdminDeposit(bookingId, payload),
    onSuccess: async () => {
      toast.success('Deposit refund initiated');
      await invalidateAfterMutation();
    },
    onError,
  });

  const refundAdvanceMutation = useMutation({
    mutationFn: ({ paymentId, ...payload }: { paymentId: string } & AdminRefundPayload) =>
      refundAdminPayment(paymentId, payload),
    onSuccess: async () => {
      toast.success('Advance refund initiated');
      await invalidateAfterMutation();
    },
    onError,
  });

  return {
    createBalanceLink: () => balanceLinkMutation.mutateAsync(),
    refundDeposit: (payload: AdminRefundPayload) => refundDepositMutation.mutateAsync(payload),
    refundAdvance: (input: { paymentId: string } & AdminRefundPayload) =>
      refundAdvanceMutation.mutateAsync(input),
    isCreatingLink: balanceLinkMutation.isPending,
    isRefundingDeposit: refundDepositMutation.isPending,
    isRefundingAdvance: refundAdvanceMutation.isPending,
    isBusy:
      balanceLinkMutation.isPending ||
      refundDepositMutation.isPending ||
      refundAdvanceMutation.isPending,
  };
}

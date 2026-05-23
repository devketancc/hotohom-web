'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errorHandler';
import {
  adminQueryKeys,
  approveAdminTripEOT,
  submitAdminTripEnd,
} from '@/services/admin.service';
import type { CrewTripEndPayload } from '@/types/crew';

export function useAdminTripEOTActions(bookingId: string, tripId: string) {
  const queryClient = useQueryClient();

  const invalidateAfterMutation = async () => {
    if (bookingId) {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
    }
    if (tripId) {
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.tripExpenses(tripId) });
    }
    await queryClient.invalidateQueries({ queryKey: ['admin', 'calendar', 'roster'] });
  };

  const onError = (err: unknown) => {
    toast.error(handleApiError(err));
  };

  const approveMutation = useMutation({
    mutationFn: () => approveAdminTripEOT(tripId),
    onSuccess: async () => {
      toast.success('EOT approved — trip completed');
      await invalidateAfterMutation();
    },
    onError,
  });

  const submitMutation = useMutation({
    mutationFn: (payload: CrewTripEndPayload) => submitAdminTripEnd(tripId, payload),
    onSuccess: async () => {
      toast.success('EOT submitted');
      await invalidateAfterMutation();
    },
    onError,
  });

  return {
    approve: () => approveMutation.mutateAsync(),
    submit: (payload: CrewTripEndPayload) => submitMutation.mutateAsync(payload),
    isApproving: approveMutation.isPending,
    isSubmitting: submitMutation.isPending,
    isBusy: approveMutation.isPending || submitMutation.isPending,
  };
}

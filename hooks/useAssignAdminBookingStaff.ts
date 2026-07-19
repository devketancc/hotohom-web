'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminQueryKeys, assignAdminBookingStaff } from '@/services/admin.service';
import type { AdminAssignStaffPayload } from '@/types/admin';

/**
 * No onError toast here on purpose — the assign sheet renders 409 conflicts
 * inline and only toasts non-conflict failures itself.
 */
export function useAssignAdminBookingStaff(bookingId: string) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AdminAssignStaffPayload) => assignAdminBookingStaff(bookingId, payload),
    onSuccess: async () => {
      toast.success('Staff assigned');
      await queryClient.invalidateQueries({ queryKey: ['admin', 'calendar', 'roster'] });
      if (bookingId) {
        await queryClient.invalidateQueries({ queryKey: adminQueryKeys.bookingDetail(bookingId) });
      }
    },
  });

  return {
    assign: (payload: AdminAssignStaffPayload) => mutation.mutateAsync(payload),
    isAssigning: mutation.isPending,
  };
}

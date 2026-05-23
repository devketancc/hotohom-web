'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errorHandler';
import { aggregateExpenseLogs } from '@/lib/crewExpenseUi';
import {
  createCrewTripExpense,
  crewQueryKeys,
  listCrewTripExpenses,
} from '@/services/crew.service';
import type { CrewTripExpenseWritePayload, CrewTripStatus } from '@/types/crew';

export function useCrewTripExpenses(tripId: string, status: CrewTripStatus, enabled = true) {
  const queryClient = useQueryClient();
  const shouldFetch = enabled && Boolean(tripId);

  const query = useQuery({
    queryKey: crewQueryKeys.tripExpenses(tripId),
    queryFn: () => listCrewTripExpenses(tripId),
    enabled: shouldFetch,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CrewTripExpenseWritePayload) => createCrewTripExpense(tripId, payload),
    onSuccess: async () => {
      toast.success('Expense logged');
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.tripExpenses(tripId) });
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.tripEotSummary(tripId) });
    },
    onError: (err: unknown) => {
      toast.error(handleApiError(err));
    },
  });

  const logs = query.data ?? [];
  const aggregated = aggregateExpenseLogs(logs);

  return {
    logs,
    aggregated,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    logExpense: createMutation.mutateAsync,
    isLogging: createMutation.isPending,
    canLog: status === 'active',
  };
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { aggregateExpenseLogs } from '@/lib/crewExpenseUi';
import { canViewTripExpenses } from '@/lib/adminEotUi';
import { adminQueryKeys, listAdminTripExpenses } from '@/services/admin.service';

export function useAdminTripExpenses(
  tripId: string,
  userRole: string | undefined,
  enabled = true
) {
  const canView = canViewTripExpenses(userRole);
  const shouldFetch = enabled && Boolean(tripId) && canView;

  const query = useQuery({
    queryKey: adminQueryKeys.tripExpenses(tripId),
    queryFn: () => listAdminTripExpenses(tripId),
    enabled: shouldFetch,
  });

  const logs = query.data ?? [];
  const aggregated = aggregateExpenseLogs(logs);

  return {
    logs,
    aggregated,
    canView,
    isLoading: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

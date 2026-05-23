'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { crewQueryKeys, getCrewCalendar } from '@/services/crew.service';

export function useCrewCalendar(activeMonthStart: Date) {
  const range = useMemo(() => {
    const start = format(startOfMonth(activeMonthStart), 'yyyy-MM-dd');
    const end = format(endOfMonth(activeMonthStart), 'yyyy-MM-dd');
    return { start, end };
  }, [activeMonthStart]);

  const queryKey = crewQueryKeys.calendar(range);

  return useQuery({
    queryKey,
    queryFn: () => getCrewCalendar(range),
    staleTime: 30_000,
  });
}

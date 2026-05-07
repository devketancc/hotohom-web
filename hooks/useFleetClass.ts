'use client';

import { useMemo } from 'react';
import { resolveFleetParamToCode } from '@/config/fleet-experience';
import { useFleetCatalog } from '@/hooks/useFleetCatalog';
import type { FleetClassSummary } from '@/types/fleet';

interface UseFleetClassResult {
  summary: FleetClassSummary | null;
  isLoading: boolean;
  isError: boolean;
  notFound: boolean;
  refetch: () => void;
}

/**
 * Narrows the shared fleet catalog query to a single class.
 * Accepts canonical slug (e.g. urbania), legacy letter (/fleet/T), or code.
 * Reuses the ['fleet','catalog'] query so the index and detail share a cache.
 */
export function useFleetClass(slugOrCode: string | undefined): UseFleetClassResult {
  const { classes, isLoading, isError, refetch } = useFleetCatalog();

  const resolvedCode = useMemo(
    () => resolveFleetParamToCode(slugOrCode),
    [slugOrCode]
  );

  const summary = useMemo<FleetClassSummary | null>(() => {
    if (!resolvedCode) return null;
    return (
      classes.find((c) => c.klass.code.toUpperCase() === resolvedCode) ?? null
    );
  }, [classes, resolvedCode]);

  const notFound = !isLoading && !isError && classes.length > 0 && !summary;

  return {
    summary,
    isLoading,
    isError,
    notFound,
    refetch,
  };
}

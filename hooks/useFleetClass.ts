'use client';

import { useMemo } from 'react';
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
 * Narrows the shared fleet catalog query to a single class by code.
 * Reuses the ['fleet','catalog'] query so the index and detail share a cache.
 */
export function useFleetClass(code: string | undefined): UseFleetClassResult {
  const { classes, isLoading, isError, refetch } = useFleetCatalog();

  const summary = useMemo<FleetClassSummary | null>(() => {
    if (!code) return null;
    const upper = code.toUpperCase();
    return (
      classes.find((c) => c.klass.code.toUpperCase() === upper) ?? null
    );
  }, [classes, code]);

  const notFound = !isLoading && !isError && classes.length > 0 && !summary;

  return {
    summary,
    isLoading,
    isError,
    notFound,
    refetch,
  };
}

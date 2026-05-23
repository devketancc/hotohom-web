'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fleetService } from '@/services/fleet.service';
import type {
  FleetCaravanListItem,
  FleetClassSummary,
} from '@/types/fleet';

interface UseFleetCatalogResult {
  classes: FleetClassSummary[];
  units: FleetCaravanListItem[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Single source of truth for the public fleet catalog.
 * Fetches /caravans/?page_size=100 once and groups results by class.
 */
export function useFleetCatalog(): UseFleetCatalogResult {
  const query = useQuery({
    queryKey: ['fleet', 'catalog'],
    queryFn: () => fleetService.listCaravans({ page_size: 100 }),
    staleTime: 5 * 60 * 1000,
  });

  const units = useMemo<FleetCaravanListItem[]>(() => {
    if (!query.data?.success) return [];
    return query.data.data?.results ?? [];
  }, [query.data]);

  const classes = useMemo<FleetClassSummary[]>(() => {
    if (units.length === 0) return [];

    const grouped = new Map<string, FleetCaravanListItem[]>();
    for (const unit of units) {
      const klass = unit.caravan_class;
      if (!klass?.id || klass.is_active === false) continue;
      const existing = grouped.get(klass.id);
      if (existing) {
        existing.push(unit);
      } else {
        grouped.set(klass.id, [unit]);
      }
    }

    const summaries: FleetClassSummary[] = [];
    for (const groupUnits of grouped.values()) {
      const klass = groupUnits[0].caravan_class;
      const classImages = klass.media
        .filter((m) => m.media_type === 'image' && Boolean(m.url))
        .sort((a, b) => a.order - b.order);
      const unitThumbnails = groupUnits
        .map((u) => u.thumbnail)
        .filter((url): url is string => Boolean(url))
        .slice(0, 4);
      const coverImage =
        classImages[0]?.url ?? unitThumbnails[0] ?? null;

      summaries.push({
        klass,
        unitCount: groupUnits.length,
        coverImage,
        unitThumbnails,
        units: groupUnits,
      });
    }

    summaries.sort((a, b) => a.klass.code.localeCompare(b.klass.code));
    return summaries;
  }, [units]);

  return {
    classes,
    units,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}

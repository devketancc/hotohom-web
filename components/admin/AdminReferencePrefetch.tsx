'use client';

import { useQuery } from '@tanstack/react-query';
import { adminQueryKeys, listAdminCaravanClasses, listAdminFleetCaravans, listAdminHubs } from '@/services/admin.service';

/**
 * Warms admin reference queries for hubs, classes, and fleet caravans so list pages feel instant.
 * Renders nothing.
 */
export function AdminReferencePrefetch() {
  useQuery({
    queryKey: adminQueryKeys.hubs,
    queryFn: listAdminHubs,
    staleTime: 5 * 60 * 1000,
  });
  useQuery({
    queryKey: adminQueryKeys.caravanClasses,
    queryFn: listAdminCaravanClasses,
    staleTime: 5 * 60 * 1000,
  });
  useQuery({
    queryKey: adminQueryKeys.caravans,
    queryFn: listAdminFleetCaravans,
    staleTime: 5 * 60 * 1000,
  });
  return null;
}

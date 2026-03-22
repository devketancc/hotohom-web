'use client';

import { useEffect } from 'react';
import { locationService } from '@/services/location.service';
import type { BookingData } from '@/types/booking';

function isValidHubCoords(lat: number, lng: number): boolean {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

/**
 * When persisted or legacy state has `hub` but no `hubLocation`, fetch hubs from the API
 * and fill coordinates so round-trip maps can render.
 */
export function useEnsureHubLocation(
  hub: string | null,
  hubLocation: BookingData['hubLocation'],
  setData: (data: Partial<BookingData>) => void
): void {
  useEffect(() => {
    if (!hub || hubLocation) return;

    let cancelled = false;

    (async () => {
      try {
        const hubs = await locationService.getHubs();
        if (cancelled) return;
        const match = hubs.find((h) => h.id === hub);
        if (!match) return;
        const lat = match.coordinates.lat;
        const lng = match.coordinates.lng;
        if (!isValidHubCoords(lat, lng)) return;

        setData({
          hubLocation: { lat, lng },
          ...(match.name ? { hubName: match.name } : {}),
        });
      } catch {
        // Leave hubLocation null; user can re-select hub from picker.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hub, hubLocation, setData]);
}

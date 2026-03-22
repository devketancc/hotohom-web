'use client';

import { useEnsureHubLocation } from '@/hooks/useEnsureHubLocation';
import { useBookingStore } from '@/store/bookingStore';

/** Fetches hub coordinates from the locations API when `hub` is set but `hubLocation` is missing (e.g. legacy persisted state). */
export function HubLocationBackfill() {
  const hub = useBookingStore((s) => s.hub);
  const hubLocation = useBookingStore((s) => s.hubLocation);
  const setData = useBookingStore((s) => s.setData);

  useEnsureHubLocation(hub, hubLocation, setData);

  return null;
}

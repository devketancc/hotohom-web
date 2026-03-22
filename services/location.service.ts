import { env } from '@/config/env';
import { useAuthStore } from '@/store/authStore';
import type { HubsResponse, LocationHub } from '@/types/location';

function readCoords(raw: Record<string, unknown>): { lat: number; lng: number } | null {
  const coords = raw.coordinates;
  if (coords && typeof coords === 'object' && !Array.isArray(coords)) {
    const c = coords as Record<string, unknown>;
    const lat = Number(c.lat);
    const lng = Number(c.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  const topLat = Number(raw.lat);
  const topLng = Number(raw.lng);
  if (Number.isFinite(topLat) && Number.isFinite(topLng)) return { lat: topLat, lng: topLng };

  const loc = raw.location;
  if (loc && typeof loc === 'object' && !Array.isArray(loc)) {
    const L = loc as Record<string, unknown>;
    const lat = Number(L.latitude ?? L.lat);
    const lng = Number(L.longitude ?? L.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return null;
}

function normalizeHubFromApi(raw: unknown): LocationHub | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const coords = readCoords(r);
  if (!coords) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    city: r.city != null ? String(r.city) : '',
    address: r.address != null ? String(r.address) : undefined,
    formatted_address:
      r.formatted_address != null
        ? String(r.formatted_address)
        : r.formattedAddress != null
          ? String(r.formattedAddress)
          : undefined,
    coordinates: coords,
    type: r.type === 'hub' || r.type === 'city' ? r.type : undefined,
    location_type: r.location_type != null ? String(r.location_type) : undefined,
  };
}

function hubsRequestUrl(): string {
  const q = new URLSearchParams({ type: 'hub' }).toString();
  if (env.API_BASE_URL === '') {
    return `/api/v1/locations?${q}`;
  }
  const base = env.API_BASE_URL.replace(/\/$/, '');
  return `${base}/api/v1/locations?${q}`;
}

export const locationService = {
  async getHubs(): Promise<LocationHub[]> {
    const url = hubsRequestUrl();
    const token = typeof window !== 'undefined' ? useAuthStore.getState().accessToken : null;
    const headers = new Headers({ Accept: 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as HubsResponse;
    const inner = data?.data;

    const rawList: unknown[] = Array.isArray(inner)
      ? inner
      : inner && typeof inner === 'object' && 'results' in inner && Array.isArray(inner.results)
        ? inner.results
        : [];

    return rawList.map(normalizeHubFromApi).filter((h): h is LocationHub => h !== null);
  }
};

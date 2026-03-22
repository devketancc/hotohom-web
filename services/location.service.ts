import { env } from '@/config/env';
import type { HubsResponse, LocationHub } from '@/types/location';

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
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers = new Headers({ Accept: 'application/json' });
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await fetch(url, { headers, cache: 'no-store' });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as HubsResponse;
    const inner = data?.data;

    const list: LocationHub[] = Array.isArray(inner)
      ? inner
      : inner && typeof inner === 'object' && 'results' in inner && Array.isArray(inner.results)
        ? inner.results
        : [];

    return list;
  }
};

import apiClient from './apiClient';
import type { HubsResponse, LocationHub } from '@/types/location';

export const locationService = {
  async getHubs(): Promise<LocationHub[]> {
    // No trailing slash: Next.js 308-strips /api/v1/.../ before the dev proxy route runs, which broke XHR (ERR_NETWORK).
    const { data } = await apiClient.get<HubsResponse>('/api/v1/locations', {
      params: { type: 'hub' }
    });
    const inner = data?.data;
    const list: LocationHub[] = Array.isArray(inner)
      ? inner
      : inner && typeof inner === 'object' && 'results' in inner && Array.isArray(inner.results)
        ? inner.results
        : [];
    return list;
  }
};

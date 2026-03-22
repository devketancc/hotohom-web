import apiClient from '@/services/apiClient';
import type { Addon } from '@/types/addon';

/** Backend may return DRF `{ results }`, a bare array, or `{ success, data }` like other Motohom endpoints. */
function extractAddonList(payload: unknown): Addon[] {
  if (Array.isArray(payload)) return payload as Addon[];
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;
  if (Array.isArray(root.results)) return root.results as Addon[];
  const inner = root.data;
  if (Array.isArray(inner)) return inner as Addon[];
  if (inner && typeof inner === 'object' && Array.isArray((inner as Record<string, unknown>).results)) {
    return (inner as { results: Addon[] }).results;
  }
  return [];
}

export const addonService = {
  async listAddons(): Promise<Addon[]> {
    const { data } = await apiClient.get<unknown>('/addons/');
    return extractAddonList(data);
  },
};

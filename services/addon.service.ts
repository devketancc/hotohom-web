import apiClient from '@/services/apiClient';
import type { Addon, AddonsListApiResponse } from '@/types/addon';

export const addonService = {
  async listAddons(): Promise<Addon[]> {
    const { data } = await apiClient.get<AddonsListApiResponse>('/addons/');
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to load addons');
    }
    return data.data;
  },
};

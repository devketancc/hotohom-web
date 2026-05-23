import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  FleetCaravanDetail,
  FleetCaravanPage,
} from '@/types/fleet';

export interface ListCaravansParams {
  /** Caravan class code filter (e.g. 'T'). */
  class?: string;
  /** Hub UUID filter. */
  hub?: string;
  page?: number;
  page_size?: number;
}

export const fleetService = {
  /**
   * Public list of fleet units. Each item includes a nested `caravan_class`
   * with full class info + class media — enough to derive the class catalog
   * for /fleet without a dedicated classes endpoint.
   */
  async listCaravans(
    params?: ListCaravansParams
  ): Promise<ApiResponse<FleetCaravanPage>> {
    const { data } = await apiClient.get<ApiResponse<FleetCaravanPage>>(
      '/caravans/',
      {
        params: {
          page_size: 100,
          ...params,
        },
      }
    );
    return data;
  },

  async getCaravan(id: string): Promise<ApiResponse<FleetCaravanDetail>> {
    const { data } = await apiClient.get<ApiResponse<FleetCaravanDetail>>(
      `/caravans/${id}/`
    );
    return data;
  },
};

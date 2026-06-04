import apiClient from './apiClient';
import type { ApiResponse } from '@/types/api';
import type { PackagesPage, TravelPackage } from '@/types/package';

async function fetchPackages(params: {
  hub: string;
  class?: string;
  page?: number;
}): Promise<ApiResponse<PackagesPage>> {
  const { data } = await apiClient.get<ApiResponse<PackagesPage>>('/packages/', {
    params: {
      hub: params.hub,
      ...(params.class ? { class: params.class } : {}),
      ...(params.page != null ? { page: params.page } : {}),
    },
  });
  return data;
}

function mergePackagePages(responses: ApiResponse<PackagesPage>[]): PackagesPage {
  const seen = new Set<string>();
  const results: TravelPackage[] = [];
  for (const r of responses) {
    if (!r.success || !r.data?.results) continue;
    for (const p of r.data.results) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        results.push(p);
      }
    }
  }
  return {
    count: results.length,
    next: null,
    previous: null,
    results,
  };
}

export const packageService = {
  async getPackageById(id: string): Promise<ApiResponse<TravelPackage>> {
    const { data } = await apiClient.get<ApiResponse<TravelPackage>>(`/packages/${id}/`);
    return data;
  },

  async listPackages(params: {
    hub: string;
    class?: string;
    page?: number;
  }): Promise<ApiResponse<PackagesPage>> {
    return fetchPackages(params);
  },

  /** One request per hub; merges and de-duplicates by package id (default “All hubs” UI). */
  async listPackagesAcrossHubs(
    hubIds: string[],
    options?: { class?: string }
  ): Promise<ApiResponse<PackagesPage>> {
    if (hubIds.length === 0) {
      return {
        success: true,
        data: { count: 0, next: null, previous: null, results: [] },
      };
    }
    const settled = await Promise.allSettled(
      hubIds.map((hub) => fetchPackages({ hub, class: options?.class }))
    );
    const rejected = settled.filter((s): s is PromiseRejectedResult => s.status === 'rejected');
    if (rejected.length === settled.length) {
      throw rejected[0]?.reason instanceof Error
        ? rejected[0].reason
        : new Error('Could not load packages for any hub');
    }
    const ok: ApiResponse<PackagesPage>[] = [];
    for (const s of settled) {
      if (s.status === 'fulfilled' && s.value.success && s.value.data) ok.push(s.value);
    }
    return {
      success: true,
      data: mergePackagePages(ok),
    };
  },
};

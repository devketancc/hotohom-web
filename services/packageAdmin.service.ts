import apiClient from '@/services/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AdminPaginated } from '@/types/admin';
import type { TravelPackage } from '@/types/package';
import type {
  AdminPackage,
  AdminPackageListQuery,
  AdminPackageListResponse,
  AdminPackageLocationOption,
  AdminPackageWritePayload,
} from '@/types/adminPackage';

export const packageAdminQueryKeys = {
  list: (params: AdminPackageListQuery) => ['admin', 'packages', 'list', params] as const,
  detail: (id: string) => ['admin', 'packages', 'detail', id] as const,
  locations: (search: string) => ['admin', 'packages', 'locations', search] as const,
};

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

export function normalizeAdminPackage(raw: unknown): AdminPackage | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    description: r.description != null ? String(r.description) : '',
    caravan_class: r.caravan_class != null ? String(r.caravan_class) : '',
    caravan_class_code: r.caravan_class_code != null ? String(r.caravan_class_code) : '',
    home_hub: r.home_hub != null ? String(r.home_hub) : '',
    home_hub_name: r.home_hub_name != null ? String(r.home_hub_name) : '',
    duration_days: Number(r.duration_days) || 0,
    included_km: Number(r.included_km) || 0,
    base_price: r.base_price != null ? String(r.base_price) : '0',
    thumbnail_url: r.thumbnail_url != null ? String(r.thumbnail_url) : null,
    highlights: normalizeStringArray(r.highlights),
    images: normalizeStringArray(r.images),
    is_active: Boolean(r.is_active),
    days: Array.isArray(r.days) ? (r.days as TravelPackage['days']) : [],
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

function unwrapPaginatedPackages(
  data: ApiResponse<AdminPaginated<unknown>> | undefined
): AdminPackageListResponse {
  const inner = data?.data;
  if (!inner || typeof inner !== 'object') {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const list = inner.results;
  const results = Array.isArray(list)
    ? list.map(normalizeAdminPackage).filter((row): row is AdminPackage => row !== null)
    : [];
  return {
    count: Number(inner.count) || 0,
    next: inner.next ?? null,
    previous: inner.previous ?? null,
    results,
  };
}

function normalizeLocationOption(raw: unknown): AdminPackageLocationOption | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    name: r.name != null ? String(r.name) : '',
    location_type: r.location_type != null ? String(r.location_type) : '',
  };
}

export async function listAdminPackages(query: AdminPackageListQuery): Promise<AdminPackageListResponse> {
  const params: Record<string, string | number> = {};
  if (query.page != null) params.page = query.page;
  if (query.page_size != null) params.page_size = query.page_size;

  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/packages/', { params });
  return unwrapPaginatedPackages(data);
}

export async function getAdminPackage(id: string): Promise<AdminPackage> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/packages/${id}/`);
  const row = normalizeAdminPackage(data?.data);
  if (!row) throw new Error('Package not found.');
  return row;
}

export async function createAdminPackage(payload: AdminPackageWritePayload): Promise<AdminPackage> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/admin/packages/create/', payload);
  const row = normalizeAdminPackage(data?.data);
  if (!row) throw new Error('Invalid create response.');
  return row;
}

export async function updateAdminPackage(
  id: string,
  payload: AdminPackageWritePayload
): Promise<AdminPackage> {
  const { data } = await apiClient.patch<ApiResponse<unknown>>(`/admin/packages/${id}/`, payload);
  const row = normalizeAdminPackage(data?.data);
  if (!row) return getAdminPackage(id);
  return row;
}

export async function deactivateAdminPackage(id: string): Promise<void> {
  await apiClient.delete(`/admin/packages/${id}/`);
}

export async function listAdminPackageLocationOptions(search?: string): Promise<AdminPackageLocationOption[]> {
  const params: Record<string, string | number> = { page_size: 50, is_active: 'true' };
  if (search?.trim()) params.search = search.trim();

  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/locations/', { params });
  const inner = data?.data;
  const list = inner?.results;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeLocationOption).filter((row): row is AdminPackageLocationOption => row !== null);
}

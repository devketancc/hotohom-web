import apiClient from '@/services/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AdminPaginated } from '@/types/admin';
import type {
  AdminAddon,
  AdminAddonCategory,
  AdminAddonListQuery,
  AdminAddonListResponse,
  AdminAddonPricingType,
  AdminAddonWritePayload,
} from '@/types/adminAddon';

const CATEGORIES: AdminAddonCategory[] = ['comfort', 'adventure', 'safety', 'utility', 'other'];

function normalizeCategory(raw: unknown): AdminAddonCategory {
  const s = raw != null ? String(raw) : '';
  return CATEGORIES.includes(s as AdminAddonCategory) ? (s as AdminAddonCategory) : 'other';
}

function normalizePricingType(raw: unknown): AdminAddonPricingType {
  return raw === 'per_day' ? 'per_day' : 'flat';
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

export function normalizeAdminAddon(raw: unknown): AdminAddon | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    description: r.description != null ? String(r.description) : '',
    category: normalizeCategory(r.category),
    pricing_type: normalizePricingType(r.pricing_type),
    price: r.price != null ? String(r.price) : '0',
    image_url: r.image_url != null ? String(r.image_url) : '',
    applicable_classes: normalizeStringArray(r.applicable_classes),
    max_quantity: Number(r.max_quantity) || 1,
    is_active: Boolean(r.is_active),
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

function unwrapPaginatedAddons(
  data: ApiResponse<AdminPaginated<unknown>> | undefined
): AdminAddonListResponse {
  const inner = data?.data;
  if (!inner || typeof inner !== 'object') {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const list = (inner as AdminPaginated<unknown>).results;
  const results = Array.isArray(list)
    ? list.map(normalizeAdminAddon).filter((row): row is AdminAddon => row !== null)
    : [];
  return {
    count: Number((inner as AdminPaginated<unknown>).count) || 0,
    next: (inner as AdminPaginated<unknown>).next ?? null,
    previous: (inner as AdminPaginated<unknown>).previous ?? null,
    results,
  };
}

export async function listAdminAddons(query: AdminAddonListQuery): Promise<AdminAddonListResponse> {
  const params: Record<string, string | number> = {};
  if (query.page != null) params.page = query.page;
  if (query.page_size != null) params.page_size = query.page_size;
  if (query.is_active !== undefined) {
    params.is_active = query.is_active ? 'true' : 'false';
  }

  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/addons/', { params });
  return unwrapPaginatedAddons(data);
}

export async function getAdminAddon(id: string): Promise<AdminAddon> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/addons/${id}/`);
  const row = normalizeAdminAddon(data?.data);
  if (!row) throw new Error('Add-on not found.');
  return row;
}

export async function createAdminAddon(payload: AdminAddonWritePayload): Promise<AdminAddon> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/admin/addons/create/', payload);
  const row = normalizeAdminAddon(data?.data);
  if (!row) {
    const latest = await listAdminAddons({ page: 1, page_size: 20, is_active: payload.is_active ?? true });
    const match = latest.results.find((a) => a.name === payload.name);
    if (match) return match;
    throw new Error('Invalid create response.');
  }
  return row;
}

export async function updateAdminAddon(
  id: string,
  payload: Partial<AdminAddonWritePayload>
): Promise<AdminAddon> {
  const { data } = await apiClient.patch<ApiResponse<unknown>>(`/admin/addons/${id}/`, payload);
  const row = normalizeAdminAddon(data?.data);
  if (!row) return getAdminAddon(id);
  return row;
}

export async function deleteAdminAddon(id: string): Promise<void> {
  await apiClient.delete(`/admin/addons/${id}/`);
}

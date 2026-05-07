import apiClient from '@/services/apiClient';
import type { ApiResponse } from '@/types/api';
import type { AdminPaginated } from '@/types/admin';
import type {
  AdminCoupon,
  AdminCouponListQuery,
  AdminCouponListResponse,
  AdminCouponLocationOption,
  AdminCouponWritePayload,
} from '@/types/coupon';

function normalizeUserId(raw: unknown): string | null {
  if (raw == null) return null;
  if (typeof raw === 'string') return raw || null;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) {
    const id = (raw as { id: unknown }).id;
    return id != null ? String(id) : null;
  }
  return null;
}

function normalizeStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === 'string');
}

export function normalizeAdminCoupon(raw: unknown): AdminCoupon | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const discount_type = r.discount_type === 'percent' ? 'percent' : 'flat';
  const applicable_on =
    r.applicable_on === 'addons' ? 'addons' : r.applicable_on === 'base' ? 'base' : 'cart';

  return {
    id,
    code: r.code != null ? String(r.code) : '',
    description: r.description != null ? String(r.description) : '',
    user: normalizeUserId(r.user),
    discount_type,
    discount_value: r.discount_value != null ? String(r.discount_value) : '0',
    max_discount_cap: r.max_discount_cap != null ? String(r.max_discount_cap) : null,
    applicable_on,
    min_booking_value: r.min_booking_value != null ? String(r.min_booking_value) : '0',
    max_uses: r.max_uses == null ? null : Number(r.max_uses),
    used_count: Number(r.used_count) || 0,
    per_user_limit: Number(r.per_user_limit) || 1,
    valid_from: r.valid_from != null ? String(r.valid_from) : '',
    valid_until: r.valid_until != null ? String(r.valid_until) : '',
    applicable_classes: normalizeStringArray(r.applicable_classes),
    applicable_destinations: normalizeStringArray(r.applicable_destinations),
    is_first_booking_only: Boolean(r.is_first_booking_only),
    is_referral_coupon: Boolean(r.is_referral_coupon),
    is_active: Boolean(r.is_active),
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

function normalizeLocationOption(raw: unknown): AdminCouponLocationOption | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    name: r.name != null ? String(r.name) : '',
    location_type: r.location_type != null ? String(r.location_type) : '',
    is_active: Boolean(r.is_active),
  };
}

function unwrapPaginatedCoupons(
  data: ApiResponse<AdminPaginated<unknown>> | undefined
): AdminCouponListResponse {
  const inner = data?.data;
  if (!inner || typeof inner !== 'object') {
    return { count: 0, next: null, previous: null, results: [] };
  }
  const list = (inner as AdminPaginated<unknown>).results;
  const results = Array.isArray(list)
    ? list.map(normalizeAdminCoupon).filter((row): row is AdminCoupon => row !== null)
    : [];
  return {
    count: Number((inner as AdminPaginated<unknown>).count) || 0,
    next: (inner as AdminPaginated<unknown>).next ?? null,
    previous: (inner as AdminPaginated<unknown>).previous ?? null,
    results,
  };
}

export async function listAdminCoupons(query: AdminCouponListQuery): Promise<AdminCouponListResponse> {
  const params: Record<string, string | number> = {};
  if (query.page != null) params.page = query.page;
  if (query.page_size != null) params.page_size = query.page_size;
  if (query.code?.trim()) params.code = query.code.trim();
  if (query.is_active !== undefined) {
    params.is_active = query.is_active ? 'true' : 'false';
  }

  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/coupons/', { params });
  return unwrapPaginatedCoupons(data);
}

export async function getAdminCoupon(id: string): Promise<AdminCoupon> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/coupons/${id}/`);
  const row = normalizeAdminCoupon(data?.data);
  if (!row) throw new Error('Coupon not found.');
  return row;
}

export async function createAdminCoupon(payload: AdminCouponWritePayload): Promise<AdminCoupon> {
  const { data } = await apiClient.post<ApiResponse<unknown>>('/admin/coupons/create/', payload);
  const row = normalizeAdminCoupon(data?.data);
  if (!row) {
    // Admin write serializer can omit `id`; fallback by re-fetching the newest matching code.
    const createdCode = payload.code.trim().toUpperCase();
    if (createdCode) {
      const latest = await listAdminCoupons({ code: createdCode, page: 1, page_size: 1 });
      const match = latest.results.find((coupon) => coupon.code.toUpperCase() === createdCode);
      if (match) return match;
    }
    throw new Error('Invalid create response.');
  }
  return row;
}

export async function updateAdminCoupon(id: string, payload: Partial<AdminCouponWritePayload>): Promise<AdminCoupon> {
  const { data } = await apiClient.patch<ApiResponse<unknown>>(`/admin/coupons/${id}/`, payload);
  const row = normalizeAdminCoupon(data?.data);
  if (!row) {
    // PATCH response may come from write serializer without read-only fields like `id`.
    return getAdminCoupon(id);
  }
  return row;
}

export async function deleteAdminCoupon(id: string): Promise<void> {
  await apiClient.delete(`/admin/coupons/${id}/`);
}

/** Active waypoints (and hubs if returned) for destination targeting — paginated, first page. */
export async function listAdminCouponLocationOptions(): Promise<AdminCouponLocationOption[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/locations/', {
    params: { type: 'waypoint', page_size: 100, is_active: 'true' },
  });
  const inner = data?.data;
  const list = inner?.results;
  if (!Array.isArray(list)) return [];
  return list.map(normalizeLocationOption).filter((row): row is AdminCouponLocationOption => row !== null);
}

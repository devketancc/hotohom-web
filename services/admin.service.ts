import apiClient from '@/services/apiClient';
import type { ApiResponse } from '@/types/api';
import type {
  AdminCaravanClass,
  AdminCaravanClassMedia,
  AdminFleetCaravan,
  AdminFleetCaravanDetail,
  AdminFleetCaravanHomeHub,
  AdminHub,
  AdminPaginated,
} from '@/types/admin';

export const adminQueryKeys = {
  hubs: ['admin', 'hubs'] as const,
  caravanClasses: ['admin', 'caravan-classes'] as const,
  caravans: ['admin', 'caravans', 'fleet'] as const,
  caravanDetail: (id: string) => ['admin', 'caravans', 'detail', id] as const,
};

function readCoordinates(raw: Record<string, unknown>): { lat: number; lng: number } | null {
  const coords = raw.coordinates;
  if (coords && typeof coords === 'object' && !Array.isArray(coords)) {
    const c = coords as Record<string, unknown>;
    const lat = Number(c.lat);
    const lng = Number(c.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }
  const lat = Number(raw.lat);
  const lng = Number(raw.lng);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

function normalizeAdminHub(raw: unknown): AdminHub | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const coords = readCoordinates(r);
  if (!coords) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    city: r.city != null ? String(r.city) : '',
    state: r.state != null ? String(r.state) : '',
    formatted_address:
      r.formatted_address != null ? String(r.formatted_address) : String(r.formattedAddress ?? ''),
    is_active: Boolean(r.is_active),
    google_maps_url: r.google_maps_url != null ? String(r.google_maps_url) : null,
    coordinates: coords,
    location_type: r.location_type != null ? String(r.location_type) : 'hub',
  };
}

function normalizeMedia(raw: unknown): AdminCaravanClassMedia | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  const id = m.id != null ? String(m.id) : '';
  const url = m.url != null ? String(m.url) : '';
  if (!id || !url) return null;
  return {
    id,
    url,
    media_type: m.media_type != null ? String(m.media_type) : 'image',
    order: Number(m.order) || 0,
  };
}

function normalizeAdminCaravanClass(raw: unknown): AdminCaravanClass | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const amenitiesRaw = r.amenities;
  const amenities = Array.isArray(amenitiesRaw)
    ? amenitiesRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const mediaRaw = r.media;
  const media = Array.isArray(mediaRaw)
    ? mediaRaw.map(normalizeMedia).filter((m): m is AdminCaravanClassMedia => m !== null)
    : [];

  return {
    id,
    code: r.code != null ? String(r.code) : '',
    name: r.name != null ? String(r.name) : '',
    description: r.description != null ? String(r.description) : '',
    full_capacity: Number(r.full_capacity) || 0,
    capacity_pets: Number(r.capacity_pets) || 0,
    human_capacity_decreased_by_each_pet: Number(r.human_capacity_decreased_by_each_pet) || 0,
    amenities,
    is_pet_friendly: Boolean(r.is_pet_friendly),
    is_active: Boolean(r.is_active),
    media,
  };
}

function unwrapResults<T>(data: ApiResponse<AdminPaginated<unknown>> | undefined, normalize: (row: unknown) => T | null): T[] {
  const inner = data?.data;
  const list = inner?.results;
  if (!Array.isArray(list)) return [];
  return list.map(normalize).filter((row): row is T => row !== null);
}

export async function listAdminHubs(): Promise<AdminHub[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/locations/', {
    params: { type: 'hub' },
  });
  return unwrapResults(data, normalizeAdminHub);
}

export async function listAdminCaravanClasses(): Promise<AdminCaravanClass[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/caravan-classes/');
  return unwrapResults(data, normalizeAdminCaravanClass);
}

function normalizeAdminFleetCaravan(raw: unknown): AdminFleetCaravan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const nested = r.caravan_class;
  const caravan_class = normalizeAdminCaravanClass(nested);
  if (!caravan_class) return null;

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    registration_no: r.registration_no != null ? String(r.registration_no) : '',
    year: Number(r.year) || 0,
    home_hub_name: r.home_hub_name != null ? String(r.home_hub_name) : '',
    thumbnail: r.thumbnail != null && typeof r.thumbnail === 'string' ? r.thumbnail : null,
    is_active: Boolean(r.is_active),
    is_available: Boolean(r.is_available),
    caravan_class,
  };
}

export async function listAdminFleetCaravans(): Promise<AdminFleetCaravan[]> {
  const { data } = await apiClient.get<ApiResponse<AdminPaginated<unknown>>>('/admin/caravans/');
  return unwrapResults(data, normalizeAdminFleetCaravan);
}

function normalizeFleetHomeHub(raw: unknown): AdminFleetCaravanHomeHub | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    name: r.name != null ? String(r.name) : '',
    city: r.city != null ? String(r.city) : '',
  };
}

function normalizeAdminFleetCaravanDetail(raw: unknown): AdminFleetCaravanDetail | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const caravan_class = normalizeAdminCaravanClass(r.caravan_class);
  if (!caravan_class) return null;

  const extraRaw = r.extra_amenities;
  const extra_amenities = Array.isArray(extraRaw)
    ? extraRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const allRaw = r.all_amenities;
  const all_amenities = Array.isArray(allRaw)
    ? allRaw.filter((a): a is string => typeof a === 'string')
    : [];

  const mediaRaw = r.media;
  const media = Array.isArray(mediaRaw)
    ? mediaRaw.map(normalizeMedia).filter((m): m is AdminCaravanClassMedia => m !== null)
    : [];

  return {
    id,
    name: r.name != null ? String(r.name) : '',
    registration_no: r.registration_no != null ? String(r.registration_no) : '',
    year: Number(r.year) || 0,
    caravan_class,
    home_hub: normalizeFleetHomeHub(r.home_hub),
    extra_amenities,
    all_amenities,
    media,
    is_active: Boolean(r.is_active),
    is_available: Boolean(r.is_available),
    created_at: r.created_at != null ? String(r.created_at) : '',
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
  };
}

export async function getAdminFleetCaravanById(id: string): Promise<AdminFleetCaravanDetail> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/admin/caravans/${encodeURIComponent(id)}/`);
  const inner = data?.data;
  const row = normalizeAdminFleetCaravanDetail(inner);
  if (!row) {
    throw new Error('Caravan not found or invalid response');
  }
  return row;
}

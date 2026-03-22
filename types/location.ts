import { ApiResponse } from './api';

export interface LocationHub {
  id: string;
  name: string;
  city: string;
  /** API may send `formatted_address` instead */
  address?: string;
  formatted_address?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  type?: 'hub' | 'city';
  location_type?: string;
}

export interface PaginatedPayload<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type HubsResponse = ApiResponse<PaginatedPayload<LocationHub>>;

/** POST /carts/ body — must match backend contract */
export type CreateCartStopType = 'pickup' | 'waypoint' | 'dropoff';

export type CreateCartLocation = {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  meta: Record<string, unknown>;
};

export type CreateCartStopPayload = {
  order: number;
  stop_type: CreateCartStopType;
  notes: string;
  location: CreateCartLocation;
};

export type CreateCartPayload = {
  caravan_class_id: string;
  hub_id: string;
  start_datetime: string;
  end_datetime: string;
  num_humans: number;
  num_pets: number;
  is_one_way: boolean;
  estimated_km: number;
  stops: CreateCartStopPayload[];
};

export type CartPricingBreakdown = {
  grand_total: number;
  base_price: number;
};

/** Snapshot returned from create cart (and future cart reads) */
export type Cart = {
  id: string;
  pricing_mode: string;
  pricing_breakdown: CartPricingBreakdown;
  total_days: number;
  estimated_km: number;
  stops: unknown[];
  is_ready_for_checkout: boolean;
};

export type CreateCartApiResponse = {
  success: boolean;
  data?: Cart;
  message?: string;
};

/** GET /carts/{id}/ uses the same envelope as create */
export type CartDetailApiResponse = CreateCartApiResponse;

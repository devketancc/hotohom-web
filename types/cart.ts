/** POST /carts/ body — must match backend contract */
export type CreateCartStopType =
  | 'pickup'
  | 'waypoint'
  | 'dropoff'
  | 'hub_start'
  | 'hub_end';

export type CreateCartLocation = {
  name: string;
  lat: number;
  lng: number;
  place_id: string;
  meta: Record<string, unknown>;
};

export type CreateCartRouteStopPayload = {
  order: number;
  stop_type: 'pickup' | 'waypoint' | 'dropoff';
  notes: string;
  location: CreateCartLocation;
};

export type CreateCartHubStopPayload = {
  order: number;
  stop_type: 'hub_start' | 'hub_end';
  notes: string;
  location_id: string;
};

export type CreateCartStopPayload = CreateCartRouteStopPayload | CreateCartHubStopPayload;

/** Round-trip custom route cart (hub_start / route / hub_end). */
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

/** Package cart: pickup + dropoff only, plus `package_id` (POST /carts/). */
export type CreatePackageCartPayload = {
  package_id: string;
  caravan_class_id: string;
  hub_id: string;
  start_datetime: string;
  num_humans: number;
  num_pets: number;
  name: string;
  phone: string;
  stops: CreateCartRouteStopPayload[];
  end_datetime?: string;
  is_one_way?: boolean;
  estimated_km?: number;
};

export type CreateCartBody = CreateCartPayload | CreatePackageCartPayload;

export type CartPricingBreakdown = {
  grand_total: number;
  base_price: number;
  addons_total: number;
  insurance_total: number;
  tax_total: number;
  gst: number;
  gst_rate: string;
  razorpay_charges: number;
  deposit_amount: number;
  pet_cleaning_charge: number;
  one_way_surcharge: number;
  coupon_discount: number;
  /** Set only when the API sends `subtotal` (used for an extra line before tax). */
  subtotal?: number;
  chosen: string;
  pricing_mode_label: string;
  reason: string;
};

export type CartItem = {
  id: string;
  addon_id: string;
  addon_name: string;
  quantity: number;
  price: string;
  total: string;
};

export type CartStatus = 'active' | 'checkout' | 'converted' | 'abandoned';

/** Snapshot returned from create cart (and future cart reads) */
export type Cart = {
  id: string;
  status?: CartStatus;
  coupon: string | null;
  pricing_mode: string;
  pricing_breakdown: CartPricingBreakdown;
  total_days: number;
  estimated_km: number;
  items: CartItem[];
  stops: unknown[];
  is_ready_for_checkout: boolean;
  converted_booking?: string | null;
  caravan_available?: boolean;
};

export type CreateCartApiResponse = {
  success: boolean;
  data?: Cart;
  message?: string;
};

/** GET /carts/{id}/ uses the same envelope as create */
export type CartDetailApiResponse = CreateCartApiResponse;

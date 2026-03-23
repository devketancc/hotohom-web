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

/** Snapshot returned from create cart (and future cart reads) */
export type Cart = {
  id: string;
  pricing_mode: string;
  pricing_breakdown: CartPricingBreakdown;
  total_days: number;
  estimated_km: number;
  items: CartItem[];
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

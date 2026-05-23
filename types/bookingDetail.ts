/** Shared booking detail shapes from BookingSerializer (admin + customer). */

export interface BookingPricingModeComparison {
  total?: number | null;
  rate?: number | null;
  days?: number | null;
  estimated_km?: number | null;
  included_km?: number | null;
}

export interface BookingPricingBreakdown {
  pricing_mode: string;
  pricing_mode_label: string;
  chosen: string;
  reason: string;
  day_wise: BookingPricingModeComparison | null;
  km_wise: BookingPricingModeComparison | null;
  base_price: number;
  pet_cleaning_charge: number;
  one_way_surcharge: number;
  addons_price: number;
  coupon_discount: number;
  subtotal: number;
  gst: number;
  gst_rate: string;
  razorpay_charges: number;
  grand_total: number;
  deposit_amount: number;
}

export interface BookingItem {
  id: string;
  addon: string;
  addon_name: string;
  addon_category: string;
  addon_image_url: string;
  addon_pricing_type: string;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface BookingPricingSnapshot {
  km_rate: number;
  day_rate: number;
  total_days: number;
  deposit_amount: number;
  hub_id?: string | null;
  included_km?: number;
  estimated_km?: number;
  buffered_km?: number;
  km_buffer_pct?: number;
  package_base_price?: number;
}

export interface BookingTripEvent {
  id: string;
  event_type: string;
  source: string;
  occurred_at: string | null;
  recorded_by: string | null;
  recorded_by_name: string;
  metadata: Record<string, unknown>;
  bill_url: string | null;
  notes: string;
  created_at: string;
}

export interface BookingTripCore {
  id: string;
  status: string;
  odometer_start: number | null;
  odometer_end: number | null;
  actual_km: number | null;
  actual_start: string | null;
  actual_end: string | null;
  extra_km: number;
  extra_km_charge: string;
  ac_hours: string;
  ac_charge: string;
  gen_hours: string;
  gen_charge: string;
  late_hours: string;
  late_charge: string;
  parking_charge: string;
  toll_charge: string;
  damage_charge: string;
  other_charge: string;
  other_charge_note: string;
  total_extra_charge: string;
  hub_return_km: number | null;
  fuel_charge: string;
  estimated_toll_charge: string;
  eot_submitted_at: string | null;
  driver_notes: string;
  events: BookingTripEvent[];
  updated_at: string;
}

export interface BookingAssignment {
  driver_id: string | null;
  driver_name: string | null;
  driver_phone: string | null;
  helper_id: string | null;
  helper_name: string | null;
  helper_phone: string | null;
}

/** Fields added to booking detail beyond legacy list shape. */
export interface BookingDetailExtensions {
  caravan_class_name: string;
  estimated_km: number;
  buffered_km: number;
  avg_km_per_day: number;
  one_way_surcharge: string;
  coupon: string | null;
  gst: string;
  items: BookingItem[];
  pricing_breakdown: BookingPricingBreakdown | null;
}

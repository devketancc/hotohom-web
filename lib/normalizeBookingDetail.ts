import type {
  BookingAssignment,
  BookingItem,
  BookingPricingBreakdown,
  BookingPricingModeComparison,
  BookingPricingSnapshot,
  BookingTripEvent,
  BookingTripCore,
} from '@/types/bookingDetail';

function pricingNum(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function pricingStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function moneyStr(value: unknown, fallback = '0'): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeModeComparison(raw: unknown): BookingPricingModeComparison | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    total: r.total != null ? pricingNum(r.total) : null,
    rate: r.rate != null ? pricingNum(r.rate) : null,
    days: r.days != null ? pricingNum(r.days) : null,
    estimated_km: r.estimated_km != null ? pricingNum(r.estimated_km) : null,
    included_km: r.included_km != null ? pricingNum(r.included_km) : null,
  };
}

export function normalizeBookingPricingBreakdown(raw: unknown): BookingPricingBreakdown | null {
  if (!raw || typeof raw !== 'object') return null;
  const o = raw as Record<string, unknown>;
  const hasExplicitAddons =
    'addons_price' in o && o.addons_price !== null && o.addons_price !== undefined;
  const addonsFromTotal = pricingNum(o.addons_total);

  return {
    pricing_mode: pricingStr(o.pricing_mode),
    pricing_mode_label: pricingStr(o.pricing_mode_label),
    chosen: pricingStr(o.chosen),
    reason: pricingStr(o.reason),
    day_wise: normalizeModeComparison(o.day_wise),
    km_wise: normalizeModeComparison(o.km_wise),
    base_price: pricingNum(o.base_price),
    pet_cleaning_charge: pricingNum(o.pet_cleaning_charge),
    one_way_surcharge: pricingNum(o.one_way_surcharge),
    addons_price: hasExplicitAddons ? pricingNum(o.addons_price) : addonsFromTotal,
    coupon_discount: pricingNum(o.coupon_discount),
    subtotal: pricingNum(o.subtotal),
    gst: pricingNum(o.gst),
    gst_rate: pricingStr(o.gst_rate),
    razorpay_charges: pricingNum(o.razorpay_charges),
    grand_total: pricingNum(o.grand_total),
    deposit_amount: pricingNum(o.deposit_amount),
  };
}

export function normalizeBookingItem(raw: unknown): BookingItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    addon: r.addon != null ? String(r.addon) : '',
    addon_name: r.addon_name != null ? String(r.addon_name) : '',
    addon_category: r.addon_category != null ? String(r.addon_category) : '',
    addon_image_url: r.addon_image_url != null ? String(r.addon_image_url) : '',
    addon_pricing_type: r.addon_pricing_type != null ? String(r.addon_pricing_type) : '',
    quantity: Number(r.quantity) || 0,
    unit_price: moneyStr(r.unit_price),
    total_price: moneyStr(r.total_price),
  };
}

export function normalizeBookingPricingSnapshot(raw: unknown): BookingPricingSnapshot {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const snap: BookingPricingSnapshot = {
    km_rate: pricingNum(r.km_rate),
    day_rate: pricingNum(r.day_rate),
    total_days: pricingNum(r.total_days),
    deposit_amount: pricingNum(r.deposit_amount),
  };
  if (r.hub_id != null) snap.hub_id = String(r.hub_id);
  if (r.included_km != null) snap.included_km = pricingNum(r.included_km);
  if (r.estimated_km != null) snap.estimated_km = pricingNum(r.estimated_km);
  if (r.buffered_km != null) snap.buffered_km = pricingNum(r.buffered_km);
  if (r.km_buffer_pct != null) snap.km_buffer_pct = pricingNum(r.km_buffer_pct);
  if (r.package_base_price != null) snap.package_base_price = pricingNum(r.package_base_price);
  return snap;
}

export function normalizeBookingAssignment(raw: unknown): BookingAssignment | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    driver_id: r.driver_id != null ? String(r.driver_id) : null,
    driver_name: r.driver_name != null ? String(r.driver_name) : null,
    driver_phone: r.driver_phone != null ? String(r.driver_phone) : null,
    helper_id: r.helper_id != null ? String(r.helper_id) : null,
    helper_name: r.helper_name != null ? String(r.helper_name) : null,
    helper_phone: r.helper_phone != null ? String(r.helper_phone) : null,
  };
}

export function normalizeBookingTripEvent(raw: unknown): BookingTripEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    event_type: r.event_type != null ? String(r.event_type) : '',
    source: r.source != null ? String(r.source) : '',
    occurred_at: r.occurred_at != null ? String(r.occurred_at) : null,
    recorded_by: r.recorded_by != null ? String(r.recorded_by) : null,
    recorded_by_name: r.recorded_by_name != null ? String(r.recorded_by_name) : '',
    metadata: r.metadata && typeof r.metadata === 'object' ? (r.metadata as Record<string, unknown>) : {},
    bill_url: r.bill_url != null ? String(r.bill_url) : null,
    images: Array.isArray(r.images) ? r.images.map(String) : [],
    notes: r.notes != null ? String(r.notes) : '',
    created_at: r.created_at != null ? String(r.created_at) : '',
  };
}

export function normalizeBookingTrip(raw: unknown): BookingTripCore | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  const eventsRaw = Array.isArray(r.events) ? r.events : [];
  return {
    id,
    status: r.status != null ? String(r.status) : '',
    odometer_start: Number.isFinite(Number(r.odometer_start)) ? Number(r.odometer_start) : null,
    odometer_end: Number.isFinite(Number(r.odometer_end)) ? Number(r.odometer_end) : null,
    actual_km: Number.isFinite(Number(r.actual_km)) ? Number(r.actual_km) : null,
    actual_start: r.actual_start != null ? String(r.actual_start) : null,
    actual_end: r.actual_end != null ? String(r.actual_end) : null,
    extra_km: Number(r.extra_km) || 0,
    extra_km_charge: moneyStr(r.extra_km_charge),
    ac_hours: moneyStr(r.ac_hours),
    ac_charge: moneyStr(r.ac_charge),
    gen_hours: moneyStr(r.gen_hours),
    gen_charge: moneyStr(r.gen_charge),
    late_hours: moneyStr(r.late_hours),
    late_charge: moneyStr(r.late_charge),
    parking_charge: moneyStr(r.parking_charge),
    toll_charge: moneyStr(r.toll_charge),
    damage_charge: moneyStr(r.damage_charge),
    other_charge: moneyStr(r.other_charge),
    other_charge_note: r.other_charge_note != null ? String(r.other_charge_note) : '',
    total_extra_charge: moneyStr(r.total_extra_charge),
    hub_return_km: Number.isFinite(Number(r.hub_return_km)) ? Number(r.hub_return_km) : null,
    fuel_charge: moneyStr(r.fuel_charge),
    estimated_toll_charge: moneyStr(r.estimated_toll_charge),
    eot_submitted_at: r.eot_submitted_at != null ? String(r.eot_submitted_at) : null,
    driver_notes: r.driver_notes != null ? String(r.driver_notes) : '',
    events: eventsRaw.map(normalizeBookingTripEvent).filter((e): e is BookingTripEvent => e !== null),
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
  };
}

export function normalizeBookingDetailExtensions(raw: Record<string, unknown>) {
  const itemsRaw = Array.isArray(raw.items) ? raw.items : [];
  return {
    caravan_class_name: raw.caravan_class_name != null ? String(raw.caravan_class_name) : '',
    estimated_km: Number(raw.estimated_km) || 0,
    buffered_km: Number(raw.buffered_km) || 0,
    avg_km_per_day: Number(raw.avg_km_per_day) || 0,
    one_way_surcharge: moneyStr(raw.one_way_surcharge),
    coupon: raw.coupon != null ? String(raw.coupon) : null,
    gst: moneyStr(raw.gst),
    items: itemsRaw.map(normalizeBookingItem).filter((i): i is BookingItem => i !== null),
    pricing_breakdown: normalizeBookingPricingBreakdown(raw.pricing_breakdown),
  };
}

export function resolveAssignmentFromRaw(
  r: Record<string, unknown>,
  assignment: BookingAssignment | null
): BookingAssignment | null {
  const legacyDriverName = r.driver_name != null ? String(r.driver_name) : '';
  return (
    assignment ??
    (legacyDriverName
      ? {
          driver_id: r.driver != null ? String(r.driver) : null,
          driver_name: legacyDriverName,
          driver_phone: null,
          helper_id: null,
          helper_name: null,
          helper_phone: null,
        }
      : null)
  );
}

function normalizeBookingStop(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;
  return {
    id,
    order: Number(r.order) || 0,
    stop_type: r.stop_type != null ? String(r.stop_type) : '',
    location: r.location != null ? String(r.location) : '',
    location_name: r.location_name != null ? String(r.location_name) : '',
    estimated_arrival: r.estimated_arrival != null ? String(r.estimated_arrival) : null,
    notes: r.notes != null ? String(r.notes) : '',
  };
}

/** Full booking detail normalization (BookingSerializer). */
export function normalizeBookingDetailRaw(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = r.id != null ? String(r.id) : '';
  if (!id) return null;

  const stopsRaw = Array.isArray(r.stops) ? r.stops : [];
  const assignment = resolveAssignmentFromRaw(r, normalizeBookingAssignment(r.assignment));
  const legacyDriverName = r.driver_name != null ? String(r.driver_name) : '';
  const extensions = normalizeBookingDetailExtensions(r);

  return {
    id,
    source: r.source != null ? String(r.source) : '',
    booking_type: r.booking_type != null ? String(r.booking_type) : '',
    status: r.status != null ? String(r.status) : '',
    customer: r.customer != null ? String(r.customer) : '',
    customer_name: r.customer_name != null ? String(r.customer_name) : '',
    customer_phone: r.customer_phone != null ? String(r.customer_phone) : '',
    caravan: r.caravan != null ? String(r.caravan) : '',
    caravan_name: r.caravan_name != null ? String(r.caravan_name) : '',
    caravan_class: r.caravan_class != null ? String(r.caravan_class) : '',
    driver: r.driver != null ? String(r.driver) : null,
    driver_name: legacyDriverName || assignment?.driver_name || '',
    assignment,
    is_b2b: Boolean(r.is_b2b),
    b2b_partner: r.b2b_partner != null ? String(r.b2b_partner) : null,
    package: r.package != null ? String(r.package) : null,
    start_datetime: r.start_datetime != null ? String(r.start_datetime) : '',
    end_datetime: r.end_datetime != null ? String(r.end_datetime) : '',
    total_days: Number(r.total_days) || 0,
    num_humans: Number(r.num_humans) || 0,
    num_pets: Number(r.num_pets) || 0,
    is_one_way: Boolean(r.is_one_way),
    pricing_mode: r.pricing_mode != null ? String(r.pricing_mode) : '',
    pricing_snapshot: normalizeBookingPricingSnapshot(r.pricing_snapshot),
    pet_cleaning_charge: moneyStr(r.pet_cleaning_charge),
    base_price: moneyStr(r.base_price),
    addons_price: moneyStr(r.addons_price),
    coupon_discount: moneyStr(r.coupon_discount),
    subtotal: moneyStr(r.subtotal),
    razorpay_charges: moneyStr(r.razorpay_charges),
    grand_total: moneyStr(r.grand_total),
    cancellation_reason: r.cancellation_reason != null ? String(r.cancellation_reason) : '',
    cancelled_at: r.cancelled_at != null ? String(r.cancelled_at) : null,
    notes: r.notes != null ? String(r.notes) : '',
    stops: stopsRaw.map(normalizeBookingStop).filter((s) => s !== null),
    trip: normalizeBookingTrip(r.trip),
    created_at: r.created_at != null ? String(r.created_at) : '',
    updated_at: r.updated_at != null ? String(r.updated_at) : '',
    ...extensions,
  };
}

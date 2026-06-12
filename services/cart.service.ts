import apiClient from '@/services/apiClient';
import type { AxiosResponse } from 'axios';
import type {
  Cart,
  CartItem,
  CartDetailApiResponse,
  CartPricingBreakdown,
  CreateCartApiResponse,
  CreateCartBody,
} from '@/types/cart';

function pricingNum(value: unknown): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

function pricingStr(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value).trim();
  return s;
}

function normalizePricingBreakdown(raw: unknown): CartPricingBreakdown {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const addonsFromPrice = pricingNum(o.addons_price);
  const hasExplicitAddonsTotal =
    'addons_total' in o && o.addons_total !== null && o.addons_total !== undefined;
  const gst = pricingNum(o.gst);
  const taxTotalRaw = pricingNum(o.tax_total);
  const hasExplicitSubtotal = 'subtotal' in o && o.subtotal !== null && o.subtotal !== undefined;
  const hasExplicitTaxTotal =
    'tax_total' in o && o.tax_total !== null && o.tax_total !== undefined;

  return {
    grand_total: pricingNum(o.grand_total),
    base_price: pricingNum(o.base_price),
    addons_total: hasExplicitAddonsTotal ? pricingNum(o.addons_total) : addonsFromPrice,
    insurance_total: pricingNum(o.insurance_total),
    tax_total: hasExplicitTaxTotal ? taxTotalRaw : gst,
    gst,
    gst_rate: pricingStr(o.gst_rate),
    razorpay_charges: pricingNum(o.razorpay_charges),
    deposit_amount: pricingNum(o.deposit_amount),
    pet_cleaning_charge: pricingNum(o.pet_cleaning_charge),
    one_way_surcharge: pricingNum(o.one_way_surcharge),
    coupon_discount: pricingNum(o.coupon_discount),
    subtotal: hasExplicitSubtotal ? pricingNum(o.subtotal) : undefined,
    chosen: pricingStr(o.chosen),
    pricing_mode_label: pricingStr(o.pricing_mode_label),
    reason: pricingStr(o.reason),
  };
}

function normalizeCartItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    const o = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
    const addonId = pricingStr(o.addon_id) || pricingStr(o.addon);
    return {
      id: pricingStr(o.id) || `${addonId || 'addon'}-${idx}`,
      addon_id: addonId,
      addon_name: pricingStr(o.addon_name),
      quantity: pricingNum(o.quantity),
      price: pricingStr(o.price) || pricingStr(o.unit_price),
      total: pricingStr(o.total) || pricingStr(o.total_price),
    };
  });
}

function normalizeCart(data: Cart): Cart {
  const raw = data as unknown as Record<string, unknown>;
  const status = pricingStr(raw.status);
  const convertedBooking = raw.converted_booking;
  return {
    ...data,
    status: (status as Cart['status']) || undefined,
    coupon: pricingStr(raw.coupon) || null,
    pricing_breakdown: normalizePricingBreakdown(data.pricing_breakdown),
    items: normalizeCartItems(raw.items),
    converted_booking:
      convertedBooking === null || convertedBooking === undefined
        ? null
        : pricingStr(convertedBooking) || null,
    caravan_available:
      typeof raw.caravan_available === 'boolean' ? raw.caravan_available : undefined,
  };
}

function extractCouponErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return 'Invalid coupon code. Please try another one.';
  const root = payload as Record<string, unknown>;
  const error = root.error;
  if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>;
    const message = pricingStr(errObj.message);
    if (message) return message;
    const details = errObj.details;
    if (details && typeof details === 'object') {
      const errors = (details as Record<string, unknown>).errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const first = pricingStr(errors[0]);
        if (first) return first;
      }
    }
  }
  const message = pricingStr(root.message);
  return message || 'Invalid coupon code. Please try another one.';
}

export const cartService = {
  async createCart(payload: CreateCartBody): Promise<Cart> {
    const { data } = await apiClient.post<CreateCartApiResponse>('/carts/', payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create cart');
    }
    return normalizeCart(data.data);
  },

  async getCart(cartId: string): Promise<Cart> {
    const { data } = await apiClient.get<CartDetailApiResponse>(`/carts/${cartId}/`);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to load cart');
    }
    return normalizeCart(data.data);
  },

  async addItem(cartId: string, addonId: string, quantity: number): Promise<void> {
    const { data } = await apiClient.post<CartDetailApiResponse>(`/carts/${cartId}/items/`, {
      addon_id: addonId,
      quantity,
    });
    if (!data.success) {
      throw new Error(data.message || 'Failed to add item to cart');
    }
  },

  async removeItem(cartId: string, addonId: string): Promise<void> {
    const { data } = await apiClient.delete<CartDetailApiResponse>(`/carts/${cartId}/items/${addonId}/`);
    if (!data.success) {
      throw new Error(data.message || 'Failed to remove item from cart');
    }
  },

  async applyCoupon(cartId: string, couponCode: string): Promise<Cart> {
    const code = couponCode.trim();
    if (!code) throw new Error('Enter a coupon code.');

    const response: AxiosResponse<unknown> = await apiClient.post(
      `/carts/${cartId}/coupon/`,
      { coupon_code: code },
      { validateStatus: () => true }
    );
    const payload = response.data as Record<string, unknown>;
    const isSuccess = payload?.success === true;

    if (!isSuccess) {
      throw new Error(extractCouponErrorMessage(payload));
    }

    const data = payload?.data;
    if (!data || typeof data !== 'object') {
      throw new Error('Coupon applied, but failed to refresh cart.');
    }
    return normalizeCart(data as Cart);
  },

  async removeCoupon(cartId: string): Promise<Cart> {
    const response: AxiosResponse<unknown> = await apiClient.delete(
      `/carts/${cartId}/coupon/`,
      { validateStatus: () => true }
    );
    const payload = response.data as Record<string, unknown>;
    const isSuccess = payload?.success === true;

    if (!isSuccess) {
      throw new Error(extractCouponErrorMessage(payload));
    }

    const data = payload?.data;
    if (!data || typeof data !== 'object') {
      throw new Error('Coupon removed, but failed to refresh cart.');
    }
    return normalizeCart(data as Cart);
  },
};

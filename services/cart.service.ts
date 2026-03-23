import apiClient from '@/services/apiClient';
import type {
  Cart,
  CartDetailApiResponse,
  CartPricingBreakdown,
  CreateCartApiResponse,
  CreateCartPayload,
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

function normalizeCart(data: Cart): Cart {
  return {
    ...data,
    pricing_breakdown: normalizePricingBreakdown(data.pricing_breakdown),
  };
}

export const cartService = {
  async createCart(payload: CreateCartPayload): Promise<Cart> {
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
};

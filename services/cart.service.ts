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

function normalizePricingBreakdown(raw: unknown): CartPricingBreakdown {
  const o = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    grand_total: pricingNum(o.grand_total),
    base_price: pricingNum(o.base_price),
    addons_total: pricingNum(o.addons_total),
    insurance_total: pricingNum(o.insurance_total),
    tax_total: pricingNum(o.tax_total),
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

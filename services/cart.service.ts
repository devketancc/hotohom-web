import apiClient from '@/services/apiClient';
import type { Cart, CreateCartApiResponse, CreateCartPayload } from '@/types/cart';

export const cartService = {
  async createCart(payload: CreateCartPayload): Promise<Cart> {
    const { data } = await apiClient.post<CreateCartApiResponse>('/carts/', payload);
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create cart');
    }
    return data.data;
  },
};

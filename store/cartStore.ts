import { create } from 'zustand';
import type { Cart } from '@/types/cart';

type CartState = {
  cart: Cart | null;
  cartId: string | null;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  cartId: null,
  setCart: (cart) => set({ cart, cartId: cart.id }),
  clearCart: () => set({ cart: null, cartId: null }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart } from '@/types/cart';

type CartState = {
  cart: Cart | null;
  cartId: string | null;
  /** False until persist has finished rehydrating from storage (avoids flash redirect on /booking/summary). */
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  setCart: (cart: Cart) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cart: null,
      cartId: null,
      hasHydrated: false,
      setHasHydrated: (value) => set({ hasHydrated: value }),
      setCart: (cart) => set({ cart, cartId: cart.id }),
      clearCart: () => set({ cart: null, cartId: null }),
    }),
    {
      name: 'motohom-cart-storage',
      partialize: (state) => ({ cartId: state.cartId, cart: state.cart }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) console.error('cart persist rehydrate failed', error);
        // Rehydrate can run synchronously during `create()`; defer so `useCartStore` is initialized (TDZ).
        queueMicrotask(() => {
          useCartStore.getState().setHasHydrated(true);
        });
      },
    }
  )
);

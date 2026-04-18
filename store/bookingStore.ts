import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { BookingData } from '@/types/booking';
import { useCartStore } from '@/store/cartStore';

export interface BookingState extends BookingData {
  /** False until persist has rehydrated (avoid redirecting package flow on stale initial slice). */
  hasHydrated: boolean;
  setData: (data: Partial<BookingData>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  /** Package flow: change trip start only; end date follows `activePackage.duration_days`. */
  setPackageTripStart: (start: Date) => void;
  reset: () => void;
}

const initialBookingData: BookingData = {
  hub: null,
  hubName: null,
  hubLocation: null,
  dates: { start: null, end: null, totalDays: 0 },
  caravanClass: null,
  passengers: 1,
  pets: 0,
  journey: null,
  addons: [],
  pricing: {
    basePrice: 0,
    addonsPrice: 0,
    tax: 0,
    total: 0,
  },
  bookingFlow: 'standard',
  activePackage: null,
};

const initialPersistedSlice = (): Omit<
  BookingState,
  'setData' | 'setDates' | 'setPackageTripStart' | 'reset'
> => ({
  ...initialBookingData,
  hasHydrated: false,
});

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialPersistedSlice(),
      setData: (data) => {
        if (
          data.journey !== undefined ||
          data.hub !== undefined ||
          data.caravanClass !== undefined
        ) {
          useCartStore.getState().clearCart();
        }
        set((state) => {
          const next = { ...state, ...data };
          if (data.hub !== undefined && data.hub !== state.hub) {
            next.caravanClass = null;
            next.passengers = 1;
            next.activePackage = null;
            next.bookingFlow = 'standard';
          }
          return next;
        });
      },
      setDates: (start, end) => {
        useCartStore.getState().clearCart();
        set((state) => {
          let totalDays = 0;
          if (start && end) {
            const s = new Date(start);
            const e = new Date(end);
            s.setHours(0, 0, 0, 0);
            e.setHours(0, 0, 0, 0);
            // Inclusive calendar days: same start/end = 1 day; start today + end tomorrow = 2 days
            totalDays = differenceInCalendarDays(e, s) + 1;
          }
          const flow = state.bookingFlow ?? 'standard';
          const preserveCaravan = flow === 'package' && state.activePackage;
          return {
            ...state,
            dates: { start, end, totalDays },
            ...(preserveCaravan
              ? {}
              : {
                  caravanClass: null,
                  passengers: 1,
                }),
          };
        });
      },
      setPackageTripStart: (start) => {
        useCartStore.getState().clearCart();
        set((state) => {
          const pkg = state.activePackage;
          if (!pkg || (state.bookingFlow ?? 'standard') !== 'package') {
            return state;
          }
          const days = Math.max(1, pkg.duration_days);
          const end = addDays(start, Math.max(days - 1, 0));
          return {
            ...state,
            dates: { start, end, totalDays: days },
          };
        });
      },
      reset: () => {
        useCartStore.getState().clearCart();
        set({ ...initialPersistedSlice(), hasHydrated: true });
      },
    }),
    {
      name: 'motohom-booking-storage',
      partialize: (state) => ({
        hub: state.hub,
        hubName: state.hubName,
        hubLocation: state.hubLocation,
        dates: state.dates,
        caravanClass: state.caravanClass,
        passengers: state.passengers,
        pets: state.pets,
        journey: state.journey,
        addons: state.addons,
        pricing: state.pricing,
        bookingFlow: state.bookingFlow,
        activePackage: state.activePackage,
      }),
      onRehydrateStorage: () => () => {
        queueMicrotask(() => {
          useBookingStore.setState({ hasHydrated: true });
        });
      },
    }
  )
);

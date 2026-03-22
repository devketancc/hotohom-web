import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { differenceInCalendarDays } from 'date-fns';
import { BookingData } from '@/types/booking';

export interface BookingState extends BookingData {
  setData: (data: Partial<BookingData>) => void;
  setDates: (start: Date | null, end: Date | null) => void;
  reset: () => void;
}

const initialState: BookingData = {
  hub: null,
  hubName: null,
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
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...initialState,
      setData: (data) =>
        set((state) => {
          const next = { ...state, ...data };
          if (data.hub !== undefined && data.hub !== state.hub) {
            next.caravanClass = null;
          }
          return next;
        }),
      setDates: (start, end) =>
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
          return {
            ...state,
            dates: { start, end, totalDays },
            caravanClass: null,
          };
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'motohom-booking-storage',
    }
  )
);

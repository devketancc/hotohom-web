import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
      setData: (data) => set((state) => ({ ...state, ...data })),
      setDates: (start, end) => set((state) => {
        let totalDays = 0;
        if (start && end) {
          const s = new Date(start);
          const e = new Date(end);
          s.setHours(0, 0, 0, 0);
          e.setHours(0, 0, 0, 0);
          const diffTime = Math.abs(e.getTime() - s.getTime());
          totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return {
          ...state,
          dates: { start, end, totalDays }
        };
      }),
      reset: () => set(initialState),
    }),
    {
      name: 'motohom-booking-storage',
    }
  )
);

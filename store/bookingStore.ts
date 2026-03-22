import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BookingData } from '@/types/booking';

export interface BookingState extends BookingData {
  setData: (data: Partial<BookingData>) => void;
  reset: () => void;
}

const initialState: BookingData = {
  hub: null,
  dates: { start: null, end: null },
  caravanClass: null,
  passengers: [],
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
      reset: () => set(initialState),
    }),
    {
      name: 'motohom-booking-storage',
    }
  )
);

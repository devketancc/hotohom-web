import { useMutation } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { pricingService } from '@/services/pricing.service';
import { useBookingStore } from '@/store/bookingStore';

export const useBooking = () => {
  const bookingState = useBookingStore();

  const createBookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
  });

  const calculatePriceMutation = useMutation({
    mutationFn: () => pricingService.calculatePrice(bookingState),
    onSuccess: (data) => {
      bookingState.setData({ pricing: data.data });
    },
  });

  return {
    bookingState,
    createBooking: createBookingMutation.mutateAsync,
    isCreating: createBookingMutation.isPending,
    calculatePrice: calculatePriceMutation.mutateAsync,
    isCalculatingPrice: calculatePriceMutation.isPending,
  };
};

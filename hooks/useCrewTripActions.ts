'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/errorHandler';
import { crewTripActions, normalizeTripStatus } from '@/lib/crewTripUi';
import {
  crewQueryKeys,
  createCrewTripEvent,
  createCrewTripExpense,
  endCrewTrip,
  startCrewTrip,
} from '@/services/crew.service';
import type {
  CrewBookingDetail,
  CrewTripEndPayload,
  CrewTripEventWritePayload,
  CrewTripExpenseWritePayload,
  CrewTripStartPayload,
} from '@/types/crew';

export function useCrewTripActions(booking: CrewBookingDetail | undefined) {
  const queryClient = useQueryClient();
  const bookingId = booking?.id ?? '';
  const trip = booking?.trip ?? null;
  const tripId = trip?.id ?? '';
  const status = normalizeTripStatus(trip?.status);
  const actions = crewTripActions(status);

  const invalidateBooking = async () => {
    if (!bookingId) return;
    await queryClient.invalidateQueries({ queryKey: crewQueryKeys.bookingDetail(bookingId) });
    if (tripId) {
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.trip(tripId) });
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.tripEvents(tripId) });
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.tripExpenses(tripId) });
      await queryClient.invalidateQueries({ queryKey: crewQueryKeys.tripEotSummary(tripId) });
    }
  };

  const onError = (err: unknown) => {
    toast.error(handleApiError(err));
  };

  const startMutation = useMutation({
    mutationFn: ({ imageFile, ...payload }: CrewTripStartPayload & { imageFile?: File | null }) =>
      startCrewTrip(tripId, payload, imageFile),
    onSuccess: async () => {
      toast.success('Trip started');
      await invalidateBooking();
    },
    onError,
  });

  const endMutation = useMutation({
    mutationFn: (payload: CrewTripEndPayload) => endCrewTrip(tripId, payload),
    onSuccess: async () => {
      toast.success('End of trip submitted');
      await invalidateBooking();
    },
    onError,
  });

  const eventMutation = useMutation({
    mutationFn: (payload: CrewTripEventWritePayload) => createCrewTripEvent(tripId, payload),
    onSuccess: async () => {
      toast.success('Event logged');
      await invalidateBooking();
    },
    onError,
  });

  const expenseMutation = useMutation({
    mutationFn: (payload: CrewTripExpenseWritePayload) => createCrewTripExpense(tripId, payload),
    onSuccess: async () => {
      toast.success('Expense logged');
      await invalidateBooking();
    },
    onError,
  });

  return {
    trip,
    tripId,
    status,
    actions,
    hasTrip: Boolean(tripId),
    startTrip: startMutation.mutateAsync,
    endTrip: endMutation.mutateAsync,
    logEvent: eventMutation.mutateAsync,
    logExpense: expenseMutation.mutateAsync,
    isStarting: startMutation.isPending,
    isEnding: endMutation.isPending,
    isLoggingEvent: eventMutation.isPending,
    isLoggingExpense: expenseMutation.isPending,
    isBusy:
      startMutation.isPending ||
      endMutation.isPending ||
      eventMutation.isPending ||
      expenseMutation.isPending,
  };
}

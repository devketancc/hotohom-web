type AssignmentLike = {
  driver_name?: string | null;
  helper_name?: string | null;
  driver_phone?: string | null;
  helper_phone?: string | null;
} | null;

type BookingWithAssignmentLike = {
  assignment?: AssignmentLike;
  driver_name?: string | null;
};

export function getBookingAssignmentDisplay(booking: BookingWithAssignmentLike): {
  driverName: string | null;
  helperName: string | null;
  driverPhone: string | null;
  helperPhone: string | null;
  missingDriver: boolean;
  missingHelper: boolean;
  hasAnyAssignment: boolean;
} {
  const driverName = booking.assignment?.driver_name?.trim() || booking.driver_name?.trim() || null;
  const helperName = booking.assignment?.helper_name?.trim() || null;
  const driverPhone = booking.assignment?.driver_phone?.trim() || null;
  const helperPhone = booking.assignment?.helper_phone?.trim() || null;

  return {
    driverName,
    helperName,
    driverPhone,
    helperPhone,
    missingDriver: !driverName,
    missingHelper: !helperName,
    hasAnyAssignment: Boolean(driverName || helperName),
  };
}

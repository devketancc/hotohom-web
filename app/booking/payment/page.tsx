import { redirect } from 'next/navigation';

export default function BookingPaymentRedirectPage() {
  redirect('/booking/payment/status');
}

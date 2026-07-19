'use client';

/**
 * Razorpay payment-link redirect target (FRONTEND_URL + /payment/success).
 *
 * Reached by customers finishing an advance payment in the Razorpay tab, and by
 * customers paying an admin-shared balance link straight from WhatsApp — the
 * latter arrive with no session, so this page must stay auth-free and read
 * nothing but its query params.
 */
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const paid = searchParams.get('razorpay_payment_link_status') === 'paid';

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      {paid ? (
        <CheckCircle2 className="mx-auto size-10 text-stitch-primary" aria-hidden />
      ) : (
        <Clock className="mx-auto size-10 text-amber-400" aria-hidden />
      )}
      <h1 className="mt-4 font-headline text-xl font-bold text-stitch-on-background">
        {paid ? 'Payment received' : 'Payment processing'}
      </h1>
      <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
        {paid
          ? 'Thanks — your payment is confirmed. If you started this payment from another tab, that tab will update automatically.'
          : "We're confirming your payment with the bank. This can take a minute — you can safely close this page."}
      </p>
      <div className="mt-6 flex flex-col items-center gap-3">
        {paid ? (
          <Link
            href="/journeys"
            className="rounded-xl bg-stitch-primary px-6 py-3 text-sm font-bold text-stitch-on-primary hover:brightness-110"
          >
            View my journeys
          </Link>
        ) : (
          <Link
            href="/journeys"
            className="font-semibold text-stitch-primary underline underline-offset-2"
          >
            My journeys
          </Link>
        )}
      </div>
    </div>
  );
}

function PaymentSuccessFallback() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-6 text-stitch-on-surface-variant">
      <Loader2 className="size-8 animate-spin text-stitch-primary" aria-hidden />
      <span className="font-body text-sm">Loading…</span>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessFallback />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

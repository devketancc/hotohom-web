'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { isAuthed, requestAuthThenNavigate } from '@/lib/authNavigation';
import { clearPendingPayment, readPendingPayment } from '@/lib/pendingPayment';
import { cartService } from '@/services/cart.service';
import { paymentService } from '@/services/payment.service';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 300000;

type StatusPhase = 'confirming' | 'success' | 'timeout' | 'missing';

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const clearCart = useCartStore((s) => s.clearCart);
  const authPrompted = useRef(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pending = readPendingPayment();
  const cartId = searchParams.get('cart') || pending?.cartId || '';
  const paymentId = searchParams.get('payment') || pending?.paymentId || '';
  const paymentUrl = pending?.paymentUrl || '';

  const [phase, setPhase] = useState<StatusPhase>('confirming');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const completeBooking = useCallback(
    (id: string) => {
      setBookingId(id);
      setPhase('success');
      clearCart();
      clearPendingPayment();
      router.replace(`/booking/${id}`);
    },
    [clearCart, router]
  );

  const pollForCompletion = useCallback(async (): Promise<string | null> => {
    if (!cartId) return null;

    try {
      const cart = await cartService.getCart(cartId);
      if (cart.status === 'converted' && cart.converted_booking) {
        return cart.converted_booking;
      }
    } catch {
      /* continue to fallback */
    }

    if (paymentId) {
      try {
        const payments = await paymentService.listMyPayments();
        const match = payments.find(
          (p) => p.id === paymentId && p.status === 'captured' && p.booking
        );
        if (match?.booking) return match.booking;
      } catch {
        /* ignore */
      }
    }

    return null;
  }, [cartId, paymentId]);

  const runPoll = useCallback(
    async (startedAt: number) => {
      setChecking(true);
      try {
        const id = await pollForCompletion();
        if (id) {
          completeBooking(id);
          return;
        }

        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setPhase('timeout');
          return;
        }

        pollTimerRef.current = setTimeout(() => void runPoll(startedAt), POLL_INTERVAL_MS);
      } finally {
        setChecking(false);
      }
    },
    [completeBooking, pollForCompletion]
  );

  const handleCheckNow = useCallback(() => {
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    setPhase('confirming');
    void runPoll(Date.now());
  }, [runPoll]);

  useEffect(() => {
    if (!isAuthenticated && !authPrompted.current) {
      if (!isAuthed()) {
        authPrompted.current = true;
        const returnPath = cartId
          ? `/booking/payment/status?cart=${cartId}${paymentId ? `&payment=${paymentId}` : ''}`
          : '/booking/payment/status';
        requestAuthThenNavigate(returnPath);
        return;
      }
    }
  }, [cartId, isAuthenticated, paymentId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!cartId) {
      setPhase('missing');
      return;
    }

    const startedAt = Date.now();
    void runPoll(startedAt);

    return () => {
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start polling once per cart session
  }, [cartId, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-stitch-on-background">
        <Loader2 className="size-8 animate-spin text-stitch-primary" aria-hidden />
        <p className="font-body text-sm text-muted-foreground">Sign in to check payment status…</p>
      </div>
    );
  }

  if (phase === 'missing') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <AlertCircle className="mx-auto size-10 text-amber-400" aria-hidden />
        <h1 className="mt-4 font-headline text-xl font-bold text-stitch-on-background">
          No payment in progress
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground">
          We could not find a pending payment. Start checkout from your booking summary or view
          existing journeys.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            href="/booking/summary"
            className="font-semibold text-stitch-primary underline underline-offset-2"
          >
            Booking summary
          </Link>
          <Link
            href="/journeys"
            className="font-semibold text-stitch-primary underline underline-offset-2"
          >
            My journeys
          </Link>
        </div>
      </div>
    );
  }

  if (phase === 'timeout') {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <AlertCircle className="mx-auto size-10 text-amber-400" aria-hidden />
        <h1 className="mt-4 font-headline text-xl font-bold text-stitch-on-background">
          Still confirming payment
        </h1>
        <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
          If you completed payment on Zoho, confirmation can take a minute. Use the button below to
          check again, or open My Journeys — your booking may already be there.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={handleCheckNow}
            disabled={checking}
            className="rounded-xl bg-stitch-primary px-6 py-3 text-sm font-bold text-stitch-on-primary hover:brightness-110 disabled:opacity-50"
          >
            {checking ? 'Checking…' : 'Check payment again'}
          </button>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            {paymentUrl ? (
              <button
                type="button"
                onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
                className="inline-flex items-center gap-1 font-semibold text-stitch-primary underline underline-offset-2"
              >
                Open payment page
                <ExternalLink className="size-3" aria-hidden />
              </button>
            ) : null}
            <Link
              href="/journeys"
              className="font-semibold text-stitch-primary underline underline-offset-2"
            >
              My journeys
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      {phase === 'success' ? (
        <CheckCircle2 className="mx-auto size-10 text-stitch-primary" aria-hidden />
      ) : (
        <Loader2 className="mx-auto size-8 animate-spin text-stitch-primary" aria-hidden />
      )}
      <h1 className="mt-4 font-headline text-xl font-bold text-stitch-on-background">
        {phase === 'success' ? 'Booking confirmed' : 'Confirming your payment'}
      </h1>
      <p className="mt-2 font-body text-sm text-muted-foreground leading-relaxed">
        {phase === 'success' && bookingId
          ? 'Redirecting to your booking…'
          : 'Complete payment in the Zoho tab that opened. This page will automatically redirect you to your booking once payment is confirmed.'}
      </p>
      {phase === 'confirming' ? (
        <div className="mt-6 space-y-3">
          {paymentUrl ? (
            <button
              type="button"
              onClick={() => window.open(paymentUrl, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/30 px-4 py-2.5 text-sm font-semibold text-stitch-on-background hover:border-stitch-primary/60"
            >
              Open payment page
              <ExternalLink className="size-3.5" aria-hidden />
            </button>
          ) : null}
          <p className="font-body text-xs text-muted-foreground">
            Already paid on Zoho?{' '}
            <button
              type="button"
              onClick={handleCheckNow}
              disabled={checking}
              className="font-semibold text-stitch-primary underline underline-offset-2 disabled:opacity-50"
            >
              Check now
            </button>
          </p>
        </div>
      ) : null}
    </div>
  );
}

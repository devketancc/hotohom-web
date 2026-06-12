import type { PendingPaymentContext } from '@/types/payment';

export const PENDING_PAYMENT_KEY = 'motohom_pending_payment';
export const RESUME_PAYMENT_KEY = 'motohom_resume_payment';

export function savePendingPayment(ctx: PendingPaymentContext): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(ctx));
}

export function readPendingPayment(): PendingPaymentContext | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingPaymentContext;
    if (parsed?.paymentId && parsed?.cartId && parsed?.paymentUrl) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function clearPendingPayment(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(PENDING_PAYMENT_KEY);
  sessionStorage.removeItem(RESUME_PAYMENT_KEY);
}

export function setResumePaymentFlag(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(RESUME_PAYMENT_KEY, '1');
}

export function consumeResumePaymentFlag(): boolean {
  if (typeof window === 'undefined') return false;
  const flag = sessionStorage.getItem(RESUME_PAYMENT_KEY);
  if (flag !== '1') return false;
  sessionStorage.removeItem(RESUME_PAYMENT_KEY);
  return true;
}

export function buildPaymentStatusPath(cartId: string, paymentId?: string): string {
  const params = new URLSearchParams({ cart: cartId });
  if (paymentId) params.set('payment', paymentId);
  return `/booking/payment/status?${params.toString()}`;
}

/** Open Zoho payment in a new tab when possible; returns whether a separate tab was used. */
export function openPaymentUrl(paymentUrl: string, paymentTab: Window | null): boolean {
  if (paymentTab && !paymentTab.closed) {
    paymentTab.location.href = paymentUrl;
    return true;
  }
  const opened = window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  return opened !== null;
}

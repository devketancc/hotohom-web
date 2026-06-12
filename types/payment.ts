export type PaymentType = 'advance' | 'deposit';

export type CreatePaymentLinkBody = {
  cart_id: string;
  payment_type: PaymentType;
};

export type CreatePaymentLinkResult = {
  payment_id: string;
  payment_url: string;
  zoho_invoice_id: string;
  amount: string;
  cart_id: string;
};

export type PaymentRecord = {
  id: string;
  cart: string;
  booking: string | null;
  payment_type: PaymentType;
  amount: string;
  status: 'pending' | 'captured' | 'failed';
  captured_at: string | null;
  created_at: string;
};

export type PendingPaymentContext = {
  paymentId: string;
  cartId: string;
  paymentUrl: string;
};

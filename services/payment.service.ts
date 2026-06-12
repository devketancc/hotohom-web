import apiClient from '@/services/apiClient';
import type {
  CreatePaymentLinkResult,
  PaymentRecord,
  PaymentType,
} from '@/types/payment';

type PaymentLinkApiResponse = {
  success: boolean;
  data?: CreatePaymentLinkResult;
  message?: string;
};

type PaymentsListApiResponse = {
  success: boolean;
  data?: PaymentRecord[];
  message?: string;
};

export const paymentService = {
  async createPaymentLink(
    cartId: string,
    paymentType: PaymentType = 'advance'
  ): Promise<CreatePaymentLinkResult> {
    const { data } = await apiClient.post<PaymentLinkApiResponse>('/payments/link/', {
      cart_id: cartId,
      payment_type: paymentType,
    });
    if (!data.success || !data.data) {
      throw new Error(data.message || 'Failed to create payment link');
    }
    return data.data;
  },

  async listMyPayments(): Promise<PaymentRecord[]> {
    const { data } = await apiClient.get<PaymentsListApiResponse | PaymentRecord[]>('/payments/');
    if (Array.isArray(data)) return data;
    if (data?.success && Array.isArray(data.data)) return data.data;
    return [];
  },
};

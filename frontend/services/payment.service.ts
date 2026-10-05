import { api } from './api';

export interface ConfirmPaymentResponse {
  success: boolean;
  type?: 'TICKET_PURCHASE' | 'SUBSCRIPTION';
  message?: string;
  tickets?: any[];
  instantWins?: any[];
  subscription?: any;
  updatedRaffle?: any;
}

export const paymentService = {
  async confirmPayment(params: { paymentJobRef?: string; orderNumber?: string }): Promise<ConfirmPaymentResponse> {
    const response = await api.post('/payment/confirm', params);
    return response.data;
  },
};

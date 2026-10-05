import { api } from './api';

export interface BasketCheckoutItem {
  raffleId: string;
  quantity: number;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  country?: string;
  saveToProfile?: boolean;
}

export interface BasketCheckoutPayload {
  items: BasketCheckoutItem[];
  shippingDetails: ShippingDetails;
}

export interface CheckoutResponse {
  message?: string;
  url?: string;
  orderNumber?: string;
  transaction?: any;
  tickets?: any[];
  instantWins?: any[];
}

export const ticketService = {
  async checkout(payload: BasketCheckoutPayload): Promise<CheckoutResponse> {
    const response = await api.post('/tickets/checkout', payload);
    return response.data;
  },

  async purchaseTickets(raffleId: string, quantity: number): Promise<CheckoutResponse> {
    const response = await api.post(`/tickets/purchase/${raffleId}`, { quantity });
    return response.data;
  },

  async getMyTickets(): Promise<any[]> {
    const response = await api.get('/tickets/my-tickets');
    return response.data;
  },

  async getMyPendingOrders(): Promise<any[]> {
    const response = await api.get('/tickets/my-pending-orders');
    return response.data;
  },

  async payPendingOrder(transactionId: string): Promise<any> {
    const response = await api.post(`/tickets/pay-pending-order/${transactionId}`);
    return response.data;
  },

  async getMyTransactions(): Promise<any[]> {
    const response = await api.get('/tickets/my-transactions');
    return response.data;
  },
};

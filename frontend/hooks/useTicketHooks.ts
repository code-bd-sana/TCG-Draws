import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const usePurchaseTicketsMutation = (raffleId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quantity: number) => {
      const response = await api.post(`/tickets/purchase/${raffleId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh available tickets, etc.
      queryClient.invalidateQueries({ queryKey: ['raffle', raffleId] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });
};

export const useMyTicketsQuery = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['my-tickets'],
    queryFn: async () => {
      const response = await api.get('/tickets/my-tickets');
      return response.data;
    },
    enabled,
    retry: false,
  });
};

export const useMyPendingOrdersQuery = () => {
  return useQuery({
    queryKey: ['my-pending-orders'],
    queryFn: async () => {
      const response = await api.get('/tickets/my-pending-orders');
      return response.data;
    },
  });
};

export const usePayPendingOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await api.post(`/tickets/pay-pending-order/${transactionId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-orders'] });
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
    },
  });
};

export const useMyTransactionsQuery = () => {
  return useQuery({
    queryKey: ['my-transactions'],
    queryFn: async () => {
      const response = await api.get('/tickets/my-transactions');
      return response.data;
    },
  });
};


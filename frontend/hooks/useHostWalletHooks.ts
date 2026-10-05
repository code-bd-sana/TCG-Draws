import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostWalletService, RequestWithdrawalPayload } from '../services/host-wallet.service';

export const useHostDashboardOverview = () => {
  return useQuery({
    queryKey: ['host-dashboard-overview'],
    queryFn: hostWalletService.getDashboardOverview,
    staleTime: 30 * 1000,
  });
};

export const useHostSalesAnalytics = () => {
  return useQuery({
    queryKey: ['host-sales-analytics'],
    queryFn: hostWalletService.getSalesAnalytics,
    staleTime: 30 * 1000,
  });
};

export const useHostPerformanceAnalytics = (timeframe: string = '1M') => {
  return useQuery({
    queryKey: ['host-performance-analytics', timeframe],
    queryFn: () => hostWalletService.getPerformanceAnalytics(timeframe),
    staleTime: 30 * 1000,
  });
};

export const useHostWalletStats = () => {
  return useQuery({
    queryKey: ['host-wallet-stats'],
    queryFn: hostWalletService.getWalletStats,
    staleTime: 60 * 1000,
  });
};

export const useHostWithdrawalHistory = () => {
  return useQuery({
    queryKey: ['host-withdrawal-history'],
    queryFn: hostWalletService.getWithdrawalHistory,
    staleTime: 60 * 1000,
  });
};

export const useRequestWithdrawalMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestWithdrawalPayload) => hostWalletService.requestWithdrawal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-wallet-stats'] });
      queryClient.invalidateQueries({ queryKey: ['host-withdrawal-history'] });
    },
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminTicketAssignmentService,
  AssignTicketsPayload,
} from '../services/admin-ticket-assignment.service';

export const useAdminCompetitions = (params?: { q?: string; hostId?: string }) => {
  return useQuery({
    queryKey: ['admin', 'ticket-assignment', 'competitions', params],
    queryFn: () => adminTicketAssignmentService.getCompetitions(params),
    staleTime: 30 * 1000,
  });
};

export const useAdminCompetitionDetails = (id?: string) => {
  return useQuery({
    queryKey: ['admin', 'ticket-assignment', 'competition', id],
    queryFn: () => adminTicketAssignmentService.getCompetitionById(id!),
    enabled: Boolean(id),
    staleTime: 10 * 1000,
  });
};

export const useAdminUserSearch = (query?: string) => {
  return useQuery({
    queryKey: ['admin', 'ticket-assignment', 'users', query],
    queryFn: () => adminTicketAssignmentService.searchUsers(query),
    staleTime: 15 * 1000,
  });
};

export const useAdminAssignTicketsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignTicketsPayload) =>
      adminTicketAssignmentService.assignTickets(payload),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ['admin', 'ticket-assignment', 'competitions'],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'ticket-assignment', 'competition', variables.raffleId],
      });
      queryClient.invalidateQueries({
        queryKey: ['admin', 'ticket-assignment', 'history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['adminOrders'],
      });
      queryClient.invalidateQueries({
        queryKey: ['adminOverviewStats'],
      });
    },
  });
};

export const useAdminAssignmentHistory = (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['admin', 'ticket-assignment', 'history', params],
    queryFn: () => adminTicketAssignmentService.getHistory(params),
    staleTime: 20 * 1000,
  });
};

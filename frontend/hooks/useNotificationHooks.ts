import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notificationService,
  QueryNotificationsParams,
} from '../services/notification.service';

export const useNotificationsQuery = (params?: QueryNotificationsParams, enabled = true) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled,
  });
};

export const useUnreadNotificationCountQuery = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    enabled,
  });
};

export const useMarkNotificationReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

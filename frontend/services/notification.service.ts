import { api } from './api';

export interface NotificationItem {
  id: string;
  userId: string;
  type: string; // 'WIN' | 'PURCHASE' | 'RAFFLE' | 'SYSTEM'
  title: string;
  message: string;
  link?: string | null;
  metadata?: Record<string, any> | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryNotificationsParams {
  type?: string;
  isRead?: boolean | string;
  page?: number;
  limit?: number;
}

export const notificationService = {
  async getNotifications(params?: QueryNotificationsParams): Promise<NotificationsResponse> {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  async getUnreadCount(): Promise<{ count: number }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllAsRead(): Promise<{ success: boolean; markedCount: number }> {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },
};

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a notification record. Fail-safe: logs error and returns null on failure
   * so callers are never blocked.
   */
  async create(dto: CreateNotificationDto) {
    try {
      return await this.prisma.notification.create({
        data: {
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          message: dto.message,
          link: dto.link,
          metadata: dto.metadata || undefined,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create notification for user ${dto.userId}: ${error.message}`,
        error.stack,
      );
      return null;
    }
  }

  /**
   * Get paginated notifications for an authenticated user with optional filtering.
   */
  async getUserNotifications(userId: string, query: QueryNotificationsDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (query.type && query.type.toUpperCase() !== 'ALL') {
      where.type = query.type.toUpperCase();
    }

    if (query.isRead !== undefined && query.isRead !== '') {
      where.isRead = query.isRead === 'true';
    }

    const [notifications, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get total unread count for a user.
   */
  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  /**
   * Mark a single notification as read.
   */
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Mark all unread notifications for a user as read.
   */
  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return {
      success: true,
      markedCount: result.count,
    };
  }

  // ==========================================
  // Helper Dispatches
  // ==========================================

  /**
   * Send notification to a specific user.
   */
  async notifyUser(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>,
  ) {
    return this.create({ userId, type, title, message, link, metadata });
  }

  /**
   * Send notification to a host by hostProfile ID.
   */
  async notifyHost(
    hostId: string,
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      const host = await this.prisma.hostProfile.findUnique({
        where: { id: hostId },
        select: { userId: true },
      });

      if (host?.userId) {
        return await this.create({
          userId: host.userId,
          type,
          title,
          message,
          link,
          metadata,
        });
      }
    } catch (error) {
      this.logger.error(`Error finding host for notification: ${error.message}`);
    }
    return null;
  }

  /**
   * Send notification to all administrators.
   */
  async notifyAdmins(
    type: string,
    title: string,
    message: string,
    link?: string,
    metadata?: Record<string, any>,
  ) {
    try {
      const admins = await this.prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true },
      });

      await Promise.all(
        admins.map((admin) =>
          this.create({
            userId: admin.id,
            type,
            title,
            message,
            link,
            metadata,
          }),
        ),
      );
    } catch (error) {
      this.logger.error(`Error notifying admins: ${error.message}`);
    }
  }
}

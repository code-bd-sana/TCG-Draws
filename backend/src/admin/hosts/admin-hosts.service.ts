import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AdminHostsService {
  constructor(private prisma: PrismaService) {}

  async getHosts(page = 1, limit = 10, search = '', status = 'All') {
    const skip = (page - 1) * limit;

    const where: Prisma.HostProfileWhereInput = {};

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status === 'Active') {
      where.isVerified = true;
      where.user = { isBlocked: false };
    } else if (status === 'Blocked') {
      where.user = { isBlocked: true };
    } else if (status === 'Pending') {
      where.isVerified = false;
    }

    const [hosts, total] = await Promise.all([
      this.prisma.hostProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              location: true,
              phone: true,
              address: true,
              isEmailVerified: true,
              isBlocked: true,
              createdAt: true,
            },
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { raffles: true },
          },
        },
      }),
      this.prisma.hostProfile.count({ where }),
    ]);

    const formattedHosts = hosts.map((host) => {
      const revenue = Number(host.walletBalance) || 0;
      const activeSubscription =
        host.subscriptions.length > 0 ? host.subscriptions[0] : null;
      const activePlan = activeSubscription?.plan?.name || 'Free';

      return {
        id: host.id,
        userId: host.userId,
        businessName: host.businessName,
        slug: host.slug || null,
        bio: host.bio || null,
        phone: host.phone || host.user?.phone || null,
        address: host.address || host.user?.address || null,
        walletBalance: revenue,
        revenue: revenue,
        isVerified: host.isVerified,
        createdAt: host.createdAt,

        // User profile details
        email: host.user?.email || '',
        firstName: host.user?.firstName || null,
        lastName: host.user?.lastName || null,
        avatarUrl: host.user?.avatarUrl || null,
        location: host.user?.location || null,
        isBlocked: host.user?.isBlocked ?? false,
        isEmailVerified: host.user?.isEmailVerified ?? false,
        userCreatedAt: host.user?.createdAt || null,

        // Subscription details
        plan: !host.isVerified ? 'Pending Approval' : activePlan,
        subscription: activeSubscription
          ? {
              id: activeSubscription.id,
              planName: activeSubscription.plan.name,
              price: Number(activeSubscription.plan.price) || 0,
              durationDays: activeSubscription.plan.durationDays,
              maxActiveRaffles: activeSubscription.plan.maxActiveRaffles,
              status: activeSubscription.status,
              startDate: activeSubscription.startDate,
              endDate: activeSubscription.endDate,
            }
          : null,

        // Stats
        raffles: host._count.raffles,
      };
    });

    return {
      hosts: formattedHosts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getHostById(id: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            location: true,
            phone: true,
            address: true,
            isEmailVerified: true,
            isBlocked: true,
            createdAt: true,
          },
        },
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        raffles: {
          select: {
            id: true,
            title: true,
            status: true,
            pricePerTicket: true,
            totalTickets: true,
            ticketsSold: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { raffles: true },
        },
      },
    });

    if (!host) {
      throw new NotFoundException('Host profile not found');
    }

    const revenue = Number(host.walletBalance) || 0;
    const activeSubscription =
      host.subscriptions.find((s) => s.status === 'ACTIVE') ||
      host.subscriptions[0] ||
      null;
    const activePlan = activeSubscription?.plan?.name || 'Free';

    return {
      id: host.id,
      userId: host.userId,
      businessName: host.businessName,
      slug: host.slug || null,
      bio: host.bio || null,
      phone: host.phone || host.user?.phone || null,
      address: host.address || host.user?.address || null,
      walletBalance: revenue,
      revenue: revenue,
      isVerified: host.isVerified,
      createdAt: host.createdAt,

      // User details
      email: host.user?.email || '',
      firstName: host.user?.firstName || null,
      lastName: host.user?.lastName || null,
      avatarUrl: host.user?.avatarUrl || null,
      location: host.user?.location || null,
      isBlocked: host.user?.isBlocked ?? false,
      isEmailVerified: host.user?.isEmailVerified ?? false,
      userCreatedAt: host.user?.createdAt || null,

      // Subscription
      plan: !host.isVerified ? 'Pending Approval' : activePlan,
      subscription: activeSubscription
        ? {
            id: activeSubscription.id,
            planName: activeSubscription.plan.name,
            price: Number(activeSubscription.plan.price) || 0,
            durationDays: activeSubscription.plan.durationDays,
            maxActiveRaffles: activeSubscription.plan.maxActiveRaffles,
            status: activeSubscription.status,
            startDate: activeSubscription.startDate,
            endDate: activeSubscription.endDate,
          }
        : null,

      // Stats & raffles
      raffles: host._count.raffles,
      recentRaffles: host.raffles || [],
    };
  }

  async getStats() {
    const [totalHosts, activeHosts, blockedHosts, pendingHosts] = await Promise.all([
      this.prisma.hostProfile.count(),
      this.prisma.hostProfile.count({ where: { isVerified: true, user: { isBlocked: false } } }),
      this.prisma.hostProfile.count({ where: { user: { isBlocked: true } } }),
      this.prisma.hostProfile.count({ where: { isVerified: false } }),
    ]);

    return {
      totalHosts,
      activeHosts,
      blockedHosts,
      pendingHosts,
    };
  }

  async approveHost(id: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { id },
    });
    if (!hostProfile) {
      throw new NotFoundException('Host profile not found');
    }

    const updated = await this.prisma.hostProfile.update({
      where: { id },
      data: { isVerified: true },
    });

    try {
      await this.prisma.notification.create({
        data: {
          userId: hostProfile.userId,
          type: 'SYSTEM',
          title: 'Host Application Approved!',
          message: `Congratulations! Your host operator application for "${hostProfile.businessName}" has been approved. You can now create competitions and launch draws.`,
          link: '/dashboard/host',
        },
      });
    } catch (e) {
      // Non-blocking notification
    }

    return updated;
  }

  async rejectHost(id: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { id },
    });
    if (!hostProfile) {
      throw new NotFoundException('Host profile not found');
    }

    return this.prisma.$transaction(async (tx) => {
      // Delete subscriptions if any exist
      await tx.hostSubscription.deleteMany({
        where: { hostId: id },
      });
      // Delete host profile
      await tx.hostProfile.delete({
        where: { id },
      });
      // Reset user role to CLIENT
      await tx.user.update({
        where: { id: hostProfile.userId },
        data: { role: 'CLIENT' },
      });
    });
  }
}

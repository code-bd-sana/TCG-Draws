import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getMySubscription(hostId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!host) return null;

    let sub = await this.prisma.hostSubscription.findFirst({
      where: { hostId: host.id, status: 'ACTIVE' },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      sub = await this.prisma.hostSubscription.findFirst({
        where: { hostId: host.id },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!sub) {
      let freePlan = await this.prisma.subscriptionPlan.findFirst({
        where: { name: { equals: 'Free', mode: 'insensitive' } },
      });
      if (!freePlan) {
        freePlan = await this.prisma.subscriptionPlan.create({
          data: {
            id: 'free',
            name: 'Free',
            price: 0,
            durationDays: 365,
            maxActiveRaffles: 1,
          },
        });
      }
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (freePlan.durationDays || 365));

      sub = await this.prisma.hostSubscription.create({
        data: {
          hostId: host.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
        include: { plan: true },
      });
    }

    const transaction = sub ? await this.prisma.transaction.findFirst({
      where: { relatedEntityId: sub.id, type: 'SUBSCRIPTION_FEE' },
      orderBy: { createdAt: 'desc' },
    }) : null;

    return { ...sub, transaction };
  }

  async cancelSubscription(hostId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!host) throw new BadRequestException('Host profile not found');

    const activeSub = await this.prisma.hostSubscription.findFirst({
      where: { hostId: host.id, status: 'ACTIVE' },
    });

    if (!activeSub) {
      throw new BadRequestException('No active subscription found to cancel');
    }

    return this.prisma.hostSubscription.update({
      where: { id: activeSub.id },
      data: { status: 'CANCELLED' },
    });
  }

  async getMyBillingHistory(hostId: string) {
    const host = await this.prisma.hostProfile.findFirst({
      where: {
        OR: [{ userId: hostId }, { id: hostId }],
      },
    });

    if (host) {
      // Auto-reconcile active paid subscriptions that lack a recorded Transaction
      const activePaidSubs = await this.prisma.hostSubscription.findMany({
        where: {
          hostId: host.id,
          status: 'ACTIVE',
          plan: {
            price: { gt: 0 },
          },
        },
        include: { plan: true },
      });

      for (const sub of activePaidSubs) {
        const existingTx = await this.prisma.transaction.findFirst({
          where: {
            OR: [
              { relatedEntityId: sub.id },
              { userId: host.userId, type: 'SUBSCRIPTION_FEE', amount: sub.plan.price },
            ],
          },
        });

        if (!existingTx) {
          await this.prisma.transaction.create({
            data: {
              userId: host.userId,
              type: 'SUBSCRIPTION_FEE',
              amount: sub.plan.price,
              status: 'COMPLETED',
              paymentGateway: 'CASHFLOWS',
              relatedEntityId: sub.id,
              gatewayTransactionId: `AUTO_REC_${sub.id.substring(0, 8)}`,
              createdAt: sub.createdAt,
            },
          });
        }
      }
    }

    return this.prisma.transaction.findMany({
      where: {
        userId: host?.userId || hostId,
        type: 'SUBSCRIPTION_FEE',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllSubscriptions(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.HostSubscriptionWhereInput = {};

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { host: { businessName: { contains: q, mode: 'insensitive' } } },
        { host: { user: { firstName: { contains: q, mode: 'insensitive' } } } },
        { host: { user: { lastName: { contains: q, mode: 'insensitive' } } } },
        { host: { user: { email: { contains: q, mode: 'insensitive' } } } },
        { plan: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [subscriptions, total] = await Promise.all([
      this.prisma.hostSubscription.findMany({
        where,
        skip,
        take: limit,
        include: {
          plan: true,
          host: {
            include: { user: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.hostSubscription.count({ where }),
    ]);

    // Efficient single-query lookup for transactions to prevent N+1 queries
    const subIds = subscriptions.map((s) => s.id);
    const transactions = subIds.length > 0
      ? await this.prisma.transaction.findMany({
          where: {
            relatedEntityId: { in: subIds },
            type: 'SUBSCRIPTION_FEE',
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    const txMap = new Map<string, (typeof transactions)[0]>();
    for (const tx of transactions) {
      if (tx.relatedEntityId && !txMap.has(tx.relatedEntityId)) {
        txMap.set(tx.relatedEntityId, tx);
      }
    }

    const formattedSubscriptions = subscriptions.map((sub) => ({
      ...sub,
      transaction: txMap.get(sub.id) || null,
    }));

    return {
      subscriptions: formattedSubscriptions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getAdminStats() {
    // Get all active subscriptions
    const activeSubscriptions = await this.prisma.hostSubscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true },
    });

    let mrr = 0;
    const planCounts: Record<string, number> = {};
    const planNames: Record<string, string> = {};

    activeSubscriptions.forEach((sub) => {
      // Calculate MRR (assuming price is per month)
      if (sub.plan && sub.plan.price) {
        mrr += Number(sub.plan.price);
      }

      // Count plans
      const planId = sub.planId;
      if (!planCounts[planId]) {
        planCounts[planId] = 0;
        planNames[planId] = sub.plan?.name || 'Unknown';
      }
      planCounts[planId]++;
    });

    // Format plan distribution for the pie chart
    const totalActive = activeSubscriptions.length;
    const planDistribution = Object.keys(planCounts).map((planId) => {
      const count = planCounts[planId];
      const percentage =
        totalActive > 0 ? Math.round((count / totalActive) * 100) : 0;
      return {
        name: planNames[planId],
        value: count,
        percentage: `${percentage}%`,
      };
    });

    return {
      mrr,
      totalActive,
      planDistribution,
    };
  }
}

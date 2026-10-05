import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostsService {
  constructor(private prisma: PrismaService) {}

  async findAllVerifiedPublic() {
    const hosts = await this.prisma.hostProfile.findMany({
      where: {
        isVerified: true,
        user: {
          isBlocked: false,
          role: 'HOST',
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isBlocked: true,
          },
        },
        _count: {
          select: {
            raffles: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return hosts.map((host) => ({
      id: host.id,
      slug: host.slug || host.id,
      name: host.businessName,
      logo: host.user.avatarUrl,
      description: host.bio || null,
      category: null,
      competitionCount: host._count.raffles,
      averageRating: 5.0, // Mocked for now
      totalReviews: 12, // Mocked for now
      isVerified: host.isVerified,
      isBlocked: host.user.isBlocked,
    }));
  }

  async findOnePublic(slug: string) {
    const host = await this.prisma.hostProfile.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isVerified: true,
        user: {
          isBlocked: false,
          role: 'HOST',
        },
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            isBlocked: true,
          },
        },
        raffles: {
          where: {
            status: {
              in: ['ACTIVE', 'ENDED'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            instantWins: true,
          },
        },
        _count: {
          select: {
            raffles: {
              where: {
                status: 'ACTIVE',
              },
            },
          },
        },
      },
    });

    if (!host) {
      throw new NotFoundException('Host not found or is unavailable');
    }

    return {
      id: host.id,
      slug: host.slug || host.id,
      name: host.businessName,
      logo: host.user.avatarUrl,
      bio: host.bio || null,
      isVerified: host.isVerified,
      isBlocked: host.user.isBlocked,
      drawsHosted: host._count.raffles,
      rating: null,
      memberSince: host.createdAt.getFullYear(),
      raffles: host.raffles.map((raffle) => {
        // Format endDate as "Ends in Xd Yh" or a clean date string
        const end = new Date(raffle.endDate);
        const isPast = end.getTime() <= Date.now() || raffle.status === 'ENDED' || raffle.status === 'COMPLETED' || raffle.status === 'CANCELLED';
        const formattedEndDate = end.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        return {
          id: raffle.id,
          slug: raffle.slug || raffle.id,
          title: raffle.title,
          description: raffle.description,
          image: raffle.mainImage || '/images/default-raffle.png',
          ticketPrice: raffle.pricePerTicket
            ? Number(raffle.pricePerTicket.toString())
            : 0,
          totalTickets: raffle.totalTickets,
          soldTickets: raffle.ticketsSold,
          rawEndDate: raffle.endDate,
          endDate: isPast ? 'Draw Closed' : `Ends ${formattedEndDate}`,
          status: isPast ? 'ENDED' : raffle.status, // ACTIVE, ENDED, etc.
          category: (raffle as any).category?.slug || 'drivers',
          isInstantWin: raffle.instantWins?.length > 0,
          instantWinsCount: raffle.instantWins?.length || 0,
        };
      }),
    };
  }

  async getHostProfileByUserId(userId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });
    if (!host) {
      throw new NotFoundException('Host profile not found for this user');
    }
    return host;
  }

  async getHostCommissionRate(hostId: string): Promise<number> {
    const sub = await this.prisma.hostSubscription.findFirst({
      where: {
        OR: [
          { hostId },
          { host: { userId: hostId } },
        ],
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub || !sub.plan) {
      return 15.0;
    }

    const planName = (sub.plan.name || '').toLowerCase();
    if (planName.includes('premium') || planName.includes('pro')) {
      return 10.0;
    }

    return 15.0;
  }

  async getWalletStats(userId: string) {
    const host = await this.getHostProfileByUserId(userId);
    const commissionRate = await this.getHostCommissionRate(host.id);

    // Sum pending withdrawals
    const pendingWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        hostId: host.id,
        status: 'PENDING',
      },
      _sum: {
        amount: true,
      },
    });

    // Sum completed withdrawals for fees paid (using amount to support all Prisma Client versions)
    const completedWithdrawals = await this.prisma.withdrawal.aggregate({
      where: {
        hostId: host.id,
        status: { in: ['COMPLETED', 'APPROVED', 'PENDING'] },
      },
      _sum: {
        amount: true,
      },
    });

    // Sum total ticket sales across host raffles
    const raffles = await this.prisma.raffle.findMany({
      where: { hostId: host.id },
      select: {
        pricePerTicket: true,
        ticketsSold: true,
      },
    });

    const totalLifetimeEarnings = raffles.reduce((acc, r) => {
      return acc + Number(r.pricePerTicket) * r.ticketsSold;
    }, 0);

    const availableBalance = Number(host.walletBalance);
    const pendingClearance = Number(pendingWithdrawals._sum?.amount || 0);
    const totalFeesPaid = Number(completedWithdrawals._sum?.amount || 0) * (commissionRate / 100);

    return {
      availableBalance,
      pendingClearance,
      totalLifetimeEarnings,
      totalFeesPaid,
      commissionRate,
    };
  }

  async requestWithdrawal(
    userId: string,
    dto: {
      amount: number;
      payoutMethod: string;
      payoutDetails: Record<string, any>;
    },
  ) {
    const host = await this.getHostProfileByUserId(userId);
    const currentBalance = Number(host.walletBalance);

    if (dto.payoutMethod !== 'BANK_TRANSFER') {
      throw new BadRequestException('Payout method must be BANK_TRANSFER');
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Withdrawal amount must be greater than 0');
    }

    if (dto.amount > currentBalance) {
      throw new BadRequestException(
        `Insufficient wallet balance. You have £${currentBalance.toFixed(2)} available.`,
      );
    }

    const commissionRate = await this.getHostCommissionRate(host.id);
    const feeAmount = dto.amount * (commissionRate / 100);
    const netAmount = dto.amount - feeAmount;

    const result = await this.prisma.$transaction(async (tx) => {
      // Deduct requested amount from host's wallet balance
      await tx.hostProfile.update({
        where: { id: host.id },
        data: {
          walletBalance: {
            decrement: dto.amount,
          },
        },
      });

      // Create Withdrawal record
      const withdrawalData: any = {
        hostId: host.id,
        amount: dto.amount,
        feeAmount: feeAmount,
        netAmount: netAmount,
        payoutMethod: dto.payoutMethod,
        payoutDetails: JSON.stringify(dto.payoutDetails),
        status: 'PENDING',
      };

      const withdrawal = await tx.withdrawal.create({
        data: withdrawalData,
      });

      // Log transaction
      await tx.transaction.create({
        data: {
          userId,
          type: 'HOST_WITHDRAWAL',
          amount: dto.amount,
          status: 'PENDING',
          relatedEntityId: withdrawal.id,
        },
      });

      return withdrawal;
    });

    const resObj = result as any;
    return {
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: result.id,
        grossAmount: Number(result.amount),
        feeAmount: Number(resObj.feeAmount != null ? resObj.feeAmount : Number(result.amount) * (commissionRate / 100)),
        feePercent: commissionRate,
        netAmount: Number(resObj.netAmount != null ? resObj.netAmount : Number(result.amount) * ((100 - commissionRate) / 100)),
        payoutMethod: result.payoutMethod,
        status: result.status,
        createdAt: result.createdAt,
      },
    };
  }

  async getWithdrawalsHistory(userId: string) {
    const host = await this.getHostProfileByUserId(userId);
    const commissionRate = await this.getHostCommissionRate(host.id);

    const withdrawals = await this.prisma.withdrawal.findMany({
      where: { hostId: host.id },
      orderBy: { createdAt: 'desc' },
    });

    return withdrawals.map((w) => {
      const wObj = w as any;
      const grossAmount = Number(w.amount);
      const feeDeducted = Number(wObj.feeAmount != null ? wObj.feeAmount : grossAmount * (commissionRate / 100));
      const netAmount = Number(wObj.netAmount != null ? wObj.netAmount : grossAmount - feeDeducted);
      const feePercent = grossAmount > 0 && wObj.feeAmount != null
        ? Math.round((Number(wObj.feeAmount) / grossAmount) * 100)
        : commissionRate;

      let parsedDetails = {};
      try {
        if (w.payoutDetails) parsedDetails = JSON.parse(w.payoutDetails);
      } catch (e) {
        parsedDetails = { raw: w.payoutDetails };
      }

      return {
        id: w.id,
        date: new Date(w.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        grossAmount,
        feeDeducted,
        feePercent,
        netAmount,
        method: w.payoutMethod || 'Bank Transfer',
        status:
          w.status === 'COMPLETED'
            ? 'Paid'
            : w.status === 'PENDING'
              ? 'Processing'
              : w.status,
        referenceId: `WD-${w.id.substring(0, 8).toUpperCase()}`,
        payoutDetails: parsedDetails,
        adminNotes: w.adminNotes,
      };
    });
  }

  async getHostDashboardOverview(userId: string) {
    const host = await this.getHostProfileByUserId(userId);

    // Fetch all host raffles
    const hostRaffles = await this.prisma.raffle.findMany({
      where: { hostId: host.id },
      orderBy: { createdAt: 'desc' },
      include: {
        instantWins: true,
        _count: {
          select: { tickets: true, winners: true },
        },
      },
    });

    const activeRaffles = hostRaffles.filter((r) => r.status === 'ACTIVE');
    const totalTicketsSold = hostRaffles.reduce((sum, r) => sum + r.ticketsSold, 0);

    const totalGrossRevenue = hostRaffles.reduce(
      (sum, r) => sum + Number(r.pricePerTicket) * r.ticketsSold,
      0,
    );
    const commissionRate = await this.getHostCommissionRate(host.id);
    const totalNetRevenue = totalGrossRevenue * ((100 - commissionRate) / 100);

    const totalWinnersCount = await this.prisma.winner.count({
      where: { raffle: { hostId: host.id } },
    });

    // Recent Activity / Ticket Sales
    const recentTickets = await this.prisma.ticket.findMany({
      where: { raffle: { hostId: host.id } },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        raffle: { select: { title: true, pricePerTicket: true } },
      },
    });

    const recentActivity = recentTickets.map((t) => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      raffleTitle: t.raffle?.title || 'Golf Competition',
      buyerName: `${t.user?.firstName || 'User'} ${t.user?.lastName || ''}`.trim() || t.user?.email || 'Anonymous Client',
      amount: Number(t.raffle?.pricePerTicket || 0),
      createdAt: t.createdAt,
    }));

    // Formatted Active Raffles for UI
    const formattedActiveRaffles = activeRaffles.map((r) => {
      const percentageSold = r.totalTickets > 0 
        ? Math.min(100, Math.round((r.ticketsSold / r.totalTickets) * 100)) 
        : 0;

      return {
        id: r.id,
        slug: r.slug || r.id,
        title: r.title,
        image: r.mainImage || '/images/default-raffle.png',
        ticketPrice: Number(r.pricePerTicket),
        totalTickets: r.totalTickets,
        ticketsSold: r.ticketsSold,
        percentageSold,
        endDate: r.endDate,
        status: r.status,
        revenue: Number(r.pricePerTicket) * r.ticketsSold,
      };
    });

    // Upcoming Draws (Active or Ended raffles closest to expiry)
    const upcomingDraws = hostRaffles
      .filter((r) => r.status === 'ACTIVE' || r.status === 'ENDED')
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        title: r.title,
        endDate: r.endDate,
        ticketsSold: r.ticketsSold,
        totalTickets: r.totalTickets,
        status: r.status,
      }));

    return {
      kpiStats: {
        totalNetRevenue,
        totalGrossRevenue,
        commissionRate,
        availableBalance: Number(host.walletBalance),
        activeCompetitionsCount: activeRaffles.length,
        totalCompetitionsCount: hostRaffles.length,
        totalTicketsSold,
        totalWinnersCount,
      },
      activeRaffles: formattedActiveRaffles,
      upcomingDraws,
      recentActivity,
    };
  }

  async getSalesAnalytics(userId: string) {
    const host = await this.getHostProfileByUserId(userId);
    const commissionRate = await this.getHostCommissionRate(host.id);
    const netPercentage = 100 - commissionRate;
    const netMultiplier = netPercentage / 100;

    const raffles = await this.prisma.raffle.findMany({
      where: { hostId: host.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalCompetitions = raffles.length;
    const activeCompetitions = raffles.filter((r) => r.status === 'ACTIVE').length;

    let totalTicketsSold = 0;
    let totalGrossRevenue = 0;

    const rafflesBreakdown = raffles.map((raffle) => {
      const price = raffle.pricePerTicket ? Number(raffle.pricePerTicket) : 0;
      const sold = raffle.ticketsSold || 0;
      const gross = sold * price;
      const net = gross * netMultiplier;

      totalTicketsSold += sold;
      totalGrossRevenue += gross;

      return {
        id: raffle.id,
        title: raffle.title,
        image: raffle.mainImage || '/images/default-raffle.png',
        status: raffle.status,
        ticketPrice: price,
        totalTickets: raffle.totalTickets,
        ticketsSold: sold,
        grossRevenue: gross,
        netRevenue: net,
        progressPercentage: raffle.totalTickets > 0 ? Math.round((sold / raffle.totalTickets) * 100) : 0,
        createdAt: raffle.createdAt,
      };
    });

    const totalNetRevenue = totalGrossRevenue * netMultiplier;
    const avgRevenuePerRaffle = totalCompetitions > 0 ? totalGrossRevenue / totalCompetitions : 0;

    // Fetch tickets for sales trend chart (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const raffleIds = raffles.map((r) => r.id);

    let recentTickets: any[] = [];
    if (raffleIds.length > 0) {
      recentTickets = await this.prisma.ticket.findMany({
        where: {
          raffleId: { in: raffleIds },
          createdAt: { gte: sevenDaysAgo },
        },
        include: {
          raffle: {
            select: { pricePerTicket: true },
          },
        },
      });
    }

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const chartMap = new Map<string, { date: string; sales: number; revenue: number }>();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = dayNames[d.getDay()];
      chartMap.set(dayKey, { date: dayKey, sales: 0, revenue: 0 });
    }

    recentTickets.forEach((t) => {
      const dayKey = dayNames[new Date(t.createdAt).getDay()];
      const price = t.raffle?.pricePerTicket ? Number(t.raffle.pricePerTicket) : 0;
      if (chartMap.has(dayKey)) {
        const item = chartMap.get(dayKey)!;
        item.sales += 1;
        item.revenue += price;
      }
    });

    const chartData = Array.from(chartMap.values());

    return {
      commissionRate,
      netPercentage,
      metrics: {
        totalGrossRevenue,
        totalNetRevenue,
        commissionRate,
        netPercentage,
        totalTicketsSold,
        activeCompetitions,
        totalCompetitions,
        avgRevenuePerRaffle,
      },
      chartData,
      raffles: rafflesBreakdown,
    };
  }

  async getPerformanceAnalytics(userId: string, timeframe: string = '1M') {
    const host = await this.getHostProfileByUserId(userId);

    const raffles = await this.prisma.raffle.findMany({
      where: { hostId: host.id },
      orderBy: { createdAt: 'desc' },
    });

    const raffleIds = raffles.map((r) => r.id);

    // 1. Calculate Category Sales Breakdown
    const categoryMap = new Map<string, number>();
    let totalGrossRevenue = 0;

    raffles.forEach((r) => {
      const cat = r.category || 'General';
      const rev = (r.ticketsSold || 0) * (r.pricePerTicket ? Number(r.pricePerTicket) : 0);
      totalGrossRevenue += rev;
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + rev);
    });

    const categorySales = Array.from(categoryMap.entries()).map(([name, value]) => {
      const percentage = totalGrossRevenue > 0 ? Math.round((value / totalGrossRevenue) * 100) : 0;
      return { name, value, percentage };
    });

    // 2. Calculate Top 5 Performing Raffles
    const sortedRaffles = [...raffles].sort((a, b) => {
      const pctA = a.totalTickets > 0 ? a.ticketsSold / a.totalTickets : 0;
      const pctB = b.totalTickets > 0 ? b.ticketsSold / b.totalTickets : 0;
      return pctB - pctA;
    });

    const topRaffles = sortedRaffles.slice(0, 5).map((r) => {
      const pct = r.totalTickets > 0 ? Math.round((r.ticketsSold / r.totalTickets) * 100) : 0;
      return {
        id: r.id,
        name: r.title,
        percentage: pct,
        revenue: (r.ticketsSold || 0) * (r.pricePerTicket ? Number(r.pricePerTicket) : 0),
      };
    });

    // 3. Calculate Revenue Trend based on timeframe
    const now = new Date();
    let startDate = new Date();
    if (timeframe === '7D') startDate.setDate(now.getDate() - 7);
    else if (timeframe === '1M') startDate.setMonth(now.getMonth() - 1);
    else if (timeframe === '3M') startDate.setMonth(now.getMonth() - 3);
    else if (timeframe === '1Y') startDate.setFullYear(now.getFullYear() - 1);
    else startDate.setMonth(now.getMonth() - 1);

    let tickets: any[] = [];
    if (raffleIds.length > 0) {
      tickets = await this.prisma.ticket.findMany({
        where: {
          raffleId: { in: raffleIds },
          createdAt: { gte: startDate },
        },
        include: {
          raffle: {
            select: { pricePerTicket: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });
    }

    const trendMap = new Map<string, number>();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    if (timeframe === '7D') {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        trendMap.set(dayNames[d.getDay()], 0);
      }
      tickets.forEach((t) => {
        const dayKey = dayNames[new Date(t.createdAt).getDay()];
        const price = t.raffle?.pricePerTicket ? Number(t.raffle.pricePerTicket) : 0;
        if (trendMap.has(dayKey)) {
          trendMap.set(dayKey, trendMap.get(dayKey)! + price);
        }
      });
    } else {
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        trendMap.set(monthNames[d.getMonth()], 0);
      }
      tickets.forEach((t) => {
        const monthKey = monthNames[new Date(t.createdAt).getMonth()];
        const price = t.raffle?.pricePerTicket ? Number(t.raffle.pricePerTicket) : 0;
        if (trendMap.has(monthKey)) {
          trendMap.set(monthKey, trendMap.get(monthKey)! + price);
        }
      });
    }

    const revenueTrend = Array.from(trendMap.entries()).map(([month, revenue]) => ({
      month,
      revenue,
    }));

    // 4. Calculate Dynamic Entrant Demographics based on Ticket Buyers
    let entrantTickets: any[] = [];
    if (raffleIds.length > 0) {
      entrantTickets = await this.prisma.ticket.findMany({
        where: {
          raffleId: { in: raffleIds },
        },
        include: {
          user: {
            select: {
              location: true,
              address: true,
            },
          },
        },
      });
    }

    const regionCounts = new Map<string, number>();
    let totalEntrantsWithLocation = 0;

    entrantTickets.forEach((t) => {
      const loc = `${t.user?.location || ''} ${t.user?.address || ''}`.toLowerCase();
      let region = 'England (London & South East)';

      if (loc.includes('london') || loc.includes('kent') || loc.includes('surrey') || loc.includes('sussex') || loc.includes('essex') || loc.includes('south east')) {
        region = 'England (London & South East)';
      } else if (loc.includes('manchester') || loc.includes('birmingham') || loc.includes('leeds') || loc.includes('liverpool') || loc.includes('midlands') || loc.includes('north')) {
        region = 'England (Midlands & North)';
      } else if (loc.includes('scotland') || loc.includes('glasgow') || loc.includes('edinburgh') || loc.includes('aberdeen')) {
        region = 'Scotland';
      } else if (loc.includes('wales') || loc.includes('cardiff') || loc.includes('belfast') || loc.includes('ireland')) {
        region = 'Wales & Northern Ireland';
      } else if (t.user?.location?.trim()) {
        const cleanLoc = t.user.location.trim();
        region = cleanLoc.length > 28 ? cleanLoc.substring(0, 28) + '...' : cleanLoc;
      }

      regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
      totalEntrantsWithLocation++;
    });

    let demographics: Array<{ region: string; percentage: number }> = [];

    if (totalEntrantsWithLocation > 0) {
      demographics = Array.from(regionCounts.entries())
        .map(([region, count]) => ({
          region,
          percentage: Math.round((count / totalEntrantsWithLocation) * 100),
        }))
        .sort((a, b) => b.percentage - a.percentage);
    } else {
      demographics = [
        { region: 'England (London & South East)', percentage: 0 },
        { region: 'England (Midlands & North)', percentage: 0 },
        { region: 'Scotland', percentage: 0 },
        { region: 'Wales & Northern Ireland', percentage: 0 },
      ];
    }

    return {
      timeframe,
      revenueTrend,
      categorySales,
      topRaffles,
      demographics,
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async getOverviewStats() {
    const [totalUsers, activeHosts, liveRaffles, revenueAggregate, awaitingReviewCount, awaitingReviewList] = await Promise.all([
      // Total users count
      this.prisma.user.count(),
      // Active verified unblocked hosts count
      this.prisma.hostProfile.count({
        where: { isVerified: true, user: { isBlocked: false } },
      }),
      // Live active raffles count
      this.prisma.raffle.count({
        where: { status: 'ACTIVE' },
      }),
      // Total platform revenue sum
      this.prisma.transaction.aggregate({
        where: { status: 'COMPLETED', type: 'TICKET_PURCHASE' },
        _sum: { amount: true },
      }),
      // Count of raffles awaiting admin review
      this.prisma.raffle.count({
        where: { status: 'PENDING_APPROVAL' },
      }),
      // List of raffles awaiting review
      this.prisma.raffle.findMany({
        where: { status: 'PENDING_APPROVAL' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          host: {
            select: {
              businessName: true,
            },
          },
        },
      }),
    ]);

    const totalRevenue = Number(revenueAggregate._sum.amount) || 0;

    // Fetch dynamic feeds to construct Recent Activity timeline
    const [recentHosts, recentUsers, recentRaffles, recentWithdrawals, recentTransactions] = await Promise.all([
      this.prisma.hostProfile.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.raffle.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.withdrawal.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.transaction.findMany({
        where: { type: 'TICKET_PURCHASE' },
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const activities = [
      ...recentHosts.map((h) => ({
        text: `New host registered — ${h.businessName}`,
        createdAt: h.createdAt,
        highlight: false,
        alert: false,
      })),
      ...recentUsers.map((u) => ({
        text: `New user registered — ${u.email}`,
        createdAt: u.createdAt,
        highlight: false,
        alert: false,
      })),
      ...recentRaffles.map((r) => ({
        text: r.status === 'ACTIVE' ? `Raffle approved — ${r.title}` : `New raffle submitted — ${r.title}`,
        createdAt: r.createdAt,
        highlight: false,
        alert: r.status === 'CANCELLED',
      })),
      ...recentWithdrawals.map((w) => ({
        text: `Withdrawal request — £${Number(w.amount).toFixed(2)} (${w.status})`,
        createdAt: w.createdAt,
        highlight: w.status === 'PENDING',
        alert: w.status === 'FAILED',
      })),
      ...recentTransactions.map((t) => ({
        text: `Ticket purchased — £${Number(t.amount).toFixed(2)}`,
        createdAt: t.createdAt,
        highlight: false,
        alert: false,
      })),
    ];

    // Sort all events by date descending and return top 5
    const recentActivity = activities
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)
      .map((act) => ({
        text: act.text,
        time: this.formatRelativeTime(act.createdAt),
        highlight: act.highlight,
        alert: act.alert,
      }));

    // Query hosts with raffles to compute dynamic Top Hosts
    const allHosts = await this.prisma.hostProfile.findMany({
      include: {
        raffles: {
          select: {
            ticketsSold: true,
            pricePerTicket: true,
          },
        },
      },
    });

    const topHosts = allHosts
      .map((h) => {
        const revenue = h.raffles.reduce(
          (acc, r) => acc + (r.ticketsSold || 0) * (r.pricePerTicket ? Number(r.pricePerTicket) : 0),
          0,
        );
        const initials =
          h.businessName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'HP';
        return {
          id: h.id,
          name: h.businessName,
          revenue: `£${revenue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          rawRevenue: revenue,
          initials,
        };
      })
      .sort((a, b) => b.rawRevenue - a.rawRevenue)
      .slice(0, 5)
      .map((h, index) => ({
        rank: index + 1,
        id: h.id,
        name: h.name,
        revenue: h.revenue,
        initials: h.initials,
      }));

    return {
      stats: {
        totalUsers,
        activeHosts,
        liveRaffles,
        totalRevenue,
      },
      topHosts,
      awaitingReview: {
        count: awaitingReviewCount,
        list: awaitingReviewList.map((raffle) => ({
          id: raffle.id,
          title: raffle.title,
          sub: `Submitted by ${raffle.host.businessName}`,
          icon: raffle.title.substring(0, 2).toUpperCase(),
        })),
      },
      recentActivity,
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  }

  async getSystemLogs(params: { page?: number; limit?: number; search?: string; filter?: string }) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const search = params.search?.toLowerCase() || '';
    const filter = params.filter || 'All';

    // Query collections
    const [users, hosts, raffles, transactions, withdrawals, winners] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.hostProfile.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.raffle.findMany({
        include: { host: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.transaction.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.withdrawal.findMany({
        include: { host: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      this.prisma.winner.findMany({
        include: { user: true, raffle: true, ticket: true },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
    ]);

    const logs: any[] = [];

    // Map Users to Logs
    users.forEach((u) => {
      logs.push({
        id: `usr-${u.id}`,
        timestamp: u.createdAt,
        actor: {
          name: u.email,
          initials: u.email.substring(0, 2).toUpperCase(),
          type: u.role === 'ADMIN' ? 'admin' : 'user',
        },
        description: `User account created: ${u.email}`,
        ip: '127.0.0.1',
        status: 'Success',
      });

      if (u.isBlocked) {
        logs.push({
          id: `usr-blocked-${u.id}`,
          timestamp: u.updatedAt || u.createdAt,
          actor: {
            name: 'System',
            initials: 'SY',
            type: 'system',
          },
          description: `User account suspended: ${u.email}`,
          ip: '—',
          status: 'Success',
        });
      }
    });

    // Map Hosts to Logs
    hosts.forEach((h) => {
      logs.push({
        id: `hst-${h.id}`,
        timestamp: h.createdAt,
        actor: {
          name: h.user?.email || 'New Host',
          initials: h.businessName.substring(0, 2).toUpperCase(),
          type: 'user',
        },
        description: `Host profile registered: ${h.businessName}`,
        ip: '127.0.0.1',
        status: 'Success',
      });
    });

    // Map Raffles to Logs
    raffles.forEach((r) => {
      logs.push({
        id: `raf-${r.id}`,
        timestamp: r.createdAt,
        actor: {
          name: r.host?.businessName || 'Host',
          initials: r.title.substring(0, 2).toUpperCase(),
          type: 'user',
        },
        description: `Raffle created: '${r.title}' (Status: ${r.status})`,
        ip: '127.0.0.1',
        status: 'Success',
      });

      if (r.status === 'ACTIVE') {
        logs.push({
          id: `raf-approved-${r.id}`,
          timestamp: r.updatedAt || r.createdAt,
          actor: {
            name: 'Admin',
            initials: 'AD',
            type: 'admin',
          },
          description: `Raffle approved & published: '${r.title}'`,
          ip: '127.0.0.1',
          status: 'Success',
        });
      }
    });

    // Map Transactions to Logs
    transactions.forEach((t) => {
      const isRefund = t.type === 'REFUND';
      logs.push({
        id: `tx-${t.id}`,
        timestamp: t.createdAt,
        actor: {
          name: t.user?.email || 'Customer',
          initials: 'TX',
          type: isRefund ? 'admin' : 'user',
        },
        description: isRefund
          ? `Refund processed for transaction: £${Number(t.amount).toFixed(2)}`
          : `Ticket purchased successfully: £${Number(t.amount).toFixed(2)}`,
        ip: '127.0.0.1',
        status: t.status === 'COMPLETED' ? 'Success' : 'Failed',
      });
    });

    // Map Withdrawals to Logs
    withdrawals.forEach((w) => {
      logs.push({
        id: `wd-${w.id}`,
        timestamp: w.createdAt,
        actor: {
          name: w.host?.businessName || 'Host',
          initials: 'WD',
          type: 'user',
        },
        description: `Withdrawal request submitted: £${Number(w.amount).toFixed(2)}`,
        ip: '127.0.0.1',
        status: 'Success',
      });

      if (w.status === 'COMPLETED' || w.status === 'REJECTED') {
        logs.push({
          id: `wd-status-${w.id}`,
          timestamp: w.updatedAt || w.createdAt,
          actor: {
            name: 'Admin',
            initials: 'AD',
            type: 'admin',
          },
          description: `Withdrawal request ${w.status.toLowerCase()}: £${Number(w.amount).toFixed(2)}`,
          ip: '127.0.0.1',
          status: 'Success',
        });
      }
    });

    // Map Winners to System Audit Logs
    winners.forEach((w) => {
      const winnerName = w.user ? `${w.user.firstName || ''} ${w.user.lastName || ''}`.trim() || w.user.email : 'Winner';
      logs.push({
        id: `win-${w.id}`,
        timestamp: w.createdAt,
        actor: {
          name: 'System Engine',
          initials: 'SE',
          type: 'system',
        },
        description: `Winner declared for '${w.raffle?.title || 'Competition'}': Ticket #${w.ticket?.ticketNumber || 'N/A'} (${winnerName})`,
        ip: '127.0.0.1',
        status: 'Success',
      });
    });

    // Filter list
    let filteredLogs = logs;

    if (search) {
      filteredLogs = filteredLogs.filter(
        (l) =>
          l.description.toLowerCase().includes(search) ||
          l.actor.name.toLowerCase().includes(search)
      );
    }

    if (filter !== 'All') {
      if (filter === 'User Actions') {
        filteredLogs = filteredLogs.filter((l) => l.actor.type === 'user');
      } else if (filter === 'Admin Actions') {
        filteredLogs = filteredLogs.filter((l) => l.actor.type === 'admin');
      } else if (filter === 'System Events') {
        filteredLogs = filteredLogs.filter((l) => l.actor.type === 'system');
      } else if (filter === 'Errors') {
        filteredLogs = filteredLogs.filter((l) => l.status === 'Failed');
      }
    }

    // Sort by timestamp desc
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Paginate
    const total = filteredLogs.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = filteredLogs.slice((page - 1) * limit, page * limit);

    return {
      logs: paginated.map((l) => ({
        ...l,
        timestamp: l.timestamp.toISOString(),
      })),
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async getReports(timeFilter: string = '3M') {
    const now = new Date();
    let startDate = new Date();

    switch (timeFilter) {
      case '7D':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1M':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case '3M':
      default:
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    const [
      transactions,
      users,
      raffles,
      hosts,
      allUsersWithLocation,
    ] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          status: 'COMPLETED',
          type: 'TICKET_PURCHASE',
          createdAt: { gte: startDate },
        },
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.user.findMany({
        select: {
          createdAt: true,
          location: true,
        },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.raffle.findMany({
        select: {
          id: true,
          title: true,
          category: true,
          ticketsSold: true,
          pricePerTicket: true,
          host: {
            select: {
              businessName: true,
            },
          },
        },
        orderBy: { ticketsSold: 'desc' },
      }),
      this.prisma.hostProfile.findMany({
        include: {
          raffles: {
            select: {
              ticketsSold: true,
              pricePerTicket: true,
            },
          },
        },
      }),
      this.prisma.user.findMany({
        select: {
          location: true,
        },
      }),
    ]);

    // 1. Revenue Trend
    const revenueMap = new Map<string, number>();

    if (timeFilter === '7D') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString('en-US', { weekday: 'short' });
        revenueMap.set(label, 0);
      }
      transactions.forEach((tx) => {
        const label = new Date(tx.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
        if (revenueMap.has(label)) {
          revenueMap.set(label, revenueMap.get(label)! + Number(tx.amount));
        }
      });
    } else {
      transactions.forEach((tx) => {
        const label = new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short' });
        revenueMap.set(label, (revenueMap.get(label) || 0) + Number(tx.amount));
      });
    }

    const revenueTrend = Array.from(revenueMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value * 100) / 100,
    }));

    if (revenueTrend.length === 0) {
      const monthNames = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
      const currentMonth = now.getMonth();
      for (let i = 5; i >= 0; i--) {
        const idx = (currentMonth - i + 12) % 12;
        revenueTrend.push({ name: monthNames[idx], value: 0 });
      }
    }

    // 2. Sales by Category
    const categoryTotals = new Map<string, number>();
    raffles.forEach((r) => {
      const cat = r.category || 'General';
      const revenue = r.ticketsSold * Number(r.pricePerTicket);
      categoryTotals.set(cat, (categoryTotals.get(cat) || 0) + revenue);
    });

    const totalCategoryRev = Array.from(categoryTotals.values()).reduce((a, b) => a + b, 0);
    const colors = ['#0B4D35', '#15803D', '#16A34A', '#4ADE80', '#86EFAC'];
    let colorIdx = 0;

    let categorySales = Array.from(categoryTotals.entries()).map(([name, val]) => {
      const percent = totalCategoryRev > 0 ? Math.round((val / totalCategoryRev) * 100) : 0;
      const color = colors[colorIdx % colors.length];
      colorIdx++;
      return { name, value: percent, color };
    });

    // 3. Most Popular Competitions
    const popularCompetitions = raffles.slice(0, 5).map((r) => ({
      name: r.title,
      value: r.ticketsSold,
    }));

    // 4. User Growth Over Time
    const userGrowthMap = new Map<string, number>();
    let cumulativeUsers = 0;

    users.forEach((u) => {
      const label = new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short' });
      userGrowthMap.set(label, (userGrowthMap.get(label) || 0) + 1);
    });

    const userGrowth: { name: string; users: number }[] = [];
    userGrowthMap.forEach((count, month) => {
      cumulativeUsers += count;
      userGrowth.push({ name: month, users: cumulativeUsers });
    });

    // Monthly User & Host Growth (last 6 months) for Growth Chart
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const growthData: { name: string; Users: number; Hosts: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIdx = d.getMonth();
      const mYear = d.getFullYear();
      const mLabel = monthNames[mIdx];

      const userCount = users.filter((u) => {
        const ud = new Date(u.createdAt);
        return ud.getMonth() === mIdx && ud.getFullYear() === mYear;
      }).length;

      const hostCount = hosts.filter((h) => {
        const hd = new Date(h.createdAt);
        return hd.getMonth() === mIdx && hd.getFullYear() === mYear;
      }).length;

      growthData.push({
        name: mLabel,
        Users: userCount,
        Hosts: hostCount,
      });
    }

    // 5. Host Performance
    const hostPerformanceData = hosts.map((h) => {
      const totalTicketsSold = h.raffles.reduce((acc, r) => acc + r.ticketsSold, 0);
      return {
        name: h.businessName,
        ticketsSold: totalTicketsSold,
      };
    });

    const maxTickets = Math.max(...hostPerformanceData.map((h) => h.ticketsSold), 1);
    const hostPerformance = hostPerformanceData.slice(0, 5).map((h) => ({
      name: h.name,
      percent: Math.min(100, Math.max(0, Math.round((h.ticketsSold / maxTickets) * 100))),
    }));

    // 6. Geographic Distribution (only actual provided user locations)
    const locationCounts = new Map<string, number>();
    let totalWithLoc = 0;
    allUsersWithLocation.forEach((u) => {
      if (u.location && u.location.trim()) {
        const loc = u.location.trim();
        locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
        totalWithLoc++;
      }
    });

    const geographicDistribution = Array.from(locationCounts.entries())
      .slice(0, 5)
      .map(([name, count]) => ({
        name,
        value: totalWithLoc > 0 ? Math.round((count / totalWithLoc) * 100) : 0,
      }));

    return {
      revenueTrend,
      growthData,
      categorySales,
      popularCompetitions,
      userGrowth,
      hostPerformance,
      geographicDistribution,
    };
  }
}

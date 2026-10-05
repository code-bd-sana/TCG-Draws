import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { parseUkDateTimeToUtc } from '../common/utils/uk-time.util';

@Injectable()
export class RafflesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(hostId: string, data: any) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        raffles: true,
      },
    });

    if (!hostProfile) {
      throw new BadRequestException('Host profile not found');
    }

    let activeSub = hostProfile.subscriptions[0];
    if (!activeSub) {
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

      activeSub = (await this.prisma.hostSubscription.create({
        data: {
          hostId: hostProfile.id,
          planId: freePlan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
        include: { plan: true },
      })) as any;
    }

    // Check active competitions limit
    if (
      activeSub.plan &&
      activeSub.plan.maxActiveRaffles !== null &&
      activeSub.plan.maxActiveRaffles !== undefined
    ) {
      const activeCount = await this.prisma.raffle.count({
        where: {
          hostId: hostProfile.id,
          status: { in: ['ACTIVE', 'PENDING_APPROVAL', 'APPROVED'] },
        },
      });

      if (activeCount >= activeSub.plan.maxActiveRaffles) {
        throw new ForbiddenException(
          `You have reached the maximum allowed active competitions (${activeSub.plan.maxActiveRaffles}) for your ${activeSub.plan.name} plan. Please upgrade your subscription to create more competitions.`,
        );
      }
    }

    // Restrict Instant Wins for Free Plan
    if (
      data.instantWins &&
      Array.isArray(data.instantWins) &&
      data.instantWins.length > 0 &&
      activeSub.plan &&
      activeSub.plan.name.toLowerCase() === 'free'
    ) {
      throw new ForbiddenException(
        'Instant Wins are only available on Premium and Pro plans. Please upgrade your subscription.',
      );
    }

    // Generate unique slug
    const baseSlug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    const uniqueStr = Math.random().toString(36).substring(2, 8);
    const slug = `${baseSlug}-${uniqueStr}`;

    const startDate = parseUkDateTimeToUtc(data.startDate);
    const endDate = parseUkDateTimeToUtc(data.endDate);

    if (!startDate || isNaN(startDate.getTime())) {
      throw new BadRequestException('A valid start date & time is required (UK Time)');
    }
    if (!endDate || isNaN(endDate.getTime())) {
      throw new BadRequestException('A valid end date & time is required (UK Time)');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('End date & time must be strictly after the start date & time');
    }

    const totalTickets = Number(data.totalTickets) || 0;

    const minTickets =
      data.minTickets !== undefined &&
      data.minTickets !== null &&
      data.minTickets !== ''
        ? Math.max(1, Number(data.minTickets))
        : 1;

    const maxTickets =
      data.maxTickets !== undefined &&
      data.maxTickets !== null &&
      data.maxTickets !== ''
        ? Number(data.maxTickets)
        : null;

    if (maxTickets !== null) {
      if (maxTickets < minTickets) {
        throw new BadRequestException(
          'Maximum tickets per person must be greater than or equal to minimum tickets',
        );
      }
      if (maxTickets > totalTickets) {
        throw new BadRequestException(
          'Maximum tickets per person cannot exceed total tickets',
        );
      }
    }

    const raffle = await this.prisma.raffle.create({
      data: {
        hostId: hostProfile.id,
        title: data.title,
        slug,
        category: data.category || null,
        description: data.description || '',
        prizeName: data.prizeName || null,
        mainPrizeValue:
          data.mainPrizeValue !== undefined &&
          data.mainPrizeValue !== null &&
          data.mainPrizeValue !== ''
            ? Number(data.mainPrizeValue)
            : null,
        pricePerTicket:
          data.pricePerTicket !== undefined && data.pricePerTicket !== null
            ? Number(data.pricePerTicket)
            : Number(data.ticketPrice || 0),
        totalTickets,
        minTickets,
        maxTickets,
        startDate,
        endDate,
        status: 'PENDING_APPROVAL', // Requires admin approval
        isAutoDraw: data.isAutoDraw !== undefined ? data.isAutoDraw : true,
        autoDrawDate:
          data.autoDrawDate !== undefined ? data.autoDrawDate : true,
        autoDrawSoldOut:
          data.autoDrawSoldOut !== undefined ? data.autoDrawSoldOut : false,
      },
    });

    if (
      data.instantWins &&
      Array.isArray(data.instantWins) &&
      data.instantWins.length > 0
    ) {
      // Generate unique random ticket numbers
      const numInstantWins = data.instantWins.length;
      if (numInstantWins <= totalTickets) {
        const uniqueTickets = new Set<number>();
        while (uniqueTickets.size < numInstantWins) {
          uniqueTickets.add(Math.floor(Math.random() * totalTickets) + 1);
        }
        const ticketNumbers = Array.from(uniqueTickets);

        const instantWinsData = data.instantWins.map(
          (iw: any, index: number) => ({
            raffleId: raffle.id,
            ticketNumber: ticketNumbers[index],
            prizeName: iw.prizeName,
            rrpValue: iw.rrpValue ? Number(iw.rrpValue) : null,
            image: iw.image || null,
          }),
        );

        await this.prisma.instantWin.createMany({
          data: instantWinsData,
        });
      }
    }

    // Non-blocking notification dispatches
    try {
      this.notificationsService.notifyUser(
        hostId,
        'RAFFLE',
        'Competition Submitted for Approval',
        `Your competition "${raffle.title}" has been created and submitted for administrator review.`,
        '/dashboard/host/competitions',
        { raffleId: raffle.id },
      );
      this.notificationsService.notifyAdmins(
        'RAFFLE',
        'New Competition Awaiting Approval',
        `Host "${hostProfile.businessName}" submitted a new competition: "${raffle.title}".`,
        '/dashboard/admin/raffles',
        { raffleId: raffle.id, hostId: hostProfile.id },
      );
    } catch (e) {
      // Non-blocking
    }

    return raffle;
  }

  async updateMainImage(id: string, hostId: string, url: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!hostProfile) throw new BadRequestException('Host profile not found');

    const raffle = await this.prisma.raffle.findFirst({
      where: { id, hostId: hostProfile.id },
    });

    if (!raffle) throw new NotFoundException('Raffle not found');

    return this.prisma.raffle.update({
      where: { id },
      data: { mainImage: url },
    });
  }

  async findAllPublic(query: any) {
    const {
      search,
      page = 1,
      limit = 12,
      category,
      statusFilter,
      sort,
      hasInstantWins,
    } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const now = new Date();

    // Base where clause
    const whereClause: any = {
      status: 'ACTIVE',
      host: {
        isVerified: true,
        user: {
          isBlocked: false,
        },
      },
    };

    const andClauses: any[] = [];

    // Category filter (supports exact name, slug, singular/plural, DB Category mapping)
    if (category && category !== 'All' && category !== 'all') {
      const cleanCategory = category.trim();
      const slugified = cleanCategory.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const spaceSeparated = cleanCategory.replace(/-/g, ' ');
      const singular = cleanCategory.endsWith('s') ? cleanCategory.slice(0, -1) : cleanCategory;
      const plural = cleanCategory.endsWith('s') ? cleanCategory : `${cleanCategory}s`;

      const matchedCategories = await this.prisma.category.findMany({
        where: {
          OR: [
            { name: { equals: cleanCategory, mode: 'insensitive' } },
            { slug: { equals: cleanCategory, mode: 'insensitive' } },
            { name: { equals: slugified, mode: 'insensitive' } },
            { slug: { equals: slugified, mode: 'insensitive' } },
            { name: { equals: spaceSeparated, mode: 'insensitive' } },
            { slug: { equals: spaceSeparated, mode: 'insensitive' } },
            { name: { equals: singular, mode: 'insensitive' } },
            { slug: { equals: singular, mode: 'insensitive' } },
            { name: { equals: plural, mode: 'insensitive' } },
            { slug: { equals: plural, mode: 'insensitive' } },
            { name: { contains: singular, mode: 'insensitive' } },
            { slug: { contains: singular, mode: 'insensitive' } },
          ],
        },
      });

      const possibleValues = new Set<string>([
        cleanCategory,
        slugified,
        spaceSeparated,
        singular,
        plural,
      ]);

      for (const cat of matchedCategories) {
        if (cat.name) {
          possibleValues.add(cat.name);
          possibleValues.add(cat.name.toLowerCase());
          if (cat.name.endsWith('s')) {
            possibleValues.add(cat.name.slice(0, -1));
          } else {
            possibleValues.add(`${cat.name}s`);
          }
        }
        if (cat.slug) {
          possibleValues.add(cat.slug);
          possibleValues.add(cat.slug.toLowerCase());
          possibleValues.add(cat.slug.replace(/-/g, ' '));
          if (cat.slug.endsWith('s')) {
            possibleValues.add(cat.slug.slice(0, -1));
          } else {
            possibleValues.add(`${cat.slug}s`);
          }
        }
      }

      const orConditions: any[] = [];
      for (const val of Array.from(possibleValues)) {
        if (!val || val.length < 2) continue;
        orConditions.push({ category: { equals: val, mode: 'insensitive' } });
        orConditions.push({ category: { contains: val, mode: 'insensitive' } });
        orConditions.push({
          AND: [
            { category: null },
            { title: { contains: val, mode: 'insensitive' } },
          ],
        });
      }

      andClauses.push({
        OR: orConditions,
      });
    }

    // Instant Win filter
    if (hasInstantWins === 'true') {
      whereClause.instantWins = {
        some: {}, // At least one instant win attached
      };
    }

    // Status filter - defaults to 'Live' for public visitors so unstarted raffles are strictly excluded
    if (!statusFilter || statusFilter === 'Live') {
      whereClause.startDate = { lte: now };
      whereClause.endDate = { gte: now };
    } else if (statusFilter === 'Upcoming') {
      whereClause.startDate = { gt: now };
    } else if (statusFilter === 'Past') {
      whereClause.endDate = { lt: now };
    } else if (statusFilter === 'All' || statusFilter === 'all') {
      // Explicitly show all without date bounds
    }

    if (search) {
      andClauses.push({
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { host: { businessName: { contains: search, mode: 'insensitive' } } },
          {
            host: {
              user: { firstName: { contains: search, mode: 'insensitive' } },
            },
          },
          {
            host: {
              user: { lastName: { contains: search, mode: 'insensitive' } },
            },
          },
        ],
      });
    }

    if (andClauses.length > 0) {
      whereClause.AND = andClauses;
    }

    // Sort logic
    let orderBy: any = { createdAt: 'desc' }; // default Latest
    if (sort === 'Ending Soon' || sort === 'ending-soon') {
      orderBy = { endDate: 'asc' };
    } else if (sort === 'Price: Low to High' || sort === 'price-asc') {
      orderBy = { pricePerTicket: 'asc' };
    } else if (sort === 'Price: High to Low' || sort === 'price-desc') {
      orderBy = { pricePerTicket: 'desc' };
    } else if (sort === 'Most Popular' || sort === 'popular') {
      orderBy = { ticketsSold: 'desc' };
    } else if (sort === 'featured') {
      orderBy = { createdAt: 'desc' };
    }

    const [raffles, total] = await Promise.all([
      this.prisma.raffle.findMany({
        where: whereClause,
        include: {
          host: { include: { user: true } },
          _count: { select: { instantWins: true, tickets: true } },
        },
        skip,
        take: Number(limit),
        orderBy,
      }),
      this.prisma.raffle.count({ where: whereClause }),
    ]);

    const formattedRaffles = raffles.map((r: any) => ({
      ...r,
      ticketsSold:
        r._count?.tickets !== undefined ? r._count.tickets : (r.ticketsSold || 0),
    }));

    return {
      data: formattedRaffles,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / Number(limit)),
      },
    };
  }

  async getRecentWinners() {
    const winners = await this.prisma.winner.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            location: true,
            avatarUrl: true,
          },
        },
        raffle: {
          select: {
            title: true,
            prizeName: true,
          },
        },
      },
    });

    return winners.map((w) => ({
      id: w.id,
      name: w.user.firstName
        ? `${w.user.firstName} ${w.user.lastName?.charAt(0) || ''}.`
        : 'Anonymous User',
      initials: w.user.firstName
        ? `${w.user.firstName.charAt(0)}${w.user.lastName?.charAt(0) || ''}`
        : 'AU',
      location: w.user.location || '',
      avatarUrl: w.user.avatarUrl,
      prizeWon: w.prizeName || w.raffle.prizeName,
      status: w.deliveryStatus,
      statusText:
        w.deliveryStatus === 'DELIVERED'
          ? 'DELIVERED'
          : w.deliveryStatus === 'SHIPPED'
            ? 'SHIPPED'
            : 'VERIFIED',
      whenWon: w.createdAt.toISOString(),
    }));
  }

  async getPublicWinnersList(query: any) {
    const {
      page = 1,
      limit = 8,
      activeTab = 'all',
      winnerType = 'all',
      sortBy = 'newest',
    } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};
    const now = new Date();

    if (activeTab === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      whereClause.createdAt = { gte: weekAgo };
    } else if (activeTab === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      whereClause.createdAt = { gte: monthStart };
    }

    if (winnerType === 'instant') {
      whereClause.winType = 'INSTANT_WIN';
    } else if (winnerType === 'main_draw') {
      whereClause.winType = 'MAIN_DRAW';
    }

    const orderBy: Prisma.WinnerOrderByWithRelationInput =
      sortBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

    const [winners, total] = await Promise.all([
      this.prisma.winner.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              avatarUrl: true,
              location: true,
            },
          },
          raffle: { select: { title: true, mainImage: true, prizeName: true } },
          ticket: { select: { ticketNumber: true } },
        },
      }),
      this.prisma.winner.count({ where: whereClause }),
    ]);

    const data = winners.map((w) => ({
      id: w.id,
      name: w.user.firstName
        ? `${w.user.firstName} ${w.user.lastName?.charAt(0) || ''}.`
        : 'Anonymous',
      location: w.user.location || '',
      avatar: w.user.avatarUrl || w.raffle?.mainImage || '',
      competitionImage: w.raffle?.mainImage || '',
      winnerType: w.winType === 'INSTANT_WIN' ? 'instant' : 'main_draw',
      initials: w.user.firstName
        ? `${w.user.firstName.charAt(0)}${w.user.lastName?.charAt(0) || ''}`
        : 'AU',
      prizeTitle: w.prizeName || w.raffle?.prizeName || 'Unknown Prize',
      drawDate: w.createdAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      dateString: w.createdAt.toISOString(),
      ticketNumber: w.ticket?.ticketNumber?.toString() || '0000',
      status: w.deliveryStatus?.toLowerCase() || 'pending',
    }));

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / Number(limit)),
      },
    };
  }

  async findOnePublic(slug: string) {
    const raffle = await this.prisma.raffle.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        status: { in: ['ACTIVE', 'ENDED'] },
        host: {
          user: {
            isBlocked: false,
          },
        },
      },
      include: {
        host: { include: { user: true } },
        instantWins: true,
        _count: { select: { tickets: true } },
      },
    });
    if (!raffle) throw new NotFoundException('Raffle not found or is unavailable');

    if (raffle.status === 'ACTIVE' && new Date(raffle.startDate) > new Date()) {
      throw new NotFoundException('This competition has not started yet');
    }
    return {
      ...raffle,
      ticketsSold:
        (raffle as any)._count?.tickets !== undefined
          ? (raffle as any)._count.tickets
          : (raffle.ticketsSold || 0),
    };
  }


  async findHostRaffles(hostId: string, query: any = {}) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!hostProfile)
      return { data: [], meta: { total: 0, page: 1, lastPage: 1 } };

    const { page = 1, limit = 10, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = { hostId: hostProfile.id };

    if (status && status !== 'All') {
      if (status === 'Live') whereClause.status = 'ACTIVE';
      else if (status === 'Pending Review')
        whereClause.status = 'PENDING_APPROVAL';
      else if (status === 'Ended') whereClause.status = 'ENDED';
      else if (status === 'Drafts') whereClause.status = 'DRAFT';
    }

    const [raffles, total] = await Promise.all([
      this.prisma.raffle.findMany({
        where: whereClause,
        include: {
          _count: { select: { tickets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.raffle.count({ where: whereClause }),
    ]);

    const formattedRaffles = raffles.map((r: any) => ({
      ...r,
      ticketsSold:
        r._count?.tickets !== undefined ? r._count.tickets : (r.ticketsSold || 0),
    }));

    return {
      data: formattedRaffles,
      meta: {
        total,
        page: Number(page),
        lastPage: Math.ceil(total / Number(limit)) || 1,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      },
    };
  }

  async findOneHost(id: string, hostId: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!hostProfile) throw new BadRequestException('Host profile not found');

    const raffle = await this.prisma.raffle.findFirst({
      where: { id, hostId: hostProfile.id },
      include: {
        instantWins: true,
      },
    });

    if (!raffle) throw new NotFoundException('Competition not found');
    return raffle;
  }

  async update(id: string, hostId: string, data: any) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!hostProfile) throw new BadRequestException('Host profile not found');

    const raffle = await this.prisma.raffle.findFirst({
      where: { id, hostId: hostProfile.id },
    });

    if (!raffle) throw new NotFoundException('Raffle not found');

    const {
      ticketPrice,
      pricePerTicket,
      id: _id,
      hostId: _hostId,
      ticketsSold: _ticketsSold,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      instantWins: _instantWins,
      tickets: _tickets,
      winners: _winners,
      host: _host,
      ...allowedData
    } = data;

    const updatePayload: any = { ...allowedData };

    const effectiveTicketPrice = pricePerTicket !== undefined ? pricePerTicket : ticketPrice;
    if (effectiveTicketPrice !== undefined && effectiveTicketPrice !== null) {
      updatePayload.pricePerTicket = Number(effectiveTicketPrice);
    }

    if (updatePayload.totalTickets !== undefined && updatePayload.totalTickets !== null) {
      updatePayload.totalTickets = Number(updatePayload.totalTickets);
    }

    if (updatePayload.minTickets !== undefined) {
      updatePayload.minTickets =
        updatePayload.minTickets !== null && updatePayload.minTickets !== ''
          ? Math.max(1, Number(updatePayload.minTickets))
          : 1;
    }

    if (updatePayload.maxTickets !== undefined) {
      updatePayload.maxTickets =
        updatePayload.maxTickets !== null && updatePayload.maxTickets !== ''
          ? Number(updatePayload.maxTickets)
          : null;
    }

    if (updatePayload.mainPrizeValue !== undefined) {
      updatePayload.mainPrizeValue =
        updatePayload.mainPrizeValue !== null && updatePayload.mainPrizeValue !== ''
          ? Number(updatePayload.mainPrizeValue)
          : null;
    }

    const effectiveMin =
      updatePayload.minTickets !== undefined
        ? updatePayload.minTickets
        : (raffle.minTickets || 1);
    const effectiveMax =
      updatePayload.maxTickets !== undefined
        ? updatePayload.maxTickets
        : raffle.maxTickets;
    const effectiveTotal =
      updatePayload.totalTickets !== undefined
        ? updatePayload.totalTickets
        : raffle.totalTickets;

    if (effectiveMax !== null && effectiveMax !== undefined) {
      if (effectiveMax < effectiveMin) {
        throw new BadRequestException(
          'Maximum tickets per person must be greater than or equal to minimum tickets',
        );
      }
      if (effectiveMax > effectiveTotal) {
        throw new BadRequestException(
          'Maximum tickets per person cannot exceed total tickets',
        );
      }
    }

    if (updatePayload.startDate !== undefined) {
      const parsedStart = parseUkDateTimeToUtc(updatePayload.startDate);
      if (!parsedStart || isNaN(parsedStart.getTime())) {
        throw new BadRequestException('A valid start date & time is required (UK Time)');
      }
      updatePayload.startDate = parsedStart;
    }

    if (updatePayload.endDate !== undefined) {
      const parsedEnd = parseUkDateTimeToUtc(updatePayload.endDate);
      if (!parsedEnd || isNaN(parsedEnd.getTime())) {
        throw new BadRequestException('A valid end date & time is required (UK Time)');
      }
      updatePayload.endDate = parsedEnd;
    }

    const checkStart = updatePayload.startDate || raffle.startDate;
    const checkEnd = updatePayload.endDate || raffle.endDate;
    if (checkStart && checkEnd && new Date(checkEnd) <= new Date(checkStart)) {
      throw new BadRequestException('End date & time must be strictly after the start date & time');
    }

    return this.prisma.raffle.update({
      where: { id },
      data: updatePayload,
    });
  }

  async remove(id: string, hostId: string) {
    const hostProfile = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
    });
    if (!hostProfile) throw new BadRequestException('Host profile not found');

    const raffle = await this.prisma.raffle.findFirst({
      where: { id, hostId: hostProfile.id },
    });

    if (!raffle) throw new NotFoundException('Raffle not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.winner.deleteMany({ where: { raffleId: id } });
      await tx.ticket.deleteMany({ where: { raffleId: id } });
      await tx.instantWin.deleteMany({ where: { raffleId: id } });
      return tx.raffle.delete({ where: { id } });
    });
  }

  async approve(id: string) {
    const raffle = await this.prisma.raffle.findUnique({ where: { id } });
    if (!raffle) throw new NotFoundException('Raffle not found');

    return this.prisma.raffle.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });
  }

  async reject(id: string, reason?: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id },
      include: {
        host: {
          include: { user: true },
        },
      },
    });
    if (!raffle) throw new NotFoundException('Raffle not found');

    const updated = await this.prisma.raffle.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    if (raffle.host?.userId) {
      await this.notificationsService.create({
        userId: raffle.host.userId,
        type: 'RAFFLE',
        title: 'Competition Changes Requested',
        message:
          reason && reason.trim().length > 0
            ? `Your competition "${raffle.title}" was not approved. Feedback: ${reason.trim()}`
            : `Your competition "${raffle.title}" was not approved and requires changes before it can be published.`,
        link: '/dashboard/host/competitions',
        metadata: {
          raffleId: raffle.id,
          raffleTitle: raffle.title,
          reason: reason?.trim() || null,
        },
      });
    }

    return updated;
  }

  async drawWinner(raffleId: string, winningTicketNumber?: number) {
    const winner = await this.prisma.$transaction(async (tx) => {
      // 1. Get the raffle and check its status
      const raffle = await tx.raffle.findUnique({
        where: { id: raffleId },
        include: { winners: true, tickets: true },
      });

      if (!raffle) {
        throw new NotFoundException('Raffle not found');
      }

      const hasMainWinner = raffle.winners.some(
        (w) => w.winType === 'MAIN_DRAW',
      );
      if (hasMainWinner) {
        throw new BadRequestException(
          'A winner has already been drawn for this competition',
        );
      }

      if (raffle.tickets.length === 0) {
        throw new BadRequestException(
          'Cannot draw a winner because no tickets have been sold yet.',
        );
      }

      let winningTicket: any;

      if (winningTicketNumber !== undefined && winningTicketNumber !== null && !isNaN(Number(winningTicketNumber))) {
        const targetNum = Number(winningTicketNumber);
        winningTicket = raffle.tickets.find(
          (t) => t.ticketNumber === targetNum,
        );
        if (!winningTicket) {
          throw new BadRequestException(
            `Ticket #${targetNum} was not sold in this competition. Please enter a valid sold ticket number.`,
          );
        }
      } else {
        // Pick random winning ticket
        const randomIndex = Math.floor(Math.random() * raffle.tickets.length);
        winningTicket = raffle.tickets[randomIndex];
      }

      // 3. Create the Winner record
      const winner = await tx.winner.create({
        data: {
          userId: winningTicket.userId,
          raffleId: raffle.id,
          ticketId: winningTicket.id,
          winType: 'MAIN_DRAW',
          prizeName: raffle.prizeName || raffle.title,
        },
        include: { user: true, ticket: true },
      });

      // 4. Update Raffle status to ENDED
      await tx.raffle.update({
        where: { id: raffleId },
        data: { status: 'ENDED' },
      });

      return winner;
    });

    // Non-blocking notification dispatches
    try {
      const winnerName = `${winner.user?.firstName || ''} ${winner.user?.lastName || ''}`.trim() || winner.user?.email || 'Entrant';
      const prizeTitle = winner.prizeName || 'Main Prize';

      // 1. Notify Winner
      this.notificationsService.notifyUser(
        winner.userId,
        'WIN',
        '🏆 Congratulations! You Won the Main Draw!',
        `You won ${prizeTitle} with winning ticket #${winner.ticket?.ticketNumber}! Visit your dashboard to claim.`,
        '/dashboard/user/winners',
        { winnerId: winner.id, raffleId, ticketNumber: winner.ticket?.ticketNumber },
      );

      // 2. Notify Host
      if (winner.raffleId) {
        const raffleWithHost = await this.prisma.raffle.findUnique({
          where: { id: winner.raffleId },
          select: { hostId: true, title: true },
        });
        if (raffleWithHost?.hostId) {
          this.notificationsService.notifyHost(
            raffleWithHost.hostId,
            'WIN',
            '🏆 Main Draw Winner Drawn',
            `Main draw completed for "${raffleWithHost.title}". Winner: ${winnerName} (Ticket #${winner.ticket?.ticketNumber}).`,
            '/dashboard/host/competitions',
            { winnerId: winner.id, raffleId },
          );
        }
      }

      // 3. Notify Admins
      this.notificationsService.notifyAdmins(
        'WIN',
        '🏆 Competition Draw Concluded',
        `Winner drawn for ${prizeTitle}: ${winnerName} (Ticket #${winner.ticket?.ticketNumber}).`,
        '/dashboard/admin/winners',
        { winnerId: winner.id, raffleId },
      );
    } catch (e) {
      // Non-blocking
    }

    return winner;
  }

  async getRaffleSoldTickets(raffleId: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        host: { include: { user: true } },
        instantWins: true,
      },
    });

    const tickets = await this.prisma.ticket.findMany({
      where: { raffleId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            location: true,
            avatarUrl: true,
          },
        },
        transaction: {
          select: {
            id: true,
            amount: true,
            paymentGateway: true,
            gatewayTransactionId: true,
            status: true,
          },
        },
        winners: true,
      },
      orderBy: { ticketNumber: 'asc' },
    });

    const instantWinsMap = new Map<number, any>();
    if (raffle?.instantWins) {
      raffle.instantWins.forEach((iw) => {
        instantWinsMap.set(iw.ticketNumber, iw);
      });
    }

    return tickets.map((t) => {
      const mainWin = t.winners?.find((w) => w.winType === 'MAIN_DRAW');
      const instantWin = instantWinsMap.get(t.ticketNumber);

      let winStatus = 'Regular Entry';
      if (mainWin) {
        winStatus = `Main Draw Winner (${mainWin.prizeName || 'Main Prize'})`;
      } else if (instantWin) {
        winStatus = `Instant Winner (${instantWin.prizeName})`;
      }

      return {
        id: t.id,
        ticketNumber: t.ticketNumber,
        raffleId: t.raffleId,
        raffleTitle: raffle?.title || 'Unknown Competition',
        raffleCategory: raffle?.category || 'N/A',
        pricePerTicket: raffle?.pricePerTicket ? Number(raffle.pricePerTicket) : 0,
        hostName: raffle?.host?.businessName || (raffle?.host?.user ? `${raffle.host.user.firstName || ''} ${raffle.host.user.lastName || ''}`.trim() : 'Unknown Host'),
        hostEmail: raffle?.host?.user?.email || 'N/A',
        userId: t.userId,
        buyerName: (t.user?.firstName || t.user?.lastName)
          ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim()
          : (t.user?.email ? t.user.email : 'N/A'),
        userName: (t.user?.firstName || t.user?.lastName)
          ? `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim()
          : (t.user?.email ? t.user.email : 'N/A'),
        userEmail: t.user?.email || 'N/A',
        userPhone: t.user?.phone || 'N/A',
        userLocation: t.user?.location || 'N/A',
        avatarUrl: t.user?.avatarUrl,
        transactionId: t.transactionId,
        gatewayTransactionId: t.transaction?.gatewayTransactionId || t.transactionId || 'N/A',
        paymentGateway: t.transaction?.paymentGateway || 'N/A',
        paymentStatus: t.transaction?.status || 'COMPLETED',
        winStatus,
        createdAt: t.createdAt,
      };
    });
  }

  async updateWinnerDeliveryStatus(
    winnerId: string,
    deliveryStatus: string,
    trackingNumber?: string,
  ) {
    if (!winnerId || winnerId === 'null' || winnerId === 'undefined') {
      throw new BadRequestException('Invalid winner ID provided');
    }

    // 1. Try finding Winner by id directly
    let winner = await this.prisma.winner.findUnique({
      where: { id: winnerId },
    });

    // 2. If not found by winner.id, check if winnerId is an InstantWin ID
    if (!winner) {
      const instantWin = await this.prisma.instantWin.findUnique({
        where: { id: winnerId },
      });

      if (instantWin) {
        // Find ticket purchased for this instantWin ticketNumber
        const ticket = await this.prisma.ticket.findFirst({
          where: {
            raffleId: instantWin.raffleId,
            ticketNumber: instantWin.ticketNumber,
          },
        });

        if (ticket) {
          winner = await this.prisma.winner.findFirst({
            where: { ticketId: ticket.id },
          });

          if (!winner) {
            winner = await this.prisma.winner.create({
              data: {
                userId: ticket.userId,
                raffleId: ticket.raffleId,
                ticketId: ticket.id,
                winType: 'INSTANT_WIN',
                prizeName: instantWin.prizeName,
                deliveryStatus: deliveryStatus,
                trackingNumber: trackingNumber || null,
              },
            });
            return winner;
          }
        }
      }
    }

    if (!winner) {
      throw new NotFoundException(`Winner record not found for ID ${winnerId}`);
    }

    return this.prisma.winner.update({
      where: { id: winner.id },
      data: {
        deliveryStatus,
        trackingNumber: trackingNumber || winner.trackingNumber,
      },
    });
  }

  async getWinners(raffleId: string, hostId?: string) {
    // If hostId is provided, verify ownership, otherwise we might be fetching public winners?
    // Let's assume we fetch all winners for a raffle. The controller can restrict it.

    // First, find the raffle
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        instantWins: true,
        winners: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            ticket: true,
          },
        },
      },
    });

    if (!raffle) {
      throw new NotFoundException('Raffle not found');
    }

    if (hostId) {
      const hostProfile = await this.prisma.hostProfile.findUnique({
        where: { userId: hostId },
      });
      if (hostProfile?.id !== raffle.hostId) {
        throw new ForbiddenException(
          'You do not have permission to view this.',
        );
      }
    }

    // Since Instant Wins might not have `Winner` records yet (they are created when claimed),
    // we need to combine the data if needed, or just return the winners array.
    // Wait, earlier we linked instant wins to tickets when purchased. Let's return both.

    // Get tickets that won instant wins
    const instantWinTickets = await this.prisma.ticket.findMany({
      where: {
        raffleId: raffleId,
        ticketNumber: {
          in: raffle.instantWins.map((iw) => iw.ticketNumber),
        },
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Map instant wins with the user who bought that ticket & delivery status
    const mappedInstantWins = raffle.instantWins.map((iw) => {
      const winningTicket = instantWinTickets.find(
        (t) => t.ticketNumber === iw.ticketNumber,
      );
      const winnerRec = winningTicket
        ? raffle.winners.find((w) => w.ticketId === winningTicket.id)
        : null;

      return {
        ...iw,
        winner: winningTicket
          ? {
              ...winningTicket.user,
              winnerRecordId: winnerRec?.id || null,
              deliveryStatus: winnerRec?.deliveryStatus || 'PENDING',
              trackingNumber: winnerRec?.trackingNumber || null,
            }
          : null,
        ticket: winningTicket ? winningTicket : null,
      };
    });

    const mainDrawWinners = raffle.winners
      .filter((w) => w.winType === 'MAIN_DRAW')
      .map((w) => ({
        ...w,
        winnerRecordId: w.id,
      }));

    return {
      mainDraw: mainDrawWinners,
      instantWins: mappedInstantWins,
    };
  }

  async getPendingApprovals() {
    return this.prisma.raffle.findMany({
      where: { status: 'PENDING_APPROVAL' },
      include: {
        host: {
          include: {
            user: true,
            subscriptions: {
              where: { status: 'ACTIVE' },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            _count: { select: { raffles: true } },
          },
        },
        instantWins: {
          orderBy: { ticketNumber: 'asc' },
        },
        _count: { select: { instantWins: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllAdmin(query: any) {
    const { search, page = 1, limit = 10, status } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = {};

    if (status && status !== 'All') {
      if (status === 'Live') whereClause.status = 'ACTIVE';
      else if (status === 'Pending') whereClause.status = 'PENDING_APPROVAL';
      else if (status === 'Ended') whereClause.status = 'ENDED';
      else if (status === 'Rejected')
        whereClause.status = 'CANCELLED'; // assuming CANCELLED = Rejected
      else if (status === 'Draft') whereClause.status = 'DRAFT';
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        {
          host: {
            user: { firstName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          host: {
            user: { lastName: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          host: { user: { email: { contains: search, mode: 'insensitive' } } },
        },
      ];
    }

    const [raffles, total] = await Promise.all([
      this.prisma.raffle.findMany({
        where: whereClause,
        include: {
          host: { include: { user: true } },
          _count: { select: { tickets: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      this.prisma.raffle.count({ where: whereClause }),
    ]);

    const formattedRaffles = raffles.map((r: any) => ({
      ...r,
      ticketsSold:
        r._count?.tickets !== undefined ? r._count.tickets : (r.ticketsSold || 0),
    }));

    const lastPage = Math.ceil(total / Number(limit)) || 1;

    return {
      data: formattedRaffles,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage,
        totalPages: lastPage,
      },
    };
  }

  async adminDelete(id: string) {
    const raffle = await this.prisma.raffle.findUnique({ where: { id } });
    if (!raffle) throw new NotFoundException('Raffle not found');

    return this.prisma.$transaction(async (tx) => {
      await tx.winner.deleteMany({ where: { raffleId: id } });
      await tx.ticket.deleteMany({ where: { raffleId: id } });
      await tx.instantWin.deleteMany({ where: { raffleId: id } });
      return tx.raffle.delete({ where: { id } });
    });
  }

  async getPublicStats() {
    // 1. Draws Completed (Count of ENDED raffles)
    const drawsCompleted = await this.prisma.raffle.count({
      where: { status: 'ENDED' },
    });

    // 2. Minimum Entry (Lowest pricePerTicket across ACTIVE/ENDED)
    const minEntryAgg = await this.prisma.raffle.aggregate({
      where: { status: { in: ['ACTIVE', 'ENDED'] } },
      _min: { pricePerTicket: true },
    });

    // Parse the decimal value, default to 1 if none found
    const minimumEntry = minEntryAgg._min.pricePerTicket
      ? Number(minEntryAgg._min.pricePerTicket)
      : 1;

    return [
      {
        id: 1,
        value: `${drawsCompleted.toLocaleString('en-GB')}`,
        label: 'Draws Completed',
      },
      // {
      //   id: 2,
      //   value: `£${minimumEntry}`,
      //   label: 'Minimum Entry',
      // },
      {
        id: 3,
        value: 'Verified',
        label: 'Fair Draws',
      },
    ];
  }
// remove
  async getPublicLiveStats() {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const liveCount = await this.prisma.raffle.count({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    const closingTodayCount = await this.prisma.raffle.count({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    const activeRaffles = await this.prisma.raffle.findMany({
      where: {
        status: 'ACTIVE',
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        mainPrizeValue: true,
        pricePerTicket: true,
        totalTickets: true,
      },
    });

    let totalPrizes = 0;
    for (const r of activeRaffles) {
      if (r.mainPrizeValue) {
        totalPrizes += Number(r.mainPrizeValue);
      } else {
        totalPrizes += r.totalTickets * Number(r.pricePerTicket);
      }
    }

    const formattedTotalPrizes = `£${Math.round(totalPrizes).toLocaleString('en-GB')}`;

    return {
      liveCount,
      closingTodayCount,
      totalPrizesValue: formattedTotalPrizes,
    };
  }

  async getPublicHostPreviewStats() {
    const activeDraws = await this.prisma.raffle.count({
      where: { status: 'ACTIVE' },
    });

    const raffles = await this.prisma.raffle.findMany({
      where: { status: { in: ['ACTIVE', 'ENDED'] } },
      select: {
        ticketsSold: true,
        totalTickets: true,
        pricePerTicket: true,
        _count: {
          select: { tickets: true },
        },
      },
    });

    let ticketsSold = 0;
    let totalEarned = 0;
    let totalCapacity = 0;

    for (const r of raffles) {
      const sold =
        r._count?.tickets !== undefined ? r._count.tickets : (r.ticketsSold || 0);
      const price = r.pricePerTicket ? Number(r.pricePerTicket) : 0;
      ticketsSold += sold;
      totalEarned += sold * price;
      totalCapacity += r.totalTickets || 0;
    }

    const targetPercent =
      totalCapacity > 0
        ? Math.min(100, Math.round((ticketsSold / totalCapacity) * 100))
        : 0;

    return {
      activeDraws,
      ticketsSold,
      totalEarned,
      targetPercent,
    };
  }

  async getPublicWinnerStats() {
    const totalWinners = await this.prisma.winner.count();

    // For "Verified Draws", we can count raffles with status 'ENDED' or 'COMPLETED'
    // Since 'ENDED' is the status in the enum
    const verifiedDraws = await this.prisma.raffle.count({
      where: { status: 'ENDED' },
    });

    // For "Prizes Awarded" value, since we don't have a specific monetary value field,
    // we'll calculate the total potential revenue of all ENDED draws as a proxy,
    // or we can sum totalTickets * pricePerTicket of ENDED draws.
    const endedRaffles = await this.prisma.raffle.findMany({
      where: { status: 'ENDED' },
      select: { mainPrizeValue: true, totalTickets: true, pricePerTicket: true },
    });

    let totalValue = 0;
    endedRaffles.forEach((r) => {
      if (r.mainPrizeValue && Number(r.mainPrizeValue) > 0) {
        totalValue += Number(r.mainPrizeValue);
      } else {
        totalValue += r.totalTickets * Number(r.pricePerTicket);
      }
    });

    // Formatting currency for UK (£)
    const formattedValue = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(totalValue);

    return {
      prizesAwarded: formattedValue,
      totalWinners,
      verifiedDraws: `${verifiedDraws.toLocaleString('en-GB')}`,
    };
  }

  async getRafflePendingOrders(raffleId: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      select: {
        id: true,
        title: true,
        category: true,
        pricePerTicket: true,
        totalTickets: true,
      },
    });

    if (!raffle) {
      throw new NotFoundException('Competition not found');
    }

    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        status: 'PENDING',
        type: 'TICKET_PURCHASE',
        relatedEntityId: { contains: raffleId },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            location: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return pendingTransactions.map((tx) => {
      // Parse quantity for this specific raffle from relatedEntityId
      let quantity = 1;
      const serialized = tx.relatedEntityId || '';
      const items = serialized.split(';').filter(Boolean);
      for (const item of items) {
        const [rId, q] = item.split(':');
        if (rId === raffleId) {
          quantity = parseInt(q || '1', 10);
          break;
        }
      }

      const buyerName =
        tx.user?.firstName || tx.user?.lastName
          ? `${tx.user.firstName || ''} ${tx.user.lastName || ''}`.trim()
          : tx.user?.email || 'Guest User';

      const amount = (quantity * Number(raffle.pricePerTicket)).toFixed(2);

      return {
        id: tx.id,
        orderNumber: tx.gatewayTransactionId || tx.id,
        raffleId: raffle.id,
        raffleTitle: raffle.title,
        quantity,
        pricePerTicket: Number(raffle.pricePerTicket),
        amount: Number(amount),
        buyerName,
        buyerEmail: tx.user?.email || 'N/A',
        buyerPhone: tx.user?.phone || 'N/A',
        buyerAddress: tx.user?.address || tx.user?.location || 'N/A',
        paymentGateway: tx.paymentGateway || 'CASHFLOWS',
        status: 'PENDING',
        createdAt: tx.createdAt,
      };
    });
  }
}

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { RafflesService } from '../../raffles/raffles.service';
import { AdminAssignTicketsDto } from './dto/admin-assign-tickets.dto';
import { AdminCompetitionsQueryDto } from './dto/admin-competitions-query.dto';
import { AdminAssignmentHistoryQueryDto } from './dto/admin-assignment-history-query.dto';
import * as crypto from 'crypto';

@Injectable()
export class AdminTicketAssignmentService {
  private readonly logger = new Logger(AdminTicketAssignmentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly rafflesService: RafflesService,
  ) {}

  /**
   * 1. GET /competitions
   * Returns active competitions with stats, host, and instant win counts.
   */
  async getCompetitions(query: AdminCompetitionsQueryDto) {
    const where: any = {
      status: 'ACTIVE',
    };

    if (query.q) {
      where.OR = [
        { title: { contains: query.q, mode: 'insensitive' } },
        { slug: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    if (query.hostId) {
      where.hostId = query.hostId;
    }

    const raffles = await this.prisma.raffle.findMany({
      where,
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        instantWins: {
          select: {
            id: true,
            isClaimed: true,
            ticketNumber: true,
            prizeName: true,
            rrpValue: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return raffles.map((r) => {
      const pricePerTicket = Number(r.pricePerTicket || 0);
      const remainingTickets = Math.max(0, r.totalTickets - r.ticketsSold);
      const hostUser = r.host?.user;
      const hostName =
        r.host?.businessName ||
        `${hostUser?.firstName || ''} ${hostUser?.lastName || ''}`.trim() ||
        hostUser?.email ||
        'Verified Host';

      return {
        id: r.id,
        title: r.title,
        slug: r.slug,
        mainImage: r.mainImage,
        pricePerTicket,
        totalTickets: r.totalTickets,
        ticketsSold: r.ticketsSold,
        remainingTickets,
        status: r.status,
        isAutoDraw: r.isAutoDraw,
        autoDrawSoldOut: r.autoDrawSoldOut,
        minTickets: r.minTickets || 1,
        maxTickets: r.maxTickets,
        startDate: r.startDate,
        endDate: r.endDate,
        host: {
          id: r.host?.id,
          businessName: r.host?.businessName,
          slug: r.host?.slug,
          ownerName: hostName,
          email: hostUser?.email,
          avatarUrl: hostUser?.avatarUrl,
        },
        instantWinCounts: {
          total: r.instantWins.length,
          claimed: r.instantWins.filter((iw) => iw.isClaimed).length,
          available: r.instantWins.filter((iw) => !iw.isClaimed).length,
        },
      };
    });
  }

  /**
   * 2. GET /competitions/:id
   * Returns full competition data, stats, all instant wins, and all sold tickets.
   */
  async getCompetitionById(id: string) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id },
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        instantWins: {
          orderBy: { ticketNumber: 'asc' },
        },
        tickets: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
            transaction: {
              select: {
                id: true,
                paymentGateway: true,
                gatewayTransactionId: true,
                createdAt: true,
              },
            },
          },
          orderBy: { ticketNumber: 'asc' },
        },
      },
    });

    if (!raffle) {
      throw new NotFoundException('Competition not found');
    }

    const pricePerTicket = Number(raffle.pricePerTicket || 0);
    const remainingTickets = Math.max(0, raffle.totalTickets - raffle.ticketsSold);
    const hostUser = raffle.host?.user;
    const hostName =
      raffle.host?.businessName ||
      `${hostUser?.firstName || ''} ${hostUser?.lastName || ''}`.trim() ||
      hostUser?.email ||
      'Host';

    return {
      id: raffle.id,
      title: raffle.title,
      slug: raffle.slug,
      mainImage: raffle.mainImage,
      category: raffle.category,
      pricePerTicket,
      totalTickets: raffle.totalTickets,
      ticketsSold: raffle.ticketsSold,
      remainingTickets,
      status: raffle.status,
      isAutoDraw: raffle.isAutoDraw,
      autoDrawSoldOut: raffle.autoDrawSoldOut,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      host: {
        id: raffle.host?.id,
        businessName: raffle.host?.businessName,
        slug: raffle.host?.slug,
        ownerName: hostName,
        email: hostUser?.email,
      },
      instantWins: raffle.instantWins.map((iw) => ({
        id: iw.id,
        ticketNumber: iw.ticketNumber,
        prizeName: iw.prizeName,
        rrpValue: iw.rrpValue ? Number(iw.rrpValue) : null,
        image: iw.image,
        isClaimed: iw.isClaimed,
      })),
      soldTickets: raffle.tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        purchaseDate: t.createdAt,
        buyerId: t.user.id,
        buyerName: `${t.user.firstName || ''} ${t.user.lastName || ''}`.trim() || t.user.email,
        buyerEmail: t.user.email,
        buyerAvatar: t.user.avatarUrl,
        paymentGateway: t.transaction?.paymentGateway || 'UNKNOWN',
        gatewayTransactionId: t.transaction?.gatewayTransactionId,
      })),
    };
  }

  /**
   * 3. GET /users/search?q=<term>
   * Live autocomplete search matching user email, firstName, lastName, or id.
   * Returns active users (excluding blocked accounts).
   */
  async searchUsers(searchTerm?: string) {
    const where: any = {
      isBlocked: false,
    };

    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.trim();
      where.OR = [
        { email: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
        { id: { equals: term } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatarUrl: true,
        isBlocked: true,
      },
      take: 25,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      return {
        id: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        name: fullName.length > 0 ? fullName : u.email,
        role: u.role,
        avatar: u.avatarUrl,
      };
    });
  }

  /**
   * 4. POST /assign
   * Validates within an atomic database transaction ($transaction):
   * - Raffle exists and is not ended/cancelled.
   * - User exists and is not blocked.
   * - Specific or random numbers verified and allocated.
   * - Host wallet credited, raffle ticketsSold updated, tickets & winner created.
   * - AuditLog created.
   * - Auto-draw triggered if competition sold out.
   */
  async assignTickets(dto: AdminAssignTicketsDto, adminId: string) {
    const hasSpecificNumbers =
      Array.isArray(dto.ticketNumbers) && dto.ticketNumbers.length > 0;
    const hasQuantity = typeof dto.quantity === 'number' && dto.quantity > 0;

    if (!hasSpecificNumbers && !hasQuantity) {
      throw new BadRequestException(
        'You must specify either explicit ticketNumbers or a positive quantity.',
      );
    }

    if (hasSpecificNumbers) {
      const uniqueNumbers = new Set(dto.ticketNumbers);
      if (uniqueNumbers.size !== dto.ticketNumbers!.length) {
        throw new BadRequestException('Duplicate ticket numbers detected in request.');
      }
    }

    // Execute atomic transaction
    const txResult = await this.prisma.$transaction(
      async (tx) => {
        // 1. Fetch competition with host and instant wins
        const raffle = await tx.raffle.findUnique({
          where: { id: dto.raffleId },
          include: {
            instantWins: true,
            host: true,
          },
        });

        if (!raffle) {
          throw new NotFoundException('Competition not found');
        }

        if (raffle.status !== 'ACTIVE') {
          throw new BadRequestException(
            `Competition is not active (current status: ${raffle.status})`,
          );
        }

        // 2. Fetch recipient user
        const recipient = await tx.user.findUnique({
          where: { id: dto.userId },
        });

        if (!recipient) {
          throw new NotFoundException('Recipient user not found');
        }

        if (recipient.isBlocked) {
          throw new BadRequestException('Recipient account is currently suspended/blocked');
        }

        // 3. Determine assigned ticket numbers
        const existingTickets = await tx.ticket.findMany({
          where: { raffleId: raffle.id },
          select: { ticketNumber: true },
        });

        const soldNumbersSet = new Set(existingTickets.map((t) => t.ticketNumber));
        let assignedNumbers: number[] = [];

        if (hasSpecificNumbers) {
          const requestedNumbers = dto.ticketNumbers!;
          for (const num of requestedNumbers) {
            if (num < 1 || num > raffle.totalTickets) {
              throw new BadRequestException(
                `Ticket #${num} is out of bounds (allowed: 1 to ${raffle.totalTickets})`,
              );
            }
            if (soldNumbersSet.has(num)) {
              throw new BadRequestException(`Ticket #${num} has already been sold.`);
            }
          }
          assignedNumbers = requestedNumbers;
        } else {
          const qty = dto.quantity!;
          const availableCount = raffle.totalTickets - soldNumbersSet.size;
          if (qty > availableCount) {
            throw new BadRequestException(
              `Only ${availableCount} ticket(s) remaining; cannot allocate ${qty}.`,
            );
          }

          const availablePool: number[] = [];
          for (let i = 1; i <= raffle.totalTickets; i++) {
            if (!soldNumbersSet.has(i)) {
              availablePool.push(i);
            }
          }

          // Fisher-Yates shuffle
          for (let i = availablePool.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePool[i], availablePool[j]] = [availablePool[j], availablePool[i]];
          }

          assignedNumbers = availablePool.slice(0, qty);
        }

        const quantityAllocated = assignedNumbers.length;
        const pricePerTicket = Number(raffle.pricePerTicket || 0);
        const totalAmount = quantityAllocated * pricePerTicket;

        // 4. Create Transaction record with ADMIN_MANUAL
        const gatewayTransactionId = `ADMIN_ASSIGN_${Date.now()}_${crypto.randomUUID()}`;
        const transaction = await tx.transaction.create({
          data: {
            userId: recipient.id,
            type: 'TICKET_PURCHASE',
            amount: totalAmount,
            status: 'COMPLETED',
            paymentGateway: 'ADMIN_MANUAL',
            gatewayTransactionId,
            relatedEntityId: raffle.id,
          },
        });

        // 5. Host Wallet Crediting
        if (raffle.hostId) {
          await tx.hostProfile.update({
            where: { id: raffle.hostId },
            data: {
              walletBalance: {
                increment: totalAmount,
              },
            },
          });
        }

        // 6. Increment ticketsSold count on raffle
        const updatedRaffle = await tx.raffle.update({
          where: { id: raffle.id },
          data: {
            ticketsSold: {
              increment: quantityAllocated,
            },
          },
        });

        // 7. Create Ticket records
        await tx.ticket.createMany({
          data: assignedNumbers.map((num) => ({
            raffleId: raffle.id,
            userId: recipient.id,
            transactionId: transaction.id,
            ticketNumber: num,
          })),
        });

        const createdTickets = await tx.ticket.findMany({
          where: { transactionId: transaction.id },
          orderBy: { ticketNumber: 'asc' },
        });

        // 8. Instant Win Evaluation & Automation
        const instantWinsClaimed: any[] = [];
        for (const ticket of createdTickets) {
          const matchedWin = raffle.instantWins.find(
            (iw) => iw.ticketNumber === ticket.ticketNumber && !iw.isClaimed,
          );

          if (matchedWin) {
            // Mark instant win as claimed
            const updatedIw = await tx.instantWin.update({
              where: { id: matchedWin.id },
              data: { isClaimed: true },
            });

            // Automatically create Winner record
            const winner = await tx.winner.create({
              data: {
                raffleId: raffle.id,
                userId: recipient.id,
                ticketId: ticket.id,
                winType: 'INSTANT_WIN',
                prizeName: updatedIw.prizeName,
                deliveryStatus: 'PENDING',
                isClaimed: true,
              },
            });

            instantWinsClaimed.push({
              instantWinId: updatedIw.id,
              ticketNumber: ticket.ticketNumber,
              prizeName: updatedIw.prizeName,
              rrpValue: updatedIw.rrpValue ? Number(updatedIw.rrpValue) : null,
              winnerId: winner.id,
            });
          }
        }

        // 9. Audit Logging
        let auditLogRecord: any = null;
        try {
          auditLogRecord = await tx.auditLog.create({
            data: {
              adminId,
              action: 'ADMIN_MANUAL_TICKET_ASSIGNMENT',
              targetRaffleId: raffle.id,
              recipientUserId: recipient.id,
              ticketNumbers: assignedNumbers,
              totalAmount: totalAmount,
              details: {
                adminNotes: dto.adminNotes || null,
                raffleTitle: raffle.title,
                recipientEmail: recipient.email,
                quantity: quantityAllocated,
                pricePerTicket,
                gatewayTransactionId,
                instantWinsClaimed,
              },
            },
          });
        } catch (auditErr) {
          this.logger.warn(`Failed to insert AuditLog record: ${auditErr.message}`);
        }

        return {
          transaction,
          updatedRaffle,
          recipient,
          assignedNumbers,
          quantityAllocated,
          pricePerTicket,
          totalAmount,
          instantWinsClaimed,
          auditLogRecord,
          adminNotes: dto.adminNotes || null,
        };
      },
      {
        timeout: 20000,
      },
    );

    // Outside transaction operations: Auto-Draw & Notifications
    const {
      transaction,
      updatedRaffle,
      recipient,
      assignedNumbers,
      quantityAllocated,
      pricePerTicket,
      totalAmount,
      instantWinsClaimed,
      auditLogRecord,
      adminNotes,
    } = txResult;

    // Check Auto-draw if sold out
    if (
      updatedRaffle.isAutoDraw &&
      updatedRaffle.autoDrawSoldOut &&
      updatedRaffle.ticketsSold >= updatedRaffle.totalTickets &&
      updatedRaffle.status === 'ACTIVE'
    ) {
      try {
        await this.rafflesService.drawWinner(updatedRaffle.id);
        this.logger.log(`Auto-draw triggered on sellout for ${updatedRaffle.id}`);
      } catch (err) {
        this.logger.error(
          `Failed to execute auto draw on sold out for ${updatedRaffle.id}: ${err.message}`,
        );
      }
    } else if (
      updatedRaffle.ticketsSold >= updatedRaffle.totalTickets &&
      updatedRaffle.status === 'ACTIVE'
    ) {
      try {
        await this.prisma.raffle.update({
          where: { id: updatedRaffle.id },
          data: { status: 'ENDED' },
        });
      } catch (err) {
        this.logger.error(`Failed to update raffle status to ENDED: ${err.message}`);
      }
    }

    // In-app notifications to recipient
    try {
      const noteText = adminNotes ? ` (Note: ${adminNotes})` : '';
      await this.notificationsService.notifyUser(
        recipient.id,
        'PURCHASE',
        '🎟️ Complimentary Tickets Issued',
        `You have been allocated ${quantityAllocated} ticket(s) for "${updatedRaffle.title}" by administration.${noteText}`,
        '/dashboard/user/tickets',
        {
          raffleId: updatedRaffle.id,
          ticketNumbers: assignedNumbers,
          transactionId: transaction.id,
          amount: totalAmount,
        },
      );

      // If instant wins were unlocked, notify recipient and admin
      if (instantWinsClaimed.length > 0) {
        const prizeNames = instantWinsClaimed
          .map((w) => `#${w.ticketNumber} (${w.prizeName})`)
          .join(', ');

        await this.notificationsService.notifyUser(
          recipient.id,
          'INSTANT_WIN',
          '⚡ Instant Win Prize Unlocked!',
          `You unlocked instant win prize(s) with your manual ticket allocation: ${prizeNames}!`,
          '/dashboard/user/winners',
          {
            raffleId: updatedRaffle.id,
            instantWins: instantWinsClaimed,
          },
        );

        await this.notificationsService.notifyAdmins(
          'INSTANT_WIN',
          '⚡ Admin Manual Allocation Instant Win',
          `User ${recipient.email} unlocked instant win(s) in "${updatedRaffle.title}": ${prizeNames}.`,
          '/dashboard/admin/winners',
        );
      }
    } catch (notifErr) {
      this.logger.warn(`Failed to dispatch in-app notifications: ${notifErr.message}`);
    }

    return {
      success: true,
      message: `Successfully allocated ${quantityAllocated} ticket(s) to ${recipient.email}.`,
      allocation: {
        transactionId: transaction.id,
        gatewayTransactionId: transaction.gatewayTransactionId,
        raffleId: updatedRaffle.id,
        raffleTitle: updatedRaffle.title,
        recipient: {
          id: recipient.id,
          name: `${recipient.firstName || ''} ${recipient.lastName || ''}`.trim() || recipient.email,
          email: recipient.email,
        },
        ticketNumbers: assignedNumbers,
        quantity: quantityAllocated,
        pricePerTicket,
        totalAmount,
        hostCredited: totalAmount,
        instantWinsClaimed,
        adminNotes,
        auditLogId: auditLogRecord?.id,
      },
    };
  }

  /**
   * 5. GET /history
   * Paginated history of all ADMIN_MANUAL transactions showing:
   * Date, Transaction ID, Recipient, Competition, Assigned Numbers, Total Value, and Admin Notes.
   */
  async getHistory(query: AdminAssignmentHistoryQueryDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const where: any = {
      paymentGateway: 'ADMIN_MANUAL',
    };

    if (query.search && query.search.trim().length > 0) {
      const term = query.search.trim();
      where.OR = [
        { gatewayTransactionId: { contains: term, mode: 'insensitive' } },
        { id: { contains: term, mode: 'insensitive' } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
        { user: { firstName: { contains: term, mode: 'insensitive' } } },
        { user: { lastName: { contains: term, mode: 'insensitive' } } },
        {
          tickets: {
            some: {
              raffle: {
                title: { contains: term, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          tickets: {
            include: {
              raffle: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  mainImage: true,
                },
              },
              winners: true,
            },
            orderBy: { ticketNumber: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    // Gather related AuditLog entries for notes and admin info
    const gatewayTxIds = transactions
      .map((t) => t.gatewayTransactionId)
      .filter(Boolean) as string[];

    let auditLogs: any[] = [];
    try {
      auditLogs = await this.prisma.auditLog.findMany({
        where: {
          action: 'ADMIN_MANUAL_TICKET_ASSIGNMENT',
        },
      });
    } catch (e) {
      // If auditLog table is empty or inaccessible
      this.logger.debug(`Could not query auditLog: ${e.message}`);
    }

    const items = transactions.map((t) => {
      const raffle = t.tickets[0]?.raffle;
      const assignedNumbers = t.tickets.map((tkt) => tkt.ticketNumber);
      const recipientName =
        `${t.user?.firstName || ''} ${t.user?.lastName || ''}`.trim() ||
        t.user?.email ||
        'User';

      // Find matching audit log entry by gatewayTransactionId inside details or targetRaffleId+recipientUserId
      const matchedAudit = auditLogs.find((al) => {
        const details = (al.details as any) || {};
        return (
          details.gatewayTransactionId === t.gatewayTransactionId ||
          (al.recipientUserId === t.userId && al.targetRaffleId === raffle?.id)
        );
      });

      const instantWins = t.tickets
        .filter((tkt) => tkt.winners && tkt.winners.length > 0)
        .map((tkt) => ({
          ticketNumber: tkt.ticketNumber,
          prizeName: tkt.winners[0]?.prizeName,
          winType: tkt.winners[0]?.winType,
        }));

      return {
        id: t.id,
        date: t.createdAt,
        transactionId: t.gatewayTransactionId || `#TRN-${t.id.slice(0, 8).toUpperCase()}`,
        totalValue: Number(t.amount || 0),
        status: t.status,
        paymentGateway: t.paymentGateway,
        recipient: {
          id: t.user?.id,
          name: recipientName,
          email: t.user?.email,
          avatarUrl: t.user?.avatarUrl,
        },
        competition: {
          id: raffle?.id,
          title: raffle?.title || 'Unknown Competition',
          slug: raffle?.slug,
          mainImage: raffle?.mainImage,
        },
        assignedNumbers,
        ticketsCount: assignedNumbers.length,
        adminNotes: matchedAudit?.details?.adminNotes || null,
        adminId: matchedAudit?.adminId || null,
        instantWins,
      };
    });

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

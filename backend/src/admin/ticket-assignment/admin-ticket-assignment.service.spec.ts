import { Test, TestingModule } from '@nestjs/testing';
import { AdminTicketAssignmentService } from './admin-ticket-assignment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { RafflesService } from '../../raffles/raffles.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AdminTicketAssignmentService', () => {
  let service: AdminTicketAssignmentService;
  let prisma: any;
  let notificationsService: any;
  let rafflesService: any;

  const mockRaffle = {
    id: 'raffle-1',
    title: 'Charizard Base Set PSA 10',
    slug: 'charizard-base-set-psa-10',
    status: 'ACTIVE',
    pricePerTicket: 10.0,
    totalTickets: 100,
    ticketsSold: 20,
    hostId: 'host-1',
    isAutoDraw: true,
    autoDrawSoldOut: true,
    host: {
      id: 'host-1',
      businessName: 'TCG Vault',
      slug: 'tcg-vault',
      user: {
        id: 'user-host',
        firstName: 'Ash',
        lastName: 'Ketchum',
        email: 'ash@pokemon.com',
      },
    },
    instantWins: [
      {
        id: 'iw-1',
        ticketNumber: 7,
        prizeName: 'Pikachu Promo Card',
        rrpValue: 50.0,
        isClaimed: false,
      },
      {
        id: 'iw-2',
        ticketNumber: 15,
        prizeName: 'Booster Pack',
        rrpValue: 20.0,
        isClaimed: true,
      },
    ],
  };

  const mockRecipient = {
    id: 'user-recipient',
    email: 'buyer@test.com',
    firstName: 'Brock',
    lastName: 'Boulder',
    role: 'CLIENT',
    isBlocked: false,
  };

  beforeEach(async () => {
    prisma = {
      raffle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      transaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      ticket: {
        findMany: jest.fn(),
        createMany: jest.fn(),
      },
      instantWin: {
        update: jest.fn(),
      },
      winner: {
        create: jest.fn(),
      },
      hostProfile: {
        update: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    notificationsService = {
      notifyUser: jest.fn().mockResolvedValue(null),
      notifyAdmins: jest.fn().mockResolvedValue(null),
    };

    rafflesService = {
      drawWinner: jest.fn().mockResolvedValue(null),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminTicketAssignmentService,
        { provide: PrismaService, useValue: prisma },
        { provide: NotificationsService, useValue: notificationsService },
        { provide: RafflesService, useValue: rafflesService },
      ],
    }).compile();

    service = module.get<AdminTicketAssignmentService>(AdminTicketAssignmentService);
  });

  describe('getCompetitions', () => {
    it('should return active competitions formatted with instant win counts', async () => {
      prisma.raffle.findMany.mockResolvedValue([mockRaffle]);

      const result = await service.getCompetitions({});

      expect(result).toHaveLength(1);
      expect(result[0].remainingTickets).toBe(80);
      expect(result[0].instantWinCounts).toEqual({
        total: 2,
        claimed: 1,
        available: 1,
      });
      expect(result[0].host.ownerName).toBe('TCG Vault');
    });
  });

  describe('searchUsers', () => {
    it('should return active users and exclude blocked users', async () => {
      prisma.user.findMany.mockResolvedValue([mockRecipient]);

      const result = await service.searchUsers('buyer');

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isBlocked: false }),
        }),
      );
      expect(result[0].email).toBe('buyer@test.com');
      expect(result[0].name).toBe('Brock Boulder');
    });
  });

  describe('assignTickets (Atomic Transaction)', () => {
    it('should successfully assign specific tickets, credit host, create transaction & claim instant win', async () => {
      prisma.raffle.findUnique.mockResolvedValue(mockRaffle);
      prisma.user.findUnique.mockResolvedValue(mockRecipient);
      prisma.ticket.findMany
        .mockResolvedValueOnce([{ ticketNumber: 1 }]) // Existing sold tickets
        .mockResolvedValueOnce([
          { id: 'tkt-7', ticketNumber: 7 },
          { id: 'tkt-14', ticketNumber: 14 },
        ]); // Newly created tickets
      prisma.transaction.create.mockResolvedValue({
        id: 'trn-1',
        amount: 20.0,
        paymentGateway: 'ADMIN_MANUAL',
        gatewayTransactionId: 'ADMIN_ASSIGN_123',
      });
      prisma.hostProfile.update.mockResolvedValue({ walletBalance: 20.0 });
      prisma.raffle.update.mockResolvedValue({
        ...mockRaffle,
        ticketsSold: 22,
      });
      prisma.instantWin.update.mockResolvedValue({
        ...mockRaffle.instantWins[0],
        isClaimed: true,
      });
      prisma.winner.create.mockResolvedValue({ id: 'win-1' });
      prisma.auditLog.create.mockResolvedValue({ id: 'audit-1' });

      const result = await service.assignTickets(
        {
          raffleId: 'raffle-1',
          userId: 'user-recipient',
          ticketNumbers: [7, 14],
          adminNotes: 'Promotional Giveaway Winner',
        },
        'admin-123',
      );

      expect(result.success).toBe(true);
      expect(result.allocation.quantity).toBe(2);
      expect(result.allocation.totalAmount).toBe(20.0);
      expect(result.allocation.hostCredited).toBe(20.0);

      // Verify Transaction creation
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-recipient',
          type: 'TICKET_PURCHASE',
          amount: 20.0,
          status: 'COMPLETED',
          paymentGateway: 'ADMIN_MANUAL',
        }),
      });

      // Verify Host Profile Wallet increment
      expect(prisma.hostProfile.update).toHaveBeenCalledWith({
        where: { id: 'host-1' },
        data: { walletBalance: { increment: 20.0 } },
      });

      // Verify Instant Win claim & Winner creation for ticket #7
      expect(prisma.instantWin.update).toHaveBeenCalledWith({
        where: { id: 'iw-1' },
        data: { isClaimed: true },
      });
      expect(prisma.winner.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          raffleId: 'raffle-1',
          userId: 'user-recipient',
          ticketId: 'tkt-7',
          winType: 'INSTANT_WIN',
          prizeName: 'Pikachu Promo Card',
        }),
      });

      // Verify AuditLog creation
      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: 'admin-123',
          action: 'ADMIN_MANUAL_TICKET_ASSIGNMENT',
          targetRaffleId: 'raffle-1',
          recipientUserId: 'user-recipient',
          ticketNumbers: [7, 14],
          totalAmount: 20.0,
        }),
      });

      // Verify notification sent to recipient
      expect(notificationsService.notifyUser).toHaveBeenCalledWith(
        'user-recipient',
        'PURCHASE',
        expect.any(String),
        expect.stringContaining('Promotional Giveaway Winner'),
        '/dashboard/user/tickets',
        expect.any(Object),
      );
    });

    it('should reject allocation if requested ticket is already sold', async () => {
      prisma.raffle.findUnique.mockResolvedValue(mockRaffle);
      prisma.user.findUnique.mockResolvedValue(mockRecipient);
      prisma.ticket.findMany.mockResolvedValue([{ ticketNumber: 7 }]); // 7 is already sold

      await expect(
        service.assignTickets(
          {
            raffleId: 'raffle-1',
            userId: 'user-recipient',
            ticketNumbers: [7],
          },
          'admin-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject allocation if recipient user is blocked', async () => {
      prisma.raffle.findUnique.mockResolvedValue(mockRaffle);
      prisma.user.findUnique.mockResolvedValue({
        ...mockRecipient,
        isBlocked: true,
      });

      await expect(
        service.assignTickets(
          {
            raffleId: 'raffle-1',
            userId: 'user-recipient',
            ticketNumbers: [8],
          },
          'admin-123',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHistory', () => {
    it('should return paginated history of ADMIN_MANUAL transactions', async () => {
      prisma.transaction.findMany.mockResolvedValue([
        {
          id: 'trn-1',
          amount: 50.0,
          status: 'COMPLETED',
          paymentGateway: 'ADMIN_MANUAL',
          gatewayTransactionId: 'ADMIN_ASSIGN_999',
          createdAt: new Date(),
          user: mockRecipient,
          tickets: [
            {
              ticketNumber: 5,
              raffle: mockRaffle,
              winners: [],
            },
          ],
        },
      ]);
      prisma.transaction.count.mockResolvedValue(1);
      prisma.auditLog.findMany.mockResolvedValue([
        {
          adminId: 'admin-1',
          details: {
            gatewayTransactionId: 'ADMIN_ASSIGN_999',
            adminNotes: 'VIP Player Reward',
          },
        },
      ]);

      const history = await service.getHistory({ page: 1, limit: 10 });

      expect(history.items).toHaveLength(1);
      expect(history.items[0].transactionId).toBe('ADMIN_ASSIGN_999');
      expect(history.items[0].adminNotes).toBe('VIP Player Reward');
      expect(history.items[0].totalValue).toBe(50.0);
    });
  });
});

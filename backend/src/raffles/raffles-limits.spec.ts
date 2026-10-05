import { BadRequestException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { TicketsService } from '../tickets/tickets.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('Raffle min/max ticket limits', () => {
  let rafflesService: RafflesService;
  let ticketsService: TicketsService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      hostProfile: {
        findUnique: jest.fn(),
      },
      subscriptionPlan: {
        findFirst: jest.fn(),
      },
      raffle: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
      },
      ticket: {
        count: jest.fn(),
        createMany: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      order: {
        create: jest.fn(),
      },
      transaction: {
        create: jest.fn().mockResolvedValue({ id: 'tx-1' }),
      },
      $transaction: jest.fn((callback: any) => callback(prismaMock)),
    };

    notificationsMock = {
      createNotification: jest.fn(),
    };

    rafflesService = new RafflesService(
      prismaMock as unknown as PrismaService,
      notificationsMock as unknown as NotificationsService,
    );

    ticketsService = new TicketsService(
      prismaMock as unknown as PrismaService,
      rafflesService,
      notificationsMock as unknown as NotificationsService,
    );
  });

  describe('RafflesService.create limit validation', () => {
    const mockHost = {
      id: 'host-1',
      userId: 'user-host-1',
      subscriptions: [
        {
          status: 'ACTIVE',
          plan: { maxActiveRaffles: 10, maxTicketsPerRaffle: 1000 },
        },
      ],
      raffles: [],
    };

    it('should reject when minTickets > maxTickets', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHost);

      await expect(
        rafflesService.create('user-host-1', {
          title: 'Test Competition',
          totalTickets: 100,
          ticketPrice: 5,
          minTickets: 20,
          maxTickets: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Maximum tickets per person must be greater than or equal to minimum tickets',
        ),
      );
    });

    it('should reject when maxTickets > totalTickets', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHost);

      await expect(
        rafflesService.create('user-host-1', {
          title: 'Test Competition',
          totalTickets: 100,
          ticketPrice: 5,
          minTickets: 5,
          maxTickets: 150,
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000),
        }),
      ).rejects.toThrow(
        new BadRequestException(
          'Maximum tickets per person cannot exceed total tickets',
        ),
      );
    });

    it('should persist minTickets and maxTickets when valid', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue(mockHost);
      prismaMock.raffle.create.mockImplementation((args: any) =>
        Promise.resolve({ id: 'raffle-1', ...args.data }),
      );

      const created = await rafflesService.create('user-host-1', {
        title: 'Valid Competition',
        totalTickets: 100,
        ticketPrice: 5,
        minTickets: 2,
        maxTickets: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
      });

      expect(created).toBeDefined();
      expect(prismaMock.raffle.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            minTickets: 2,
            maxTickets: 20,
          }),
        }),
      );
    });
  });

  describe('TicketsService ticket limits enforcement', () => {
    const mockRaffle = {
      id: 'raffle-1',
      title: 'Titleist Driver Draw',
      status: 'ACTIVE',
      totalTickets: 100,
      ticketsSold: 0,
      ticketPrice: 10,
      minTickets: 5,
      maxTickets: 25,
      drawDate: new Date(Date.now() + 86400000),
    };

    it('should reject purchase when quantity < minTickets', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(mockRaffle);
      prismaMock.ticket.count.mockResolvedValue(0);

      await expect(
        ticketsService.allocateTicketsInDatabase('user-1', 'raffle-1', 2),
      ).rejects.toThrow(
        new BadRequestException(
          'Minimum ticket purchase for "Titleist Driver Draw" is 5 ticket(s)',
        ),
      );
    });

    it('should reject purchase when quantity exceeds maxTickets', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(mockRaffle);
      prismaMock.ticket.count.mockResolvedValue(0);

      await expect(
        ticketsService.allocateTicketsInDatabase('user-1', 'raffle-1', 30),
      ).rejects.toThrow(
        new BadRequestException(
          'Maximum ticket limit is 25 per person for "Titleist Driver Draw". You already hold 0 ticket(s). You can purchase up to 25 more.',
        ),
      );
    });

    it('should reject purchase when cumulative tickets exceed maxTickets', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(mockRaffle);
      // User already holds 20 tickets
      prismaMock.ticket.count.mockResolvedValue(20);

      await expect(
        ticketsService.allocateTicketsInDatabase('user-1', 'raffle-1', 10),
      ).rejects.toThrow(
        new BadRequestException(
          'Maximum ticket limit is 25 per person for "Titleist Driver Draw". You already hold 20 ticket(s). You can purchase up to 5 more.',
        ),
      );
    });

    it('should allow purchase when within minTickets and cumulative maxTickets', async () => {
      prismaMock.raffle.findUnique.mockResolvedValue(mockRaffle);
      prismaMock.ticket.count.mockResolvedValue(10);
      prismaMock.ticket.findMany.mockResolvedValue([]);
      prismaMock.ticket.createMany.mockResolvedValue({ count: 10 });
      prismaMock.order.create.mockResolvedValue({ id: 'order-1', totalAmount: 100 });
      prismaMock.raffle.update.mockResolvedValue({ ...mockRaffle, ticketsSold: 20 });

      const result = await ticketsService.allocateTicketsInDatabase(
        'user-1',
        'raffle-1',
        10,
      );

      expect(result).toBeDefined();
      expect(prismaMock.transaction.create).toHaveBeenCalled();
      expect(prismaMock.ticket.createMany).toHaveBeenCalled();
    });
  });
});

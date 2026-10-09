import { RafflesService } from './raffles.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('RafflesService - getPublicWinnerStats', () => {
  let rafflesService: RafflesService;
  let prismaMock: any;
  let notificationsMock: any;

  beforeEach(() => {
    prismaMock = {
      winner: {
        count: jest.fn(),
      },
      raffle: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    notificationsMock = {
      createNotification: jest.fn(),
    };

    rafflesService = new RafflesService(
      prismaMock as unknown as PrismaService,
      notificationsMock as unknown as NotificationsService,
    );
  });

  it('should calculate mainDrawWinners, instantWinners, totalWinners, and prizesAwarded correctly', async () => {
    prismaMock.winner.count.mockImplementation(({ where }: { where: { winType: string } }) => {
      if (where.winType === 'MAIN_DRAW') return Promise.resolve(3);
      if (where.winType === 'INSTANT_WIN') return Promise.resolve(6);
      return Promise.resolve(0);
    });

    prismaMock.raffle.count.mockResolvedValue(5);
    prismaMock.raffle.findMany.mockResolvedValue([
      { mainPrizeValue: 500, totalTickets: 100, pricePerTicket: 5 },
      { mainPrizeValue: null, totalTickets: 200, pricePerTicket: 10 },
    ]);

    const stats = await rafflesService.getPublicWinnerStats();

    expect(stats.mainDrawWinners).toBe(3);
    expect(stats.instantWinners).toBe(6);
    expect(stats.totalWinners).toBe(9); // 3 + 6
    expect(stats.verifiedDraws).toBe('5');
    expect(stats.prizesAwarded).toBe('£2,500'); // 500 + (200 * 10) = 2,500
  });

  it('should handle zero winners and zero ended raffles gracefully', async () => {
    prismaMock.winner.count.mockResolvedValue(0);
    prismaMock.raffle.count.mockResolvedValue(0);
    prismaMock.raffle.findMany.mockResolvedValue([]);

    const stats = await rafflesService.getPublicWinnerStats();

    expect(stats.mainDrawWinners).toBe(0);
    expect(stats.instantWinners).toBe(0);
    expect(stats.totalWinners).toBe(0);
    expect(stats.verifiedDraws).toBe('0');
    expect(stats.prizesAwarded).toBe('£0');
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HostsService } from './hosts.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HostsService', () => {
  let service: HostsService;
  let prismaMock: {
    hostSubscription: {
      findFirst: jest.Mock;
    };
    hostProfile: {
      findUnique: jest.Mock;
    };
  };

  beforeEach(async () => {
    prismaMock = {
      hostSubscription: {
        findFirst: jest.fn(),
      },
      hostProfile: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostsService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<HostsService>(HostsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHostCommissionRate', () => {
    it('should return 10.0 for Premium plan', async () => {
      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: { id: 'plan-1', name: 'Premium' },
      });

      const rate = await service.getHostCommissionRate('host-123');
      expect(rate).toBe(10.0);
    });

    it('should return 10.0 for Pro plan', async () => {
      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-2',
        status: 'ACTIVE',
        plan: { id: 'plan-2', name: 'Pro' },
      });

      const rate = await service.getHostCommissionRate('host-123');
      expect(rate).toBe(10.0);
    });

    it('should return 15.0 for Free plan', async () => {
      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
        plan: { id: 'plan-3', name: 'Free' },
      });

      const rate = await service.getHostCommissionRate('host-123');
      expect(rate).toBe(15.0);
    });

    it('should return 15.0 when no active subscription exists', async () => {
      prismaMock.hostSubscription.findFirst.mockResolvedValue(null);

      const rate = await service.getHostCommissionRate('host-123');
      expect(rate).toBe(15.0);
    });
  });

  describe('getHostDashboardOverview', () => {
    it('should calculate 90% net revenue and 10% commission rate for Premium host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 500,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: { id: 'plan-1', name: 'Premium' },
      });

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'raffle-1',
            status: 'ACTIVE',
            pricePerTicket: 10,
            ticketsSold: 100, // gross = 1000
            totalTickets: 200,
          },
        ]),
      };

      (prismaMock as any).winner = {
        count: jest.fn().mockResolvedValue(2),
      };

      (prismaMock as any).ticket = {
        findMany: jest.fn().mockResolvedValue([]),
      };

      const overview = await service.getHostDashboardOverview('user-1');
      expect(overview.kpiStats.totalGrossRevenue).toBe(1000);
      expect(overview.kpiStats.totalNetRevenue).toBe(900);
      expect(overview.kpiStats.commissionRate).toBe(10.0);
    });

    it('should calculate 85% net revenue and 15% commission rate for Free host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 500,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
        plan: { id: 'plan-3', name: 'Free' },
      });

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'raffle-1',
            status: 'ACTIVE',
            pricePerTicket: 10,
            ticketsSold: 100, // gross = 1000
            totalTickets: 200,
          },
        ]),
      };

      (prismaMock as any).winner = {
        count: jest.fn().mockResolvedValue(0),
      };

      (prismaMock as any).ticket = {
        findMany: jest.fn().mockResolvedValue([]),
      };

      const overview = await service.getHostDashboardOverview('user-1');
      expect(overview.kpiStats.totalGrossRevenue).toBe(1000);
      expect(overview.kpiStats.totalNetRevenue).toBe(850);
      expect(overview.kpiStats.commissionRate).toBe(15.0);
    });
  });

  describe('getSalesAnalytics', () => {
    it('should calculate 90% net revenue and return commissionRate 10 / netPercentage 90 for Premium host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: { id: 'plan-1', name: 'Premium' },
      });

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'raffle-1',
            title: 'Title 1',
            status: 'ACTIVE',
            pricePerTicket: 10,
            ticketsSold: 100, // gross = 1000
            totalTickets: 200,
            createdAt: new Date(),
          },
        ]),
      };

      (prismaMock as any).ticket = {
        findMany: jest.fn().mockResolvedValue([]),
      };

      const result = await service.getSalesAnalytics('user-1');
      expect(result.commissionRate).toBe(10.0);
      expect(result.netPercentage).toBe(90.0);
      expect(result.metrics.totalGrossRevenue).toBe(1000);
      expect(result.metrics.totalNetRevenue).toBe(900);
      expect(result.metrics.commissionRate).toBe(10.0);
      expect(result.metrics.netPercentage).toBe(90.0);
      expect(result.raffles[0].grossRevenue).toBe(1000);
      expect(result.raffles[0].netRevenue).toBe(900);
    });

    it('should calculate 85% net revenue and return commissionRate 15 / netPercentage 85 for Free host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
        plan: { id: 'plan-3', name: 'Free' },
      });

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'raffle-1',
            title: 'Title 1',
            status: 'ACTIVE',
            pricePerTicket: 10,
            ticketsSold: 100, // gross = 1000
            totalTickets: 200,
            createdAt: new Date(),
          },
        ]),
      };

      (prismaMock as any).ticket = {
        findMany: jest.fn().mockResolvedValue([]),
      };

      const result = await service.getSalesAnalytics('user-1');
      expect(result.commissionRate).toBe(15.0);
      expect(result.netPercentage).toBe(85.0);
      expect(result.metrics.totalGrossRevenue).toBe(1000);
      expect(result.metrics.totalNetRevenue).toBe(850);
      expect(result.metrics.commissionRate).toBe(15.0);
      expect(result.metrics.netPercentage).toBe(85.0);
      expect(result.raffles[0].grossRevenue).toBe(1000);
      expect(result.raffles[0].netRevenue).toBe(850);
    });
  });

  describe('getWalletStats', () => {
    it('should calculate fees paid at 10% for Premium host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 1000,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: { id: 'plan-1', name: 'Premium' },
      });

      (prismaMock as any).withdrawal = {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { amount: 0 } }) // pending
          .mockResolvedValueOnce({ _sum: { amount: 200 } }), // completed
      };

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([
          { pricePerTicket: 10, ticketsSold: 50 },
        ]),
      };

      const stats = await service.getWalletStats('user-1');
      expect(stats.commissionRate).toBe(10.0);
      expect(stats.totalFeesPaid).toBe(20); // 200 * 0.10
      expect(stats.totalLifetimeEarnings).toBe(500);
      expect(stats.availableBalance).toBe(1000);
    });

    it('should calculate fees paid at 15% for Free host', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 1000,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
        plan: { id: 'plan-3', name: 'Free' },
      });

      (prismaMock as any).withdrawal = {
        aggregate: jest
          .fn()
          .mockResolvedValueOnce({ _sum: { amount: 0 } }) // pending
          .mockResolvedValueOnce({ _sum: { amount: 200 } }), // completed
      };

      (prismaMock as any).raffle = {
        findMany: jest.fn().mockResolvedValue([]),
      };

      const stats = await service.getWalletStats('user-1');
      expect(stats.commissionRate).toBe(15.0);
      expect(stats.totalFeesPaid).toBe(30); // 200 * 0.15
    });
  });

  describe('requestWithdrawal', () => {
    it('should reject non-BANK_TRANSFER payout methods', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 500,
      });

      await expect(
        service.requestWithdrawal('user-1', {
          amount: 100,
          payoutMethod: 'PAYPAL',
          payoutDetails: { email: 'test@paypal.com' },
        }),
      ).rejects.toThrow('Payout method must be BANK_TRANSFER');
    });

    it('should apply 10% fee and 90% net for Premium host on BANK_TRANSFER', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 500,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-1',
        status: 'ACTIVE',
        plan: { id: 'plan-1', name: 'Premium' },
      });

      const txMock = {
        hostProfile: { update: jest.fn() },
        withdrawal: {
          create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'wd-1', ...data })),
        },
        transaction: { create: jest.fn() },
      };

      (prismaMock as any).$transaction = jest.fn((cb) => cb(txMock));

      const res = await service.requestWithdrawal('user-1', {
        amount: 200,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: { accountNumber: '12345678', sortCode: '11-22-33' },
      });

      expect(res.withdrawal.grossAmount).toBe(200);
      expect(res.withdrawal.feeAmount).toBe(20); // 10% of 200
      expect(res.withdrawal.feePercent).toBe(10);
      expect(res.withdrawal.netAmount).toBe(180); // 90% of 200
      expect(res.withdrawal.payoutMethod).toBe('BANK_TRANSFER');
    });

    it('should apply 15% fee and 85% net for Free host on BANK_TRANSFER', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
        walletBalance: 500,
      });

      prismaMock.hostSubscription.findFirst.mockResolvedValue({
        id: 'sub-3',
        status: 'ACTIVE',
        plan: { id: 'plan-3', name: 'Free' },
      });

      const txMock = {
        hostProfile: { update: jest.fn() },
        withdrawal: {
          create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'wd-2', ...data })),
        },
        transaction: { create: jest.fn() },
      };

      (prismaMock as any).$transaction = jest.fn((cb) => cb(txMock));

      const res = await service.requestWithdrawal('user-1', {
        amount: 200,
        payoutMethod: 'BANK_TRANSFER',
        payoutDetails: { accountNumber: '12345678', sortCode: '11-22-33' },
      });

      expect(res.withdrawal.grossAmount).toBe(200);
      expect(res.withdrawal.feeAmount).toBe(30); // 15% of 200
      expect(res.withdrawal.feePercent).toBe(15);
      expect(res.withdrawal.netAmount).toBe(170); // 85% of 200
      expect(res.withdrawal.payoutMethod).toBe('BANK_TRANSFER');
    });
  });
});

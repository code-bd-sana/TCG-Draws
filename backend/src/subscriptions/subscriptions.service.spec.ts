import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsService } from './subscriptions.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SubscriptionsService - Auto-Reconciliation', () => {
  let service: SubscriptionsService;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      hostProfile: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
      },
      hostSubscription: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      subscriptionPlan: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  it('should auto-reconcile missing transaction for an active £29 Premium subscription', async () => {
    prismaMock.hostProfile.findFirst.mockResolvedValue({
      id: 'host-1',
      userId: 'user-1',
    });

    const activeSub = {
      id: 'sub-prem-1',
      hostId: 'host-1',
      status: 'ACTIVE',
      createdAt: new Date('2026-09-01'),
      plan: {
        id: 'plan-prem',
        name: 'Premium',
        price: 29.0,
      },
    };

    prismaMock.hostSubscription.findMany.mockResolvedValue([activeSub]);

    // Transaction is missing initially
    prismaMock.transaction.findFirst.mockResolvedValue(null);

    prismaMock.transaction.create.mockImplementation(({ data }: any) =>
      Promise.resolve({ id: 'tx-auto-1', ...data }),
    );

    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: 'tx-auto-1',
        userId: 'user-1',
        type: 'SUBSCRIPTION_FEE',
        amount: 29.0,
        status: 'COMPLETED',
        paymentGateway: 'CASHFLOWS',
        relatedEntityId: 'sub-prem-1',
        gatewayTransactionId: 'AUTO_REC_sub-prem',
        createdAt: new Date('2026-09-01'),
      },
    ]);

    const history = await service.getMyBillingHistory('user-1');

    expect(prismaMock.transaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        type: 'SUBSCRIPTION_FEE',
        amount: 29.0,
        status: 'COMPLETED',
        paymentGateway: 'CASHFLOWS',
        relatedEntityId: 'sub-prem-1',
      }),
    });

    expect(history).toHaveLength(1);
    expect(history[0].amount).toBe(29.0);
    expect(history[0].type).toBe('SUBSCRIPTION_FEE');
  });

  it('should not create duplicate transaction if transaction already exists', async () => {
    prismaMock.hostProfile.findFirst.mockResolvedValue({
      id: 'host-1',
      userId: 'user-1',
    });

    const activeSub = {
      id: 'sub-prem-1',
      hostId: 'host-1',
      status: 'ACTIVE',
      plan: {
        id: 'plan-prem',
        name: 'Premium',
        price: 29.0,
      },
    };

    prismaMock.hostSubscription.findMany.mockResolvedValue([activeSub]);

    // Transaction already exists
    prismaMock.transaction.findFirst.mockResolvedValue({
      id: 'tx-existing',
      userId: 'user-1',
      type: 'SUBSCRIPTION_FEE',
      amount: 29.0,
      status: 'COMPLETED',
    });

    prismaMock.transaction.findMany.mockResolvedValue([
      {
        id: 'tx-existing',
        userId: 'user-1',
        type: 'SUBSCRIPTION_FEE',
        amount: 29.0,
      },
    ]);

    const history = await service.getMyBillingHistory('user-1');

    expect(prismaMock.transaction.create).not.toHaveBeenCalled();
    expect(history).toHaveLength(1);
  });
});

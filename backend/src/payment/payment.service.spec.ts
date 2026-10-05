import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from '../tickets/tickets.service';

describe('PaymentService - Subscription Transactions', () => {
  let service: PaymentService;
  let prismaMock: any;
  let ticketsServiceMock: any;

  beforeEach(async () => {
    prismaMock = {
      subscriptionPlan: {
        findFirst: jest.fn(),
      },
      hostProfile: {
        findFirst: jest.fn(),
      },
      hostSubscription: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
      },
      transaction: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    ticketsServiceMock = {
      allocateTicketsInDatabase: jest.fn(),
      allocateBasketTicketsInDatabase: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: TicketsService, useValue: ticketsServiceMock },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
  });

  describe('confirmPaymentReturn - Host Subscription', () => {
    it('should create a SUBSCRIPTION_FEE transaction when confirmed', async () => {
      prismaMock.subscriptionPlan.findFirst.mockResolvedValue({
        id: 'plan-prem-123',
        name: 'Premium',
        price: 29.0,
        durationDays: 30,
      });

      prismaMock.hostProfile.findFirst.mockResolvedValue({
        id: 'host-1',
        userId: 'user-1',
      });

      prismaMock.transaction.findFirst.mockResolvedValue(null);

      prismaMock.hostSubscription.create.mockResolvedValue({
        id: 'sub-new-1',
        hostId: 'host-1',
        planId: 'plan-prem-123',
        status: 'ACTIVE',
      });

      prismaMock.transaction.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'tx-123', ...data }),
      );

      const result = await service.confirmPaymentReturn({
        orderNumber: 'SUB_host1_planprem_123456789',
      });

      expect(result.success).toBe(true);
      expect(result.type).toBe('SUBSCRIPTION');
      expect(result.transaction).toBeDefined();
      expect(result.transaction.type).toBe('SUBSCRIPTION_FEE');
      expect(result.transaction.amount).toBe(29.0);
      expect(result.transaction.status).toBe('COMPLETED');
      expect(result.transaction.userId).toBe('user-1');
      expect(result.transaction.gatewayTransactionId).toBe('SUB_host1_planprem_123456789');
    });
  });

  describe('handleWebhook - Host Subscription', () => {
    it('should idempotently create a SUBSCRIPTION_FEE transaction on webhook event', async () => {
      prismaMock.subscriptionPlan.findFirst.mockResolvedValue({
        id: 'plan-pro-456',
        name: 'Pro',
        price: 79.0,
        durationDays: 30,
      });

      prismaMock.hostProfile.findFirst.mockResolvedValue({
        id: 'host-2',
        userId: 'user-2',
      });

      prismaMock.hostSubscription.create.mockResolvedValue({
        id: 'sub-new-2',
        hostId: 'host-2',
        planId: 'plan-pro-456',
        status: 'ACTIVE',
      });

      // First webhook call: no existing transaction
      prismaMock.transaction.findFirst.mockResolvedValue(null);
      prismaMock.transaction.create.mockImplementation(({ data }: any) =>
        Promise.resolve({ id: 'tx-456', ...data }),
      );

      const payload = {
        data: {
          paymentStatus: 'COMPLETED',
          order: {
            orderNumber: 'SUB_host2_planpro_987654321',
          },
        },
      };

      const result = await service.handleWebhookNotification('dummy-sig', payload);
      expect(result.success).toBe(true);
      expect(prismaMock.transaction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'SUBSCRIPTION_FEE',
          amount: 79.0,
          status: 'COMPLETED',
          userId: 'user-2',
          gatewayTransactionId: 'SUB_host2_planpro_987654321',
        }),
      });
    });
  });
});

import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { TicketsService } from '../tickets/tickets.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => TicketsService))
    private readonly ticketsService: TicketsService,
  ) {}

  private generateHash(requestBodyString: string): string {
    const apiKey = process.env.CASHFLOWS_API_KEY || '';
    const dataToHash = apiKey + requestBodyString;
    return crypto
      .createHash('sha512')
      .update(dataToHash)
      .digest('hex')
      .toUpperCase();
  }

  async createSubscriptionCheckout(hostId: string, planId: string) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });
    if (!plan) throw new BadRequestException('Plan not found');

    const host = await this.prisma.hostProfile.findUnique({
      where: { userId: hostId },
      include: { user: true },
    });
    if (!host) throw new BadRequestException('Host profile not found');

    // Free Subscription Plan (Price = 0) -> Immediately activate without payment gateway
    if (Number(plan.price) === 0) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (plan.durationDays || 365));

      // Deactivate existing subscriptions
      await this.prisma.hostSubscription.updateMany({
        where: { hostId: host.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED' },
      });

      // Create new active subscription
      const newSub = await this.prisma.hostSubscription.create({
        data: {
          hostId: host.id,
          planId: plan.id,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      });

      // Create a transaction record for free subscription
      const transactionId = `FREE_SUB_${crypto.randomUUID()}`;
      await this.prisma.transaction.create({
        data: {
          userId: host.user.id,
          type: 'SUBSCRIPTION_FEE',
          amount: 0,
          status: 'COMPLETED',
          paymentGateway: 'FREE',
          gatewayTransactionId: transactionId,
          relatedEntityId: newSub.id,
        },
      });

      this.logger.log(
        `Activated FREE subscription for host ${hostId} with plan ${plan.name}`,
      );
      return {
        isFree: true,
        transactionId,
        message: 'Free subscription activated successfully',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/host/billing?status=success`,
      };
    }

    const baseUrl =
      process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';
    const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';

    // Test Payment Flow (Enabled if USE_TEST_PAYMENT=true in .env)
    if (process.env.USE_TEST_PAYMENT === 'true') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // Deactivate existing subscriptions
      await this.prisma.hostSubscription.updateMany({
        where: { hostId: host.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED' },
      });

      // Create new active subscription
      const newSub = await this.prisma.hostSubscription.create({
        data: {
          hostId: host.id,
          planId,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      });

      // Create a test transaction record
      const transactionId = `TEST_SUB_${crypto.randomUUID()}`;
      await this.prisma.transaction.create({
        data: {
          userId: host.user.id,
          type: 'SUBSCRIPTION_FEE',
          amount: plan.price,
          status: 'COMPLETED',
          paymentGateway: 'TEST',
          gatewayTransactionId: transactionId,
          relatedEntityId: newSub.id,
        },
      });

      this.logger.log(
        `Activated TEST subscription for host ${hostId} with plan ${plan.name}`,
      );
      return {
        isTest: true,
        transactionId,
        message: 'Test payment successful',
      };
    }

    // Generate unique order number (max 35 chars for Cashflows API)
    const orderNumber = `SUB_${hostId.slice(0, 8)}_${planId.slice(0, 8)}_${Date.now()}`;

    // Request payload for Cashflows Hosted Payment Page / Checkout
    const requestPayload = {
      Request: {
        type: 'Payment',
        amountToCollect: plan!.price.toString(),
        currency: 'GBP',
        order: {
          orderNumber: orderNumber,
        },
        recurring: true, // Mark as recurring for subscriptions
        customer: {
          email: host!.user.email,
          firstName: host!.user.firstName || '',
          lastName: host!.user.lastName || '',
        },
        returnUrl: `${process.env.FRONTEND_URL}/dashboard/host/billing?status=success`,
        cancelUrl: `${process.env.FRONTEND_URL}/dashboard/host/billing?status=cancel`,
      },
    };

    const apiKey = process.env.CASHFLOWS_API_KEY || '';

    const innerRequestPayload = {
      type: 'Payment',
      amountToCollect: Number(plan.price).toFixed(2),
      currency: 'GBP',
      order: {
        orderNumber: orderNumber,
        note: `Subscription Plan: ${plan.name}`,
      },
      customer: {
        email: host.user.email,
        firstName: host.user.firstName || 'Valued',
        lastName: host.user.lastName || 'Customer',
      },
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/host/billing?status=success&ordernumber=${orderNumber}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/host/billing?status=cancel`,
    };

    const innerRequestString = JSON.stringify(innerRequestPayload);
    const hash = crypto
      .createHash('sha512')
      .update(apiKey + innerRequestString)
      .digest('hex')
      .toUpperCase();

    try {
      console.log('=====================================================');
      console.log('CASHFLOWS SUBSCRIPTION CHECKOUT REQUEST:');
      console.log('URL:', `${baseUrl}/api/gateway/payment-jobs`);
      console.log('ConfigurationId:', configId);
      console.log('Hash:', hash);
      console.log('Body Payload:', innerRequestString);
      console.log('=====================================================');

      const response = await fetch(`${baseUrl}/api/gateway/payment-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ConfigurationId: configId,
          Hash: hash,
        },
        body: innerRequestString,
      });

      const responseText = await response.text();
      console.log('=====================================================');
      console.log(`CASHFLOWS SUBSCRIPTION RESPONSE (Status: ${response.status}):`);
      console.log(responseText);
      console.log('=====================================================');

      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { rawText: responseText };
      }

      if (!response.ok) {
        this.logger.error(`Cashflows Subscription API error (${response.status}): ${responseText}`, data);
        throw new BadRequestException(
          data.message || data.error || `Cashflows API error (${response.status}): ${responseText || 'Empty response'}`,
        );
      }

      this.logger.log(`CASHFLOWS SUCCESS RESPONSE DATA: ${JSON.stringify(data, null, 2)}`);

      let redirectUrl =
        data.links?.action?.href ||
        data.links?.action?.url ||
        (typeof data.links?.action === 'string' ? data.links.action : null) ||
        data.redirectUrl ||
        data.paymentUrl ||
        data.url ||
        data.hostedPaymentPageUrl ||
        data.checkoutUrl ||
        data.href ||
        data.link;

      if (!redirectUrl && Array.isArray(data.actions)) {
        const checkoutAction = data.actions.find(
          (a: any) => a.rel === 'checkout' || a.rel === 'payment' || a.rel === 'redirect' || a.rel === 'hosted_checkout',
        );
        if (checkoutAction) redirectUrl = checkoutAction.href || checkoutAction.url;
      }

      if (!redirectUrl && data.data?.reference) {
        redirectUrl = `${baseUrl}/payment?ref=${data.data.reference}`;
      }

      if (!redirectUrl) {
        this.logger.error('Cashflows API response payload:', JSON.stringify(data, null, 2));
        throw new BadRequestException(`Cashflows gateway response: ${JSON.stringify(data)}`);
      }

      return { url: redirectUrl };
    } catch (error: any) {
      this.logger.error(`Cashflow API error: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(
        `Cashflows Payment Gateway Error: ${error.message}`,
      );
    }
  }

  private isPaymentSuccessful(status?: string): boolean {
    if (!status) return false;
    const s = status.toUpperCase().trim();
    const successStatuses = [
      'COMPLETED',
      'SUCCESS',
      'SETTLED',
      'AUTHORISED',
      'AUTHORIZED',
      'PAID',
      'CAPTURED',
      'PAYMENT_COMPLETE',
    ];
    return successStatuses.includes(s);
  }

  async handleWebhook(signature: string, payload: any) {
    this.logger.log(`Received Cashflow webhook signature: ${signature}`);
    
    let parsedPayload = payload;
    let payloadString = '';

    if (Buffer.isBuffer(payload)) {
      payloadString = payload.toString('utf8');
      try {
        parsedPayload = JSON.parse(payloadString);
      } catch {
        parsedPayload = { raw: payloadString };
      }
    } else if (typeof payload === 'string') {
      payloadString = payload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch {
        parsedPayload = { raw: payload };
      }
    } else {
      parsedPayload = payload || {};
      payloadString = JSON.stringify(payload);
    }

    console.log('=====================================================');
    console.log('CASHFLOWS INCOMING WEBHOOK NOTIFICATION DATA:');
    console.log(JSON.stringify(parsedPayload, null, 2));
    console.log('=====================================================');

    try {
      const data = parsedPayload.data || parsedPayload;
      let orderNumber = data.order?.orderNumber || data.orderNumber;
      let status = (data.paymentStatus || data.status || parsedPayload.event || '').toString().toUpperCase();

      const paymentJobRef = parsedPayload.paymentJobReference || parsedPayload.paymentReference || data.paymentJobReference;

      // If webhook carries a paymentJobReference, fetch the full payment job details from Cashflows API
      if (paymentJobRef) {
        this.logger.log(`Fetching Cashflows payment-job details for reference: ${paymentJobRef}`);
        const apiKey = process.env.CASHFLOWS_API_KEY || '';
        const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
        const baseUrl = process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';

        const getHash = crypto
          .createHash('sha512')
          .update(apiKey)
          .digest('hex')
          .toUpperCase();

        try {
          const jobResponse = await fetch(`${baseUrl}/api/gateway/payment-jobs/${paymentJobRef}`, {
            method: 'GET',
            headers: {
              ConfigurationId: configId,
              Hash: getHash,
              'Content-Type': 'application/json',
            },
          });

          const jobData = await jobResponse.json();
          console.log('=====================================================');
          console.log('CASHFLOWS FETCHED PAYMENT JOB DETAILS:');
          console.log(JSON.stringify(jobData, null, 2));
          console.log('=====================================================');

          const fetchedOrder = jobData.data?.order || jobData.order;
          if (fetchedOrder?.orderNumber) {
            orderNumber = fetchedOrder.orderNumber;
          }
          const fetchedStatus = jobData.data?.paymentStatus || jobData.paymentStatus || jobData.status;
          if (fetchedStatus) {
            status = fetchedStatus.toString().toUpperCase();
          }
        } catch (fetchErr: any) {
          this.logger.error(`Failed to fetch payment job details for ${paymentJobRef}: ${fetchErr.message}`);
        }
      }

      this.logger.log(`Webhook Processing - Event Status: "${status}", OrderNumber: "${orderNumber}"`);

      const isSuccess = this.isPaymentSuccessful(status);

      if (!isSuccess) {
        this.logger.log(
          `Webhook received non-success or pending status "${status}" for order "${orderNumber}". Skipping ticket allocation.`,
        );
        return {
          status: 'ignored_uncompleted',
          eventStatus: status,
          orderNumber,
        };
      }

      // Handle Ticket Purchase Order (orderNumber format: TCK_raffleIdPrefix_userIdPrefix_quantity_[pendingTxId]_timestamp)
      if (orderNumber && orderNumber.startsWith('TCK_')) {
        const parts = orderNumber.split('_');
        const rafflePrefix = parts[1];
        const userPrefix = parts[2];
        const quantity = parseInt(parts[3] || '1', 10);
        const pendingTransactionId = parts.length >= 6 ? parts[4] : undefined;

        if (rafflePrefix && userPrefix && quantity > 0) {
          const raffle = await this.prisma.raffle.findFirst({
            where: { id: { startsWith: rafflePrefix } },
          });
          const user = await this.prisma.user.findFirst({
            where: { id: { startsWith: userPrefix } },
          });

          if (raffle && user) {
            // Check if tickets for this transaction were already allocated to prevent double allocation
            const existingTx = await this.prisma.transaction.findFirst({
              where: {
                OR: [
                  ...(pendingTransactionId ? [{ id: pendingTransactionId, status: 'COMPLETED' }] : []),
                  { gatewayTransactionId: orderNumber, status: 'COMPLETED' },
                ],
              },
            });

            if (existingTx) {
              this.logger.log(`Tickets for order ${orderNumber} already allocated.`);
              return { success: true, message: 'Already allocated' };
            }

            this.logger.log(`Allocating ${quantity} tickets for user ${user.id} in raffle ${raffle.id} via confirmed webhook...`);
            try {
              const ticketResult: any = await this.ticketsService.allocateTicketsInDatabase(
                user.id,
                raffle.id,
                quantity,
                'CASHFLOWS',
                orderNumber,
                pendingTransactionId,
              );
              this.logger.log(
                `Successfully allocated ${quantity} ticket(s) via webhook for order ${orderNumber}`,
              );
            } catch (tckErr: any) {
              this.logger.warn(`Webhook ticket allocation notice: ${tckErr.message}`);
            }
          }
        }
      }

      // Handle Basket Ticket Purchase Order (orderNumber format: BSK_transactionId_timestamp)
      if (orderNumber && orderNumber.startsWith('BSK_')) {
        const parts = orderNumber.split('_');
        const transactionId = parts[1];

        if (transactionId) {
          const pendingTx = await this.prisma.transaction.findUnique({
            where: { id: transactionId },
            include: { tickets: true },
          });

          if (pendingTx && pendingTx.status !== 'COMPLETED') {
            const serializedItems = pendingTx.relatedEntityId || '';
            const items = serializedItems
              .split(';')
              .filter(Boolean)
              .map((part) => {
                const [rId, q] = part.split(':');
                return { raffleId: rId, quantity: parseInt(q || '1', 10) };
              });

            if (items.length > 0) {
              this.logger.log(`Allocating basket tickets for transaction ${transactionId} via webhook...`);
              try {
                const result = await this.ticketsService.allocateBasketTicketsInDatabase(
                  pendingTx.userId,
                  items,
                  undefined,
                  'CASHFLOWS',
                  orderNumber,
                  pendingTx.id,
                );
                this.logger.log(`Successfully allocated basket tickets via webhook for tx ${transactionId}`);
              } catch (bskErr: any) {
                this.logger.warn(`Webhook basket ticket allocation notice: ${bskErr.message}`);
              }
            }
          }
        }
      }

      // Handle Host Subscription Order (orderNumber format: SUB_hostIdPrefix_planIdPrefix_timestamp)
      if (orderNumber && orderNumber.startsWith('SUB_')) {
        const parts = orderNumber.split('_');
        const hostPrefix = parts[1];
        const planPrefix = parts[2];

        if (hostPrefix && planPrefix) {
          const plan = await this.prisma.subscriptionPlan.findFirst({
            where: { id: { startsWith: planPrefix } },
          });
          const host = await this.prisma.hostProfile.findFirst({
            where: { OR: [{ id: { startsWith: hostPrefix } }, { userId: { startsWith: hostPrefix } }] },
          });

          if (plan && host) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);

            await this.prisma.hostSubscription.updateMany({
              where: { hostId: host.id, status: 'ACTIVE' },
              data: { status: 'EXPIRED' },
            });

            const sub = await this.prisma.hostSubscription.create({
              data: {
                hostId: host.id,
                planId: plan.id,
                status: 'ACTIVE',
                startDate,
                endDate,
              },
            });

            // Idempotently create SUBSCRIPTION_FEE Transaction record
            const existingTx = await this.prisma.transaction.findFirst({
              where: {
                OR: [
                  { gatewayTransactionId: orderNumber },
                  { relatedEntityId: sub.id },
                ],
                type: 'SUBSCRIPTION_FEE',
              },
            });

            if (!existingTx) {
              await this.prisma.transaction.create({
                data: {
                  userId: host.userId,
                  type: 'SUBSCRIPTION_FEE',
                  amount: plan.price,
                  status: 'COMPLETED',
                  paymentGateway: 'CASHFLOWS',
                  gatewayTransactionId: orderNumber,
                  relatedEntityId: sub.id,
                },
              });
              this.logger.log(
                `Created SUBSCRIPTION_FEE transaction for host ${host.id} on plan ${plan.name} via webhook`,
              );
            }

            this.logger.log(
              `Activated subscription for host ${host.id} with plan ${plan.name} via webhook`,
            );
          }
        }
      }

      return { success: true, message: 'Webhook notification processed successfully' };
    } catch (err: any) {
      this.logger.error(`Cashflow webhook error: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  async confirmPaymentReturn(params: {
    paymentJobRef?: string;
    orderNumber?: string;
  }) {
    let orderNumber = params.orderNumber;
    const paymentJobRef = params.paymentJobRef;

    this.logger.log(`confirmPaymentReturn called with paymentJobRef: "${paymentJobRef}", orderNumber: "${orderNumber}"`);

    let isVerifiedSuccess = false;

    if (!orderNumber && paymentJobRef) {
      const apiKey = process.env.CASHFLOWS_API_KEY || '';
      const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
      const baseUrl = process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';
      const getHash = crypto.createHash('sha512').update(apiKey).digest('hex').toUpperCase();

      try {
        const jobResponse = await fetch(`${baseUrl}/api/gateway/payment-jobs/${paymentJobRef}`, {
          method: 'GET',
          headers: {
            ConfigurationId: configId,
            Hash: getHash,
            'Content-Type': 'application/json',
          },
        });
        const jobData = await jobResponse.json();
        const fetchedOrder = jobData.data?.order || jobData.order;
        if (fetchedOrder?.orderNumber) {
          orderNumber = fetchedOrder.orderNumber;
        }
        const fetchedStatus = jobData.data?.paymentStatus || jobData.paymentStatus || jobData.status;
        if (this.isPaymentSuccessful(fetchedStatus)) {
          isVerifiedSuccess = true;
        }
      } catch (err: any) {
        this.logger.error(`Failed to fetch job ref ${paymentJobRef} in confirmation: ${err.message}`);
      }
    } else if (paymentJobRef) {
      // If orderNumber is present but paymentJobRef is also present, verify status
      const apiKey = process.env.CASHFLOWS_API_KEY || '';
      const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
      const baseUrl = process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';
      const getHash = crypto.createHash('sha512').update(apiKey).digest('hex').toUpperCase();

      try {
        const jobResponse = await fetch(`${baseUrl}/api/gateway/payment-jobs/${paymentJobRef}`, {
          method: 'GET',
          headers: {
            ConfigurationId: configId,
            Hash: getHash,
            'Content-Type': 'application/json',
          },
        });
        const jobData = await jobResponse.json();
        const fetchedStatus = jobData.data?.paymentStatus || jobData.paymentStatus || jobData.status;
        if (this.isPaymentSuccessful(fetchedStatus)) {
          isVerifiedSuccess = true;
        }
      } catch (err: any) {
        this.logger.error(`Failed to verify job ref ${paymentJobRef}: ${err.message}`);
      }
    }

    if (!orderNumber) {
      throw new BadRequestException('Order number or payment job reference is required');
    }

    // Process Ticket Purchase Order
    if (orderNumber.startsWith('TCK_')) {
      const parts = orderNumber.split('_');
      const rafflePrefix = parts[1];
      const userPrefix = parts[2];
      const quantity = parseInt(parts[3] || '1', 10);
      const pendingTransactionId = parts.length >= 6 ? parts[4] : undefined;

      // Check if already completed (by webhook)
      const existingTx = await this.prisma.transaction.findFirst({
        where: {
          OR: [
            ...(pendingTransactionId ? [{ id: pendingTransactionId, status: 'COMPLETED' }] : []),
            { gatewayTransactionId: orderNumber, status: 'COMPLETED' },
          ],
        },
      });

      if (existingTx) {
        const existingTickets = await this.prisma.ticket.findMany({
          where: { transactionId: existingTx.id },
        });
        return {
          success: true,
          type: 'TICKET_PURCHASE',
          transaction: existingTx,
          createdTickets: existingTickets,
        };
      }

      // Unless USE_TEST_PAYMENT is explicitly 'true', payment MUST be verified by Cashflows or completed webhook!
      const isTestPayment =
        process.env.USE_TEST_PAYMENT === 'true' ||
        process.env.USE_TEST_PAYMENT === '"true"';

      if (!isTestPayment && !isVerifiedSuccess) {
        this.logger.warn(`Unverified ticket return confirmation attempt for order ${orderNumber}. Awaiting Cashflows webhook.`);
        return {
          success: false,
          status: 'PENDING',
          message: 'Payment is being processed by Cashflows. Your tickets will appear once confirmed by webhook.',
        };
      }

      if (rafflePrefix && userPrefix && quantity > 0) {
        const raffle = await this.prisma.raffle.findFirst({
          where: { id: { startsWith: rafflePrefix } },
        });
        const user = await this.prisma.user.findFirst({
          where: { id: { startsWith: userPrefix } },
        });

        if (raffle && user) {
          try {
            const result: any = await this.ticketsService.allocateTicketsInDatabase(
              user.id,
              raffle.id,
              quantity,
              'CASHFLOWS',
              orderNumber,
              pendingTransactionId,
            );
            this.logger.log(`Confirmed & allocated ${quantity} tickets for user ${user.id} in raffle ${raffle.id}`);
            return {
              success: true,
              type: 'TICKET_PURCHASE',
              ...result,
            };
          } catch (err: any) {
            this.logger.warn(`Ticket confirmation notice: ${err.message}`);
            return {
              success: true,
              type: 'TICKET_PURCHASE',
              message: err.message || 'Tickets confirmed',
            };
          }
        }
      }
    }

    // Process Basket Ticket Purchase Order
    if (orderNumber.startsWith('BSK_')) {
      const parts = orderNumber.split('_');
      const transactionId = parts[1];

      if (transactionId) {
        const pendingTx = await this.prisma.transaction.findUnique({
          where: { id: transactionId },
          include: { tickets: true },
        });

        if (pendingTx) {
          if (pendingTx.status === 'COMPLETED') {
            const existingTickets = await this.prisma.ticket.findMany({
              where: { transactionId: pendingTx.id },
            });
            return {
              success: true,
              type: 'TICKET_PURCHASE',
              transaction: pendingTx,
              tickets: existingTickets,
            };
          }

          // Unless USE_TEST_PAYMENT is explicitly 'true', payment MUST be verified by Cashflows or completed webhook!
          const isTestPayment =
            process.env.USE_TEST_PAYMENT === 'true' ||
            process.env.USE_TEST_PAYMENT === '"true"';

          if (!isTestPayment && !isVerifiedSuccess) {
            this.logger.warn(`Unverified basket return confirmation attempt for order ${orderNumber}. Awaiting Cashflows webhook.`);
            return {
              success: false,
              status: 'PENDING',
              message: 'Payment is being processed by Cashflows. Your tickets will appear once confirmed by webhook.',
            };
          }

          const serializedItems = pendingTx.relatedEntityId || '';
          const items = serializedItems
            .split(';')
            .filter(Boolean)
            .map((part) => {
              const [rId, q] = part.split(':');
              return { raffleId: rId, quantity: parseInt(q || '1', 10) };
            });

          if (items.length > 0) {
            try {
              const result: any = await this.ticketsService.allocateBasketTicketsInDatabase(
                pendingTx.userId,
                items,
                undefined,
                'CASHFLOWS',
                orderNumber,
                pendingTx.id,
              );
              this.logger.log(`Confirmed & allocated basket tickets for tx ${pendingTx.id}`);
              return {
                success: true,
                type: 'TICKET_PURCHASE',
                ...result,
              };
            } catch (err: any) {
              this.logger.warn(`Basket ticket confirmation notice: ${err.message}`);
              return {
                success: true,
                type: 'TICKET_PURCHASE',
                message: err.message || 'Basket tickets confirmed',
              };
            }
          }
        }
      }
    }

    // Process Host Subscription Order
    if (orderNumber.startsWith('SUB_')) {
      const parts = orderNumber.split('_');
      const hostPrefix = parts[1];
      const planPrefix = parts[2];

      if (hostPrefix && planPrefix) {
        const plan = await this.prisma.subscriptionPlan.findFirst({
          where: { id: { startsWith: planPrefix } },
        });
        const host = await this.prisma.hostProfile.findFirst({
          where: { OR: [{ id: { startsWith: hostPrefix } }, { userId: { startsWith: hostPrefix } }] },
        });

        if (plan && host) {
          const existingTx = await this.prisma.transaction.findFirst({
            where: {
              gatewayTransactionId: orderNumber,
              type: 'SUBSCRIPTION_FEE',
            },
          });

          let sub: any;
          if (existingTx && existingTx.relatedEntityId) {
            sub = await this.prisma.hostSubscription.findUnique({
              where: { id: existingTx.relatedEntityId },
            });
          }

          if (!sub) {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + plan.durationDays);

            await this.prisma.hostSubscription.updateMany({
              where: { hostId: host.id, status: 'ACTIVE' },
              data: { status: 'EXPIRED' },
            });

            sub = await this.prisma.hostSubscription.create({
              data: {
                hostId: host.id,
                planId: plan.id,
                status: 'ACTIVE',
                startDate,
                endDate,
              },
            });
          }

          let transaction = existingTx;
          if (!transaction) {
            transaction = await this.prisma.transaction.create({
              data: {
                userId: host.userId,
                type: 'SUBSCRIPTION_FEE',
                amount: plan.price,
                status: 'COMPLETED',
                paymentGateway: 'CASHFLOWS',
                gatewayTransactionId: orderNumber,
                relatedEntityId: sub.id,
              },
            });
            this.logger.log(
              `Created SUBSCRIPTION_FEE transaction ${transaction.id} for host ${host.id} via confirmation`,
            );
          }

          this.logger.log(`Confirmed subscription for host ${host.id} with plan ${plan.name}`);
          return {
            success: true,
            type: 'SUBSCRIPTION',
            subscription: sub,
            transaction,
          };
        }
      }
    }

    return { success: true, message: 'Payment confirmation completed' };
  }

  async handleWebhookNotification(signature: string, payload: any) {
    return this.handleWebhook(signature, payload);
  }
}

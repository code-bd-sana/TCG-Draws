import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { RafflesService } from '../raffles/raffles.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  BasketCheckoutDto,
  ShippingDetailsDto,
} from './dto/basket-checkout.dto';

@Injectable()
export class TicketsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => RafflesService))
    private readonly rafflesService: RafflesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async purchaseTickets(userId: string, raffleId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      select: { pricePerTicket: true },
    });

    if (!raffle) {
      throw new NotFoundException('Competition not found');
    }

    const price = Number(raffle.pricePerTicket || 0);
    if (price <= 0) {
      return this.allocateTicketsInDatabase(
        userId,
        raffleId,
        quantity,
        'FREE_ENTRY',
      );
    }

    const isTestPayment =
      process.env.USE_TEST_PAYMENT === 'true' ||
      process.env.USE_TEST_PAYMENT === '"true"';

    if (isTestPayment) {
      return this.allocateTicketsInDatabase(userId, raffleId, quantity);
    }

    // Default to Cashflows Payment Gateway
    return this.createCashflowsTicketCheckout(userId, raffleId, quantity);
  }

  async allocateTicketsInDatabase(
    userId: string,
    raffleId: string,
    quantity: number,
    paymentGateway = 'SIMULATED',
    gatewayTransactionId?: string,
    existingTransactionId?: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        // 1. Fetch the active raffle and lock it for update if needed.
        const raffle = await tx.raffle.findUnique({
          where: { id: raffleId },
          include: { instantWins: true },
        });

        if (!raffle) {
          throw new NotFoundException('Competition not found');
        }

        if (raffle.status !== 'ACTIVE') {
          throw new BadRequestException('This competition is not active');
        }

        const now = new Date();
        if (raffle.startDate && new Date(raffle.startDate) > now) {
          throw new BadRequestException('This competition has not started yet');
        }
        if (raffle.endDate && new Date(raffle.endDate) <= now) {
          throw new BadRequestException('This competition has already closed');
        }

        const minTickets = raffle.minTickets || 1;
        if (quantity < minTickets) {
          throw new BadRequestException(
            `Minimum ticket purchase for "${raffle.title}" is ${minTickets} ticket(s)`,
          );
        }

        if (raffle.maxTickets) {
          const userExistingCount = await tx.ticket.count({
            where: { raffleId, userId },
          });
          if (userExistingCount + quantity > raffle.maxTickets) {
            const allowed = Math.max(0, raffle.maxTickets - userExistingCount);
            throw new BadRequestException(
              `Maximum ticket limit is ${raffle.maxTickets} per person for "${raffle.title}". You already hold ${userExistingCount} ticket(s). You can purchase up to ${allowed} more.`,
            );
          }
        }

        // 2. Determine available ticket numbers based on real database tickets
        const existingTickets = await tx.ticket.findMany({
          where: { raffleId },
          select: { ticketNumber: true },
        });
        const usedNumbers = new Set(existingTickets.map((t) => t.ticketNumber));
        const actualSold = existingTickets.length;

        if (actualSold + quantity > raffle.totalTickets) {
          throw new BadRequestException(
            `Only ${raffle.totalTickets - actualSold} tickets remaining`,
          );
        }

        const availableNumbers: number[] = [];
        for (let i = 1; i <= raffle.totalTickets; i++) {
          if (!usedNumbers.has(i)) {
            availableNumbers.push(i);
          }
        }

        if (availableNumbers.length < quantity) {
          throw new BadRequestException('Not enough ticket numbers available');
        }

        // 3. Shuffle and pick random numbers
        for (let i = availableNumbers.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [availableNumbers[i], availableNumbers[j]] = [
            availableNumbers[j],
            availableNumbers[i],
          ];
        }
        const assignedNumbers = availableNumbers.slice(0, quantity);

        // 4. Create or Update Transaction
        const totalAmount = Number(raffle.pricePerTicket) * quantity;
        const finalGatewayTxId =
          gatewayTransactionId ||
          (paymentGateway === 'CASHFLOWS'
            ? `CF_${crypto.randomUUID()}`
            : paymentGateway === 'FREE_ENTRY'
            ? `FREE_${crypto.randomUUID()}`
            : `SIM_PAY_${crypto.randomUUID()}`);

        let transaction: any;
        if (existingTransactionId) {
          transaction = await tx.transaction.update({
            where: { id: existingTransactionId },
            data: {
              status: 'COMPLETED',
              amount: totalAmount,
              paymentGateway,
              gatewayTransactionId: finalGatewayTxId,
            },
          });
        } else {
          transaction = await tx.transaction.create({
            data: {
              userId,
              type: 'TICKET_PURCHASE',
              amount: totalAmount,
              status: 'COMPLETED',
              paymentGateway,
              gatewayTransactionId: finalGatewayTxId,
              relatedEntityId: raffle.id,
            },
          });
        }

        // 5. Create Tickets
        const ticketsData = assignedNumbers.map((num) => ({
          raffleId: raffle.id,
          userId,
          transactionId: transaction.id,
          ticketNumber: num,
        }));

        await tx.ticket.createMany({
          data: ticketsData,
        });

        // Fetch the created tickets to return them
        const createdTickets = await tx.ticket.findMany({
          where: { transactionId: transaction.id },
        });

        // 6. Check for Instant Wins
        const instantWinsData: any[] = [];
        const userInstantWins: any[] = [];

        for (const ticket of createdTickets) {
          const matchedInstantWin = raffle.instantWins.find(
            (iw) => iw.ticketNumber === ticket.ticketNumber && !iw.isClaimed,
          );

          if (matchedInstantWin) {
            // Mark as claimed
            const updatedInstantWin = await tx.instantWin.update({
              where: { id: matchedInstantWin.id },
              data: { isClaimed: true },
            });

            // Create Winner Record for instant win
            const winner = await tx.winner.create({
              data: {
                raffleId: raffle.id,
                userId,
                ticketId: ticket.id,
                winType: 'INSTANT_WIN',
                prizeName: updatedInstantWin.prizeName,
                deliveryStatus: 'PENDING',
              },
            });

            instantWinsData.push(updatedInstantWin);
            userInstantWins.push({
              ...winner,
              instantWin: updatedInstantWin,
              ticket,
            });
          }
        }

        // 7. Recalculate and update ticketsSold based on actual tickets in database
        const newTotalSold = actualSold + quantity;
        const updatedRaffle = await tx.raffle.update({
          where: { id: raffle.id },
          data: {
            ticketsSold: newTotalSold,
          },
        });

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

        return {
          transaction,
          createdTickets,
          userInstantWins,
          updatedRaffle,
        };
      },
      {
        timeout: 15000,
      },
    );

    // End competition if max capacity reached
    if (
      result.updatedRaffle.ticketsSold >= result.updatedRaffle.totalTickets &&
      result.updatedRaffle.status === 'ACTIVE'
    ) {
      try {
        await this.prisma.raffle.update({
          where: { id: result.updatedRaffle.id },
          data: { status: 'ENDED' },
        });
      } catch (err) {
        console.error('Failed to update manual raffle status on sold out:', err);
      }
    }

    // Non-blocking notification dispatches
    try {
      const raffleTitle = result.updatedRaffle.title;
      const amount = Number(result.transaction.amount);

      // 1. Buyer order confirmation
      this.notificationsService.notifyUser(
        userId,
        'PURCHASE',
        '🎟️ Tickets Confirmed',
        `You successfully purchased ${quantity} ticket(s) for "${raffleTitle}" (£${amount.toFixed(2)}). Good luck!`,
        '/dashboard/user/tickets',
        { raffleId, quantity, amount, transactionId: result.transaction.id },
      );

      // 2. Host ticket sale notification
      if (result.updatedRaffle.hostId) {
        this.notificationsService.notifyHost(
          result.updatedRaffle.hostId,
          'PURCHASE',
          '🎟️ New Ticket Sale',
          `${quantity} ticket(s) purchased for "${raffleTitle}" (£${amount.toFixed(2)}).`,
          '/dashboard/host/competitions',
          { raffleId, quantity, amount },
        );
      }

      // 3. Admin order alert
      this.notificationsService.notifyAdmins(
        'PURCHASE',
        '🎟️ Ticket Order Completed',
        `Order of ${quantity} ticket(s) (£${amount.toFixed(2)}) for "${raffleTitle}".`,
        '/dashboard/admin/orders',
        { raffleId, quantity, amount },
      );

      // 4. Instant win alerts (if any)
      if (result.userInstantWins && result.userInstantWins.length > 0) {
        for (const win of result.userInstantWins) {
          const prizeName = win.prizeName || win.instantWin?.prizeName || 'Instant Win Prize';
          const ticketNum = win.ticket?.ticketNumber || win.instantWin?.ticketNumber;

          // Winner user
          this.notificationsService.notifyUser(
            userId,
            'WIN',
            '⚡ Instant Win Prize Won!',
            `You won ${prizeName} on ticket #${ticketNum} for "${raffleTitle}"! Claim your prize now.`,
            '/dashboard/user/winners',
            { raffleId, prizeName, ticketNumber: ticketNum },
          );

          // Host
          if (result.updatedRaffle.hostId) {
            this.notificationsService.notifyHost(
              result.updatedRaffle.hostId,
              'WIN',
              '⚡ Instant Win Claimed',
              `An entrant won instant prize "${prizeName}" on ticket #${ticketNum} for "${raffleTitle}".`,
              '/dashboard/host/competitions',
              { raffleId, prizeName, ticketNumber: ticketNum },
            );
          }

          // Admin
          this.notificationsService.notifyAdmins(
            'WIN',
            '⚡ Instant Win Claimed',
            `Instant prize "${prizeName}" claimed on ticket #${ticketNum} for "${raffleTitle}".`,
            '/dashboard/admin/winners',
            { raffleId, prizeName, ticketNumber: ticketNum },
          );
        }
      }
    } catch (e) {
      // Non-blocking
    }

    return {
      message: 'Tickets purchased successfully',
      transaction: result.transaction,
      tickets: result.createdTickets,
      instantWins: result.userInstantWins,
    };
  }

  async getUserTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: { userId },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
            endDate: true,
            status: true,
            prizeName: true,
            description: true,
            pricePerTicket: true,
            totalTickets: true,
            ticketsSold: true,
            instantWins: true,
            host: {
              include: { user: true },
            },
          },
        },
        winners: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createCashflowsTicketCheckout(
    userId: string,
    raffleId: string,
    quantity: number,
  ) {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    });

    if (!raffle) {
      throw new NotFoundException('Competition not found');
    }

    if (raffle.status !== 'ACTIVE') {
      throw new BadRequestException('This competition is not active');
    }

    const now = new Date();
    if (raffle.startDate && new Date(raffle.startDate) > now) {
      throw new BadRequestException('This competition has not started yet');
    }
    if (raffle.endDate && new Date(raffle.endDate) <= now) {
      throw new BadRequestException('This competition has already closed');
    }

    const minTickets = raffle.minTickets || 1;
    if (quantity < minTickets) {
      throw new BadRequestException(
        `Minimum ticket purchase for "${raffle.title}" is ${minTickets} ticket(s)`,
      );
    }

    if (raffle.maxTickets) {
      const userExistingCount = await this.prisma.ticket.count({
        where: { raffleId, userId },
      });
      if (userExistingCount + quantity > raffle.maxTickets) {
        const allowed = Math.max(0, raffle.maxTickets - userExistingCount);
        throw new BadRequestException(
          `Maximum ticket limit is ${raffle.maxTickets} per person for "${raffle.title}". You already hold ${userExistingCount} ticket(s). You can purchase up to ${allowed} more.`,
        );
      }
    }

    // Determine actual tickets sold from real database tickets
    const existingTicketsCount = await this.prisma.ticket.count({
      where: { raffleId },
    });

    if (existingTicketsCount + quantity > raffle.totalTickets) {
      throw new BadRequestException(
        `Only ${raffle.totalTickets - existingTicketsCount} tickets remaining`,
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const baseUrl =
      process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';
    const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
    const apiKey = process.env.CASHFLOWS_API_KEY || '';

    const totalAmount = (Number(raffle.pricePerTicket) * quantity).toFixed(2);

    if (Number(totalAmount) <= 0) {
      return this.allocateTicketsInDatabase(
        userId,
        raffleId,
        quantity,
        'FREE_ENTRY',
      );
    }

    // Create a PENDING transaction record upfront
    const pendingTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'TICKET_PURCHASE',
        amount: parseFloat(totalAmount),
        status: 'PENDING',
        paymentGateway: 'CASHFLOWS',
        relatedEntityId: `${raffle.id}:${quantity}`,
      },
    });

    const orderNumber = `TCK_${raffleId}_${userId}_${quantity}_${pendingTransaction.id}_${Date.now()}`;

    await this.prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: { gatewayTransactionId: orderNumber },
    });

    const innerRequestPayload = {
      type: 'Payment',
      amountToCollect: totalAmount,
      currency: 'GBP',
      order: {
        orderNumber: orderNumber,
        note: `Ticket purchase: ${quantity} ticket(s) for ${raffle.title}`,
      },
      customer: {
        email: user?.email || '',
        firstName: user?.firstName || 'Valued',
        lastName: user?.lastName || 'Customer',
      },
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?payment=success&ordernumber=${orderNumber}&raffle=${raffle.slug || raffle.id}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/user/tickets?payment=cancel`,
    };

    const innerRequestString = JSON.stringify(innerRequestPayload);
    const hash = crypto
      .createHash('sha512')
      .update(apiKey + innerRequestString)
      .digest('hex')
      .toUpperCase();

    try {
      console.log(`Sending Cashflows Ticket Checkout request to ${baseUrl}/api/gateway/payment-jobs`);
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
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { rawText: responseText };
      }

      if (!response.ok) {
        console.error('Cashflows Ticket API Error Response:', data);
        throw new BadRequestException(
          data.message || data.error || `Cashflows Gateway Error (${response.status})`,
        );
      }

      console.log('CASHFLOWS SUCCESS RESPONSE DATA:', JSON.stringify(data, null, 2));

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
        console.error('Cashflows Ticket API response payload:', JSON.stringify(data, null, 2));
        throw new BadRequestException(`Cashflows gateway response: ${JSON.stringify(data)}`);
      }

      return {
        url: redirectUrl,
        orderNumber,
      };
    } catch (error: any) {
      console.error(`Cashflow Ticket Checkout Error: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Cashflows Gateway Error: ${error.message}`);
    }
  }

  private validateAgeAndDob(dobString?: string): Date {
    if (!dobString) {
      throw new BadRequestException('Date of birth is required');
    }
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) {
      throw new BadRequestException('Invalid date of birth format');
    }
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      throw new BadRequestException(
        'You must be at least 18 years of age to purchase tickets. Processing refused.',
      );
    }
    return dob;
  }

  async checkout(userId: string, dto: BasketCheckoutDto, clientBaseUrl?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Basket must contain at least one item');
    }

    // Strictly validate Date of Birth and enforce 18+ requirement
    this.validateAgeAndDob(dto.shippingDetails?.dateOfBirth);

    const isTestPayment =
      process.env.USE_TEST_PAYMENT === 'true' ||
      process.env.USE_TEST_PAYMENT === '"true"';

    if (isTestPayment) {
      return this.allocateBasketTicketsInDatabase(
        userId,
        dto.items,
        dto.shippingDetails,
      );
    }

    // If all items in basket are £0 (free entry), allocate directly without Cashflows redirect
    const raffleIds = dto.items.map((i) => i.raffleId);
    const raffles = await this.prisma.raffle.findMany({
      where: { id: { in: raffleIds } },
      select: { id: true, pricePerTicket: true },
    });
    const priceMap = new Map(raffles.map((r) => [r.id, Number(r.pricePerTicket || 0)]));
    const totalAmount = dto.items.reduce((sum, item) => {
      const price = priceMap.get(item.raffleId) || 0;
      return sum + price * item.quantity;
    }, 0);

    if (totalAmount <= 0) {
      return this.allocateBasketTicketsInDatabase(
        userId,
        dto.items,
        dto.shippingDetails,
        'FREE_ENTRY',
      );
    }

    return this.createCashflowsBasketCheckout(
      userId,
      dto.items,
      dto.shippingDetails,
      clientBaseUrl,
    );
  }

  async allocateBasketTicketsInDatabase(
    userId: string,
    items: { raffleId: string; quantity: number }[],
    shippingDetails?: ShippingDetailsDto,
    paymentGateway = 'SIMULATED',
    gatewayTransactionId?: string,
    existingTransactionId?: string,
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Basket must contain at least one item');
    }

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new BadRequestException('Quantity must be at least 1 for all items');
      }
    }

    const result = await this.prisma.$transaction(
      async (tx) => {
        // Auto-save date of birth and/or profile address details
        const dob = shippingDetails?.dateOfBirth
          ? this.validateAgeAndDob(shippingDetails.dateOfBirth)
          : undefined;

        const profileUpdate: any = {};
        if (dob) {
          profileUpdate.dateOfBirth = dob;
        }

        if (shippingDetails?.saveToProfile) {
          const fullAddress = [
            shippingDetails.addressLine1,
            shippingDetails.addressLine2,
            shippingDetails.city,
            shippingDetails.postcode,
            shippingDetails.country || 'United Kingdom',
          ]
            .filter(Boolean)
            .join(', ');

          profileUpdate.firstName = shippingDetails.firstName;
          profileUpdate.lastName = shippingDetails.lastName;
          profileUpdate.phone = shippingDetails.phone;
          profileUpdate.address = fullAddress;
        }

        if (Object.keys(profileUpdate).length > 0) {
          await tx.user.update({
            where: { id: userId },
            data: profileUpdate,
          });
        }

        // 2. Fetch and validate each raffle, calculate totals and available ticket numbers
        let totalAmount = 0;
        const raffleAllocations: {
          raffle: any;
          quantity: number;
          assignedNumbers: number[];
          subtotal: number;
        }[] = [];

        for (const item of items) {
          const raffle = await tx.raffle.findUnique({
            where: { id: item.raffleId },
            include: { instantWins: true },
          });

          if (!raffle) {
            throw new NotFoundException(`Competition with ID ${item.raffleId} not found`);
          }

          if (raffle.status !== 'ACTIVE') {
            throw new BadRequestException(`Competition "${raffle.title}" is not active`);
          }

          const now = new Date();
          if (raffle.startDate && new Date(raffle.startDate) > now) {
            throw new BadRequestException(`Competition "${raffle.title}" has not started yet`);
          }
          if (raffle.endDate && new Date(raffle.endDate) <= now) {
            throw new BadRequestException(`Competition "${raffle.title}" has already closed`);
          }

          const minTickets = raffle.minTickets || 1;
          if (item.quantity < minTickets) {
            throw new BadRequestException(
              `Minimum ticket purchase for "${raffle.title}" is ${minTickets} ticket(s)`,
            );
          }

          if (raffle.maxTickets) {
            const userExistingCount = await tx.ticket.count({
              where: { raffleId: raffle.id, userId },
            });
            if (userExistingCount + item.quantity > raffle.maxTickets) {
              const allowed = Math.max(0, raffle.maxTickets - userExistingCount);
              throw new BadRequestException(
                `Maximum ticket limit is ${raffle.maxTickets} per person for "${raffle.title}". You already hold ${userExistingCount} ticket(s). You can purchase up to ${allowed} more.`,
              );
            }
          }

          // Available ticket numbers based on real database tickets
          const existingTickets = await tx.ticket.findMany({
            where: { raffleId: raffle.id },
            select: { ticketNumber: true },
          });
          const usedNumbers = new Set(existingTickets.map((t) => t.ticketNumber));
          const actualSold = existingTickets.length;

          if (actualSold + item.quantity > raffle.totalTickets) {
            throw new BadRequestException(
              `Only ${raffle.totalTickets - actualSold} tickets remaining for "${raffle.title}"`,
            );
          }

          const availableNumbers: number[] = [];
          for (let i = 1; i <= raffle.totalTickets; i++) {
            if (!usedNumbers.has(i)) {
              availableNumbers.push(i);
            }
          }

          if (availableNumbers.length < item.quantity) {
            throw new BadRequestException(
              `Not enough ticket numbers available for "${raffle.title}"`,
            );
          }

          // Fisher-Yates shuffle
          for (let i = availableNumbers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableNumbers[i], availableNumbers[j]] = [
              availableNumbers[j],
              availableNumbers[i],
            ];
          }
          const assignedNumbers = availableNumbers.slice(0, item.quantity);
          const subtotal = Number(raffle.pricePerTicket) * item.quantity;
          totalAmount += subtotal;

          raffleAllocations.push({
            raffle,
            quantity: item.quantity,
            assignedNumbers,
            subtotal,
          });
        }

        // 3. Create or update Transaction record
        let transaction: any;
        if (existingTransactionId) {
          transaction = await tx.transaction.update({
            where: { id: existingTransactionId },
            data: {
              status: 'COMPLETED',
              amount: totalAmount,
              paymentGateway,
              gatewayTransactionId: gatewayTransactionId || existingTransactionId,
            },
          });
        } else {
          transaction = await tx.transaction.create({
            data: {
              userId,
              type: 'TICKET_PURCHASE',
              amount: totalAmount,
              status: 'COMPLETED',
              paymentGateway,
              gatewayTransactionId:
                gatewayTransactionId ||
                (paymentGateway === 'FREE_ENTRY'
                  ? `FREE_BSK_${crypto.randomUUID()}`
                  : `SIM_BASKET_${crypto.randomUUID()}`),
              relatedEntityId:
                items.length === 1 ? items[0].raffleId : 'BASKET',
            },
          });
        }

        // 4. Create tickets and check instant wins for all raffles
        const allCreatedTickets: any[] = [];
        const allInstantWins: any[] = [];
        const updatedRaffles: any[] = [];

        for (const alloc of raffleAllocations) {
          const { raffle, quantity, assignedNumbers, subtotal } = alloc;

          const ticketsData = assignedNumbers.map((num) => ({
            raffleId: raffle.id,
            userId,
            transactionId: transaction.id,
            ticketNumber: num,
          }));

          await tx.ticket.createMany({
            data: ticketsData,
          });

          const createdTickets = await tx.ticket.findMany({
            where: {
              transactionId: transaction.id,
              raffleId: raffle.id,
            },
          });
          allCreatedTickets.push(...createdTickets);

          // Check instant wins
          for (const ticket of createdTickets) {
            const matchedInstantWin = raffle.instantWins.find(
              (iw: any) =>
                iw.ticketNumber === ticket.ticketNumber && !iw.isClaimed,
            );

            if (matchedInstantWin) {
              await tx.instantWin.update({
                where: { id: matchedInstantWin.id },
                data: { isClaimed: true },
              });

              const winner = await tx.winner.create({
                data: {
                  userId,
                  raffleId: raffle.id,
                  ticketId: ticket.id,
                  winType: 'INSTANT_WIN',
                  prizeName: matchedInstantWin.prizeName,
                  deliveryStatus: 'PENDING',
                  isClaimed: false,
                },
              });

              allInstantWins.push({
                ...winner,
                raffleTitle: raffle.title,
                ticketNumber: ticket.ticketNumber,
                title: matchedInstantWin.prizeName,
                prizeName: matchedInstantWin.prizeName,
                prizeImage: matchedInstantWin.image,
                image: matchedInstantWin.image,
                rrpValue: matchedInstantWin.rrpValue
                  ? Number(matchedInstantWin.rrpValue)
                  : null,
              });
            }
          }

          // Determine current actual ticket count to sync ticketsSold accurately
          const totalTicketsAfterThis = await tx.ticket.count({
            where: { raffleId: raffle.id },
          });

          // Update Raffle ticketsSold
          const updatedRaffle = await tx.raffle.update({
            where: { id: raffle.id },
            data: {
              ticketsSold: totalTicketsAfterThis,
            },
          });
          updatedRaffles.push(updatedRaffle);

          // Credit Host wallet balance
          if (raffle.hostId) {
            await tx.hostProfile.update({
              where: { id: raffle.hostId },
              data: {
                walletBalance: {
                  increment: subtotal,
                },
              },
            });
          }
        }

        return {
          transaction,
          allCreatedTickets,
          allInstantWins,
          updatedRaffles,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    // Outside transaction: check auto draw
    for (const updatedRaffle of result.updatedRaffles) {
      if (
        updatedRaffle.isAutoDraw &&
        updatedRaffle.autoDrawSoldOut &&
        updatedRaffle.ticketsSold >= updatedRaffle.totalTickets &&
        updatedRaffle.status === 'ACTIVE'
      ) {
        try {
          await this.rafflesService.drawWinner(updatedRaffle.id);
        } catch (err) {
          console.error(`Failed to trigger auto draw on sold out for ${updatedRaffle.id}:`, err);
        }
      } else if (
        !updatedRaffle.isAutoDraw &&
        updatedRaffle.ticketsSold >= updatedRaffle.totalTickets &&
        updatedRaffle.status === 'ACTIVE'
      ) {
        try {
          await this.prisma.raffle.update({
            where: { id: updatedRaffle.id },
            data: { status: 'ENDED' },
          });
        } catch (err) {
          console.error(`Failed to update manual raffle status on sold out for ${updatedRaffle.id}:`, err);
        }
      }
    }

    // Non-blocking notification dispatches for Basket Checkout
    try {
      const totalTicketsCount = result.allCreatedTickets.length;
      const totalAmount = Number(result.transaction.amount);
      const competitionCount = result.updatedRaffles.length;

      // 1. Buyer order confirmation
      this.notificationsService.notifyUser(
        userId,
        'PURCHASE',
        '🎟️ Basket Order Confirmed',
        `Your order of ${totalTicketsCount} ticket(s) across ${competitionCount} competition(s) is confirmed (£${totalAmount.toFixed(2)}). Good luck!`,
        '/dashboard/user/tickets',
        { transactionId: result.transaction.id, ticketCount: totalTicketsCount, amount: totalAmount },
      );

      // 2. Consolidated Host notifications per host
      const hostMap = new Map<string, { count: number; subtotal: number }>();
      for (const item of items) {
        const raffle = result.updatedRaffles.find((r) => r.id === item.raffleId);
        if (raffle?.hostId) {
          const prev = hostMap.get(raffle.hostId) || { count: 0, subtotal: 0 };
          const itemSubtotal = (Number(raffle.pricePerTicket) || 0) * item.quantity;
          hostMap.set(raffle.hostId, {
            count: prev.count + item.quantity,
            subtotal: prev.subtotal + itemSubtotal,
          });
        }
      }

      for (const [hostId, data] of hostMap.entries()) {
        this.notificationsService.notifyHost(
          hostId,
          'PURCHASE',
          '🎟️ New Ticket Sales',
          `${data.count} ticket(s) purchased across your competitions (£${data.subtotal.toFixed(2)}).`,
          '/dashboard/host/competitions',
          { hostId, ticketCount: data.count, amount: data.subtotal },
        );
      }

      // 3. Admin order alert
      this.notificationsService.notifyAdmins(
        'PURCHASE',
        '🎟️ New Basket Order Placed',
        `Basket checkout completed: ${totalTicketsCount} ticket(s) (£${totalAmount.toFixed(2)}) across ${competitionCount} competition(s).`,
        '/dashboard/admin/orders',
        { transactionId: result.transaction.id, amount: totalAmount },
      );

      // 4. Instant win alerts (if any)
      if (result.allInstantWins && result.allInstantWins.length > 0) {
        for (const win of result.allInstantWins) {
          const prizeName = win.prizeName || win.title || 'Instant Win Prize';
          const ticketNum = win.ticketNumber;
          const raffleTitle = win.raffleTitle || 'Competition';

          // Winner user
          this.notificationsService.notifyUser(
            userId,
            'WIN',
            '⚡ Instant Win Prize Won!',
            `You won ${prizeName} on ticket #${ticketNum} for "${raffleTitle}"! Claim your prize now.`,
            '/dashboard/user/winners',
            { raffleId: win.raffleId, prizeName, ticketNumber: ticketNum },
          );

          // Find raffle host
          const raffle = result.updatedRaffles.find((r) => r.id === win.raffleId);
          if (raffle?.hostId) {
            this.notificationsService.notifyHost(
              raffle.hostId,
              'WIN',
              '⚡ Instant Win Claimed',
              `An entrant won instant prize "${prizeName}" on ticket #${ticketNum} for "${raffleTitle}".`,
              '/dashboard/host/competitions',
              { raffleId: win.raffleId, prizeName, ticketNumber: ticketNum },
            );
          }

          // Admin
          this.notificationsService.notifyAdmins(
            'WIN',
            '⚡ Instant Win Claimed',
            `Instant prize "${prizeName}" claimed on ticket #${ticketNum} for "${raffleTitle}".`,
            '/dashboard/admin/winners',
            { raffleId: win.raffleId, prizeName, ticketNumber: ticketNum },
          );
        }
      }
    } catch (e) {
      // Non-blocking
    }

    return {
      message: 'Tickets purchased successfully',
      transaction: result.transaction,
      tickets: result.allCreatedTickets,
      instantWins: result.allInstantWins,
    };
  }

  async createCashflowsBasketCheckout(
    userId: string,
    items: { raffleId: string; quantity: number }[],
    shippingDetails?: ShippingDetailsDto,
    clientBaseUrl?: string,
  ) {
    if (!items || items.length === 0) {
      throw new BadRequestException('Basket must contain at least one item');
    }

    const dob = this.validateAgeAndDob(shippingDetails?.dateOfBirth);

    let totalAmount = 0;
    const raffleTitles: string[] = [];

    // Pre-validate all items and calculate total amount
    for (const item of items) {
      const raffle = await this.prisma.raffle.findUnique({
        where: { id: item.raffleId },
      });

      if (!raffle) {
        throw new NotFoundException(`Competition with ID ${item.raffleId} not found`);
      }
      if (raffle.status !== 'ACTIVE') {
        throw new BadRequestException(`Competition "${raffle.title}" is not active`);
      }

      const now = new Date();
      if (raffle.startDate && new Date(raffle.startDate) > now) {
        throw new BadRequestException(`Competition "${raffle.title}" has not started yet`);
      }
      if (raffle.endDate && new Date(raffle.endDate) <= now) {
        throw new BadRequestException(`Competition "${raffle.title}" has already closed`);
      }

      const minTickets = raffle.minTickets || 1;
      if (item.quantity < minTickets) {
        throw new BadRequestException(
          `Minimum ticket purchase for "${raffle.title}" is ${minTickets} ticket(s)`,
        );
      }

      if (raffle.maxTickets) {
        const userExistingCount = await this.prisma.ticket.count({
          where: { raffleId: raffle.id, userId },
        });
        if (userExistingCount + item.quantity > raffle.maxTickets) {
          const allowed = Math.max(0, raffle.maxTickets - userExistingCount);
          throw new BadRequestException(
            `Maximum ticket limit is ${raffle.maxTickets} per person for "${raffle.title}". You already hold ${userExistingCount} ticket(s). You can purchase up to ${allowed} more.`,
          );
        }
      }
      if (raffle.ticketsSold + item.quantity > raffle.totalTickets) {
        throw new BadRequestException(
          `Only ${raffle.totalTickets - raffle.ticketsSold} tickets remaining for "${raffle.title}"`,
        );
      }

      totalAmount += Number(raffle.pricePerTicket) * item.quantity;
      raffleTitles.push(`${item.quantity}x ${raffle.title}`);
    }

    if (totalAmount <= 0) {
      return this.allocateBasketTicketsInDatabase(
        userId,
        items,
        shippingDetails,
        'FREE_ENTRY',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const formattedAmount = totalAmount.toFixed(2);

    // Compact item serialization to store in transaction.relatedEntityId: "raffleId:quantity;..."
    const serializedItems = items.map((i) => `${i.raffleId}:${i.quantity}`).join(';');

    // Create a PENDING transaction record
    const pendingTransaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: 'TICKET_PURCHASE',
        amount: totalAmount,
        status: 'PENDING',
        paymentGateway: 'CASHFLOWS',
        relatedEntityId: serializedItems.slice(0, 255),
      },
    });

    // Auto-save date of birth and update user address if requested
    const profileUpdate: any = {
      dateOfBirth: dob,
    };
    if (shippingDetails?.saveToProfile) {
      const fullAddress = [
        shippingDetails.addressLine1,
        shippingDetails.addressLine2,
        shippingDetails.city,
        shippingDetails.postcode,
        shippingDetails.country || 'United Kingdom',
      ]
        .filter(Boolean)
        .join(', ');

      profileUpdate.firstName = shippingDetails.firstName;
      profileUpdate.lastName = shippingDetails.lastName;
      profileUpdate.phone = shippingDetails.phone;
      profileUpdate.address = fullAddress;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: profileUpdate,
    });

    const orderNumber = `BSK_${pendingTransaction.id}_${Date.now()}`;

    // Update the transaction with gatewayTransactionId = orderNumber
    await this.prisma.transaction.update({
      where: { id: pendingTransaction.id },
      data: { gatewayTransactionId: orderNumber },
    });

    const baseUrl =
      process.env.CASHFLOWS_BASE_URL || 'https://gateway-int.cashflows.com';
    const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
    const apiKey = process.env.CASHFLOWS_API_KEY || '';

    const frontendUrl =
      clientBaseUrl ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';

    const innerRequestPayload = {
      type: 'Payment',
      amountToCollect: formattedAmount,
      currency: 'GBP',
      order: {
        orderNumber,
        note: `Basket checkout: ${raffleTitles.join(', ').slice(0, 200)}`,
      },
      customer: {
        email: shippingDetails?.email || user?.email || '',
        firstName: shippingDetails?.firstName || user?.firstName || '',
        lastName: shippingDetails?.lastName || user?.lastName || '',
      },
      returnUrl: `${frontendUrl}/checkout/success?payment=success&ordernumber=${orderNumber}`,
      cancelUrl: `${frontendUrl}/basket?payment=cancel`,
    };

    const innerRequestString = JSON.stringify(innerRequestPayload);
    const hash = crypto
      .createHash('sha512')
      .update(apiKey + innerRequestString)
      .digest('hex')
      .toUpperCase();

    try {
      console.log(`Sending Cashflows Basket Checkout request to ${baseUrl}/api/gateway/payment-jobs`);
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
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { rawText: responseText };
      }

      if (!response.ok) {
        console.error('Cashflows Basket API Error Response:', data);
        throw new BadRequestException(
          data.message || data.error || `Cashflows Gateway Error (${response.status})`,
        );
      }

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
          (a: any) =>
            a.rel === 'checkout' ||
            a.rel === 'payment' ||
            a.rel === 'redirect' ||
            a.rel === 'hosted_checkout',
        );
        if (checkoutAction) redirectUrl = checkoutAction.href || checkoutAction.url;
      }

      if (!redirectUrl && data.data?.reference) {
        redirectUrl = `${baseUrl}/payment?ref=${data.data.reference}`;
      }

      if (!redirectUrl) {
        console.error('Cashflows Basket API response payload:', JSON.stringify(data, null, 2));
        throw new BadRequestException(`Cashflows gateway response: ${JSON.stringify(data)}`);
      }

      return {
        url: redirectUrl,
        orderNumber,
      };
    } catch (error: any) {
      console.error(`Cashflows Basket Checkout Error: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Cashflows Gateway Error: ${error.message}`);
    }
  }

  async getUserPendingOrders(userId: string) {
    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: 'PENDING',
        type: 'TICKET_PURCHASE',
      },
      orderBy: { createdAt: 'desc' },
    });

    const results: any[] = [];

    for (const tx of pendingTransactions) {
      const serialized = tx.relatedEntityId || '';
      const items = serialized.split(';').filter(Boolean);
      const parsedItems: any[] = [];
      let canPay = true;

      for (const item of items) {
        const [rId, q] = item.split(':');
        const quantity = parseInt(q || '1', 10);

        const raffle = await this.prisma.raffle.findUnique({
          where: { id: rId },
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
            status: true,
            startDate: true,
            endDate: true,
            totalTickets: true,
            pricePerTicket: true,
            _count: {
              select: { tickets: true },
            },
          },
        });

        if (raffle) {
          const actualSold = raffle._count?.tickets ?? 0;
          const isSoldOut = actualSold >= raffle.totalTickets;
          const now = new Date();
          const isNotStarted =
            raffle.startDate && new Date(raffle.startDate) > now;
          const isExpired =
            raffle.status !== 'ACTIVE' ||
            isNotStarted ||
            new Date(raffle.endDate) <= now;
          const remainingTickets = Math.max(0, raffle.totalTickets - actualSold);

          if (isSoldOut || isExpired || remainingTickets < quantity) {
            canPay = false;
          }

          parsedItems.push({
            raffleId: raffle.id,
            raffleTitle: raffle.title,
            raffleSlug: raffle.slug || raffle.id,
            raffleImage: raffle.mainImage,
            quantity,
            pricePerTicket: Number(raffle.pricePerTicket),
            subtotal: quantity * Number(raffle.pricePerTicket),
            isSoldOut,
            isExpired,
            remainingTickets,
          });
        }
      }

      if (parsedItems.length > 0) {
        results.push({
          id: tx.id,
          orderNumber: tx.gatewayTransactionId || tx.id,
          amount: Number(tx.amount),
          status: 'PENDING',
          createdAt: tx.createdAt,
          items: parsedItems,
          canPay,
        });
      }
    }

    return results;
  }

  async payPendingOrder(userId: string, transactionId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        status: 'PENDING',
      },
    });

    if (!tx) {
      throw new NotFoundException('Pending order not found or already completed');
    }

    const serialized = tx.relatedEntityId || '';
    const items = serialized.split(';').filter(Boolean);
    const validatedItems: { raffle: any; quantity: number }[] = [];

    for (const item of items) {
      const [rId, q] = item.split(':');
      const quantity = parseInt(q || '1', 10);

      const raffle = await this.prisma.raffle.findUnique({
        where: { id: rId },
        include: {
          _count: { select: { tickets: true } },
        },
      });

      if (!raffle) {
        throw new NotFoundException('Competition in order no longer exists');
      }

      if (raffle.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Competition "${raffle.title}" has ended or is no longer active.`,
        );
      }

      const now = new Date();
      if (raffle.startDate && new Date(raffle.startDate) > now) {
        throw new BadRequestException(
          `Competition "${raffle.title}" has not started yet.`,
        );
      }
      if (raffle.endDate && new Date(raffle.endDate) <= now) {
        throw new BadRequestException(
          `Competition "${raffle.title}" has already closed.`,
        );
      }

      const actualSold = raffle._count?.tickets ?? 0;
      if (actualSold >= raffle.totalTickets) {
        throw new BadRequestException(
          `Competition "${raffle.title}" is already SOLD OUT!`,
        );
      }

      if (actualSold + quantity > raffle.totalTickets) {
        throw new BadRequestException(
          `Only ${raffle.totalTickets - actualSold} tickets remaining for "${raffle.title}". Cannot purchase ${quantity} tickets.`,
        );
      }

      validatedItems.push({ raffle, quantity });
    }

    const isTestPayment =
      process.env.USE_TEST_PAYMENT === 'true' ||
      process.env.USE_TEST_PAYMENT === '"true"';

    // If test payment mode, fulfill instantly
    if (isTestPayment) {
      const basketItems = validatedItems.map((v) => ({
        raffleId: v.raffle.id,
        quantity: v.quantity,
      }));
      return this.allocateBasketTicketsInDatabase(
        userId,
        basketItems,
        undefined,
        'SIMULATED',
        tx.gatewayTransactionId || `SIM_BASKET_${crypto.randomUUID()}`,
        tx.id,
      );
    }

    // Real Cashflows payment flow
    const baseUrl =
      process.env.CASHFLOWS_BASE_URL || 'https://gateway.cashflows.com';
    const configId = process.env.CASHFLOWS_CONFIGURATION_ID || '';
    const apiKey = process.env.CASHFLOWS_API_KEY || '';
    
    // ALWAYS generate a fresh unique orderNumber to prevent Cashflows duplicate orderNumber error
    const orderNumber = `BSK_${tx.id}_${Date.now()}`;

    await this.prisma.transaction.update({
      where: { id: tx.id },
      data: { gatewayTransactionId: orderNumber },
    });

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const formattedAmount = Number(tx.amount).toFixed(2);

    const innerRequestPayload = {
      type: 'Payment',
      amountToCollect: formattedAmount,
      currency: 'GBP',
      order: {
        orderNumber,
        note: `Pending order payment for ${validatedItems.map((v) => v.raffle.title).join(', ').slice(0, 200)}`,
      },
      customer: {
        email: user?.email || 'customer@fairwaydraws.com',
        firstName: user?.firstName || 'Valued',
        lastName: user?.lastName || 'Customer',
      },
      returnUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout/success?payment=success&ordernumber=${orderNumber}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/user/tickets?payment=cancel`,
    };

    const innerRequestString = JSON.stringify(innerRequestPayload);
    const hash = crypto
      .createHash('sha512')
      .update(apiKey + innerRequestString)
      .digest('hex')
      .toUpperCase();

    try {
      console.log(`Sending Cashflows Pending Order Payment request to ${baseUrl}/api/gateway/payment-jobs for order ${orderNumber}`);
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
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { rawText: responseText };
      }

      if (!response.ok) {
        console.error('Cashflows Pending Order API Error Response:', data);
        throw new BadRequestException(
          data.message || data.error || `Cashflows Gateway Error (${response.status})`,
        );
      }

      console.log('CASHFLOWS SUCCESS RESPONSE DATA:', JSON.stringify(data, null, 2));

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
          (a: any) =>
            a.rel === 'checkout' ||
            a.rel === 'payment' ||
            a.rel === 'redirect' ||
            a.rel === 'hosted_checkout',
        );
        if (checkoutAction) redirectUrl = checkoutAction.href || checkoutAction.url;
      }

      if (!redirectUrl && data.data?.reference) {
        redirectUrl = `${baseUrl}/payment?ref=${data.data.reference}`;
      }

      if (!redirectUrl) {
        console.error('Cashflows Pending Order response payload without redirect URL:', JSON.stringify(data, null, 2));
        throw new BadRequestException(`Cashflows gateway response: ${JSON.stringify(data)}`);
      }

      return {
        url: redirectUrl,
        orderNumber,
      };
    } catch (error: any) {
      console.error(`Cashflows Pending Order Payment Error: ${error.message}`);
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Cashflows Gateway Error: ${error.message}`);
    }
  }

  async getUserTransactions(userId: string) {
    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => ({
      id: t.id,
      transactionId: `#TRN-${t.id.slice(0, 8).toUpperCase()}`,
      orderNumber: t.gatewayTransactionId || t.id,
      date: t.createdAt,
      description:
        t.tickets?.length > 0
          ? `${t.tickets.length} ticket(s) — ${t.tickets[0]?.raffle?.title || 'Competition Entry'}`
          : `Order #${(t.gatewayTransactionId || t.id).slice(0, 16)}`,
      amount: `£${Number(t.amount).toFixed(2)}`,
      paymentMethod: t.paymentGateway || 'CASHFLOWS',
      status: t.status.toLowerCase(),
      ticketsCount: t.tickets?.length || 0,
    }));
  }
}



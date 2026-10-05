import { BadRequestException, NotFoundException } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import {
  parseUkDateTimeToUtc,
  formatUtcToUkInputString,
  formatUkDateTime,
  getUkTimezoneAbbr,
} from '../common/utils/uk-time.util';

describe('UK Time & Start/End Date Visibility Suite', () => {
  describe('UK Timezone Utilities (Europe/London: GMT & BST)', () => {
    it('should correctly convert summer (BST = UTC+1) naive string to UTC', () => {
      // 14:30 on 15 July (BST) -> 13:30 UTC
      const parsed = parseUkDateTimeToUtc('2026-07-15T14:30');
      expect(parsed).not.toBeNull();
      expect(parsed?.toISOString()).toBe('2026-07-15T13:30:00.000Z');
      expect(getUkTimezoneAbbr(parsed!)).toBe('BST');
    });

    it('should correctly convert winter (GMT = UTC+0) naive string to UTC', () => {
      // 14:30 on 15 December (GMT) -> 14:30 UTC
      const parsed = parseUkDateTimeToUtc('2026-12-15T14:30');
      expect(parsed).not.toBeNull();
      expect(parsed?.toISOString()).toBe('2026-12-15T14:30:00.000Z');
      expect(getUkTimezoneAbbr(parsed!)).toBe('GMT');
    });

    it('should format UTC Date to UK input string ("YYYY-MM-DDTHH:mm")', () => {
      // 13:30 UTC in July -> 14:30 UK
      const summerUtc = new Date('2026-07-15T13:30:00.000Z');
      expect(formatUtcToUkInputString(summerUtc)).toBe('2026-07-15T14:30');

      // 14:30 UTC in December -> 14:30 UK
      const winterUtc = new Date('2026-12-15T14:30:00.000Z');
      expect(formatUtcToUkInputString(winterUtc)).toBe('2026-12-15T14:30');
    });

    it('should format human-readable UK datetime with BST/GMT abbreviation', () => {
      const summerUtc = new Date('2026-07-15T13:30:00.000Z');
      const formatted = formatUkDateTime(summerUtc);
      expect(formatted).toContain('14:30');
      expect(formatted).toContain('BST');

      const winterUtc = new Date('2026-12-15T14:30:00.000Z');
      const formattedWinter = formatUkDateTime(winterUtc);
      expect(formattedWinter).toContain('14:30');
      expect(formattedWinter).toContain('GMT');
    });
  });

  describe('RafflesService - Start & End Date Public Filtering', () => {
    let service: RafflesService;
    let prismaMock: any;
    let notificationsMock: any;

    beforeEach(() => {
      prismaMock = {
        raffle: {
          findMany: jest.fn(),
          count: jest.fn(),
          findFirst: jest.fn(),
          create: jest.fn(),
          update: jest.fn(),
        },
        hostProfile: {
          findUnique: jest.fn(),
        },
        category: {
          findMany: jest.fn().mockResolvedValue([]),
        },
      };

      notificationsMock = {
        notifyUser: jest.fn(),
        notifyAdmins: jest.fn(),
        create: jest.fn(),
      };

      service = new RafflesService(prismaMock, notificationsMock);
    });

    it('should filter out unstarted competitions (startDate > now) on public queries by default', async () => {
      prismaMock.raffle.findMany.mockResolvedValue([]);
      prismaMock.raffle.count.mockResolvedValue(0);

      await service.findAllPublic({});

      expect(prismaMock.raffle.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
            startDate: expect.objectContaining({ lte: expect.any(Date) }),
            endDate: expect.objectContaining({ gte: expect.any(Date) }),
          }),
        }),
      );
    });

    it('should reject raffle creation if endDate is before or equal to startDate', async () => {
      prismaMock.hostProfile.findUnique.mockResolvedValue({
        id: 'host-1',
        subscriptions: [{ status: 'ACTIVE', plan: { name: 'Pro', maxActiveRaffles: 10 } }],
      });

      await expect(
        service.create('user-1', {
          title: 'Invalid Schedule Competition',
          totalTickets: 100,
          ticketPrice: 2,
          startDate: '2026-09-25T14:00',
          endDate: '2026-09-25T13:00', // Before start
        }),
      ).rejects.toThrow(
        new BadRequestException('End date & time must be strictly after the start date & time'),
      );
    });

    it('should throw NotFoundException in findOnePublic if active competition has not started yet', async () => {
      const futureStart = new Date(Date.now() + 1000 * 60 * 60 * 24); // Tomorrow
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48);

      prismaMock.raffle.findFirst.mockResolvedValue({
        id: 'raffle-future',
        slug: 'future-draw',
        title: 'Future Draw',
        status: 'ACTIVE',
        startDate: futureStart,
        endDate: futureEnd,
        ticketsSold: 0,
        totalTickets: 100,
        _count: { tickets: 0 },
      });

      await expect(service.findOnePublic('future-draw')).rejects.toThrow(
        new NotFoundException('This competition has not started yet'),
      );
    });

    it('should successfully return findOnePublic if competition has started', async () => {
      const pastStart = new Date(Date.now() - 1000 * 60 * 60 * 24); // Yesterday
      const futureEnd = new Date(Date.now() + 1000 * 60 * 60 * 48); // In 2 days

      prismaMock.raffle.findFirst.mockResolvedValue({
        id: 'raffle-active',
        slug: 'active-draw',
        title: 'Active Draw',
        status: 'ACTIVE',
        startDate: pastStart,
        endDate: futureEnd,
        ticketsSold: 10,
        totalTickets: 100,
        _count: { tickets: 10 },
      });

      const res = await service.findOnePublic('active-draw');
      expect(res).toBeDefined();
      expect(res.title).toBe('Active Draw');
      expect(res.ticketsSold).toBe(10);
    });
  });
});

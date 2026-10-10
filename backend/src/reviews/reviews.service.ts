import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryHostReviewsDto } from './dto/query-host-reviews.dto';
import { FlagReviewDto } from './dto/flag-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Helper to format reviewer full name nicely (e.g. "John D." or "Anonymous")
   */
  private formatReviewerName(user?: { firstName?: string | null; lastName?: string | null; email?: string | null } | null): string {
    if (!user) return 'Verified Winner';
    const first = (user.firstName || '').trim();
    const last = (user.lastName || '').trim();
    if (first && last) {
      return `${first} ${last.charAt(0).toUpperCase()}.`;
    }
    if (first) return first;
    if (user.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    return 'Verified Winner';
  }

  /**
   * 1. POST /api/v1/reviews
   * - Validates winner record exists and belongs to authenticated user
   * - Ensures exactly 1 review per winning record
   * - Creates review with status 'APPROVED'
   * - Triggers system notification to host
   */
  async createReview(userId: string, dto: CreateReviewDto) {
    const winner = await this.prisma.winner.findUnique({
      where: { id: dto.winnerId },
      include: {
        raffle: {
          include: {
            host: {
              include: {
                user: true,
              },
            },
          },
        },
        review: true,
      },
    });

    if (!winner) {
      throw new NotFoundException('Winning prize record not found');
    }

    if (winner.userId !== userId) {
      throw new ForbiddenException('You can only review competitions that you have won');
    }

    if (winner.review) {
      throw new ConflictException('You have already submitted a review for this winning record');
    }

    const hostId = winner.raffle?.hostId;
    if (!hostId || !winner.raffle?.host) {
      throw new BadRequestException('Host information for this competition is not available');
    }

    const review = await this.prisma.review.create({
      data: {
        hostId,
        raffleId: winner.raffleId,
        winnerId: winner.id,
        userId,
        rating: dto.rating,
        comment: dto.comment?.trim() || null,
        status: 'APPROVED',
      },
      include: {
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Trigger system notification to host/seller
    const hostUserId = winner.raffle.host.userId;
    if (hostUserId) {
      const reviewerName = this.formatReviewerName(review.user);
      await this.notificationsService.create({
        userId: hostUserId,
        type: 'SYSTEM',
        title: 'New Winner Review Received! ⭐',
        message: `${reviewerName} left a ${dto.rating}-star review for "${winner.prizeName || winner.raffle.title}".`,
        link: `/dashboard/host/reviews`,
        metadata: {
          reviewId: review.id,
          rating: dto.rating,
          raffleId: winner.raffleId,
          winnerId: winner.id,
        },
      });
    }

    return {
      message: 'Review submitted successfully',
      review: {
        ...review,
        reviewerName: this.formatReviewerName(review.user),
      },
    };
  }

  /**
   * 2. GET /api/v1/reviews/host/:hostId (Public)
   * Accepts page, limit, rating filter
   * Returns paginated list + full statistical aggregation:
   * - averageRating: rounded to 1 decimal place, or null if 0 reviews
   * - totalReviews: count of approved reviews
   * - breakdown: count for each star [1, 2, 3, 4, 5]
   * - percentages: percentage for each star [1, 2, 3, 4, 5]
   */
  async getHostReviews(hostIdentifier: string, query: QueryHostReviewsDto) {
    // Resolve host by either ID or slug
    const host = await this.prisma.hostProfile.findFirst({
      where: {
        OR: [{ id: hostIdentifier }, { slug: hostIdentifier }],
      },
      select: { id: true, businessName: true, slug: true },
    });

    if (!host) {
      throw new NotFoundException('Host not found');
    }

    const hostId = host.id;
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(50, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    // Fetch all approved reviews for this host to compute accurate stats
    const allApprovedReviews = await this.prisma.review.findMany({
      where: {
        hostId,
        status: 'APPROVED',
      },
      select: {
        rating: true,
      },
    });

    const totalReviews = allApprovedReviews.length;
    let averageRating: number | null = null;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const percentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      let ratingSum = 0;
      allApprovedReviews.forEach((r) => {
        ratingSum += r.rating;
        if (r.rating >= 1 && r.rating <= 5) {
          breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });
      averageRating = Number((ratingSum / totalReviews).toFixed(1));
      ([1, 2, 3, 4, 5] as const).forEach((star) => {
        percentages[star] = Math.round((breakdown[star] / totalReviews) * 100);
      });
    }

    // Build query for paginated review cards
    const where: any = {
      hostId,
      status: 'APPROVED',
    };

    if (query.rating && query.rating >= 1 && query.rating <= 5) {
      where.rating = Number(query.rating);
    }

    const [reviews, filteredCount] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          raffle: {
            select: {
              id: true,
              title: true,
              slug: true,
              mainImage: true,
            },
          },
          winner: {
            select: {
              id: true,
              prizeName: true,
              winType: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      reviewerName: this.formatReviewerName(r.user),
      reviewerAvatar: r.user?.avatarUrl || null,
      prizeWon: r.winner?.prizeName || r.raffle?.title || 'Verified Competition Prize',
      competitionTitle: r.raffle?.title || 'TCG Draw Competition',
      competitionSlug: r.raffle?.slug || r.raffle?.id,
      competitionImage: r.raffle?.mainImage || null,
      isVerifiedWinner: true,
    }));

    return {
      reviews: formattedReviews,
      stats: {
        averageRating,
        totalReviews,
        breakdown,
        percentages,
      },
      pagination: {
        page,
        limit,
        total: filteredCount,
        totalPages: Math.ceil(filteredCount / limit) || 1,
      },
    };
  }

  /**
   * 3. GET /api/v1/reviews/my-reviews (Protected)
   * Returns all reviews submitted by the logged-in user
   */
  async getMyReviews(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        host: {
          select: {
            id: true,
            businessName: true,
            slug: true,
            user: {
              select: { avatarUrl: true },
            },
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
            winType: true,
          },
        },
      },
    });

    return reviews.map((r) => ({
      id: r.id,
      hostId: r.hostId,
      hostName: r.host.businessName,
      hostSlug: r.host.slug || r.host.id,
      hostLogo: r.host.user.avatarUrl,
      raffleId: r.raffleId,
      winnerId: r.winnerId,
      prizeWon: r.winner?.prizeName || r.raffle.title,
      competitionTitle: r.raffle.title,
      competitionSlug: r.raffle.slug || r.raffle.id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  /**
   * 4. GET /api/v1/reviews/host-dashboard (Protected - Host only)
   * Returns reviews received by the authenticated host with metrics
   */
  async getHostDashboardReviews(userId: string) {
    const host = await this.prisma.hostProfile.findUnique({
      where: { userId },
    });

    if (!host) {
      throw new NotFoundException('Host profile not found for authenticated user');
    }

    const hostId = host.id;

    const allApprovedReviews = await this.prisma.review.findMany({
      where: { hostId, status: 'APPROVED' },
      select: { rating: true },
    });

    const totalReviews = allApprovedReviews.length;
    let averageRating: number | null = null;
    let satisfactionRate: number | null = null;
    const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const percentages = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    if (totalReviews > 0) {
      let ratingSum = 0;
      let positiveReviews = 0; // 4 or 5 stars
      allApprovedReviews.forEach((r) => {
        ratingSum += r.rating;
        if (r.rating >= 4) positiveReviews++;
        if (r.rating >= 1 && r.rating <= 5) {
          breakdown[r.rating as 1 | 2 | 3 | 4 | 5]++;
        }
      });
      averageRating = Number((ratingSum / totalReviews).toFixed(1));
      satisfactionRate = Math.round((positiveReviews / totalReviews) * 100);
      ([1, 2, 3, 4, 5] as const).forEach((star) => {
        percentages[star] = Math.round((breakdown[star] / totalReviews) * 100);
      });
    }

    const reviews = await this.prisma.review.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        raffle: {
          select: {
            id: true,
            title: true,
            slug: true,
            mainImage: true,
          },
        },
        winner: {
          select: {
            id: true,
            prizeName: true,
          },
        },
      },
    });

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt.toISOString(),
      reviewerName: this.formatReviewerName(r.user),
      reviewerAvatar: r.user?.avatarUrl || null,
      prizeWon: r.winner?.prizeName || r.raffle.title,
      competitionTitle: r.raffle.title,
      competitionSlug: r.raffle.slug || r.raffle.id,
    }));

    return {
      metrics: {
        averageRating,
        totalReviews,
        satisfactionRate,
        breakdown,
        percentages,
      },
      reviews: formattedReviews,
    };
  }

  /**
   * 5. PATCH /api/v1/reviews/:id
   * Edit review comment/rating (only review author)
   */
  async updateReview(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: dto.rating !== undefined ? dto.rating : undefined,
        comment: dto.comment !== undefined ? (dto.comment.trim() || null) : undefined,
      },
      include: {
        raffle: {
          select: { id: true, title: true, slug: true },
        },
        winner: {
          select: { id: true, prizeName: true },
        },
      },
    });

    return {
      message: 'Review updated successfully',
      review: updated,
    };
  }

  /**
   * POST /api/v1/reviews/:id/flag
   * Flag suspicious reviews for admin moderation
   */
  async flagReview(userId: string, reviewId: string, dto: FlagReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const updated = await this.prisma.review.update({
      where: { id: reviewId },
      data: {
        status: 'FLAGGED',
      },
    });

    return {
      message: 'Review flagged for admin moderation',
      reviewId: updated.id,
      status: updated.status,
    };
  }
}

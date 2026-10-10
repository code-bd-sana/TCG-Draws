import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryHostReviewsDto } from './dto/query-host-reviews.dto';
import { FlagReviewDto } from './dto/flag-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reviews')
@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    const user = (req as any).user;
    if (user?.id) return user.id;
    if (user?.sub) return user.sub;

    let token = req.cookies?.accessToken;
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }
    if (!token) {
      throw new UnauthorizedException('No authentication token found');
    }
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * 1. POST /api/v1/reviews (Protected)
   * Create review for verified won record
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create verified review for a won competition prize' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload or host not found' })
  @ApiResponse({ status: 403, description: 'Prize record does not belong to user' })
  @ApiResponse({ status: 404, description: 'Winning prize record not found' })
  @ApiResponse({ status: 409, description: 'Review already exists for this winning record' })
  createReview(@Req() req: Request, @Body() dto: CreateReviewDto) {
    const userId = this.extractUserId(req);
    return this.reviewsService.createReview(userId, dto);
  }

  /**
   * 2. GET /api/v1/reviews/host/:hostId (Public)
   * Paginated list of approved reviews with stats aggregation
   */
  @Get('host/:hostId')
  @ApiOperation({ summary: 'Get paginated verified reviews and stats for a host (public)' })
  @ApiParam({ name: 'hostId', description: 'Host UUID or slug' })
  @ApiResponse({ status: 200, description: 'Host reviews and aggregated ratings' })
  @ApiResponse({ status: 404, description: 'Host not found' })
  getHostReviews(
    @Param('hostId') hostId: string,
    @Query() query: QueryHostReviewsDto,
  ) {
    return this.reviewsService.getHostReviews(hostId, query);
  }

  /**
   * 3. GET /api/v1/reviews/my-reviews (Protected)
   * Returns all reviews submitted by the authenticated user
   */
  @Get('my-reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all reviews written by authenticated user' })
  @ApiResponse({ status: 200, description: 'List of submitted reviews' })
  getMyReviews(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.reviewsService.getMyReviews(userId);
  }

  /**
   * 4. GET /api/v1/reviews/host-dashboard (Protected - Host only)
   * Returns reviews received by the authenticated host with satisfaction metrics
   */
  @Get('host-dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get reviews and satisfaction metrics for authenticated host' })
  @ApiResponse({ status: 200, description: 'Host received reviews and metrics' })
  @ApiResponse({ status: 403, description: 'User is not a host' })
  getHostDashboardReviews(@Req() req: Request) {
    const userId = this.extractUserId(req);
    return this.reviewsService.getHostDashboardReviews(userId);
  }

  /**
   * 5. PATCH /api/v1/reviews/:id (Protected)
   * Edit review comment and/or rating (author only)
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit review comment or rating' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review updated successfully' })
  @ApiResponse({ status: 403, description: 'Not authorized to edit this review' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  updateReview(
    @Req() req: Request,
    @Param('id') reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    const userId = this.extractUserId(req);
    return this.reviewsService.updateReview(userId, reviewId, dto);
  }

  /**
   * POST /api/v1/reviews/:id/flag (Protected)
   * Flag suspicious reviews for admin moderation
   */
  @Post(':id/flag')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Flag review for admin moderation' })
  @ApiParam({ name: 'id', description: 'Review UUID' })
  @ApiResponse({ status: 200, description: 'Review flagged successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  flagReview(
    @Req() req: Request,
    @Param('id') reviewId: string,
    @Body() dto: FlagReviewDto,
  ) {
    const userId = this.extractUserId(req);
    return this.reviewsService.flagReview(userId, reviewId, dto);
  }
}

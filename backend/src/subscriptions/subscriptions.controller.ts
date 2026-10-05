import {
  Controller,
  Get,
  Post,
  Req,
  Query,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@ApiTags('Subscriptions')
@Controller('api/v1/subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: Request): string {
    const user = (req as any).user;
    if (user?.sub) return user.sub;
    if (user?.id) return user.id;

    const authHeader = req.headers?.authorization;
    let token = req.cookies?.accessToken;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token)
      throw new UnauthorizedException('No authentication token found');
    try {
      const payload = this.jwtService.verify(token);
      return payload.sub || payload.id;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all active subscription plans' })
  @ApiResponse({
    status: 200,
    description: 'List of subscription plans successfully retrieved',
  })
  async getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current host subscription' })
  @ApiResponse({
    status: 200,
    description: 'Current active subscription details',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - host role required' })
  async getMySubscription(@Req() req: Request) {
    const hostId = this.extractUserId(req);
    return this.subscriptionsService.getMySubscription(hostId);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get the current host billing history' })
  @ApiResponse({
    status: 200,
    description: 'Host billing history transactions',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - host role required' })
  async getMyBillingHistory(@Req() req: Request) {
    const hostId = this.extractUserId(req);
    return this.subscriptionsService.getMyBillingHistory(hostId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('HOST')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel the current active subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription cancelled successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - host role required' })
  @ApiResponse({ status: 404, description: 'No active subscription found' })
  async cancelSubscription(@Req() req: Request) {
    const hostId = this.extractUserId(req);
    return this.subscriptionsService.cancelSubscription(hostId);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated subscriptions for admin' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of subscriptions' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only access' })
  async getAllSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? Math.max(1, parseInt(page, 10)) : 1;
    const limitNumber = limit ? Math.max(1, parseInt(limit, 10)) : 10;
    return this.subscriptionsService.getAllSubscriptions(
      pageNumber,
      limitNumber,
      search,
    );
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription stats for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Subscription stats object' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only access' })
  async getAdminStats() {
    return this.subscriptionsService.getAdminStats();
  }
}

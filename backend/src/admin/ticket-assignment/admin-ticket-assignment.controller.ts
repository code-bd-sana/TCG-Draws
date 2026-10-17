import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminTicketAssignmentService } from './admin-ticket-assignment.service';
import { AdminAssignTicketsDto } from './dto/admin-assign-tickets.dto';
import { AdminCompetitionsQueryDto } from './dto/admin-competitions-query.dto';
import { AdminAssignmentHistoryQueryDto } from './dto/admin-assignment-history-query.dto';

@ApiTags('Admin - Manual Ticket Assignment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('api/v1/admin/ticket-assignment')
export class AdminTicketAssignmentController {
  constructor(
    private readonly assignmentService: AdminTicketAssignmentService,
  ) {}

  @Get('competitions')
  @ApiOperation({
    summary: 'Get active competitions with host and instant win statistics (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active competitions retrieved successfully',
  })
  async getCompetitions(@Query() query: AdminCompetitionsQueryDto) {
    return this.assignmentService.getCompetitions(query);
  }

  @Get('competitions/:id')
  @ApiOperation({
    summary: 'Get full competition data including sold tickets and instant wins (Admin only)',
  })
  @ApiParam({ name: 'id', description: 'Competition / Raffle ID' })
  @ApiResponse({
    status: 200,
    description: 'Competition details retrieved successfully',
  })
  async getCompetitionById(@Param('id') id: string) {
    return this.assignmentService.getCompetitionById(id);
  }

  @Get('users/search')
  @ApiOperation({
    summary: 'Search active users by email, name, or ID for assignment (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Active users search results',
  })
  async searchUsers(@Query('q') q?: string) {
    return this.assignmentService.searchUsers(q);
  }

  @Post('assign')
  @ApiOperation({
    summary: 'Manually assign tickets to a user with full accounting and instant win processing (Admin only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Tickets successfully allocated with financial credit and audit log',
  })
  @ApiResponse({ status: 400, description: 'Validation error or sold ticket conflict' })
  @ApiResponse({ status: 404, description: 'Competition or recipient user not found' })
  async assignTickets(
    @Body() dto: AdminAssignTicketsDto,
    @Req() req: any,
  ) {
    const adminId = req.user?.sub || req.user?.id || 'SYSTEM_ADMIN';
    return this.assignmentService.assignTickets(dto, adminId);
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get paginated history of all ADMIN_MANUAL ticket assignments (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Manual assignment history records',
  })
  async getHistory(@Query() query: AdminAssignmentHistoryQueryDto) {
    return this.assignmentService.getHistory(query);
  }
}

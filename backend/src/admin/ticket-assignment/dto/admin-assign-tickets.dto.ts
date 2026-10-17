import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminAssignTicketsDto {
  @ApiProperty({ description: 'Target Competition / Raffle ID', example: 'uuid-123' })
  @IsString()
  @IsNotEmpty()
  raffleId: string;

  @ApiProperty({ description: 'Recipient User ID', example: 'uuid-456' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    description: 'Specific ticket numbers to manually allocate',
    type: [Number],
    example: [7, 14, 21],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ticketNumbers?: number[];

  @ApiPropertyOptional({
    description: 'Quantity of random available tickets to assign if ticketNumbers is omitted',
    minimum: 1,
    example: 3,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({
    description: 'Administrative notes or reason for assignment (e.g. Giveaway prize, Loyalty reward)',
    example: 'Community giveaway promotion reward',
  })
  @IsOptional()
  @IsString()
  adminNotes?: string;
}

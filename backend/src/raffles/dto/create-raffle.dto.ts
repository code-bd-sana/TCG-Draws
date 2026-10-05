import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  ValidateNested,
  IsArray,
  IsInt,
  Min,
} from 'class-validator';

export class InstantWinPrizeDto {
  @ApiProperty({
    example: 'iPhone 15 Pro',
    description: 'Name of the instant win prize',
  })
  @IsString()
  @IsNotEmpty()
  prizeName: string;

  @ApiPropertyOptional({
    example: 999.99,
    description: 'RRP value of the prize',
  })
  @IsNumber()
  @IsOptional()
  rrpValue?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/iphone.jpg',
    description: 'Image URL of the prize',
  })
  @IsString()
  @IsOptional()
  image?: string;
}

export class CreateRaffleDto {
  @ApiProperty({
    example: 'TaylorMade Qi10 Driver Competition',
    description: 'Title of the competition',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    example: 'Golf Drivers',
    description: 'Category of the competition',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 'Win a brand new custom TaylorMade Qi10 Max Driver!',
    description: 'Raffle description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 1200.0,
    description: 'Estimated retail value of the main prize',
  })
  @IsNumber()
  @IsOptional()
  mainPrizeValue?: number;

  @ApiProperty({ example: 5.99, description: 'Price per ticket in GBP/USD' })
  @IsNumber()
  @IsNotEmpty()
  ticketPrice: number;

  @ApiProperty({
    example: 500,
    description: 'Total number of tickets available',
  })
  @IsNumber()
  @IsNotEmpty()
  totalTickets: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum tickets an entrant must purchase per order (optional, default 1)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  minTickets?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Maximum tickets an entrant can purchase in total (optional)',
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxTickets?: number;

  @ApiProperty({
    example: '2026-07-20T12:00:00.000Z',
    description: 'Raffle start date/time',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    example: '2026-07-30T12:00:00.000Z',
    description: 'Raffle end date/time',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the raffle draws automatically',
  })
  @IsBoolean()
  @IsOptional()
  isAutoDraw?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Auto draw when date is reached',
  })
  @IsBoolean()
  @IsOptional()
  autoDrawDate?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Auto draw when sold out',
  })
  @IsBoolean()
  @IsOptional()
  autoDrawSoldOut?: boolean;

  @ApiPropertyOptional({
    type: [InstantWinPrizeDto],
    description: 'Optional list of instant win prizes',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InstantWinPrizeDto)
  @IsOptional()
  instantWins?: InstantWinPrizeDto[];
}

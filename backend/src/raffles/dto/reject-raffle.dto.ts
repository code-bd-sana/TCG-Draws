import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectRaffleDto {
  @ApiPropertyOptional({
    description: 'Reason for rejection and feedback for the host',
    example: 'Please provide higher resolution prize images and clarify ticket rules.',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

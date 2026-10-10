import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FlagReviewDto {
  @ApiPropertyOptional({
    description: 'Reason for flagging this review for moderation',
    example: 'Spam or inappropriate language',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

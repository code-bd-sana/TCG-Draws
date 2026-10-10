import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Updated rating score from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Updated review comment text',
    example: 'Updated feedback after item arrived safely.',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

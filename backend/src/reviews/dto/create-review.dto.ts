import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty({
    description: 'Unique ID of the won prize / winner record',
    example: 'd89c9225-b827-4a0e-bc2f-e8b839aa64fa',
  })
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @ApiProperty({
    description: 'Rating score from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({
    description: 'Optional review comment or feedback text',
    example: 'Fast dispatch and card was mint condition!',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}

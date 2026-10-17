import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class AdminCompetitionsQueryDto {
  @ApiPropertyOptional({
    description: 'Search term for competition title or slug',
    example: 'Charizard',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: 'Filter by Host Profile ID',
    example: 'host-uuid-123',
  })
  @IsOptional()
  @IsString()
  hostId?: string;
}

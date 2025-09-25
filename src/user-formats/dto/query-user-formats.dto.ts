import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserFormatsDto {
  @ApiPropertyOptional({ example: '1', description: 'Page number (default: 1)' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: '10', description: 'Items per page (default: 10, max: 50)' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => Math.min(parseInt(value, 10), 50))
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'meeting', description: 'Search in title and description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field (createdAt, updatedAt, title)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order (asc, desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

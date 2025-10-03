import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsEnum, IsMongoId, IsNumber, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ContentType } from '../../schemas/processed-content.schema';

export class QueryProcessedContentDto {
  @ApiPropertyOptional({ example: 1, description: 'Page number (default: 1)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'page must be a number' })
  @Transform(({ value }) => parseInt(value, 10) || 1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Items per page (default: 10, max: 50)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'limit must be a number' })
  @Transform(({ value }) => Math.min(parseInt(value, 10) || 10, 50))
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'meeting notes', description: 'Search in processed content and format names' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'Meeting Notes', description: 'Search specifically in format names' })
  @IsOptional()
  @IsString()
  formatName?: string;

  @ApiPropertyOptional({ 
    enum: ContentType, 
    example: ContentType.TEXT,
    description: 'Filter by content type'
  })
  @IsOptional()
  @IsEnum(ContentType)
  contentType?: ContentType;

  @ApiPropertyOptional({ 
    example: '60f7b3b3b3b3b3b3b3b3b3b3', 
    description: 'Filter by format ID' 
  })
  @IsOptional()
  @IsMongoId()
  formatId?: string;

  @ApiPropertyOptional({ example: 'createdAt', description: 'Sort field (createdAt, updatedAt)' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc', description: 'Sort order (asc, desc)' })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({ example: '2023-01-01', description: 'Filter content created from this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2023-12-31', description: 'Filter content created until this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}

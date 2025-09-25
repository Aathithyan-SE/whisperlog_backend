import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString, IsEnum, IsMongoId } from 'class-validator';
import { Transform } from 'class-transformer';
import { ContentType } from '../../schemas/processed-content.schema';

export class QueryProcessedContentDto {
  @ApiPropertyOptional({ example: '1', description: 'Page number (default: 1)' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({ example: '10', description: 'Items per page (default: 10, max: 50)' })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => Math.min(parseInt(value, 10), 50))
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'meeting notes', description: 'Search in processed content' })
  @IsOptional()
  @IsString()
  search?: string;

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
}

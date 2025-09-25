import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsString, IsMongoId } from 'class-validator';
import { ContentType } from '../../schemas/processed-content.schema';

export class ProcessContentDto {
  @ApiProperty({ 
    example: '60f7b3b3b3b3b3b3b3b3b3b3', 
    description: 'ID of the user format to apply' 
  })
  @IsNotEmpty()
  @IsMongoId()
  formatId: string;

  @ApiProperty({ 
    enum: ContentType, 
    example: ContentType.TEXT,
    description: 'Type of content being processed'
  })
  @IsEnum(ContentType)
  contentType: ContentType;

  @ApiProperty({ 
    example: 'This is the text content to be formatted according to the selected format template.',
    description: 'Content to be processed - text string or base64 encoded audio'
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}

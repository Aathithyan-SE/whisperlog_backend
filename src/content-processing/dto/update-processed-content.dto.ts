import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateProcessedContentDto {
  @ApiProperty({ 
    example: '# Updated Meeting Notes\n\n**Date:** December 8, 2023\n**Attendees:** John, Sarah, Mike\n\n## Updated Agenda\n- Q4 Roadmap Discussion\n- Feature Prioritization\n\n## Action Items\n- [ ] John: Handle user authentication (Due: December 15th)\n- [ ] Sarah: Work on data analytics (Due: January 10th)\n- [ ] Mike: Start mobile app improvements (Due: January 2024)',
    description: 'Updated processed content in markdown format'
  })
  @IsOptional()
  @IsString()
  processedContent?: string;
}

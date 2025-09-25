import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserFormatDto {
  @ApiProperty({ example: 'Meeting Notes', description: 'Title of the format' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 'Format for organizing meeting notes with action items', 
    description: 'Optional description of the format',
    required: false
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: 'Include meeting date, attendees, main topics, and action items with due dates', 
    description: 'Optional instructions for using this format',
    required: false
  })
  @IsOptional()
  @IsString()
  instruction?: string;

  @ApiProperty({ example: 'meeting-icon', description: 'Icon name for the format' })
  @IsNotEmpty()
  @IsString()
  iconName: string;

  @ApiProperty({ 
    example: '# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}', 
    description: 'Markdown format template'
  })
  @IsNotEmpty()
  @IsString()
  format: string;
}

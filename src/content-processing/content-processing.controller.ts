import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentProcessingService } from './content-processing.service';
import { ProcessContentDto } from './dto/process-content.dto';
import { QueryProcessedContentDto } from './dto/query-processed-content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Content Processing')
@Controller('content-processing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ContentProcessingController {
  constructor(private readonly contentProcessingService: ContentProcessingService) {}

  @Post('process')
  @ApiOperation({ summary: 'Process content using AI with selected format' })
  @ApiResponse({
    status: 201,
    description: 'Content processed successfully',
    schema: {
      example: {
        _id: '60f7b3b3b3b3b3b3b3b3b3b3',
        userId: '60f7b3b3b3b3b3b3b3b3b3b2',
        formatId: '60f7b3b3b3b3b3b3b3b3b3b1',
        contentType: 'text',
        originalContent: 'This is the original text content...',
        processedContent: '# Formatted Content\n\nThis is the processed content...',
        processingMetadata: {
          submissionDate: '2023-01-01T00:00:00.000Z',
          processingTime: 1500,
          aiModel: 'openai-whisper-gpt4',
        },
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid content or format' })
  @ApiResponse({ status: 404, description: 'Format not found' })
  @ApiResponse({ status: 503, description: 'AI processing service temporarily unavailable' })
  async processContent(@Req() req: any, @Body() processContentDto: ProcessContentDto) {
    return this.contentProcessingService.processContent(req.user.userId, processContentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all processed content with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'meeting notes' })
  @ApiQuery({ name: 'contentType', required: false, enum: ['text', 'audio'] })
  @ApiQuery({ name: 'formatId', required: false, example: '60f7b3b3b3b3b3b3b3b3b3b3' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'Processed content retrieved successfully',
    schema: {
      example: {
        data: [
          {
            _id: '60f7b3b3b3b3b3b3b3b3b3b3',
            userId: {
              _id: '60f7b3b3b3b3b3b3b3b3b3b2',
              username: 'john_doe',
              email: 'john@example.com',
            },
            formatId: {
              _id: '60f7b3b3b3b3b3b3b3b3b3b1',
              title: 'Meeting Notes',
              iconName: 'meeting-icon',
              description: 'Format for meeting notes',
            },
            contentType: 'text',
            originalContent: 'This is the original text content...',
            processedContent: '# Formatted Content\n\nThis is the processed content...',
            processingMetadata: {
              submissionDate: '2023-01-01T00:00:00.000Z',
              processingTime: 1500,
              aiModel: 'openai-whisper-gpt4',
            },
            isActive: true,
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-01T00:00:00.000Z',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    },
  })
  async findAll(@Req() req: any, @Query() queryDto: QueryProcessedContentDto) {
    return this.contentProcessingService.findAll(req.user.userId, queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get processing statistics for the user' })
  @ApiResponse({
    status: 200,
    description: 'Processing statistics retrieved successfully',
    schema: {
      example: {
        overview: {
          totalProcessed: 25,
          textContent: 15,
          audioContent: 10,
          avgProcessingTime: 1250,
          totalProcessingTime: 31250,
        },
        topFormats: [
          {
            _id: '60f7b3b3b3b3b3b3b3b3b3b1',
            formatTitle: 'Meeting Notes',
            formatIcon: 'meeting-icon',
            count: 8,
          },
          {
            _id: '60f7b3b3b3b3b3b3b3b3b3b2',
            formatTitle: 'Daily Journal',
            formatIcon: 'journal-icon',
            count: 5,
          },
        ],
      },
    },
  })
  async getStats(@Req() req: any) {
    return this.contentProcessingService.getProcessingStats(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a processed content by ID' })
  @ApiResponse({
    status: 200,
    description: 'Processed content retrieved successfully',
    schema: {
      example: {
        _id: '60f7b3b3b3b3b3b3b3b3b3b3',
        userId: {
          _id: '60f7b3b3b3b3b3b3b3b3b3b2',
          username: 'john_doe',
          email: 'john@example.com',
        },
        formatId: {
          _id: '60f7b3b3b3b3b3b3b3b3b3b1',
          title: 'Meeting Notes',
          iconName: 'meeting-icon',
          description: 'Format for meeting notes',
          format: '# Meeting Notes\n\n**Date:** {date}',
          instruction: 'Include date, attendees, and action items',
        },
        contentType: 'text',
        originalContent: 'This is the original text content...',
        processedContent: '# Formatted Content\n\nThis is the processed content...',
        processingMetadata: {
          submissionDate: '2023-01-01T00:00:00.000Z',
          processingTime: 1500,
          aiModel: 'openai-whisper-gpt4',
        },
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Processed content not found' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.contentProcessingService.findOne(req.user.userId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a processed content (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'Processed content deleted successfully',
    schema: {
      example: {
        message: 'Processed content deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Processed content not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.contentProcessingService.remove(req.user.userId, id);
  }
}

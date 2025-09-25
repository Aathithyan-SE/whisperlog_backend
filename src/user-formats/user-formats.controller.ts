import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { UserFormatsService } from './user-formats.service';
import { CreateUserFormatDto } from './dto/create-user-format.dto';
import { UpdateUserFormatDto } from './dto/update-user-format.dto';
import { QueryUserFormatsDto } from './dto/query-user-formats.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Formats')
@Controller('user-formats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserFormatsController {
  constructor(private readonly userFormatsService: UserFormatsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user format' })
  @ApiResponse({
    status: 201,
    description: 'User format created successfully',
    schema: {
      example: {
        _id: '60f7b3b3b3b3b3b3b3b3b3b3',
        title: 'Meeting Notes',
        description: 'Format for organizing meeting notes',
        instruction: 'Include date, attendees, and action items',
        iconName: 'meeting-icon',
        format: '# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}',
        userId: '60f7b3b3b3b3b3b3b3b3b3b2',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  async create(@Req() req: any, @Body() createUserFormatDto: CreateUserFormatDto) {
    return this.userFormatsService.create(req.user.userId, createUserFormatDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user formats with pagination' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiQuery({ name: 'search', required: false, example: 'meeting' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, example: 'desc' })
  @ApiResponse({
    status: 200,
    description: 'User formats retrieved successfully',
    schema: {
      example: {
        data: [
          {
            _id: '60f7b3b3b3b3b3b3b3b3b3b3',
            title: 'Meeting Notes',
            description: 'Format for organizing meeting notes',
            instruction: 'Include date, attendees, and action items',
            iconName: 'meeting-icon',
            format: '# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}',
            userId: '60f7b3b3b3b3b3b3b3b3b3b2',
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
  async findAll(@Req() req: any, @Query() queryDto: QueryUserFormatsDto) {
    return this.userFormatsService.findAll(req.user.userId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user format by ID' })
  @ApiResponse({
    status: 200,
    description: 'User format retrieved successfully',
    schema: {
      example: {
        _id: '60f7b3b3b3b3b3b3b3b3b3b3',
        title: 'Meeting Notes',
        description: 'Format for organizing meeting notes',
        instruction: 'Include date, attendees, and action items',
        iconName: 'meeting-icon',
        format: '# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}',
        userId: '60f7b3b3b3b3b3b3b3b3b3b2',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User format not found' })
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.userFormatsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user format' })
  @ApiResponse({
    status: 200,
    description: 'User format updated successfully',
    schema: {
      example: {
        _id: '60f7b3b3b3b3b3b3b3b3b3b3',
        title: 'Updated Meeting Notes',
        description: 'Updated format for organizing meeting notes',
        instruction: 'Include date, attendees, and action items',
        iconName: 'meeting-icon',
        format: '# Updated Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}',
        userId: '60f7b3b3b3b3b3b3b3b3b3b2',
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User format not found' })
  async update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() updateUserFormatDto: UpdateUserFormatDto,
  ) {
    return this.userFormatsService.update(req.user.userId, id, updateUserFormatDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user format (soft delete)' })
  @ApiResponse({
    status: 200,
    description: 'User format deleted successfully',
    schema: {
      example: {
        message: 'User format deleted successfully',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User format not found' })
  async remove(@Req() req: any, @Param('id') id: string) {
    return this.userFormatsService.remove(req.user.userId, id);
  }
}

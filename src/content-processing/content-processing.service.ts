import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProcessedContent, ProcessedContentDocument, ContentType } from '../schemas/processed-content.schema';
import { ProcessContentDto } from './dto/process-content.dto';
import { QueryProcessedContentDto } from './dto/query-processed-content.dto';
import { GeminiAiService } from './gemini-ai.service';
import { UserFormatsService } from '../user-formats/user-formats.service';

@Injectable()
export class ContentProcessingService {
  constructor(
    @InjectModel(ProcessedContent.name)
    private processedContentModel: Model<ProcessedContentDocument>,
    private geminiAiService: GeminiAiService,
    private userFormatsService: UserFormatsService,
  ) {}

  async processContent(userId: string, processContentDto: ProcessContentDto) {
    const { formatId, contentType, content } = processContentDto;

    // Get the user format
    const userFormat = await this.userFormatsService.findByIdForProcessing(formatId, userId);

    // Check if AI service is available
    const isAiAvailable = await this.geminiAiService.isServiceAvailable();
    if (!isAiAvailable) {
      throw new BadRequestException('AI processing service is currently unavailable');
    }

    const startTime = Date.now();
    let processedContent: string;

    try {
      // Process content based on type
      if (contentType === ContentType.TEXT) {
        processedContent = await this.geminiAiService.processTextContent(
          content,
          userFormat.format,
          userFormat.instruction,
        );
      } else if (contentType === ContentType.AUDIO) {
        processedContent = await this.geminiAiService.processAudioContent(
          content,
          userFormat.format,
          userFormat.instruction,
        );
      } else {
        throw new BadRequestException('Unsupported content type');
      }
    } catch (error) {
      throw new BadRequestException(`Failed to process content: ${error.message}`);
    }

    const processingTime = Date.now() - startTime;

    // Save processed content
    const processedContentDoc = new this.processedContentModel({
      userId: new Types.ObjectId(userId),
      formatId: new Types.ObjectId(formatId),
      contentType,
      originalContent: content,
      processedContent,
      processingMetadata: {
        submissionDate: new Date(),
        processingTime,
        aiModel: 'gemini-1.5-flash',
      },
    });

    await processedContentDoc.save();
    await processedContentDoc.populate([
      { path: 'userId', select: 'username email' },
      { path: 'formatId', select: 'title iconName' },
    ]);

    return processedContentDoc;
  }

  async findAll(userId: string, queryDto: QueryProcessedContentDto) {
    const { page, limit, search, contentType, formatId, sortBy, sortOrder } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {
      userId: new Types.ObjectId(userId),
      isActive: true,
    };

    if (contentType) {
      filter.contentType = contentType;
    }

    if (formatId) {
      filter.formatId = new Types.ObjectId(formatId);
    }

    if (search) {
      filter.processedContent = { $regex: search, $options: 'i' };
    }

    // Build sort
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries
    const [processedContents, total] = await Promise.all([
      this.processedContentModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate([
          { path: 'userId', select: 'username email' },
          { path: 'formatId', select: 'title iconName description' },
        ])
        .exec(),
      this.processedContentModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: processedContents,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(userId: string, id: string) {
    const processedContent = await this.processedContentModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .populate([
        { path: 'userId', select: 'username email' },
        { path: 'formatId', select: 'title iconName description format instruction' },
      ])
      .exec();

    if (!processedContent) {
      throw new NotFoundException('Processed content not found');
    }

    return processedContent;
  }

  async remove(userId: string, id: string) {
    const processedContent = await this.processedContentModel
      .findOne({
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId(userId),
        isActive: true,
      })
      .exec();

    if (!processedContent) {
      throw new NotFoundException('Processed content not found');
    }

    processedContent.isActive = false;
    await processedContent.save();

    return { message: 'Processed content deleted successfully' };
  }

  async getProcessingStats(userId: string) {
    const stats = await this.processedContentModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalProcessed: { $sum: 1 },
          textContent: {
            $sum: { $cond: [{ $eq: ['$contentType', ContentType.TEXT] }, 1, 0] },
          },
          audioContent: {
            $sum: { $cond: [{ $eq: ['$contentType', ContentType.AUDIO] }, 1, 0] },
          },
          avgProcessingTime: { $avg: '$processingMetadata.processingTime' },
          totalProcessingTime: { $sum: '$processingMetadata.processingTime' },
        },
      },
    ]);

    // Get format usage stats
    const formatStats = await this.processedContentModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          isActive: true,
        },
      },
      {
        $group: {
          _id: '$formatId',
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'userformats',
          localField: '_id',
          foreignField: '_id',
          as: 'format',
        },
      },
      {
        $unwind: '$format',
      },
      {
        $project: {
          formatTitle: '$format.title',
          formatIcon: '$format.iconName',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      overview: stats[0] || {
        totalProcessed: 0,
        textContent: 0,
        audioContent: 0,
        avgProcessingTime: 0,
        totalProcessingTime: 0,
      },
      topFormats: formatStats,
    };
  }
}

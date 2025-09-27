import { Injectable, NotFoundException, BadRequestException, ServiceUnavailableException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProcessedContent, ProcessedContentDocument, ContentType } from '../schemas/processed-content.schema';
import { ProcessContentDto } from './dto/process-content.dto';
import { QueryProcessedContentDto } from './dto/query-processed-content.dto';
import { ClaudeAiService } from './claude-ai.service';
import { OpenAiAudioService } from './openai-audio.service';
import { UserFormatsService } from '../user-formats/user-formats.service';

@Injectable()
export class ContentProcessingService {
  private readonly logger = new Logger(ContentProcessingService.name);

  constructor(
    @InjectModel(ProcessedContent.name)
    private processedContentModel: Model<ProcessedContentDocument>,
    private claudeAiService: ClaudeAiService,
    private openAiAudioService: OpenAiAudioService,
    private userFormatsService: UserFormatsService,
  ) {}

  async processContent(userId: string, processContentDto: ProcessContentDto) {
    const { formatId, contentType, content } = processContentDto;

    this.logger.log(`Processing content for user ${userId}, format ${formatId}, type ${contentType}`);

    // Get the user format
    const userFormat = await this.userFormatsService.findByIdForProcessing(formatId, userId);

    const startTime = Date.now();
    let processedContent: string;

    try {
      // Process content with retry mechanism
      processedContent = await this.processContentWithRetry(
        contentType,
        content,
        userFormat.format,
        userFormat.instruction,
      );
    } catch (error) {
      this.logger.error(`Failed to process content for user ${userId}: ${error.message}`);
      
      // Check if it's a service unavailable error
      if (error.message.includes('503') || error.message.includes('Service Unavailable') || 
          error.message.includes('currently unavailable')) {
        throw new ServiceUnavailableException(
          'The AI processing service is temporarily unavailable. Please try again in a few minutes.',
        );
      }
      
      // Check if it's an API key or authentication error
      if (error.message.includes('API key') || error.message.includes('authentication') || 
          error.message.includes('401') || error.message.includes('403')) {
        throw new ServiceUnavailableException(
          'AI processing service configuration error. Please contact support.',
        );
      }
      
      // Generic processing error
      throw new BadRequestException(
        'Failed to process your content. Please check your input and try again.',
      );
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
        aiModel: 'openai-whisper-gpt4',
      },
    });

    await processedContentDoc.save();
    await processedContentDoc.populate([
      { path: 'userId', select: 'username email' },
      { path: 'formatId', select: 'title iconName' },
    ]);

    return processedContentDoc;
  }

  private async processContentWithRetry(
    contentType: ContentType,
    content: string,
    formatTemplate: string,
    formatInstruction?: string,
    maxRetries: number = 3,
    retryDelay: number = 2000,
  ): Promise<string> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`Processing attempt ${attempt}/${maxRetries}`);

        // Check if OpenAI service is available for audio, Claude for text
        if (contentType === ContentType.AUDIO) {
          const isOpenAiAvailable = await this.openAiAudioService.isServiceAvailable();
          if (!isOpenAiAvailable) {
            throw new Error('OpenAI audio processing service is currently unavailable');
          }
        } else {
          const isClaudeAvailable = await this.claudeAiService.isServiceAvailable();
          if (!isClaudeAvailable) {
            throw new Error('Claude text processing service is currently unavailable');
          }
        }

        // Process content based on type
        if (contentType === ContentType.TEXT) {
          // Use OpenAI for text as well for consistency
          return await this.openAiAudioService.processTextContent(
            content,
            formatTemplate,
            formatInstruction,
          );
        } else if (contentType === ContentType.AUDIO) {
          // 🚀 DIRECT AUDIO PROCESSING - Voice Note → Formatted Content in ONE STEP!
          this.logger.log('🎤 === DIRECT AUDIO PROCESSING START ===');
          this.logger.log('🚀 Using OpenAI Whisper + GPT-4 for direct voice-to-format processing');
          this.logger.log(`🔊 Audio Data Length: ${content.length} characters (base64)`);
          
          // Process audio directly with OpenAI (Whisper + GPT-4)
          const formattedContent = await this.openAiAudioService.processAudioDirectly(
            content,
            formatTemplate,
            formatInstruction,
          );
          
          this.logger.log('🎉 === DIRECT AUDIO PROCESSING COMPLETE ===');
          this.logger.log(`📄 Final Formatted Content: "${formattedContent.substring(0, 200)}..."`);
          
          return formattedContent;
        } else {
          throw new BadRequestException('Unsupported content type');
        }
      } catch (error) {
        lastError = error;
        this.logger.warn(`Processing attempt ${attempt} failed: ${error.message}`);

        // Don't retry for certain types of errors
        if (
          error.message.includes('Unsupported content type') ||
          error.message.includes('API key') ||
          error.message.includes('401') ||
          error.message.includes('403')
        ) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying (exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        this.logger.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
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

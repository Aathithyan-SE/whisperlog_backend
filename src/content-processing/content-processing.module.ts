import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentProcessingService } from './content-processing.service';
import { ContentProcessingController } from './content-processing.controller';
import { ClaudeAiService } from './claude-ai.service';
import { OpenAiAudioService } from './openai-audio.service';
import { ProcessedContent, ProcessedContentSchema } from '../schemas/processed-content.schema';
import { UserFormatsModule } from '../user-formats/user-formats.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProcessedContent.name, schema: ProcessedContentSchema },
    ]),
    UserFormatsModule,
  ],
  controllers: [ContentProcessingController],
  providers: [ContentProcessingService, ClaudeAiService, OpenAiAudioService],
  exports: [ContentProcessingService, ClaudeAiService, OpenAiAudioService],
})
export class ContentProcessingModule {}

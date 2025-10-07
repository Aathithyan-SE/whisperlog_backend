import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentProcessingService } from './content-processing.service';
import { ContentProcessingController } from './content-processing.controller';
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
  providers: [ContentProcessingService, OpenAiAudioService],
  exports: [ContentProcessingService, OpenAiAudioService],
})
export class ContentProcessingModule {}

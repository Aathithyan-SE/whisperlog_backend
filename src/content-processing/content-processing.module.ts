import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentProcessingService } from './content-processing.service';
import { ContentProcessingController } from './content-processing.controller';
import { GeminiAiService } from './gemini-ai.service';
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
  providers: [ContentProcessingService, GeminiAiService],
  exports: [ContentProcessingService, GeminiAiService],
})
export class ContentProcessingModule {}

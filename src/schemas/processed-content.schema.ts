import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProcessedContentDocument = ProcessedContent & Document;

export enum ContentType {
  TEXT = 'text',
  AUDIO = 'audio',
}

@Schema({ timestamps: true })
export class ProcessedContent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'UserFormat', required: true })
  formatId: Types.ObjectId;

  @Prop({ required: true, enum: ContentType })
  contentType: ContentType;

  @Prop({ required: true })
  originalContent: string; // base64 for audio or text content

  @Prop({ required: true })
  processedContent: string; // MD string processed by AI

  @Prop({ 
    required: false,
    type: {
      submissionDate: Date,
      processingTime: Number,
      aiModel: String,
    }
  })
  processingMetadata?: {
    submissionDate: Date;
    processingTime: number;
    aiModel: string;
  };

  @Prop({ default: true })
  isActive: boolean;
}

export const ProcessedContentSchema = SchemaFactory.createForClass(ProcessedContent);

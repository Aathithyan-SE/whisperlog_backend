import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserFormatDocument = UserFormat & Document;

@Schema({ timestamps: true })
export class UserFormat {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  instruction?: string;

  @Prop({ required: true })
  iconName: string;

  @Prop({ required: true })
  format: string; // MD string format

  @Prop({ default: true })
  isActive: boolean;
}

export const UserFormatSchema = SchemaFactory.createForClass(UserFormat);

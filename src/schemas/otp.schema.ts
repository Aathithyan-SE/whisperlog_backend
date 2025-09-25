import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

export enum OtpType {
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
}

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true, enum: OtpType })
  type: OtpType;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: 0 })
  attempts: number;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);

// Create TTL index for automatic cleanup
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

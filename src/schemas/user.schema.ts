import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ required: false })
  emailVerificationToken?: string;

  @Prop({ required: false })
  passwordResetToken?: string;

  @Prop({ required: false })
  passwordResetExpires?: Date;

  @Prop({ required: false })
  refreshToken?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);

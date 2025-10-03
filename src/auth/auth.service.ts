import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { Otp, OtpDocument, OtpType } from '../schemas/otp.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Otp.name) private otpModel: Model<OtpDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { username, password } = registerDto;
    const email = registerDto.email.toLowerCase(); // Normalize email to lowercase

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new this.userModel({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(email, username);
    } catch (error) {
      this.logger.warn(`Failed to send welcome email to ${email}:`, error);
    }

    // Generate JWT token
    const payload = { sub: user._id, username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const { password } = loginDto;
    const email = loginDto.email.toLowerCase(); // Normalize email to lowercase

    // Find user
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload = { sub: user._id, username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async googleLogin(googleUser: any) {
    const { googleId, username } = googleUser;
    const email = googleUser.email.toLowerCase(); // Normalize email to lowercase

    let user = await this.userModel.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (user) {
      // Update google ID if not set
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user
      let finalUsername = username.toLowerCase().replace(/\s+/g, '_');
      
      // Ensure username is unique
      const existingUsername = await this.userModel.findOne({ username: finalUsername });
      if (existingUsername) {
        finalUsername = `${finalUsername}_${Date.now()}`;
      }

      user = new this.userModel({
        username: finalUsername,
        email,
        googleId,
        isEmailVerified: true,
      });

      await user.save();

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(email, finalUsername);
      } catch (error) {
        this.logger.warn(`Failed to send welcome email to ${email}:`, error);
      }
    }

    // Generate JWT token
    const payload = { sub: user._id, username: user.username, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const email = forgotPasswordDto.email.toLowerCase(); // Normalize email to lowercase

    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      // Don't reveal if email exists or not
      return { message: 'If the email exists, you will receive a password reset OTP' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP
    await this.otpModel.create({
      email,
      otp: await bcrypt.hash(otp, 12),
      type: OtpType.PASSWORD_RESET,
      expiresAt,
    });

    // Send OTP email
    try {
      await this.emailService.sendOtpEmail(email, otp, 'reset');
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw new BadRequestException('Failed to send OTP email');
    }

    return { message: 'If the email exists, you will receive a password reset OTP' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { otp, newPassword } = resetPasswordDto;
    const email = resetPasswordDto.email.toLowerCase(); // Normalize email to lowercase

    // Find user
    const user = await this.userModel.findOne({ email, isActive: true });
    if (!user) {
      throw new BadRequestException('Invalid email or OTP');
    }

    // Find valid OTP
    const otpRecord = await this.otpModel.findOne({
      email,
      type: OtpType.PASSWORD_RESET,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      // Increment attempts
      otpRecord.attempts += 1;
      if (otpRecord.attempts >= 5) {
        otpRecord.isUsed = true;
      }
      await otpRecord.save();
      throw new BadRequestException('Invalid OTP');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    return { message: 'Password reset successfully' };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

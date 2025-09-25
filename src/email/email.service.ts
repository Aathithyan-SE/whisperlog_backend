import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const mailConfig = this.configService.get('mail');
    
    // Check if email configuration is provided
    if (!mailConfig || !mailConfig.host || !mailConfig.user || !mailConfig.pass) {
      this.logger.warn('Email configuration is missing or incomplete. Email services will be disabled.');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port || 587,
        secure: mailConfig.port === 465, // true for 465, false for other ports
        auth: {
          user: mailConfig.user,
          pass: mailConfig.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        // Add connection timeout and other options
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
      });

      this.logger.log(`Email transporter configured for host: ${mailConfig.host}:${mailConfig.port}`);
    } catch (error) {
      this.logger.error('Failed to create email transporter:', error);
      this.transporter = null;
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<void> {
    // Check if transporter is available
    if (!this.transporter) {
      this.logger.warn(`Cannot send welcome email to ${email}: Email service not configured`);
      return;
    }

    try {
      // Verify connection before sending
      await this.transporter.verify();
      
      const mailOptions = {
        from: this.configService.get('mail.from'),
        to: email,
        subject: 'Welcome to WhisperLog! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">Welcome to WhisperLog!</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Hi <strong>${username}</strong>,
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Thank you for joining WhisperLog! We're excited to help you transform your voice notes and text into beautifully formatted content using the power of AI.
              </p>
              
              <div style="background-color: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #2c5aa0; margin-top: 0;">What you can do with WhisperLog:</h3>
                <ul style="color: #666; line-height: 1.6;">
                  <li>Create custom formatting templates</li>
                  <li>Transform voice notes into structured content</li>
                  <li>Process text with AI-powered formatting</li>
                  <li>Organize your content with ease</li>
                </ul>
              </div>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Get started by creating your first formatting template and begin transforming your content today!
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #999; font-size: 14px;">
                  Happy formatting!<br>
                  The WhisperLog Team
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      // Don't throw error to prevent registration from failing
      // Just log the error and continue
    }
  }

  async sendOtpEmail(email: string, otp: string, type: 'verification' | 'reset'): Promise<void> {
    // Check if transporter is available
    if (!this.transporter) {
      this.logger.error(`Cannot send OTP email to ${email}: Email service not configured`);
      throw new Error('Email service not configured');
    }

    try {
      // Verify connection before sending
      await this.transporter.verify();
      
      const subject = type === 'verification' ? 'Verify Your Email - WhisperLog' : 'Reset Your Password - WhisperLog';
      const title = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
      const description = type === 'verification' 
        ? 'Please use the following OTP to verify your email address:'
        : 'Please use the following OTP to reset your password:';

      const mailOptions = {
        from: this.configService.get('mail.from'),
        to: email,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h1 style="color: #333; text-align: center; margin-bottom: 30px;">${title}</h1>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                ${description}
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f0f8ff; border: 2px dashed #2c5aa0; padding: 20px; border-radius: 10px; display: inline-block;">
                  <h2 style="color: #2c5aa0; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 5px;">
                    ${otp}
                  </h2>
                </div>
              </div>
              
              <p style="color: #999; font-size: 14px; text-align: center; line-height: 1.6;">
                This OTP will expire in 10 minutes.<br>
                If you didn't request this, please ignore this email.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <p style="color: #999; font-size: 14px;">
                  Best regards,<br>
                  The WhisperLog Team
                </p>
              </div>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`OTP email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      throw error;
    }
  }

  // Add a method to test email configuration
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      this.logger.log('Email connection test successful');
      return true;
    } catch (error) {
      this.logger.error('Email connection test failed:', error);
      return false;
    }
  }
}

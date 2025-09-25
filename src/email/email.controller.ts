import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test-connection')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Test email service connection (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Email connection test result',
    schema: {
      example: {
        success: true,
        message: 'Email service is working correctly'
      }
    }
  })
  async testEmailConnection() {
    const isConnected = await this.emailService.testConnection();
    
    return {
      success: isConnected,
      message: isConnected 
        ? 'Email service is working correctly' 
        : 'Email service connection failed. Check your configuration.'
    };
  }
}

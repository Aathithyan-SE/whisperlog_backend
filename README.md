# WhisperLog Backend

A powerful NestJS backend for the WhisperLog mobile application that provides AI-powered content formatting services using Google's Gemini AI.

## Features

- 🔐 **Authentication**: Username/email/password registration, Google OAuth, JWT tokens
- 📧 **Email Services**: Password reset with OTP, welcome emails via private SMTP
- 📝 **User Formats**: Create custom markdown formatting templates with CRUD operations
- 🤖 **AI Processing**: Transform text and audio content using Google Gemini AI
- 📊 **Analytics**: Processing statistics and usage tracking
- 🔍 **Search & Pagination**: Efficient data retrieval with search and pagination
- 🛡️ **Security**: Rate limiting, input validation, and comprehensive error handling

## Tech Stack

- **Framework**: NestJS
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport, Google OAuth 2.0
- **AI Integration**: Google Gemini AI (gemini-1.5-flash)
- **Email**: Nodemailer with custom SMTP
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud Platform account (for Gemini AI)
- Email service (Namecheap or similar SMTP provider)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whisperlog_backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/whisperlog

   # JWT
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # Email Configuration (Namecheap)
   MAIL_HOST=mail.yourdomain.com
   MAIL_PORT=587
   MAIL_USER=noreply@yourdomain.com
   MAIL_PASS=your-email-password
   MAIL_FROM=noreply@yourdomain.com

   # Gemini AI
   GEMINI_API_KEY=your-gemini-api-key

   # App Configuration
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3001
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or start your local MongoDB instance
   ```

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the API**
   - API Base URL: `http://localhost:3000`
   - Swagger Documentation: `http://localhost:3000/api`

## API Documentation

Comprehensive API documentation is available in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) and through the Swagger UI at `/api` endpoint.

### Key Endpoints

- **Authentication**: `/auth/*` - Registration, login, OAuth, password reset
- **User Formats**: `/user-formats` - CRUD operations for formatting templates
- **Content Processing**: `/content-processing` - AI-powered content formatting

## Project Structure

```
src/
├── auth/                    # Authentication module
│   ├── dto/                # Data transfer objects
│   ├── guards/             # Auth guards
│   ├── strategies/         # Passport strategies
│   └── auth.service.ts     # Auth business logic
├── content-processing/      # AI content processing module
│   ├── dto/                # Processing DTOs
│   ├── gemini-ai.service.ts # Gemini AI integration
│   └── content-processing.service.ts
├── email/                   # Email service module
├── schemas/                 # MongoDB schemas
│   ├── user.schema.ts
│   ├── user-format.schema.ts
│   ├── processed-content.schema.ts
│   └── otp.schema.ts
├── user-formats/           # User formats module
└── config/                 # Configuration files
```

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Building
npm run build              # Build the application
npm run start:prod         # Start production build

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage

# Code Quality
npm run lint               # ESLint
npm run format             # Prettier formatting
```

### Database Schemas

#### User Schema
- Username, email, password
- Google OAuth integration
- Email verification status
- Password reset tokens

#### User Format Schema
- Title, description, instructions
- Icon name and markdown format template
- User ownership and timestamps

#### Processed Content Schema
- Original and processed content
- Content type (text/audio)
- Processing metadata and AI model info
- User and format references

#### OTP Schema
- Email verification and password reset OTPs
- Expiration and attempt tracking
- Auto-cleanup with TTL index

## AI Integration

The application uses Google's Gemini 1.5 Flash model for budget-friendly content processing:

- **Text Processing**: Direct text formatting using templates
- **Audio Processing**: Transcription followed by formatting
- **Date Intelligence**: Automatic date resolution based on submission time
- **Template Application**: Custom markdown template application
- **Error Handling**: Robust error handling for AI service failures

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: 10 requests per minute per IP
- **Input Validation**: Comprehensive request validation
- **Password Hashing**: bcryptjs with salt rounds
- **CORS Protection**: Configurable cross-origin policies
- **Environment Variables**: Secure configuration management

## Email Integration

Custom SMTP integration supporting:
- Welcome emails for new users
- OTP delivery for password reset
- HTML email templates
- Private email service support (Namecheap)

## Deployment

### Environment Variables

Ensure all required environment variables are set:
- Database connection string
- JWT secret key
- Google OAuth credentials
- Email service configuration
- Gemini AI API key

### Production Considerations

1. **Database**: Use MongoDB Atlas or similar cloud database
2. **Email**: Configure production SMTP settings
3. **Security**: Use strong JWT secrets and enable HTTPS
4. **Monitoring**: Implement logging and monitoring
5. **Scaling**: Consider horizontal scaling for high traffic

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For questions and support:
- Check the [API Documentation](./API_DOCUMENTATION.md)
- Review the Swagger UI at `/api`
- Open an issue on GitHub

---

Built with ❤️ using NestJS and powered by Google Gemini AI
# WhisperLog API Documentation

## Overview

WhisperLog is a mobile app backend that provides AI-powered content formatting services. Users can create custom formatting templates and process text or audio content using Google's Gemini AI to transform it into structured markdown format.

## Base URL
```
http://localhost:3000
```

## Authentication

Most endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Authentication

#### Register User
- **POST** `/auth/register`
- **Description**: Register a new user with username, email, and password
- **Authentication**: None required

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **409**: User with email or username already exists

---

#### Login User
- **POST** `/auth/login`
- **Description**: Login with email and password
- **Authentication**: None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **401**: Invalid credentials

---

#### Google OAuth Login
- **GET** `/auth/google`
- **Description**: Initiate Google OAuth login process
- **Authentication**: None required
- **Response**: Redirects to Google OAuth consent screen

#### Google OAuth Callback
- **GET** `/auth/google/callback`
- **Description**: Handle Google OAuth callback
- **Authentication**: None required
- **Response**: Redirects to frontend with access token

---

#### Forgot Password
- **POST** `/auth/forgot-password`
- **Description**: Request password reset OTP via email
- **Authentication**: None required

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "If the email exists, you will receive a password reset OTP"
}
```

---

#### Reset Password
- **POST** `/auth/reset-password`
- **Description**: Reset password using OTP
- **Authentication**: None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**
- **400**: Invalid or expired OTP

---

#### Get User Profile
- **GET** `/auth/profile`
- **Description**: Get current user profile information
- **Authentication**: Required

**Response (200):**
```json
{
  "id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "username": "john_doe",
  "email": "john@example.com"
}
```

---

### 2. User Formats

#### Create User Format
- **POST** `/user-formats`
- **Description**: Create a new formatting template
- **Authentication**: Required

**Request Body:**
```json
{
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes with action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}"
}
```

**Response (201):**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes with action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

---

#### Get All User Formats
- **GET** `/user-formats`
- **Description**: Get all user formats with pagination and search
- **Authentication**: Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `search` (optional): Search in title and description
- `sortBy` (optional): Sort field (createdAt, updatedAt, title)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /user-formats?page=1&limit=10&search=meeting&sortBy=createdAt&sortOrder=desc
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "title": "Meeting Notes",
      "description": "Format for organizing meeting notes",
      "instruction": "Include date, attendees, and action items",
      "iconName": "meeting-icon",
      "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}",
      "userId": "60f7b3b3b3b3b3b3b3b3b3b2",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

#### Get User Format by ID
- **GET** `/user-formats/{id}`
- **Description**: Get a specific user format by ID
- **Authentication**: Required

**Response (200):**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes",
  "instruction": "Include date, attendees, and action items",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- **404**: User format not found

---

#### Update User Format
- **PATCH** `/user-formats/{id}`
- **Description**: Update an existing user format
- **Authentication**: Required

**Request Body (partial update):**
```json
{
  "title": "Updated Meeting Notes",
  "description": "Updated format for organizing meeting notes"
}
```

**Response (200):**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
  "title": "Updated Meeting Notes",
  "description": "Updated format for organizing meeting notes",
  "instruction": "Include date, attendees, and action items",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- **404**: User format not found

---

#### Delete User Format
- **DELETE** `/user-formats/{id}`
- **Description**: Delete a user format (soft delete)
- **Authentication**: Required

**Response (200):**
```json
{
  "message": "User format deleted successfully"
}
```

**Error Responses:**
- **404**: User format not found

---

### 3. Content Processing

#### Process Content
- **POST** `/content-processing/process`
- **Description**: Process text or audio content using AI with selected format
- **Authentication**: Required

**Request Body (Text Content):**
```json
{
  "formatId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "contentType": "text",
  "content": "We had a team meeting today to discuss the Q4 roadmap. John, Sarah, and Mike were present. We decided to focus on three main features: user authentication, data analytics, and mobile app improvements. John will handle authentication by December 15th, Sarah will work on analytics by January 10th, and Mike will start mobile improvements in the new year."
}
```

**Request Body (Audio Content):**
```json
{
  "formatId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "contentType": "audio",
  "content": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmUdBDuU3PLEcyUGKoHO8tOIOwkWYrjr6qNcEwxUp+Hw"
}
```

**Response (201):**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "userId": "60f7b3b3b3b3b3b3b3b3b3b2",
  "formatId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "contentType": "text",
  "originalContent": "We had a team meeting today to discuss...",
  "processedContent": "# Meeting Notes\n\n**Date:** December 8, 2023\n**Attendees:** John, Sarah, Mike\n\n## Agenda\n- Q4 Roadmap Discussion\n- Feature Prioritization\n\n## Action Items\n- [ ] John: Handle user authentication (Due: December 15th)\n- [ ] Sarah: Work on data analytics (Due: January 10th)\n- [ ] Mike: Start mobile app improvements (Due: January 2024)",
  "processingMetadata": {
    "submissionDate": "2023-01-01T00:00:00.000Z",
    "processingTime": 1500,
    "aiModel": "gemini-1.5-flash"
  },
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- **400**: Invalid content or AI service unavailable
- **404**: Format not found

---

#### Get All Processed Content
- **GET** `/content-processing`
- **Description**: Get all processed content with pagination and filters
- **Authentication**: Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 50)
- `search` (optional): Search in processed content
- `contentType` (optional): Filter by content type (text, audio)
- `formatId` (optional): Filter by format ID
- `sortBy` (optional): Sort field (createdAt, updatedAt)
- `sortOrder` (optional): Sort order (asc, desc)

**Example Request:**
```
GET /content-processing?page=1&limit=10&contentType=text&sortBy=createdAt&sortOrder=desc
```

**Response (200):**
```json
{
  "data": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
      "userId": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b2",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "formatId": {
        "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
        "title": "Meeting Notes",
        "iconName": "meeting-icon",
        "description": "Format for meeting notes"
      },
      "contentType": "text",
      "originalContent": "We had a team meeting today...",
      "processedContent": "# Meeting Notes\n\n**Date:** December 8, 2023...",
      "processingMetadata": {
        "submissionDate": "2023-01-01T00:00:00.000Z",
        "processingTime": 1500,
        "aiModel": "gemini-1.5-flash"
      },
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

#### Get Processing Statistics
- **GET** `/content-processing/stats`
- **Description**: Get processing statistics for the authenticated user
- **Authentication**: Required

**Response (200):**
```json
{
  "overview": {
    "totalProcessed": 25,
    "textContent": 15,
    "audioContent": 10,
    "avgProcessingTime": 1250,
    "totalProcessingTime": 31250
  },
  "topFormats": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b1",
      "formatTitle": "Meeting Notes",
      "formatIcon": "meeting-icon",
      "count": 8
    },
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b2",
      "formatTitle": "Daily Journal",
      "formatIcon": "journal-icon",
      "count": 5
    }
  ]
}
```

---

#### Get Processed Content by ID
- **GET** `/content-processing/{id}`
- **Description**: Get a specific processed content by ID
- **Authentication**: Required

**Response (200):**
```json
{
  "_id": "60f7b3b3b3b3b3b3b3b3b3b4",
  "userId": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b2",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "formatId": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "title": "Meeting Notes",
    "iconName": "meeting-icon",
    "description": "Format for meeting notes",
    "format": "# Meeting Notes\n\n**Date:** {date}",
    "instruction": "Include date, attendees, and action items"
  },
  "contentType": "text",
  "originalContent": "We had a team meeting today...",
  "processedContent": "# Meeting Notes\n\n**Date:** December 8, 2023...",
  "processingMetadata": {
    "submissionDate": "2023-01-01T00:00:00.000Z",
    "processingTime": 1500,
    "aiModel": "gemini-1.5-flash"
  },
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

**Error Responses:**
- **404**: Processed content not found

---

#### Delete Processed Content
- **DELETE** `/content-processing/{id}`
- **Description**: Delete processed content (soft delete)
- **Authentication**: Required

**Response (200):**
```json
{
  "message": "Processed content deleted successfully"
}
```

**Error Responses:**
- **404**: Processed content not found

---

## Error Handling

All API endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

**409 Conflict:**
```json
{
  "statusCode": 409,
  "message": "User with this email or username already exists",
  "error": "Conflict"
}
```

**500 Internal Server Error:**
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Limit**: 10 requests per minute per IP
- **Window**: 60 seconds

When rate limit is exceeded:
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## Environment Configuration

Create a `.env` file in the project root with the following variables:

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

---

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set up Environment:**
   - Copy `.env.example` to `.env`
   - Fill in your configuration values

3. **Start MongoDB:**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # Or install MongoDB locally
   ```

4. **Run the Application:**
   ```bash
   # Development mode
   npm run start:dev
   
   # Production mode
   npm run build
   npm run start:prod
   ```

5. **Access API Documentation:**
   - Swagger UI: `http://localhost:3000/api`
   - API Endpoints: `http://localhost:3000`

---

## Features

### Authentication
- **Username/Email/Password Registration**: Standard user registration
- **Google OAuth**: Social login integration
- **JWT Tokens**: Secure authentication with refresh tokens
- **Password Reset**: OTP-based password recovery via email
- **Email Verification**: Optional email verification system

### User Formats
- **CRUD Operations**: Create, read, update, delete formatting templates
- **Pagination**: Efficient data retrieval with pagination
- **Search**: Search formats by title and description
- **Sorting**: Sort by creation date, update date, or title
- **Markdown Templates**: Rich markdown formatting support

### Content Processing
- **AI Integration**: Google Gemini AI for content processing
- **Multi-format Support**: Text and audio content processing
- **Template Application**: Apply user-defined formats to content
- **Date Intelligence**: Automatic date resolution in content
- **Processing Statistics**: Track usage and performance metrics
- **Content Management**: Full CRUD operations on processed content

### Email Services
- **Welcome Emails**: Branded welcome messages for new users
- **OTP Delivery**: Secure OTP delivery for password reset
- **Custom SMTP**: Support for private email services (Namecheap)

### Security & Performance
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Consistent error responses
- **Logging**: Structured logging for debugging
- **CORS**: Cross-origin request support

---

## Support

For questions and support, please refer to the project documentation or contact the development team.

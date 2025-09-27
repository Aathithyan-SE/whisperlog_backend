# WhisperLog Mobile API Guide

## Complete API Reference for Mobile App Developers

This guide provides exact request/response examples with all parameter names and values for integrating with the WhisperLog backend API.

---

## Base Configuration

```
Base URL: http://localhost:3000
Content-Type: application/json
Authorization: Bearer <jwt_token> (for protected endpoints)
```

---

## 1. User Formats API

### Create User Format

**Endpoint:** `POST /user-formats`
**Auth Required:** Yes
**Description:** Create a new formatting template

#### Request Headers
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

#### Request Body Schema
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "instruction": "string (optional)",
  "iconName": "string (required)",
  "format": "string (required)"
}
```

#### Example Request
```json
{
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes with action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}"
}
```

#### Success Response (201)
```json
{
  "_id": "675a1b2c3d4e5f6789abcdef",
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes with action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
  "userId": "675a1b2c3d4e5f6789abcdee",
  "isActive": true,
  "createdAt": "2024-12-11T10:30:00.000Z",
  "updatedAt": "2024-12-11T10:30:00.000Z"
}
```

#### Error Responses
```json
// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": [
    "title should not be empty",
    "iconName should not be empty",
    "format should not be empty"
  ],
  "error": "Bad Request"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

### Get All User Formats

**Endpoint:** `GET /user-formats`
**Auth Required:** Yes
**Description:** Retrieve user formats with pagination and filtering

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 50) |
| `search` | string | No | - | Search in title and description |
| `sortBy` | string | No | createdAt | Sort field (createdAt, updatedAt, title) |
| `sortOrder` | string | No | desc | Sort order (asc, desc) |

#### Example Request
```
GET /user-formats?page=1&limit=10&search=meeting&sortBy=createdAt&sortOrder=desc
```

#### Success Response (200)
```json
{
  "data": [
    {
      "_id": "675a1b2c3d4e5f6789abcdef",
      "title": "Meeting Notes",
      "description": "Format for organizing meeting notes with action items",
      "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
      "iconName": "meeting-icon",
      "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
      "userId": "675a1b2c3d4e5f6789abcdee",
      "isActive": true,
      "createdAt": "2024-12-11T10:30:00.000Z",
      "updatedAt": "2024-12-11T10:30:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6789abcde0",
      "title": "Daily Journal",
      "description": "Personal daily reflection format",
      "instruction": "Include mood, key events, and tomorrow's goals",
      "iconName": "journal-icon",
      "format": "# Daily Journal - {date}\n\n## Mood\n{mood}\n\n## Key Events\n- {event}\n\n## Tomorrow's Goals\n- [ ] {goal}",
      "userId": "675a1b2c3d4e5f6789abcdee",
      "isActive": true,
      "createdAt": "2024-12-10T15:20:00.000Z",
      "updatedAt": "2024-12-10T15:20:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### Get User Format by ID

**Endpoint:** `GET /user-formats/{id}`
**Auth Required:** Yes

#### Example Request
```
GET /user-formats/675a1b2c3d4e5f6789abcdef
```

#### Success Response (200)
```json
{
  "_id": "675a1b2c3d4e5f6789abcdef",
  "title": "Meeting Notes",
  "description": "Format for organizing meeting notes with action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
  "userId": "675a1b2c3d4e5f6789abcdee",
  "isActive": true,
  "createdAt": "2024-12-11T10:30:00.000Z",
  "updatedAt": "2024-12-11T10:30:00.000Z"
}
```

#### Error Response (404)
```json
{
  "statusCode": 404,
  "message": "User format not found",
  "error": "Not Found"
}
```

---

### Update User Format

**Endpoint:** `PATCH /user-formats/{id}`
**Auth Required:** Yes
**Description:** Partial update of user format (all fields optional)

#### Request Body Schema
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "instruction": "string (optional)",
  "iconName": "string (optional)",
  "format": "string (optional)"
}
```

#### Example Request
```
PATCH /user-formats/675a1b2c3d4e5f6789abcdef
```

```json
{
  "title": "Updated Meeting Notes",
  "description": "Enhanced format for organizing meeting notes with detailed action items"
}
```

#### Success Response (200)
```json
{
  "_id": "675a1b2c3d4e5f6789abcdef",
  "title": "Updated Meeting Notes",
  "description": "Enhanced format for organizing meeting notes with detailed action items",
  "instruction": "Include meeting date, attendees, main topics, and action items with due dates",
  "iconName": "meeting-icon",
  "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
  "userId": "675a1b2c3d4e5f6789abcdee",
  "isActive": true,
  "createdAt": "2024-12-11T10:30:00.000Z",
  "updatedAt": "2024-12-11T11:45:00.000Z"
}
```

---

### Delete User Format

**Endpoint:** `DELETE /user-formats/{id}`
**Auth Required:** Yes
**Description:** Soft delete user format

#### Example Request
```
DELETE /user-formats/675a1b2c3d4e5f6789abcdef
```

#### Success Response (200)
```json
{
  "message": "User format deleted successfully"
}
```

---

## 2. Content Processing API

### Process Content

**Endpoint:** `POST /content-processing/process`
**Auth Required:** Yes
**Description:** Process text or audio content using AI with selected format

#### Request Body Schema
```json
{
  "formatId": "string (required, MongoDB ObjectId)",
  "contentType": "text | audio (required)",
  "content": "string (required)"
}
```

#### Example Request - Text Content
```json
{
  "formatId": "675a1b2c3d4e5f6789abcdef",
  "contentType": "text",
  "content": "We had a team meeting today to discuss the Q4 roadmap. John, Sarah, and Mike were present. We decided to focus on three main features: user authentication, data analytics, and mobile app improvements. John will handle authentication by December 15th, Sarah will work on analytics by January 10th, and Mike will start mobile improvements in the new year."
}
```

#### Example Request - Audio Content
```json
{
  "formatId": "675a1b2c3d4e5f6789abcdef",
  "contentType": "audio",
  "content": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmUdBDuU3PLEcyUGKoHO8tOIOwkWYrjr6qNcEwxUp+Hw..."
}
```

#### Success Response (201)
```json
{
  "_id": "675a1b2c3d4e5f6789abcde1",
  "userId": "675a1b2c3d4e5f6789abcdee",
  "formatId": "675a1b2c3d4e5f6789abcdef",
  "contentType": "text",
  "originalContent": "We had a team meeting today to discuss the Q4 roadmap. John, Sarah, and Mike were present. We decided to focus on three main features: user authentication, data analytics, and mobile app improvements. John will handle authentication by December 15th, Sarah will work on analytics by January 10th, and Mike will start mobile improvements in the new year.",
  "processedContent": "# Meeting Notes\n\n**Date:** December 11, 2024\n**Attendees:** John, Sarah, Mike\n\n## Agenda\n- Q4 Roadmap Discussion\n- Feature Prioritization\n\n## Action Items\n- [ ] John: Handle user authentication (Due: December 15th)\n- [ ] Sarah: Work on data analytics (Due: January 10th)\n- [ ] Mike: Start mobile app improvements (Due: January 2024)",
  "processingMetadata": {
    "submissionDate": "2024-12-11T12:00:00.000Z",
    "processingTime": 1500,
    "aiModel": "gemini-1.5-flash"
  },
  "isActive": true,
  "createdAt": "2024-12-11T12:00:00.000Z",
  "updatedAt": "2024-12-11T12:00:00.000Z"
}
```

#### Error Responses
```json
// 400 Bad Request - Invalid content
{
  "statusCode": 400,
  "message": "Failed to process content: AI service unavailable",
  "error": "Bad Request"
}

// 400 Bad Request - Validation Error
{
  "statusCode": 400,
  "message": [
    "formatId must be a mongodb id",
    "contentType must be one of the following values: text, audio",
    "content should not be empty"
  ],
  "error": "Bad Request"
}

// 404 Not Found - Format not found
{
  "statusCode": 404,
  "message": "User format not found",
  "error": "Not Found"
}
```

---

### Get All Processed Content

**Endpoint:** `GET /content-processing`
**Auth Required:** Yes
**Description:** Retrieve processed content with pagination and filtering

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Items per page (max: 50) |
| `search` | string | No | - | Search in processed content |
| `contentType` | string | No | - | Filter by content type (text, audio) |
| `formatId` | string | No | - | Filter by format ID |
| `sortBy` | string | No | createdAt | Sort field (createdAt, updatedAt) |
| `sortOrder` | string | No | desc | Sort order (asc, desc) |

#### Example Request
```
GET /content-processing?page=1&limit=10&contentType=text&sortBy=createdAt&sortOrder=desc
```

#### Success Response (200)
```json
{
  "data": [
    {
      "_id": "675a1b2c3d4e5f6789abcde1",
      "userId": {
        "_id": "675a1b2c3d4e5f6789abcdee",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "formatId": {
        "_id": "675a1b2c3d4e5f6789abcdef",
        "title": "Meeting Notes",
        "iconName": "meeting-icon",
        "description": "Format for organizing meeting notes with action items"
      },
      "contentType": "text",
      "originalContent": "We had a team meeting today to discuss the Q4 roadmap...",
      "processedContent": "# Meeting Notes\n\n**Date:** December 11, 2024\n**Attendees:** John, Sarah, Mike...",
      "processingMetadata": {
        "submissionDate": "2024-12-11T12:00:00.000Z",
        "processingTime": 1500,
        "aiModel": "gemini-1.5-flash"
      },
      "isActive": true,
      "createdAt": "2024-12-11T12:00:00.000Z",
      "updatedAt": "2024-12-11T12:00:00.000Z"
    },
    {
      "_id": "675a1b2c3d4e5f6789abcde2",
      "userId": {
        "_id": "675a1b2c3d4e5f6789abcdee",
        "username": "john_doe",
        "email": "john@example.com"
      },
      "formatId": {
        "_id": "675a1b2c3d4e5f6789abcde0",
        "title": "Daily Journal",
        "iconName": "journal-icon",
        "description": "Personal daily reflection format"
      },
      "contentType": "audio",
      "originalContent": "data:audio/wav;base64,UklGRnoGAABXQVZFZm10...",
      "processedContent": "# Daily Journal - December 10, 2024\n\n## Mood\nFeeling productive and motivated\n\n## Key Events\n- Completed project milestone\n- Team lunch meeting\n\n## Tomorrow's Goals\n- [ ] Review code changes\n- [ ] Prepare presentation",
      "processingMetadata": {
        "submissionDate": "2024-12-10T18:30:00.000Z",
        "processingTime": 2200,
        "aiModel": "gemini-1.5-flash"
      },
      "isActive": true,
      "createdAt": "2024-12-10T18:30:00.000Z",
      "updatedAt": "2024-12-10T18:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### Get Processing Statistics

**Endpoint:** `GET /content-processing/stats`
**Auth Required:** Yes
**Description:** Get processing statistics for the authenticated user

#### Example Request
```
GET /content-processing/stats
```

#### Success Response (200)
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
      "_id": "675a1b2c3d4e5f6789abcdef",
      "formatTitle": "Meeting Notes",
      "formatIcon": "meeting-icon",
      "count": 8
    },
    {
      "_id": "675a1b2c3d4e5f6789abcde0",
      "formatTitle": "Daily Journal",
      "formatIcon": "journal-icon",
      "count": 5
    },
    {
      "_id": "675a1b2c3d4e5f6789abcde3",
      "formatTitle": "Project Notes",
      "formatIcon": "project-icon",
      "count": 3
    }
  ]
}
```

---

### Get Processed Content by ID

**Endpoint:** `GET /content-processing/{id}`
**Auth Required:** Yes

#### Example Request
```
GET /content-processing/675a1b2c3d4e5f6789abcde1
```

#### Success Response (200)
```json
{
  "_id": "675a1b2c3d4e5f6789abcde1",
  "userId": {
    "_id": "675a1b2c3d4e5f6789abcdee",
    "username": "john_doe",
    "email": "john@example.com"
  },
  "formatId": {
    "_id": "675a1b2c3d4e5f6789abcdef",
    "title": "Meeting Notes",
    "iconName": "meeting-icon",
    "description": "Format for organizing meeting notes with action items",
    "format": "# Meeting Notes\n\n**Date:** {date}\n**Attendees:** {attendees}\n\n## Agenda\n{agenda}\n\n## Action Items\n- [ ] {action_item}\n- [ ] {action_item}",
    "instruction": "Include meeting date, attendees, main topics, and action items with due dates"
  },
  "contentType": "text",
  "originalContent": "We had a team meeting today to discuss the Q4 roadmap. John, Sarah, and Mike were present...",
  "processedContent": "# Meeting Notes\n\n**Date:** December 11, 2024\n**Attendees:** John, Sarah, Mike\n\n## Agenda\n- Q4 Roadmap Discussion\n- Feature Prioritization\n\n## Action Items\n- [ ] John: Handle user authentication (Due: December 15th)\n- [ ] Sarah: Work on data analytics (Due: January 10th)\n- [ ] Mike: Start mobile app improvements (Due: January 2024)",
  "processingMetadata": {
    "submissionDate": "2024-12-11T12:00:00.000Z",
    "processingTime": 1500,
    "aiModel": "gemini-1.5-flash"
  },
  "isActive": true,
  "createdAt": "2024-12-11T12:00:00.000Z",
  "updatedAt": "2024-12-11T12:00:00.000Z"
}
```

#### Error Response (404)
```json
{
  "statusCode": 404,
  "message": "Processed content not found",
  "error": "Not Found"
}
```

---

### Delete Processed Content

**Endpoint:** `DELETE /content-processing/{id}`
**Auth Required:** Yes
**Description:** Soft delete processed content

#### Example Request
```
DELETE /content-processing/675a1b2c3d4e5f6789abcde1
```

#### Success Response (200)
```json
{
  "message": "Processed content deleted successfully"
}
```

---

## 3. Mobile App Implementation Tips

### Authentication Flow
1. Store JWT token securely (Keychain/Keystore)
2. Include token in all authenticated requests
3. Handle token expiration (implement refresh logic)

### Content Types
- **Text**: Plain text string
- **Audio**: Base64 encoded audio data with MIME type prefix
  ```
  data:audio/wav;base64,UklGRnoGAABXQVZF...
  ```

### Error Handling
Always check `statusCode` field in responses:
- `200/201`: Success
- `400`: Validation error - check `message` array
- `401`: Authentication required/invalid
- `404`: Resource not found
- `500`: Server error

### Pagination
All list endpoints support pagination with consistent structure:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Search and Filtering
- Use `search` parameter for text search
- Combine filters (contentType, formatId) for specific results
- Sort by `createdAt`, `updatedAt`, or `title`

### Audio Processing
- Supported formats: WAV, MP3, M4A
- Max file size: Check with backend team
- Base64 encoding required for transmission

### Network Optimization
- Implement proper loading states
- Cache user formats locally
- Use pagination for large lists
- Handle offline scenarios

---

## 4. Sample Mobile Integration Code

### Swift (iOS) Example
```swift
struct UserFormat: Codable {
    let id: String
    let title: String
    let description: String?
    let instruction: String?
    let iconName: String
    let format: String
    let userId: String
    let isActive: Bool
    let createdAt: String
    let updatedAt: String
    
    enum CodingKeys: String, CodingKey {
        case id = "_id"
        case title, description, instruction, iconName, format, userId, isActive, createdAt, updatedAt
    }
}

struct ProcessContentRequest: Codable {
    let formatId: String
    let contentType: String
    let content: String
}

class APIService {
    private let baseURL = "http://localhost:3000"
    private var authToken: String?
    
    func createUserFormat(_ format: UserFormat, completion: @escaping (Result<UserFormat, Error>) -> Void) {
        // Implementation
    }
    
    func processContent(_ request: ProcessContentRequest, completion: @escaping (Result<ProcessedContent, Error>) -> Void) {
        // Implementation
    }
}
```

### Kotlin (Android) Example
```kotlin
data class UserFormat(
    @SerializedName("_id") val id: String,
    val title: String,
    val description: String?,
    val instruction: String?,
    val iconName: String,
    val format: String,
    val userId: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

data class ProcessContentRequest(
    val formatId: String,
    val contentType: String,
    val content: String
)

class ApiService {
    private val baseUrl = "http://localhost:3000"
    
    suspend fun createUserFormat(format: UserFormat): UserFormat {
        // Implementation
    }
    
    suspend fun processContent(request: ProcessContentRequest): ProcessedContent {
        // Implementation
    }
}
```

---

## 5. Testing Endpoints

Use these cURL commands to test the API:

### Create User Format
```bash
curl -X POST http://localhost:3000/user-formats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Format",
    "description": "Test description",
    "instruction": "Test instruction",
    "iconName": "test-icon",
    "format": "# Test\n\n{content}"
  }'
```

### Process Content
```bash
curl -X POST http://localhost:3000/content-processing/process \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "formatId": "YOUR_FORMAT_ID",
    "contentType": "text",
    "content": "This is test content to be processed."
  }'
```

---

This guide provides all the exact parameter names, response structures, and implementation details needed for mobile app development with the WhisperLog API.

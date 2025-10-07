# Payload Size Fix & OpenAI-Only Processing

## Issues Fixed

### 1. PayloadTooLargeError for Large Audio Files
**Problem:** When sending large base64 audio files, the server was throwing:
```
PayloadTooLargeError: request entity too large
```

**Solution:** Updated `src/main.ts` to configure custom body parser limits:
- **Content Processing Endpoint**: 50MB limit for `/content-processing/process`
- **Other Endpoints**: 10MB default limit
- **Implementation**: Route-specific middleware with Express body parser

### 2. Unified AI Processing with OpenAI Only
**Problem:** The system was using both Claude AI and OpenAI services inconsistently.

**Solution:** Streamlined to use **OpenAI GPT-4 only** for both text and audio processing:
- **Text Content**: Direct GPT-4 formatting
- **Audio Content**: Whisper transcription + GPT-4 formatting
- **Removed**: Claude AI service dependency
- **Updated**: AI model metadata to `openai-gpt4`

## Technical Changes

### 1. Main Application Configuration (`src/main.ts`)
```typescript
// Disable default body parser
const app = await NestFactory.create(AppModule, {
  bodyParser: false,
});

// Route-specific body parser limits
app.use('/content-processing/process', (req, res, next) => {
  express.json({ 
    limit: '50mb',  // Large limit for audio processing
    extended: true 
  })(req, res, next);
});

app.use((req, res, next) => {
  express.json({ 
    limit: '10mb',  // Default limit for other routes
    extended: true 
  })(req, res, next);
});
```

### 2. Content Processing Service (`src/content-processing/content-processing.service.ts`)
- **Removed**: Claude AI service dependency
- **Updated**: Service availability check to use OpenAI only
- **Enhanced**: Logging for both text and audio processing
- **Unified**: AI model metadata

### 3. Content Processing Module (`src/content-processing/content-processing.module.ts`)
- **Removed**: Claude AI service from providers and exports
- **Simplified**: Module dependencies

## Benefits

1. **🚀 Larger File Support**: Can now handle audio files up to 50MB
2. **🔄 Consistent Processing**: Single AI provider (OpenAI) for all content types
3. **📊 Better Logging**: Enhanced logging for debugging and monitoring
4. **⚡ Simplified Architecture**: Removed unnecessary Claude AI dependency
5. **💰 Cost Optimization**: Single AI service reduces complexity and potential costs

## Testing

The server now supports:
- Large base64 audio files (up to 50MB)
- Consistent OpenAI GPT-4 processing for all content types
- Proper error handling and logging

## Usage

Both text and audio content will now be processed using OpenAI:
- **Text**: Direct GPT-4 formatting
- **Audio**: Whisper → GPT-4 pipeline

The API endpoints remain the same, but now support larger payloads and consistent AI processing.

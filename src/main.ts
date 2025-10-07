import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable default body parser to configure custom limits
  });
  
  // Configure body parser with larger limits for audio files
  app.use('/content-processing/process', (req, res, next) => {
    // Set larger limits for content processing endpoint
    const express = require('express');
    express.json({ 
      limit: '50mb',  // Allow up to 50MB for base64 audio
      extended: true 
    })(req, res, next);
  });
  
  // Default body parser for other routes
  app.use((req, res, next) => {
    const express = require('express');
    express.json({ 
      limit: '10mb',  // Default limit for other endpoints
      extended: true 
    })(req, res, next);
  });
  
  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('WhisperLog API')
    .setDescription('WhisperLog mobile app backend API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiAiService {
  private readonly logger = new Logger(GeminiAiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('gemini.apiKey');
    if (!apiKey) {
      this.logger.error('Gemini API key not configured');
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-1.5-flash for budget-friendly option
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async processTextContent(
    content: string,
    formatTemplate: string,
    formatInstruction?: string,
  ): Promise<string> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const prompt = this.buildPrompt(
        content,
        formatTemplate,
        formatInstruction,
        currentDate,
        'text',
      );

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const processedContent = response.text();

      if (!processedContent) {
        throw new BadRequestException('Failed to process content with AI');
      }

      return processedContent.trim();
    } catch (error) {
      this.logger.error('Error processing text content with Gemini:', error);
      throw new BadRequestException('Failed to process content with AI');
    }
  }

  async processAudioContent(
    base64Audio: string,
    formatTemplate: string,
    formatInstruction?: string,
  ): Promise<string> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      // First, transcribe the audio content
      const transcriptionPrompt = `
        Please transcribe the following audio content accurately. 
        Return only the transcribed text without any additional formatting or commentary.
        
        Current date for reference: ${currentDate}
        
        If you cannot transcribe the audio, respond with "Unable to transcribe audio content."
      `;

      // For audio processing, we need to handle base64 audio data
      // Note: Gemini's audio capabilities might be limited, so we'll simulate transcription
      // In a real implementation, you might want to use a dedicated speech-to-text service
      const transcriptionResult = await this.model.generateContent([
        {
          text: `${transcriptionPrompt}\n\nAudio data (base64): ${base64Audio.substring(0, 100)}...`,
        },
      ]);

      const transcriptionResponse = await transcriptionResult.response;
      const transcribedText = transcriptionResponse.text();

      if (!transcribedText || transcribedText.includes('Unable to transcribe')) {
        throw new BadRequestException('Unable to transcribe audio content');
      }

      // Now format the transcribed text using the template
      const formatPrompt = this.buildPrompt(
        transcribedText,
        formatTemplate,
        formatInstruction,
        currentDate,
        'audio',
      );

      const formatResult = await this.model.generateContent(formatPrompt);
      const formatResponse = await formatResult.response;
      const processedContent = formatResponse.text();

      if (!processedContent) {
        throw new BadRequestException('Failed to format transcribed content');
      }

      return processedContent.trim();
    } catch (error) {
      this.logger.error('Error processing audio content with Gemini:', error);
      throw new BadRequestException('Failed to process audio content with AI');
    }
  }

  private buildPrompt(
    content: string,
    formatTemplate: string,
    formatInstruction?: string,
    currentDate?: string,
    contentType?: string,
  ): string {
    return `
You are an AI assistant that helps format content according to specific templates. Your task is to take the provided content and format it according to the given template while following any specific instructions.

**Current Date:** ${currentDate}
**Content Type:** ${contentType}

**Format Template:**
${formatTemplate}

**Format Instructions:**
${formatInstruction || 'Follow the template structure and format the content appropriately.'}

**Content to Format:**
${content}

**Important Guidelines:**
1. Format the content as markdown following the provided template structure
2. If the content mentions dates like "today", "yesterday", "tomorrow", use the current date (${currentDate}) as reference
3. If specific date information is not provided in the content, use the current date where appropriate
4. Extract key information from the content and organize it according to the template
5. Maintain the markdown formatting as specified in the template
6. If the template has placeholders like {date}, {attendees}, etc., replace them with appropriate content from the input
7. Be concise but comprehensive in formatting
8. If certain template sections cannot be filled from the provided content, include placeholder text or omit those sections appropriately

Please return only the formatted content in markdown format, without any additional commentary or explanation.
    `.trim();
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!this.model) {
        return false;
      }

      // Simple test to check if the service is working
      const result = await this.model.generateContent('Test message');
      const response = await result.response;
      return !!response.text();
    } catch (error) {
      this.logger.error('Gemini AI service availability check failed:', error);
      return false;
    }
  }
}

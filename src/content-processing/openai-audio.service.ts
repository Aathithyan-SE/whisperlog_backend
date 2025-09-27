import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class OpenAiAudioService {
  private readonly logger = new Logger(OpenAiAudioService.name);
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (!apiKey) {
      this.logger.error('OpenAI API key not configured');
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });

    this.logger.log('OpenAI Audio service initialized successfully');
  }

  /**
   * DIRECT AUDIO PROCESSING: Voice Note → Formatted Content in ONE STEP
   * 
   * This method combines:
   * 1. OpenAI Whisper (transcription)
   * 2. OpenAI GPT-4 (formatting)
   * 
   * The AI directly processes your voice and outputs formatted content!
   */
  async processAudioDirectly(
    base64Audio: string,
    formatTemplate: string,
    formatInstruction?: string,
  ): Promise<string> {
    try {
      this.logger.log('🎤 === DIRECT AUDIO PROCESSING START ===');
      this.logger.log('🚀 Processing voice note directly with OpenAI (Whisper + GPT-4)');
      
      // Extract the actual base64 data
      let audioData = base64Audio;
      if (base64Audio.startsWith('data:audio/mp4;base64,')) {
        audioData = base64Audio.replace('data:audio/mp4;base64,', '');
        this.logger.log('📋 Removed MIME type prefix from audio data');
      }
      
      this.logger.log(`🔊 Audio Data Length: ${audioData.length} characters (base64)`);
      
      // Step 1: Transcribe audio with Whisper
      this.logger.log('📤 Step 1: Transcribing with OpenAI Whisper...');
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      // Create a file-like object for OpenAI API
      const audioFile = new File([audioBuffer], 'voice_note.mp4', { 
        type: 'audio/mp4' 
      });
      
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // You can make this configurable
        response_format: 'text',
      });
      
      this.logger.log('✅ Step 1 Complete: Audio transcribed with Whisper');
      this.logger.log(`📝 Transcribed Text: "${transcription.substring(0, 200)}..."`);
      this.logger.log(`📊 Transcription Length: ${transcription.length} characters`);
      
      // Step 2: Format with GPT-4 in one shot
      this.logger.log('📤 Step 2: Formatting with GPT-4...');
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const formattingPrompt = this.buildDirectProcessingPrompt(
        transcription,
        formatTemplate,
        formatInstruction,
        currentDate,
      );
      
      this.logger.log('🤖 Sending direct processing request to GPT-4...');
      this.logger.log(`📤 Prompt Length: ${formattingPrompt.length} characters`);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview', // Latest GPT-4 model
        messages: [
          {
            role: 'user',
            content: formattingPrompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent formatting
        max_tokens: 2000,
      });
      
      const formattedContent = completion.choices[0]?.message?.content;
      
      if (!formattedContent) {
        throw new BadRequestException('Failed to format content with GPT-4');
      }
      
      this.logger.log('✅ Step 2 Complete: Content formatted with GPT-4');
      this.logger.log(`📄 Formatted Content Preview: "${formattedContent.substring(0, 200)}..."`);
      this.logger.log(`📊 Final Content Length: ${formattedContent.length} characters`);
      this.logger.log('🎉 === DIRECT AUDIO PROCESSING COMPLETE ===');
      
      return formattedContent.trim();
      
    } catch (error) {
      this.logger.error('❌ Error in direct audio processing:', error);
      
      if (error.code === 'insufficient_quota') {
        this.logger.error('💳 OpenAI quota exceeded - check your billing');
        throw new BadRequestException('OpenAI quota exceeded. Please check your billing.');
      } else if (error.code === 'invalid_api_key') {
        this.logger.error('🔑 Invalid OpenAI API key');
        throw new BadRequestException('Invalid OpenAI API key configuration');
      } else if (error.status === 429) {
        this.logger.error('⏰ Rate limit exceeded - too many requests');
        throw new BadRequestException('Rate limit exceeded. Please try again in a moment.');
      }
      
      throw new BadRequestException('Failed to process audio directly with OpenAI');
    }
  }

  /**
   * For text content, we can still use GPT-4 directly
   */
  async processTextContent(
    content: string,
    formatTemplate: string,
    formatInstruction?: string,
  ): Promise<string> {
    try {
      this.logger.log('📝 Processing text content directly with GPT-4');
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      
      const formattingPrompt = this.buildDirectProcessingPrompt(
        content,
        formatTemplate,
        formatInstruction,
        currentDate,
      );
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'user',
            content: formattingPrompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });
      
      const formattedContent = completion.choices[0]?.message?.content;
      
      if (!formattedContent) {
        throw new BadRequestException('Failed to format text content with GPT-4');
      }
      
      this.logger.log('✅ Text content formatted successfully with GPT-4');
      return formattedContent.trim();
      
    } catch (error) {
      this.logger.error('Error processing text content with GPT-4:', error);
      throw new BadRequestException('Failed to process text content with AI');
    }
  }

  private buildDirectProcessingPrompt(
    content: string,
    formatTemplate: string,
    formatInstruction?: string,
    currentDate?: string,
  ): string {
    return `
You are an expert content formatter. You will receive either transcribed voice note content or text content that needs to be formatted according to a specific template.

**CRITICAL INSTRUCTIONS:**
1. **USE ONLY THE USER'S ACTUAL CONTENT** - Never use example content from the template
2. **EXTRACT key information** from the user's content
3. **ORGANIZE it** according to the template structure  
4. **REPLACE template placeholders** with real information from the user's content
5. **MAINTAIN the markdown formatting style** from the template
6. **USE today's date (${currentDate})** when the user mentions "today", "this morning", etc.

**CURRENT DATE:** ${currentDate}

**TEMPLATE STRUCTURE (style guide only - DO NOT use the content from this template):**
${formatTemplate}

**FORMATTING INSTRUCTIONS:**
${formatInstruction || 'Follow the template structure and format the content appropriately.'}

**USER'S ACTUAL CONTENT TO FORMAT:**
${content}

**EXAMPLES OF WHAT TO DO:**
- If user says "I had a meeting with John about the budget", format it as a meeting entry
- If user mentions "finished the report", add it to completed tasks
- If user says "need to call client tomorrow", add it to action items
- Use the template structure but fill it with the user's actual information

**EXAMPLES OF WHAT NOT TO DO:**
- Don't use template example content like "Reviewed the B2B app signup flow"
- Don't use placeholder text like "{date}" or "{attendees}"
- Don't make up information that wasn't mentioned by the user

**OUTPUT REQUIREMENTS:**
- Return ONLY the formatted content in markdown format
- No additional commentary or explanations
- Use the user's actual words and information
- Structure it according to the template format

Format the content now:
    `.trim();
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!this.openai) {
        this.logger.warn('OpenAI client not initialized - check API key configuration');
        return false;
      }

      // Test with a simple completion
      const testCompletion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // Use cheaper model for availability check
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5,
      });

      if (testCompletion.choices[0]?.message?.content) {
        this.logger.log('OpenAI service is available and responding');
        return true;
      }

      this.logger.warn('OpenAI service responded but with empty content');
      return false;
    } catch (error) {
      this.logger.error('OpenAI service availability check failed:', error);
      
      if (error.code === 'invalid_api_key') {
        this.logger.error('🔧 Authentication Issue:');
        this.logger.error('   • Please check your OPENAI_API_KEY environment variable');
        this.logger.error('   • Verify the API key is correct and active');
      } else if (error.code === 'insufficient_quota') {
        this.logger.error('🔧 Quota Issue:');
        this.logger.error('   • Your OpenAI account has exceeded its quota');
        this.logger.error('   • Please check your billing and usage limits');
      } else if (error.status === 429) {
        this.logger.error('🔧 Rate Limit Issue:');
        this.logger.error('   • Too many requests - try again in a moment');
      } else {
        this.logger.error('🔧 OpenAI API Error:');
        this.logger.error(`   • ${error.message}`);
      }
      
      return false;
    }
  }
}

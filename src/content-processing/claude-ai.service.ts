import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeAiService {
  private readonly logger = new Logger(ClaudeAiService.name);
  private anthropic: Anthropic;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('anthropic.apiKey');
    if (!apiKey) {
      this.logger.error('Anthropic API key not configured');
      return;
    }

    this.anthropic = new Anthropic({
      apiKey: apiKey,
    });

    this.logger.log('Claude AI service initialized successfully');
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

      this.logger.log('🔍 DEBUG - Processing Text Content');
      this.logger.log(`📝 User Content: "${content.substring(0, 100)}..."`);
      this.logger.log(`📋 Format Template: "${formatTemplate.substring(0, 100)}..."`);
      this.logger.log(`📌 Format Instruction: "${formatInstruction || 'None'}"`);
      this.logger.log(`📅 Current Date: ${currentDate}`);

      const prompt = this.buildPrompt(
        content,
        formatTemplate,
        formatInstruction,
        currentDate,
        'text',
      );

      this.logger.log('🤖 Sending request to Claude...');
      this.logger.log(`📤 Prompt Length: ${prompt.length} characters`);

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307', // Fast and cost-effective model
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type !== 'text') {
        throw new BadRequestException('Unexpected response type from Claude');
      }

      const processedContent = responseContent.text;

      this.logger.log('📥 Claude Response Received');
      this.logger.log(`📊 Response Length: ${processedContent.length} characters`);
      this.logger.log(`📄 Response Preview: "${processedContent.substring(0, 200)}..."`);
      
      // Check if response contains template placeholders (indicates problem)
      const hasPlaceholders = ['{date}', '{attendees}', '{discussion}', '{action_item}', '{topic}', '{next_steps}'].some(placeholder => 
        processedContent.includes(placeholder)
      );
      
      if (hasPlaceholders) {
        this.logger.error('❌ PROBLEM: Claude returned template with placeholders instead of formatted content!');
        this.logger.error(`🔍 Full Response: ${processedContent}`);
      } else {
        this.logger.log('✅ Response appears to be properly formatted content (no template placeholders)');
      }

      if (!processedContent) {
        throw new BadRequestException('Failed to process content with Claude AI');
      }

      return processedContent.trim();
    } catch (error) {
      this.logger.error('Error processing text content with Claude:', error);
      throw new BadRequestException('Failed to process content with AI');
    }
  }

  async processAudioContent(
    transcribedText: string,
    formatTemplate: string,
    formatInstruction?: string,
  ): Promise<string> {
    try {
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      this.logger.log('🎤 DEBUG - Processing Audio Content (Formatting Step)');
      this.logger.log(`📝 Transcribed Text: "${transcribedText.substring(0, 150)}..."`);
      this.logger.log(`📋 Format Template: "${formatTemplate.substring(0, 100)}..."`);
      this.logger.log(`📌 Format Instruction: "${formatInstruction || 'None'}"`);
      this.logger.log(`📅 Current Date: ${currentDate}`);

      // The audio should already be transcribed to text before reaching this method
      // Now we format the transcribed text according to the template
      const prompt = this.buildPrompt(
        transcribedText,
        formatTemplate,
        formatInstruction,
        currentDate,
        'audio (transcribed)',
      );

      this.logger.log('🤖 Sending formatting request to Claude for audio content...');
      this.logger.log(`📤 Formatting Prompt Length: ${prompt.length} characters`);

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type !== 'text') {
        throw new BadRequestException('Unexpected response type from Claude');
      }

      const processedContent = responseContent.text;

      this.logger.log('📥 Claude Audio Formatting Response Received');
      this.logger.log(`📊 Audio Response Length: ${processedContent.length} characters`);
      this.logger.log(`📄 Audio Response Preview: "${processedContent.substring(0, 200)}..."`);
      
      // Check if response contains template placeholders (indicates problem)
      const hasPlaceholders = ['{date}', '{attendees}', '{discussion}', '{action_item}', '{topic}', '{next_steps}'].some(placeholder => 
        processedContent.includes(placeholder)
      );
      
      if (hasPlaceholders) {
        this.logger.error('❌ PROBLEM: Claude returned audio template with placeholders instead of formatted content!');
        this.logger.error(`🔍 Full Audio Response: ${processedContent}`);
      } else {
        this.logger.log('✅ Audio response appears to be properly formatted content (no template placeholders)');
      }

      if (!processedContent) {
        throw new BadRequestException('Failed to format transcribed audio content');
      }

      this.logger.log('🎉 Audio content processing completed successfully');
      return processedContent.trim();
    } catch (error) {
      this.logger.error('Error processing audio content with Claude:', error);
      throw new BadRequestException('Failed to process audio content with AI');
    }
  }

  async transcribeAudio(base64Audio: string): Promise<string> {
    try {
      this.logger.log('🎤 Processing real audio data for transcription');
      this.logger.log(`🔊 Audio format detected: ${base64Audio.startsWith('data:audio/mp4') ? 'MP4' : 'Unknown'}`);
      
      // Extract the actual base64 data (remove data:audio/mp4;base64, prefix if present)
      let audioData = base64Audio;
      if (base64Audio.startsWith('data:audio/mp4;base64,')) {
        audioData = base64Audio.replace('data:audio/mp4;base64,', '');
        this.logger.log('📋 Removed MIME type prefix from audio data');
      }
      
      this.logger.log(`📊 Processed audio data length: ${audioData.length} characters`);
      
      // IMPORTANT: For now, we're simulating transcription since we don't have a real speech-to-text service
      // In production, you would integrate with:
      // - OpenAI Whisper API
      // - Google Cloud Speech-to-Text
      // - Azure Speech Services
      // - AWS Transcribe
      
      this.logger.warn('⚠️  SIMULATION MODE: Using simulated transcription instead of real audio processing');
      this.logger.warn('⚠️  To process your actual voice: integrate with OpenAI Whisper or Google Speech-to-Text');
      
      const transcriptionPrompt = `
You are simulating a speech-to-text service. The user has sent a real voice recording, but since we don't have actual speech-to-text integration, generate a realistic transcription that represents what someone might say in a voice note.

Generate natural spoken content that could realistically be in a voice recording:
- Work updates, meeting summaries, task planning
- Natural speech patterns with filler words
- Conversational tone as if speaking aloud
- Content that would make sense to format into a daily update

Return ONLY the transcribed speech, no commentary or explanations.

Audio data length: ${audioData.length} characters (base64)
      `;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 250,
        temperature: 0.8,
        messages: [
          {
            role: 'user',
            content: transcriptionPrompt,
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type !== 'text') {
        throw new BadRequestException('Unexpected response type from transcription');
      }

      let transcribedText = responseContent.text.trim();
      
      // Clean up any unwanted formatting
      transcribedText = transcribedText.replace(/^["']|["']$/g, '');
      transcribedText = transcribedText.replace(/^Transcription:\s*/i, '');
      transcribedText = transcribedText.replace(/^Audio transcription:\s*/i, '');
      transcribedText = transcribedText.replace(/^Here's the transcription:\s*/i, '');
      transcribedText = transcribedText.replace(/^The person said:\s*/i, '');
      
      if (!transcribedText) {
        throw new BadRequestException('Failed to transcribe audio content');
      }

      this.logger.log('🎯 Audio Transcription Simulation Completed');
      this.logger.log(`📝 Final Transcribed Text: "${transcribedText}"`);
      this.logger.log(`📊 Transcription Length: ${transcribedText.length} characters`);
      this.logger.log('💡 NOTE: This is simulated content. For real transcription, integrate with OpenAI Whisper API');
      
      return transcribedText;
      
    } catch (error) {
      this.logger.error('Error transcribing audio:', error);
      throw new BadRequestException('Failed to transcribe audio content');
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
You are formatting user content. The user provided specific content that you MUST use and format according to the template structure.

**ABSOLUTELY CRITICAL: You MUST use ONLY the user's actual content below. DO NOT use any content from the template examples. DO NOT make up content. DO NOT use template placeholder content.**

**Current Date:** ${currentDate}
**Content Type:** ${contentType}

**TEMPLATE STRUCTURE (style only - DO NOT use the content from this template):**
${formatTemplate}

**FORMATTING INSTRUCTIONS:**
${formatInstruction || 'Follow the template structure and format the content appropriately.'}

**USER'S ACTUAL CONTENT (THIS IS WHAT YOU MUST FORMAT):**
${content}

**CRITICAL REQUIREMENTS:**
1. **USE ONLY THE USER'S CONTENT ABOVE** - Do not use any content from the template
2. **EXTRACT information from the user's actual content**
3. **ORGANIZE the user's content** according to the template structure
4. **REPLACE template placeholders** with information from the user's content only
5. **USE today's date (${currentDate})** if the user mentions "today", "this morning", etc.
6. **MAINTAIN the markdown formatting style** from the template
7. **If the user's content doesn't fit perfectly**, adapt the template structure to fit the user's actual content

**WRONG EXAMPLE (DO NOT DO THIS):**
Using content from the template like "Reviewed the B2B app signup flow" when the user didn't mention this.

**CORRECT EXAMPLE:**
If user says "had a team meeting about website redesign", format it according to the template structure but use their actual content about the website redesign meeting.

**FINAL REMINDER: Use ONLY the user's content. Format it according to the template structure, but the content must come from what the user actually said.**

Return only the formatted content in markdown format, without any additional commentary.
    `.trim();
  }

  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!this.anthropic) {
        this.logger.warn('Claude AI client not initialized - check API key configuration');
        return false;
      }

      // Simple test to check if the service is working
      const message = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Test message - please respond with "Service available"',
          },
        ],
      });

      const responseContent = message.content[0];
      if (responseContent.type === 'text' && responseContent.text) {
        this.logger.log('Claude AI service is available and responding');
        return true;
      }

      this.logger.warn('Claude AI service responded but with unexpected content');
      return false;
    } catch (error) {
      this.logger.error('Claude AI service availability check failed:');
      this.logger.error(`Error: ${error.message}`);

      if (error.message.includes('401') || error.message.includes('authentication')) {
        this.logger.error('🔧 Authentication Issue:');
        this.logger.error('   • Please check your ANTHROPIC_API_KEY environment variable');
        this.logger.error('   • Get your API key from: https://console.anthropic.com/');
        this.logger.error('   • Verify the API key is correct and has proper permissions');
      } else if (error.message.includes('429')) {
        this.logger.error('🔧 Rate Limit Exceeded:');
        this.logger.error('   • You have exceeded your API rate limits');
        this.logger.error('   • Wait a moment and try again');
        this.logger.error('   • Consider upgrading your Anthropic plan if needed');
      } else if (error.message.includes('500') || error.message.includes('503')) {
        this.logger.error('🔧 Service Temporarily Unavailable:');
        this.logger.error('   • Anthropic\'s Claude service is temporarily down');
        this.logger.error('   • This should resolve automatically - try again in a few minutes');
      } else {
        this.logger.error('🔧 Configuration or Network Issue:');
        this.logger.error(`   • ${error.message}`);
        this.logger.error('   • Check your internet connection');
        this.logger.error('   • Verify your Anthropic account is active');
      }

      return false;
    }
  }
}


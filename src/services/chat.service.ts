import { GeminiClient } from '@/adapters/gemini.adapter';
import { TranslateAdapter } from '@/adapters/translate.adapter';
import { SpeechAdapter } from '@/adapters/speech.adapter';
import { createLoggingAdapter } from '@/adapters/logging.adapter';
import { ValidationError } from '@/utils/error-handler';

const logger = createLoggingAdapter();

/** Structured response from the AI chatbot, including the source attribution. */
export interface ChatResponse {
  message: string;
  language: string;
  source: 'gemini' | 'heuristic';
}

/** Multilingual AI chatbot service handling user queries via Gemini with translation support. */
export class ChatbotService {
  constructor(
    private readonly gemini: GeminiClient,
    private readonly translateAdapter: TranslateAdapter,
    private readonly speechAdapter: SpeechAdapter
  ) {}

  /**
   * Handles user queries regarding stadium info, tickets, etc.
   * @param userMessage - The message from the user
   * @param targetLanguage - Desired output language code (e.g., 'es')
   * @param isAudio - Whether the input was audio
   */
  async handleQuery(userMessage: string, targetLanguage: string = 'en', isAudio: boolean = false): Promise<ChatResponse> {
    if (!userMessage || typeof userMessage !== 'string' || userMessage.trim().length === 0) {
      throw new ValidationError('userMessage must be a non-empty string.');
    }

    try {
      let processableMessage = userMessage;
      
      if (isAudio) {
        const transcription = await this.speechAdapter.transcribeAudio(userMessage);
        processableMessage = transcription.transcript;
      }

      const prompt = `You are a helpful stadium assistant. Answer the user query clearly: ${processableMessage}`;
      const aiResponse = await this.gemini.generate({ prompt });
      
      if (!aiResponse.text) {
        throw new Error('Empty AI response');
      }

      let responseText = aiResponse.text;

      if (targetLanguage !== 'en') {
        const translation = await this.translateAdapter.translateText(responseText, targetLanguage);
        responseText = translation.translatedText;
      }

      return {
        message: responseText,
        language: targetLanguage,
        source: 'gemini'
      };
    } catch (error) {
      logger.error('Chatbot AI failed', { errorMessage: error instanceof Error ? error.message : String(error) });
      return {
        message: 'I am currently unable to process your request. Please check our FAQ page.',
        language: 'en',
        source: 'heuristic'
      };
    }
  }
}

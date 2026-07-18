import { GeminiClient } from '@/adapters/gemini.adapter';
import { TranslateAdapter } from '@/adapters/translate.adapter';
import { SpeechAdapter } from '@/adapters/speech.adapter';

export interface ChatResponse {
  message: string;
  language: string;
  source: 'gemini' | 'heuristic';
}

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
      console.error('Chatbot AI failed', error);
      return {
        message: 'I am currently unable to process your request. Please check our FAQ page.',
        language: 'en',
        source: 'heuristic'
      };
    }
  }
}

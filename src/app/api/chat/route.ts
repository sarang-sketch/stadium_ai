import { NextResponse } from 'next/server';
import { withApiHandler } from '@/middleware/api-handler';
import { ChatMessageSchema } from '@/lib/validators';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { createTranslateAdapter } from '@/adapters/translate.adapter';
import { createSpeechAdapter } from '@/adapters/speech.adapter';
import { ChatbotService } from '@/services/chat.service';

/**
 * POST /api/chat
 * Authenticated user. Answers a fan query via the ChatbotService (Gemini,
 * with translation/speech adapters). Returns the typed chat response
 * including the `source: 'gemini' | 'heuristic'` field.
 */
export const POST = withApiHandler(
  async (_req, ctx) => {
    const { message, targetLanguage, isAudio } = ctx.body;
    const service = new ChatbotService(
      createGeminiAdapter(),
      createTranslateAdapter(),
      createSpeechAdapter()
    );

    const response = await service.handleQuery(message, targetLanguage ?? 'en', isAudio ?? false);
    return NextResponse.json(response);
  },
  { schema: ChatMessageSchema, requireRole: 'user' }
);

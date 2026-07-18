import { describe, expect, it } from 'vitest';
import { ChatbotService } from '@/services/chat.service';
import { createGeminiAdapter } from '@/adapters/gemini.adapter';
import { createTranslateAdapter } from '@/adapters/translate.adapter';
import { createSpeechAdapter } from '@/adapters/speech.adapter';

describe('Chat Service — ChatbotService', () => {
  it('handles a basic user query successfully', async () => {
    const gemini = createGeminiAdapter();
    const translate = createTranslateAdapter();
    const speech = createSpeechAdapter();
    const svc = new ChatbotService(gemini, translate, speech);

    const res = await svc.handleQuery('Where is Gate 5?');

    expect(res.message).toBeDefined();
    expect(typeof res.message).toBe('string');
    expect(res.message.length).toBeGreaterThan(0);
    expect(res.language).toBe('en');
    expect(res.source).toBeDefined();
  });

  it('returns english by default when targetLanguage is en', async () => {
    const gemini = createGeminiAdapter();
    const translate = createTranslateAdapter();
    const speech = createSpeechAdapter();
    const svc = new ChatbotService(gemini, translate, speech);

    const res = await svc.handleQuery('What time does the match start?', 'en');

    expect(res.language).toBe('en');
  });

  it('handles translation requests with a non-English target language', async () => {
    const gemini = createGeminiAdapter();
    const translate = createTranslateAdapter();
    const speech = createSpeechAdapter();
    const svc = new ChatbotService(gemini, translate, speech);

    const res = await svc.handleQuery('Where are the restrooms?', 'es');

    expect(res.message).toBeDefined();
    // Language should be the requested target
    expect(res.language).toBe('es');
  });

  it('returns a valid source attribution field', async () => {
    const gemini = createGeminiAdapter();
    const translate = createTranslateAdapter();
    const speech = createSpeechAdapter();
    const svc = new ChatbotService(gemini, translate, speech);

    const res = await svc.handleQuery('Help me find my seat');

    expect(['gemini', 'heuristic']).toContain(res.source);
  });
});

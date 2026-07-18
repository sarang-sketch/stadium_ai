import { describe, expect, it } from 'vitest';
import { MockTranslateAdapter, createTranslateAdapter } from '@/adapters/translate.adapter';

describe('Translate Adapter', () => {
  it('should return valid result', async () => {
    const adapter = new MockTranslateAdapter();
    const res = await adapter.translateText('Hello', 'es');
    expect(res).toBeDefined();
    expect(res.translatedText).toBeTypeOf('string');
  });

  it('should tag with target language', async () => {
    const adapter = new MockTranslateAdapter();
    const res = await adapter.translateText('Hello', 'es');
    expect(res.targetLanguageCode).toBe('es');
  });

  it('should substitute words for known languages (es, fr)', async () => {
    const adapter = new MockTranslateAdapter();
    const resEs = await adapter.translateText('Hello', 'es');
    expect(resEs.translatedText).toContain('[es]');
    const resFr = await adapter.translateText('Hello', 'fr');
    expect(resFr.translatedText).toContain('[fr]');
  });

  it('should handle unknown languages gracefully', async () => {
    const adapter = new MockTranslateAdapter();
    const res = await adapter.translateText('Hello', 'xy');
    expect(res.translatedText).toBeTypeOf('string');
    expect(res.targetLanguageCode).toBe('xy');
  });

  it('createTranslateAdapter returns a working adapter', async () => {
    const adapter = createTranslateAdapter();
    const res = await adapter.translateText('Hello', 'es');
    expect(res.targetLanguageCode).toBe('es');
  });
});

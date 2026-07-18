import { describe, expect, it } from 'vitest';
import { MockSpeechAdapter, createSpeechAdapter } from '@/adapters/speech.adapter';

describe('Speech Adapter', () => {
  it('should return valid result for transcribeAudio', async () => {
    const adapter = new MockSpeechAdapter();
    const res = await adapter.transcribeAudio('test-audio-ref');
    expect(res).toBeDefined();
    expect(res.transcript).toBeTypeOf('string');
  });

  it('should default to en-US', async () => {
    const adapter = new MockSpeechAdapter();
    const res = await adapter.transcribeAudio('test-audio-ref');
    expect(res.languageCode).toBe('en-US');
  });

  it('should pass through custom language code', async () => {
    const adapter = new MockSpeechAdapter();
    const res = await adapter.transcribeAudio('test-audio-ref', 'fr-FR');
    expect(res.languageCode).toBe('fr-FR');
  });

  it('should have deterministic behavior', async () => {
    const adapter = new MockSpeechAdapter();
    const res1 = await adapter.transcribeAudio('audio-clip-42');
    const res2 = await adapter.transcribeAudio('audio-clip-42');
    expect(res1.transcript).toBe(res2.transcript);
  });

  it('createSpeechAdapter returns a working adapter', async () => {
    const adapter = createSpeechAdapter();
    const res = await adapter.transcribeAudio('test-audio-ref');
    expect(res.transcript).toBeTypeOf('string');
  });
});

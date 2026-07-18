import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { GeminiAdapter, createGeminiAdapter } from '@/adapters/gemini.adapter';

/**
 * Basic unit tests for the mock fallback path of GeminiAdapter. Full
 * property-based coverage of the fallback-totality contract (Property 38)
 * is implemented separately as an optional task.
 */
describe('GeminiAdapter', () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
    vi.restoreAllMocks();
  });

  it('returns a mock response labeled source "mock" when no API key is configured', async () => {
    const adapter = new GeminiAdapter();
    const result = await adapter.generate({ prompt: 'hello world' });
    expect(result.source).toBe('mock');
    expect(result.text.length).toBeGreaterThan(0);
  });

  it('is deterministic: the same prompt yields the same mock response', async () => {
    const adapter = new GeminiAdapter();
    const first = await adapter.generate({ prompt: 'predict match outcome', context: { a: 1 } });
    const second = await adapter.generate({ prompt: 'predict match outcome', context: { a: 1 } });
    expect(first.text).toBe(second.text);
  });

  it('produces different mock text for different prompts', async () => {
    const adapter = new GeminiAdapter();
    const first = await adapter.generate({ prompt: 'prompt A' });
    const second = await adapter.generate({ prompt: 'prompt B' });
    expect(first.text).not.toBe(second.text);
  });

  it('never throws even if constructed with a bogus API key that will fail the real call', async () => {
    const adapter = new GeminiAdapter({ apiKey: 'invalid-test-key', timeoutMs: 500 });
    await expect(adapter.generate({ prompt: 'hi' })).resolves.toMatchObject({ source: 'mock' });
  });

  it('createGeminiAdapter factory returns a working GeminiClient', async () => {
    const adapter = createGeminiAdapter();
    const result = await adapter.generate({ prompt: 'factory test' });
    expect(result.source).toBe('mock');
  });
});

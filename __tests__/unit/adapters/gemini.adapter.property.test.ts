import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { GeminiAdapter } from '@/adapters/gemini.adapter';

// Feature: smart-stadium-tournament-ops, Property 38: GeminiAdapter fallback behavior is total and never throws

/**
 * The "configured client throws/rejects" case is exercised by mocking the
 * underlying `@google/generative-ai` SDK to always reject, rather than
 * making real outbound network calls with a bogus key on every property
 * iteration. This keeps the test fast, deterministic, and avoids sending
 * live requests to a third-party API from the test suite.
 */
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: class {
    getGenerativeModel() {
      return {
        generateContent: () => Promise.reject(new Error('simulated Gemini API failure')),
      };
    }
  },
}));

/**
 * Arbitrary for a JSON-serializable context object: a record of string keys
 * to primitive values (string | number | boolean | null). Keeps the
 * generated context compatible with `JSON.stringify` inside the adapter's
 * mock hashing path.
 */
const primitiveArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.double({ noNaN: true }),
  fc.boolean(),
  fc.constant(null)
);

const contextArb = fc.dictionary(fc.string(), primitiveArb);

const promptArb = fc.string();

describe('GeminiAdapter fallback totality (Property 38)', () => {
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
  });

  it('always resolves with source "mock" when no API key is configured, for any prompt/context', async () => {
    await fc.assert(
      fc.asyncProperty(promptArb, contextArb, async (prompt, context) => {
        const adapter = new GeminiAdapter();
        const result = await adapter.generate({ prompt, context });
        expect(result.source).toBe('mock');
        expect(typeof result.text).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('never rejects/throws when no API key is configured, for any prompt/context', async () => {
    await fc.assert(
      fc.asyncProperty(promptArb, contextArb, async (prompt, context) => {
        const adapter = new GeminiAdapter();
        await expect(adapter.generate({ prompt, context })).resolves.toBeDefined();
      }),
      { numRuns: 100 }
    );
  });

  it('always resolves with source "mock" when the configured client fails, for any prompt/context', async () => {
    await fc.assert(
      fc.asyncProperty(promptArb, contextArb, async (prompt, context) => {
        // An API key is configured, but the mocked SDK above always rejects,
        // forcing the fallback path documented in Requirement 20.3.
        const adapter = new GeminiAdapter({ apiKey: 'configured-test-key', timeoutMs: 50 });
        const result = await adapter.generate({ prompt, context });
        expect(result.source).toBe('mock');
        expect(typeof result.text).toBe('string');
      }),
      { numRuns: 100 }
    );
  });

  it('never rejects/throws when the configured client fails, for any prompt/context', async () => {
    await fc.assert(
      fc.asyncProperty(promptArb, contextArb, async (prompt, context) => {
        const adapter = new GeminiAdapter({ apiKey: 'configured-test-key', timeoutMs: 50 });
        await expect(adapter.generate({ prompt, context })).resolves.toBeDefined();
      }),
      { numRuns: 100 }
    );
  });
});

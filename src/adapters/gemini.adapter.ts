/**
 * Gemini AI adapter — the flagship reasoning integration point.
 *
 * Unlike the other adapters in this directory (`maps.adapter.ts`,
 * `vision.adapter.ts`, etc.), which stand in for Google Cloud services that
 * cannot be credentialed in this environment and are *always* mock, this
 * adapter is designed to really call the Gemini API when a key is present.
 * It only falls back to a deterministic mock when no key is configured, or
 * when the real call fails/times out.
 *
 * Dual-path behavior (Requirement 20, Property 38):
 * - WHERE `GEMINI_API_KEY` is present in the runtime environment, calls the
 *   real Gemini API via the `@google/generative-ai` SDK and returns its
 *   response, labeled `source: "gemini"` (Requirement 20.1).
 * - WHERE no `GEMINI_API_KEY` is present, skips the real call entirely and
 *   returns a deterministic mock response derived from a seeded hash of the
 *   prompt, labeled `source: "mock"` (Requirement 20.2).
 * - IF the real API call throws or exceeds the configured timeout, the
 *   failure is caught and the same deterministic mock path is used as a
 *   fallback rather than propagating an unhandled error to the caller
 *   (Requirement 20.3).
 *
 * `generate()` is therefore total: it never throws and never returns a
 * rejected promise for the caller to handle, regardless of API key
 * presence, network failures, or timeouts. Every flagship/AI service
 * (`PricingEngine`, `FraudDetectionService`, `MatchPredictionService`,
 * `ChatbotService`, ...) can call it unconditionally and layer its own
 * heuristic fallback on top of the `source` field.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

/** A request to the Gemini reasoning engine. */
export interface GeminiRequest {
  /** The fully-built prompt text to send to the model. */
  prompt: string;
  /** Optional structured context merged into the prompt by callers that need it. */
  context?: Record<string, unknown>;
}

/** The result of a `GeminiClient.generate` call. */
export interface GeminiResponse {
  /** The generated text — either the real model output or the mock fallback text. */
  text: string;
  /**
   * Whether this response came from the real Gemini API (`"gemini"`) or the
   * deterministic mock fallback (`"mock"`). Callers use this to decide
   * whether to trust the response as-is or additionally apply/label a
   * heuristic result (Requirements 7.2, 8.2, 12.2, 13.2).
   */
  source: "gemini" | "mock";
}

/** The interface every Gemini-backed feature service depends on. */
export interface GeminiClient {
  generate(req: GeminiRequest): Promise<GeminiResponse>;
}

/** Maximum time (ms) to wait for the real Gemini API before falling back to the mock path. */
const DEFAULT_TIMEOUT_MS = 10_000;

/** The Gemini model used for real API calls: fast and cost-effective for this workload. */
const DEFAULT_MODEL = "gemini-2.0-flash";

export interface GeminiAdapterOptions {
  /** Overrides `process.env.GEMINI_API_KEY` — primarily for testing. */
  apiKey?: string;
  /** Overrides the default model name. */
  model?: string;
  /** Overrides the default real-API-call timeout, in milliseconds. */
  timeoutMs?: number;
}

/**
 * `GeminiAdapter` implements `GeminiClient` with the real/mock dual path
 * described above. See the module doc comment for the full behavioral
 * contract.
 */
export class GeminiAdapter implements GeminiClient {
  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: GeminiAdapterOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY ?? undefined;
    this.model = options.model ?? DEFAULT_MODEL;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async generate(req: GeminiRequest): Promise<GeminiResponse> {
    if (!this.apiKey) {
      // Requirement 20.2: no key configured — go straight to the mock path.
      return this.mockResponse(req);
    }

    try {
      const text = await this.callRealApi(req, this.apiKey);
      return { text, source: "gemini" };
    } catch {
      // Requirement 20.3: any failure (network error, API error, timeout)
      // falls through to the same deterministic mock — never throw.
      return this.mockResponse(req);
    }
  }

  private async callRealApi(req: GeminiRequest, apiKey: string): Promise<string> {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({ model: this.model });

    const prompt = req.context
      ? `${req.prompt}\n\nContext:\n${JSON.stringify(req.context)}`
      : req.prompt;

    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error("Gemini API call timed out")), this.timeoutMs);
      // Timers should not keep the process alive in test/serverless runs.
      if (typeof timer.unref === "function") timer.unref();
    });

    const call = model.generateContent(prompt).then((result) => result.response.text());

    try {
      return await Promise.race([call, timeout]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  /**
   * Deterministic mock response, derived from a seeded hash of the prompt
   * (and context, if present) so that the same request always yields the
   * same mock text — important for testing (Requirement 20.2).
   */
  private mockResponse(req: GeminiRequest): GeminiResponse {
    const seedInput = req.context ? `${req.prompt}::${JSON.stringify(req.context)}` : req.prompt;
    const hash = seededHash(seedInput);
    return {
      text: `[mock-gemini:${hash}] ${req.prompt.slice(0, 120)}`,
      source: "mock",
    };
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed mock responses. Not cryptographic — only needed for stable,
 * reproducible test fixtures.
 */
function seededHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Factory for `GeminiAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createMapsAdapter`).
 */
export function createGeminiAdapter(options?: GeminiAdapterOptions): GeminiClient {
  return new GeminiAdapter(options);
}

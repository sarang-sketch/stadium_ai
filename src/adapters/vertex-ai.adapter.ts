/**
 * Google Cloud Vertex AI adapter — an alternate, swappable reasoning
 * backend to `GeminiAdapter` (`src/adapters/gemini.adapter.ts`).
 *
 * Vertex AI is one of the Google Cloud services that cannot be
 * credentialed in this environment (Requirement 19), so unlike
 * `GeminiAdapter` — which has a real API-calling path guarded by
 * `GEMINI_API_KEY` and only falls back to a mock when no key is present or
 * the real call fails — `VertexAiAdapter` has **no real path at all**.
 * `createVertexAiAdapter()` always returns `MockVertexAiAdapter`, which
 * never makes a network call and always synthesizes a deterministic
 * response derived from a seeded hash of the prompt (Requirement 19.2),
 * mirroring the mock branch of `GeminiAdapter.generate` but clearly
 * labeled as Vertex AI's own mock rather than Gemini's.
 *
 * Structural compatibility with `GeminiClient` (Requirement 19.1, design
 * "External Google Cloud Adapters"): `VertexAiAdapter.generate` accepts the
 * same `GeminiRequest` shape (`{ prompt, context? }`) and resolves to a
 * `VertexAiResponse`, which is a strict superset of `GeminiResponse` (same
 * `text`/`source` fields, plus an optional `vertexOrigin` marker used for
 * logging/telemetry to distinguish a Vertex-AI-originated response from a
 * Gemini one). Because `VertexAiResponse` is assignable everywhere a
 * `GeminiResponse` is expected, `VertexAiAdapter` is assignable everywhere
 * a `GeminiClient` is expected — any service currently depending on
 * `GeminiClient` (e.g. `PricingEngine`, `FraudDetectionService`,
 * `MatchPredictionService`, `ChatbotService`) could swap its dependency to
 * `VertexAiAdapter` (or a `VertexAiClient`-typed field constructed via
 * `createVertexAiAdapter()`) without any change to calling code.
 *
 * To go live: implement `VertexAiAdapter` using a credentialed
 * `@google-cloud/vertexai` client — initialize `VertexAI` with a GCP
 * project ID and location, obtain a generative model via
 * `vertexAi.getGenerativeModel({ model: "..." })`, call
 * `generateContent(req.prompt)` (merging `req.context` into the prompt the
 * same way `GeminiAdapter` does), and map the response's generated text
 * into `{ text, source: "gemini" }` (reusing the `GeminiResponse` "gemini"
 * literal is intentional — from the caller's point of view this is just
 * another real reasoning backend), catching any error/timeout and falling
 * through to `MockVertexAiAdapter`'s deterministic path exactly as
 * `GeminiAdapter` does for Gemini.
 */

import type { GeminiRequest, GeminiResponse } from "./gemini.adapter";

/** Re-exported for callers that want a Vertex-AI-specific request alias; structurally identical to `GeminiRequest`. */
export type VertexAiRequest = GeminiRequest;

/**
 * The result of a `VertexAiAdapter.generate` call. A strict superset of
 * `GeminiResponse` — every `VertexAiResponse` is a valid `GeminiResponse`,
 * which is what makes `VertexAiAdapter` structurally swappable with
 * `GeminiClient` (see module doc comment).
 */
export interface VertexAiResponse extends GeminiResponse {
  /**
   * Internal marker distinguishing this response as Vertex-AI-originated,
   * for logging/telemetry only. Optional so that `VertexAiResponse` stays
   * assignable to plain `GeminiResponse`-typed call sites.
   */
  vertexOrigin?: true;
}

/**
 * The interface every Vertex-AI-backed feature service would depend on.
 * Shaped identically to `GeminiClient` (`generate(req): Promise<response>`)
 * so it can be used as a drop-in alternate reasoning backend.
 */
export interface VertexAiAdapter {
  generate(req: VertexAiRequest): Promise<VertexAiResponse>;
}

/**
 * MOCK IMPLEMENTATION — always synthesizes a deterministic response and
 * never calls any external API. See the module doc comment above for how
 * this differs from `GeminiAdapter` (which has a real path) and for the
 * swap-in steps to a real `@google-cloud/vertexai` client.
 */
export class MockVertexAiAdapter implements VertexAiAdapter {
  async generate(req: VertexAiRequest): Promise<VertexAiResponse> {
    const seedInput = req.context ? `${req.prompt}::${JSON.stringify(req.context)}` : req.prompt;
    const hash = seededHash(seedInput);

    return {
      text: `[mock-vertex-ai:${hash}] ${req.prompt.slice(0, 120)}`,
      source: "mock",
      vertexOrigin: true,
    };
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed mock responses. Not cryptographic — only needed for stable,
 * reproducible mock output across calls with the same prompt/context.
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
 * Factory for `VertexAiAdapter`, consistent with the factory pattern used
 * by every other adapter in this directory (e.g. `createTranslateAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createVertexAiAdapter(): VertexAiAdapter {
  return new MockVertexAiAdapter();
}

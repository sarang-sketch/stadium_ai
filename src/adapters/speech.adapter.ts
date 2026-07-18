/**
 * Google Cloud Speech-to-Text adapter — stands in for the Speech-to-Text
 * API's audio transcription features, which cannot be credentialed in this
 * environment (Requirement 19). Used as a chatbot voice-input stub: when a
 * fan speaks to the chatbot instead of typing, this adapter transcribes the
 * captured audio into text for `ChatbotService` to process.
 *
 * Like `maps.adapter.ts` and `vision.adapter.ts`, this adapter is *always*
 * mock: `MockSpeechAdapter` never makes a network call. It deterministically
 * synthesizes a plausible stadium/ticketing-related transcription and
 * confidence score from the requested `audioRef` (and optional
 * `languageCode`) so that the same inputs always produce the same output,
 * keeping callers and tests reproducible (Requirements 19.2, 19.3).
 *
 * To go live: implement `SpeechAdapter` using a credentialed Google Cloud
 * Speech-to-Text client (e.g. `@google-cloud/speech`), issuing a real
 * `recognize`/`streamingRecognize` request against the audio bytes referenced
 * by `audioRef` (with `languageCode` forwarded as the API's language hint)
 * and mapping the API response's top alternative transcript and confidence
 * into this adapter's `SpeechTranscriptionResult` shape — no changes are
 * required in `ChatbotService` or any other caller, since they depend only
 * on the `SpeechAdapter` interface (Requirement 19.4).
 */

/**
 * Result of transcribing a single audio clip, as returned by
 * `SpeechAdapter.transcribeAudio`. Standing in for what a real Speech-to-Text
 * API call would return for chatbot voice input.
 */
export interface SpeechTranscriptionResult {
  /** Transcribed text recognized from the referenced audio. */
  transcript: string;
  /** Confidence score for the transcription, 0-1. */
  confidence: number;
  /** BCP-47 language code the transcription was produced for. */
  languageCode: string;
}

/** The interface a voice-enabled `ChatbotService` would depend on. */
export interface SpeechAdapter {
  /**
   * Returns a transcription result for the audio referenced by `audioRef`.
   * Implementations are not responsible for resolving `audioRef` to actual
   * audio bytes — that is handled by the caller (e.g. `ChatbotService`).
   * `languageCode` is an optional BCP-47 hint (e.g. `"en-US"`); when omitted,
   * implementations default to `"en-US"`.
   */
  transcribeAudio(audioRef: string, languageCode?: string): Promise<SpeechTranscriptionResult>;
}

/** Default BCP-47 language code used when the caller supplies none. */
const DEFAULT_LANGUAGE_CODE = "en-US";

/** Plausible stadium/ticketing-related phrases a fan might speak to the chatbot. */
const SAMPLE_PHRASES = [
  "What time does the gate open for tonight's match",
  "Can you show me my tickets for this weekend",
  "I'd like to find the best available seats under fifty dollars",
  "Where is the nearest exit from my section",
  "Is my team registration still pending approval",
  "How long is the wait at the concession stand right now",
  "What is the current price for section A seats",
  "Can you help me book two seats together",
] as const;

/**
 * MOCK IMPLEMENTATION — returns realistic synthetic transcription data. Does
 * not call any external API. See the module doc comment above for the
 * swap-in path to a real Google Cloud Speech-to-Text client.
 */
export class MockSpeechAdapter implements SpeechAdapter {
  async transcribeAudio(
    audioRef: string,
    languageCode: string = DEFAULT_LANGUAGE_CODE
  ): Promise<SpeechTranscriptionResult> {
    const hash = seededHash(`${audioRef}::${languageCode}`);
    const seed = parseInt(hash.slice(0, 8), 16);

    const transcript = SAMPLE_PHRASES[seed % SAMPLE_PHRASES.length];

    // Confidence is derived from a different slice of the hash and kept in
    // a realistic 0.70-0.99 band, mirroring vision.adapter.ts's approach.
    const confidenceSeed = parseInt(hash.slice(4, 8), 16);
    const confidence = Math.round((0.7 + (confidenceSeed % 30) / 100) * 100) / 100;

    return { transcript, confidence, languageCode };
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed synthetic transcription data. Not cryptographic — only needed for
 * stable, reproducible mock output across calls with the same audioRef.
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
 * Factory for `SpeechAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createVisionAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createSpeechAdapter(): SpeechAdapter {
  return new MockSpeechAdapter();
}

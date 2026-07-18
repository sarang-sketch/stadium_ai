/**
 * Google Cloud Translate adapter — stands in for the Cloud Translation
 * API, which cannot be credentialed in this environment (Requirement 19).
 * Used as a chatbot i18n stub: when a fan's chatbot message needs to be
 * shown in (or interpreted from) a non-default language, this adapter
 * translates the text for `ChatbotService` to process.
 *
 * Like `maps.adapter.ts`, `vision.adapter.ts`, and `speech.adapter.ts`,
 * this adapter is *always* mock: `MockTranslateAdapter` never makes a
 * network call, and it cannot actually translate arbitrary text. Instead
 * it deterministically synthesizes a clearly-synthetic "translated" result
 * from the requested `text`/`targetLanguageCode` pair — substituting a
 * small dictionary of common words where possible and tagging the rest
 * with the target language code — so that the same inputs always produce
 * the same output, keeping callers and tests reproducible (Requirements
 * 19.2, 19.3). The realistic requirement here is shape, not translation
 * fidelity: every result carries a translated text, a detected source
 * language, and the target language.
 *
 * To go live: implement `TranslateAdapter` using a credentialed Google
 * Cloud Translate client (e.g. `@google-cloud/translate`), issuing a real
 * `translateText` request against the input `text` (with `targetLanguageCode`
 * forwarded as the API's target language) and mapping the API response's
 * translated text and detected source language code into this adapter's
 * `TranslationResult` shape — no changes are required in `ChatbotService`
 * or any other caller, since they depend only on the `TranslateAdapter`
 * interface (Requirement 19.4).
 */

/**
 * Result of translating a single piece of text, as returned by
 * `TranslateAdapter.translateText`. Standing in for what a real Cloud
 * Translation API call would return for chatbot i18n.
 */
export interface TranslationResult {
  /** Translated text, in the requested target language. */
  translatedText: string;
  /** BCP-47 language code detected for the input `text`. */
  detectedSourceLanguageCode: string;
  /** BCP-47 language code the text was translated into. */
  targetLanguageCode: string;
}

/** The interface a translation-enabled `ChatbotService` would depend on. */
export interface TranslateAdapter {
  /**
   * Returns a translation of `text` into `targetLanguageCode` (a BCP-47
   * language code, e.g. `"es"` or `"fr"`). Implementations are responsible
   * for detecting the source language of `text` themselves — callers are
   * not expected to supply it.
   */
  translateText(text: string, targetLanguageCode: string): Promise<TranslationResult>;
}

/** Default BCP-47 language code assumed for input text's detected source. */
const DEFAULT_SOURCE_LANGUAGE_CODE = "en";

/**
 * Small canned phrase-substitution dictionary for a few common English
 * words, keyed by target language code. Used to make the mock's output
 * look more like a real (if partial) translation rather than a raw tag.
 * Not exhaustive by design — this is a mock, not a translation engine.
 */
const PHRASE_SUBSTITUTIONS: Record<string, Record<string, string>> = {
  es: { hello: "hola", ticket: "boleto", seat: "asiento", gate: "puerta", team: "equipo" },
  fr: { hello: "bonjour", ticket: "billet", seat: "siège", gate: "porte", team: "équipe" },
  de: { hello: "hallo", ticket: "ticket", seat: "sitzplatz", gate: "tor", team: "mannschaft" },
  pt: { hello: "olá", ticket: "bilhete", seat: "assento", gate: "portão", team: "equipe" },
};

/**
 * MOCK IMPLEMENTATION — returns a realistic, structurally valid synthetic
 * translation result. Does not call any external API and does not perform
 * real translation. See the module doc comment above for the swap-in path
 * to a real Google Cloud Translate client.
 */
export class MockTranslateAdapter implements TranslateAdapter {
  async translateText(text: string, targetLanguageCode: string): Promise<TranslationResult> {
    const hash = seededHash(`${text}::${targetLanguageCode}`);

    const translatedText = this.buildTranslatedText(text, targetLanguageCode);
    const detectedSourceLanguageCode = this.detectSourceLanguageCode(text, hash);

    return {
      translatedText,
      detectedSourceLanguageCode,
      targetLanguageCode,
    };
  }

  /**
   * Builds a clearly-synthetic "translated" string: substitutes any known
   * dictionary words for the target language (case-insensitively, whole
   * words only) and tags the result with the target language code, e.g.
   * `[es] hola, can I see my boleto`.
   */
  private buildTranslatedText(text: string, targetLanguageCode: string): string {
    const dictionary = PHRASE_SUBSTITUTIONS[targetLanguageCode.toLowerCase()];

    const substituted = dictionary
      ? text.replace(/[A-Za-z]+/g, (word) => dictionary[word.toLowerCase()] ?? word)
      : text;

    return `[${targetLanguageCode}] ${substituted}`;
  }

  /**
   * Deterministically picks a plausible detected source language for
   * `text` from the hash, defaulting to English — mirroring how a real
   * detector would usually resolve short chatbot messages to `"en"` but
   * occasionally detect another language.
   */
  private detectSourceLanguageCode(text: string, hash: string): string {
    if (text.trim().length === 0) {
      return DEFAULT_SOURCE_LANGUAGE_CODE;
    }

    const seed = parseInt(hash.slice(0, 8), 16);
    // Bias heavily toward English (the expected default for this platform's
    // chatbot), only occasionally surfacing a different detected language.
    if (seed % 10 !== 0) {
      return DEFAULT_SOURCE_LANGUAGE_CODE;
    }

    const otherLanguages = ["es", "fr", "de", "pt"];
    return otherLanguages[seed % otherLanguages.length];
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed synthetic translation data. Not cryptographic — only needed for
 * stable, reproducible mock output across calls with the same text/target
 * language pair.
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
 * Factory for `TranslateAdapter`, consistent with the factory pattern used
 * by every other adapter in this directory (e.g. `createSpeechAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createTranslateAdapter(): TranslateAdapter {
  return new MockTranslateAdapter();
}

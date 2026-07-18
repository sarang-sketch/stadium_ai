/**
 * Secret Manager adapter — stands in for the credential/secret loader that
 * would otherwise back onto Google Cloud Secret Manager to fetch the
 * `GEMINI_API_KEY` used by `src/adapters/gemini.adapter.ts` and the Firebase
 * Admin service account credentials used by `src/lib/firebase/admin.ts`.
 * Secret Manager cannot be credentialed in this environment (Requirement
 * 19), so like `bigquery.adapter.ts`, `maps.adapter.ts`, `vision.adapter.ts`,
 * `speech.adapter.ts`, `translate.adapter.ts`, `cloud-scheduler.adapter.ts`,
 * `tasks.adapter.ts`, and `logging.adapter.ts`, this adapter is *always*
 * mock: `MockSecretsAdapter` never issues a network call to a real Secret
 * Manager vault.
 *
 * Unlike most other mock adapters in this directory, `MockSecretsAdapter`
 * isn't only structurally-valid sample data — a working local/dev secret
 * loader is actually useful during development, so it reads real values
 * from `process.env`: `getSecret(secretName)` returns
 * `process.env[secretName]` if the variable is set and non-empty, or `null`
 * otherwise. This mirrors the calling convention of a real Secret Manager
 * client closely enough that call sites (e.g. `GeminiAdapter` resolving
 * `GEMINI_API_KEY`, or Firebase Admin init resolving a service account JSON
 * blob) do not need to change when this adapter is swapped for a real one
 * (Requirement 19.4).
 *
 * To go live: implement `SecretsAdapter` using a credentialed
 * `@google-cloud/secret-manager` client — initialize a
 * `SecretManagerServiceClient` with a GCP project ID and a service account
 * credential, and in `getSecret(secretName)` call
 * `client.accessSecretVersion({ name: `projects/${projectId}/secrets/${secretName}/versions/latest` })`,
 * decode the returned `payload.data` buffer to a UTF-8 string, and return it
 * (or `null` if the secret version does not exist / access is denied) — no
 * changes are required in any caller, since they depend only on the
 * `SecretsAdapter` interface. This is the swap-in point for loading
 * `GEMINI_API_KEY` and the Firebase Admin service account JSON at runtime
 * instead of reading them from plain environment variables.
 */

/** The interface callers depend on for Secret Manager-backed secret retrieval. */
export interface SecretsAdapter {
  /**
   * Resolves the secret named `secretName` (e.g. `"GEMINI_API_KEY"` or
   * `"FIREBASE_ADMIN_CREDENTIALS"`), returning its value, or `null` if no
   * value is configured.
   */
  getSecret(secretName: string): Promise<string | null>;
}

/**
 * MOCK IMPLEMENTATION — reads secret values from `process.env` instead of a
 * real Secret Manager vault. See the module doc comment above for the
 * swap-in steps to a real `@google-cloud/secret-manager` client.
 */
export class MockSecretsAdapter implements SecretsAdapter {
  async getSecret(secretName: string): Promise<string | null> {
    const value = process.env[secretName];
    return value && value.length > 0 ? value : null;
  }
}

/**
 * Factory for `SecretsAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createLoggingAdapter`).
 * Always returns the env-var-backed mock — there is no real-API path for
 * this adapter in this environment.
 */
export function createSecretsAdapter(): SecretsAdapter {
  return new MockSecretsAdapter();
}

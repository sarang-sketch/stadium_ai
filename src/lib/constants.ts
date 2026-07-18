/**
 * Application-wide constants for the StadiumAI platform.
 *
 * Centralizes magic numbers, configuration defaults, and shared string
 * literals so they can be referenced from services, middleware, and UI
 * components without duplication.
 */

/** Default page size for paginated API responses. */
export const DEFAULT_PAGE_SIZE = 20;

/** Maximum page size a client may request. */
export const MAX_PAGE_SIZE = 100;

/** Minimum page number (pages are 1-indexed). */
export const MIN_PAGE = 1;

/** Rate limiter: default window duration in milliseconds (1 minute). */
export const RATE_LIMIT_WINDOW_MS = 60_000;

/** Rate limiter: default maximum requests per window per IP. */
export const RATE_LIMIT_MAX_REQUESTS = 100;

/** Fraud detection: risk score threshold above which a ticket is auto-flagged. */
export const FRAUD_FLAGGING_THRESHOLD = 60;

/** Reservation timeout: seconds before an unredeemed seat reservation expires. */
export const RESERVATION_TIMEOUT_SECONDS = 600;

/** Supported BCP-47 language codes for the translation adapter. */
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt"] as const;

/** Default language code used when none is specified. */
export const DEFAULT_LANGUAGE = "en" as const;

/** Seat categories available across the platform. */
export const SEAT_CATEGORIES = ["vip", "premium", "general", "student"] as const;

/** Application name used in UI headers and metadata. */
export const APP_NAME = "StadiumAI";

/** Application tagline for marketing/hero sections. */
export const APP_TAGLINE = "Smart Stadiums & Tournament Operations";

/**
 * Google Cloud services integrated into the platform, with their current
 * integration status. Used by the README and landing page.
 */
export const GCP_SERVICES = [
  { name: "Gemini AI", adapter: "gemini.adapter.ts", status: "Live (with mock fallback)" },
  { name: "Firebase Auth", adapter: "lib/firebase/auth.ts", status: "Live" },
  { name: "Cloud Firestore", adapter: "lib/firebase/config.ts", status: "Live" },
  { name: "Google Maps", adapter: "maps.adapter.ts", status: "Mock" },
  { name: "Cloud Vision", adapter: "vision.adapter.ts", status: "Mock" },
  { name: "Speech-to-Text", adapter: "speech.adapter.ts", status: "Mock" },
  { name: "Cloud Translate", adapter: "translate.adapter.ts", status: "Mock" },
  { name: "BigQuery", adapter: "bigquery.adapter.ts", status: "Mock" },
  { name: "Vertex AI", adapter: "vertex-ai.adapter.ts", status: "Mock" },
  { name: "Cloud Tasks", adapter: "tasks.adapter.ts", status: "Mock" },
  { name: "Cloud Scheduler", adapter: "cloud-scheduler.adapter.ts", status: "Mock" },
  { name: "Cloud Logging", adapter: "logging.adapter.ts", status: "Mock (console)" },
  { name: "Secret Manager", adapter: "secrets.adapter.ts", status: "Mock (env vars)" },
] as const;

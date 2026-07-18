/**
 * Google Cloud Logging adapter — stands in for the structured log sink used
 * by the shared API handler (`src/middleware/api-handler.ts`) to record
 * unhandled 500s, and by every external adapter's call site to record a
 * caught failure before falling back to its documented mock/heuristic path
 * (Error Handling: "logging the failure via the (mocked) Cloud Logging
 * adapter"). Cloud Logging cannot be credentialed in this environment
 * (Requirement 19), so like `bigquery.adapter.ts`, `maps.adapter.ts`,
 * `vision.adapter.ts`, `speech.adapter.ts`, `translate.adapter.ts`,
 * `cloud-scheduler.adapter.ts`, and `tasks.adapter.ts`, this adapter is
 * *always* mock: `MockLoggingAdapter` never issues a network call or writes
 * to a real Cloud Logging sink.
 *
 * Unlike the other mock adapters in this directory, `MockLoggingAdapter`
 * isn't only structurally-valid sample data — a working local-dev logger is
 * actually useful during development, so it writes real structured JSON log
 * lines to the console: `severity`, `WARNING`/`ERROR`/`CRITICAL` go to
 * `console.error` (so they surface on stderr / are visible in most log
 * aggregators' "error" views), everything else goes to `console.log`. Each
 * line is a single JSON object shaped `{ severity, message, timestamp,
 * ...metadata }`, which mirrors the structured-payload shape Cloud
 * Logging's `entry.jsonPayload` expects, so no call sites need to change
 * when this adapter is swapped for a real one (Requirement 19.4).
 *
 * Logging methods are synchronous (`log`/`debug`/`info`/`warn`/`error`
 * return `void`, not a `Promise`): real Cloud Logging client libraries
 * (`@google-cloud/logging`) buffer and flush entries asynchronously in the
 * background, so callers never need to `await` a log call, and modeling
 * this adapter the same way keeps call sites (including hot error paths)
 * simple and non-blocking.
 *
 * To go live: implement `LoggingAdapter` using a credentialed
 * `@google-cloud/logging` client — initialize a `Logging` client with a GCP
 * project ID and a service account credential, obtain a `Log` instance via
 * `logging.log(logName)`, and in each method build a `logging.entry(metadata,
 * jsonPayload)` (mapping `severity`/`message`/extra `metadata` fields into
 * the entry's `severity` and `jsonPayload`) and call `log.write(entry)`
 * (fire-and-forget, matching this adapter's synchronous signature) — no
 * changes are required in any caller, since they depend only on the
 * `LoggingAdapter` interface (Requirement 19.4).
 */

/** Severity levels mirroring Cloud Logging's standard severity enum. */
export type LogSeverity = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

/** The interface callers depend on for Cloud Logging-backed structured log output. */
export interface LoggingAdapter {
  /**
   * Writes a structured log entry at the given `severity` with `message`
   * and optional `metadata` (arbitrary structured fields attached to the
   * entry, e.g. `{ adapter: "maps", errorMessage: err.message }`).
   * Synchronous/fire-and-forget, matching real Cloud Logging client
   * libraries' buffered-write behavior — callers never need to `await` it.
   */
  log(severity: LogSeverity, message: string, metadata?: Record<string, unknown>): void;

  /** Convenience method delegating to `log("DEBUG", message, metadata)`. */
  debug(message: string, metadata?: Record<string, unknown>): void;

  /** Convenience method delegating to `log("INFO", message, metadata)`. */
  info(message: string, metadata?: Record<string, unknown>): void;

  /** Convenience method delegating to `log("WARNING", message, metadata)`. */
  warn(message: string, metadata?: Record<string, unknown>): void;

  /** Convenience method delegating to `log("ERROR", message, metadata)`. */
  error(message: string, metadata?: Record<string, unknown>): void;
}

/** Severities routed to `console.error` rather than `console.log`, so they surface on stderr. */
const STDERR_SEVERITIES: ReadonlySet<LogSeverity> = new Set(["WARNING", "ERROR", "CRITICAL"]);

/**
 * MOCK IMPLEMENTATION — writes structured JSON log lines to the console
 * instead of a real Cloud Logging sink. See the module doc comment above
 * for the swap-in steps to a real `@google-cloud/logging` client.
 */
export class MockLoggingAdapter implements LoggingAdapter {
  log(severity: LogSeverity, message: string, metadata?: Record<string, unknown>): void {
    const entry = {
      severity,
      message,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    const line = JSON.stringify(entry);
    if (STDERR_SEVERITIES.has(severity)) {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log("DEBUG", message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.log("INFO", message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log("WARNING", message, metadata);
  }

  error(message: string, metadata?: Record<string, unknown>): void {
    this.log("ERROR", message, metadata);
  }
}

/**
 * Factory for `LoggingAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createTasksAdapter`).
 * Always returns the console-based mock — there is no real-API path for
 * this adapter.
 */
export function createLoggingAdapter(): LoggingAdapter {
  return new MockLoggingAdapter();
}

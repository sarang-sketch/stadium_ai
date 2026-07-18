/**
 * Google Cloud Scheduler adapter — stands in for the recurring-cron-trigger
 * layer that a real deployment would use to periodically kick off jobs
 * like an automatic fixture-generation reminder or the reservation-timeout
 * sweep (the sweep's actual enqueue-and-execute step is more directly
 * modeled by `tasks.adapter.ts`'s Cloud Tasks stand-in; Cloud Scheduler's
 * role here is only the "fire on a cron schedule" trigger that would call
 * an HTTP endpoint to start that work). Cloud Scheduler cannot be
 * credentialed in this environment (Requirement 19), so like
 * `bigquery.adapter.ts`, `maps.adapter.ts`, `vision.adapter.ts`,
 * `speech.adapter.ts`, and `translate.adapter.ts`, this adapter is
 * *always* mock: `MockCloudSchedulerAdapter` never issues a network call
 * or creates a real Cloud Scheduler job.
 *
 * `MockCloudSchedulerAdapter` stores scheduled jobs in an in-memory `Map`
 * keyed by job name (there is no real scheduler to call, so this map is
 * the adapter's entire state) and returns realistic, structurally valid
 * `ScheduledJobHandle` values (Requirement 19.2) with a deterministic
 * `createdAt` derived from a seeded hash of the job's identifying fields,
 * so repeated calls with the same inputs behave reproducibly (Requirement
 * 19.3).
 *
 * To go live: implement `CloudSchedulerAdapter` using a credentialed
 * `@google-cloud/scheduler` client — initialize a `CloudSchedulerClient`
 * with a GCP project ID, location, and a service account credential, then
 * call `createJob`/`deleteJob` against a `projects/{project}/locations/{location}`
 * parent resource, configuring each job's `httpTarget` to point at a Route
 * Handler (e.g. `/api/tournament/fixtures/generate` or
 * `/api/tickets/reservations/sweep`) that triggers the fixture-generation
 * check or the reservation-timeout sweep, and mapping the API response's
 * job name, schedule, target URI, and state into this adapter's
 * `ScheduledJobHandle` shape — no changes are required in any caller,
 * since they depend only on the `CloudSchedulerAdapter` interface
 * (Requirement 19.4).
 */

/** Lifecycle state of a scheduled job, mirroring Cloud Scheduler's job states. */
export type ScheduledJobState = "ENABLED" | "PAUSED";

/**
 * Handle for a recurring scheduled job, as a real Cloud Scheduler
 * `createJob` call would return. Standing in for the recurring trigger
 * that would periodically call an HTTP endpoint to run fixture-generation
 * reminders or kick off the reservation-timeout sweep.
 */
export interface ScheduledJobHandle {
  /** Unique name identifying the job (e.g. `"reservation-timeout-sweep"`). */
  jobName: string;
  /** Unix-cron expression describing how often the job fires (e.g. every 5 minutes). */
  cronExpression: string;
  /** HTTP endpoint the job invokes when it fires. */
  targetUrl: string;
  /** ISO 8601 timestamp of when the job was created/scheduled. */
  createdAt: string;
  /** Current lifecycle state of the job. */
  state: ScheduledJobState;
}

/** The interface callers depend on for Cloud Scheduler-backed recurring job scheduling. */
export interface CloudSchedulerAdapter {
  /**
   * Schedules a recurring job named `jobName` to fire on `cronExpression`
   * (a standard unix-cron expression) by calling `targetUrl`. Standing in
   * for e.g. scheduling a periodic fixture-generation reminder or the
   * cron trigger that kicks off the reservation-timeout sweep.
   */
  scheduleJob(jobName: string, cronExpression: string, targetUrl: string): Promise<ScheduledJobHandle>;

  /**
   * Deletes the previously scheduled job named `jobName`. Resolves
   * without error even if no job with that name currently exists, mirroring
   * Cloud Scheduler's idempotent delete semantics for the mock's purposes.
   */
  deleteJob(jobName: string): Promise<void>;
}

/**
 * MOCK IMPLEMENTATION — stores scheduled jobs in an in-memory `Map` and
 * never calls a real Cloud Scheduler API. See the module doc comment above
 * for the swap-in steps to a real `@google-cloud/scheduler` client.
 */
export class MockCloudSchedulerAdapter implements CloudSchedulerAdapter {
  private readonly jobs = new Map<string, ScheduledJobHandle>();

  async scheduleJob(
    jobName: string,
    cronExpression: string,
    targetUrl: string,
  ): Promise<ScheduledJobHandle> {
    const hash = seededHash(`${jobName}::${cronExpression}::${targetUrl}`);
    const createdAt = deterministicTimestamp(hash);

    const handle: ScheduledJobHandle = {
      jobName,
      cronExpression,
      targetUrl,
      createdAt,
      state: "ENABLED",
    };

    this.jobs.set(jobName, handle);
    return handle;
  }

  async deleteJob(jobName: string): Promise<void> {
    this.jobs.delete(jobName);
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed the mock's synthetic `createdAt` timestamp. Not cryptographic —
 * only needed for stable, reproducible mock output across calls with the
 * same job name/cron expression/target URL.
 */
function seededHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Earliest synthetic `createdAt` instant (ms since epoch) a scheduled job can report. */
const CREATED_AT_EPOCH_BASE_MS = Date.UTC(2024, 0, 1);

/** Span of ms over which the synthetic `createdAt` is deterministically spread. */
const CREATED_AT_SPREAD_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * Deterministically derives an ISO 8601 timestamp from `hash`, spreading
 * synthetic `createdAt` values across roughly a year from a fixed epoch so
 * repeated calls with the same inputs always produce the same timestamp.
 */
function deterministicTimestamp(hash: string): string {
  const seed = parseInt(hash.slice(0, 8), 16);
  const offsetMs = seed % CREATED_AT_SPREAD_MS;
  return new Date(CREATED_AT_EPOCH_BASE_MS + offsetMs).toISOString();
}

/**
 * Factory for `CloudSchedulerAdapter`, consistent with the factory pattern
 * used by every other adapter in this directory (e.g.
 * `createBigQueryAdapter`). Always returns the mock — there is no real-API
 * path for this adapter.
 */
export function createCloudSchedulerAdapter(): CloudSchedulerAdapter {
  return new MockCloudSchedulerAdapter();
}

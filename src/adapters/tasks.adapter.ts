/**
 * Google Cloud Tasks adapter — stands in for the deferred, at-a-specific-time
 * job-queue layer used to run the reservation-timeout sweep: when a user
 * reserves a seat, the BookingService enqueues a task scheduled to fire
 * after the configured reservation-timeout window; when the task fires, it
 * calls back into the platform to release the seat back to `available` if
 * the reservation was never completed by a purchase (Requirement 6.5). This
 * is distinct from `cloud-scheduler.adapter.ts`, which models a *recurring*
 * cron trigger — Cloud Tasks here models a *one-off, delayed* unit of work
 * enqueued per reservation. Cloud Tasks cannot be credentialed in this
 * environment (Requirement 19), so like `bigquery.adapter.ts`,
 * `maps.adapter.ts`, `vision.adapter.ts`, `speech.adapter.ts`,
 * `translate.adapter.ts`, and `cloud-scheduler.adapter.ts`, this adapter is
 * *always* mock: `MockTasksAdapter` never issues a network call or creates a
 * real Cloud Task.
 *
 * `MockTasksAdapter` stores enqueued tasks in an in-memory `Map` keyed by
 * task ID (there is no real queue to call, so this map is the adapter's
 * entire state) and returns realistic, structurally valid
 * `EnqueuedTaskHandle` values (Requirement 19.2) with a deterministic
 * `taskId` derived from a seeded hash of the queue name and payload, so
 * repeated calls with the same inputs behave reproducibly (Requirement
 * 19.3).
 *
 * To go live: implement `TasksAdapter` using a credentialed
 * `@google-cloud/tasks` client — initialize a `CloudTasksClient` with a GCP
 * project ID, location, and a service account credential, then call
 * `createTask` against a `projects/{project}/locations/{location}/queues/{queueName}`
 * parent resource, configuring each task's `httpRequest` to target a Route
 * Handler (e.g. `/api/tickets/reservations/[seatId]/release`) that performs
 * the actual seat-release, and setting `scheduleTime` from `delaySeconds`,
 * mapping the API response's task name, queue, schedule time, and dispatch
 * state into this adapter's `EnqueuedTaskHandle` shape — no changes are
 * required in any caller, since they depend only on the `TasksAdapter`
 * interface (Requirement 19.4).
 */

/** Lifecycle state of an enqueued task, mirroring Cloud Tasks' dispatch states. */
export type EnqueuedTaskState = "SCHEDULED" | "DISPATCHED" | "CANCELLED";

/**
 * Handle for a deferred task, as a real Cloud Tasks `createTask` call would
 * return. Standing in for the one-off, delayed unit of work that would fire
 * an HTTP callback to release an expired seat reservation, or run other
 * deferred background work.
 */
export interface EnqueuedTaskHandle {
  /** Unique identifier for the enqueued task. */
  taskId: string;
  /** Name of the queue the task was enqueued onto (e.g. `"reservation-timeout-sweep"`). */
  queueName: string;
  /** ISO 8601 timestamp of when the task is scheduled to fire, accounting for any delay. */
  scheduledFor: string;
  /** Current dispatch state of the task. */
  state: EnqueuedTaskState;
}

/** The interface callers depend on for Cloud Tasks-backed deferred job enqueuing. */
export interface TasksAdapter {
  /**
   * Enqueues a task named implicitly by `queueName`+`payload` onto the queue
   * `queueName`, to fire after `delaySeconds` (defaulting to 0, i.e. as soon
   * as possible). Standing in for e.g. enqueuing the reservation-timeout
   * sweep task that releases an expired seat reservation back to
   * `available` (Requirement 6.5), or other deferred background work.
   */
  enqueueTask(
    queueName: string,
    payload: Record<string, unknown>,
    delaySeconds?: number,
  ): Promise<EnqueuedTaskHandle>;

  /**
   * Cancels the previously enqueued task identified by `taskId`. Resolves
   * without error even if no task with that ID currently exists, mirroring
   * Cloud Tasks' idempotent delete semantics for the mock's purposes.
   */
  cancelTask(taskId: string): Promise<void>;
}

/**
 * MOCK IMPLEMENTATION — stores enqueued tasks in an in-memory `Map` and
 * never calls a real Cloud Tasks API. See the module doc comment above for
 * the swap-in steps to a real `@google-cloud/tasks` client.
 */
export class MockTasksAdapter implements TasksAdapter {
  private readonly tasks = new Map<string, EnqueuedTaskHandle>();

  async enqueueTask(
    queueName: string,
    payload: Record<string, unknown>,
    delaySeconds = 0,
  ): Promise<EnqueuedTaskHandle> {
    const hash = seededHash(`${queueName}::${JSON.stringify(payload)}`);
    const taskId = `task-${hash}`;
    const scheduledFor = deterministicScheduledFor(hash, delaySeconds);

    const handle: EnqueuedTaskHandle = {
      taskId,
      queueName,
      scheduledFor,
      state: "SCHEDULED",
    };

    this.tasks.set(taskId, handle);
    return handle;
  }

  async cancelTask(taskId: string): Promise<void> {
    const existing = this.tasks.get(taskId);
    if (existing) {
      this.tasks.set(taskId, { ...existing, state: "CANCELLED" });
    }
  }
}

/**
 * Simple, fast, deterministic string hash (32-bit FNV-1a variant) used to
 * seed the mock's synthetic `taskId` and `scheduledFor` timestamp. Not
 * cryptographic — only needed for stable, reproducible mock output across
 * calls with the same queue name/payload.
 */
function seededHash(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/** Earliest synthetic base instant (ms since epoch) a task's schedule is derived from. */
const SCHEDULED_FOR_EPOCH_BASE_MS = Date.UTC(2024, 0, 1);

/** Span of ms over which the synthetic base instant is deterministically spread. */
const SCHEDULED_FOR_SPREAD_MS = 1000 * 60 * 60 * 24 * 365;

/**
 * Deterministically derives an ISO 8601 `scheduledFor` timestamp from
 * `hash`, spreading the synthetic base instant across roughly a year from a
 * fixed epoch so repeated calls with the same inputs always produce the
 * same base timestamp, then adding `delaySeconds` on top so the returned
 * value always reflects the requested delay.
 */
function deterministicScheduledFor(hash: string, delaySeconds: number): string {
  const seed = parseInt(hash.slice(0, 8), 16);
  const offsetMs = seed % SCHEDULED_FOR_SPREAD_MS;
  const baseMs = SCHEDULED_FOR_EPOCH_BASE_MS + offsetMs;
  return new Date(baseMs + delaySeconds * 1000).toISOString();
}

/**
 * Factory for `TasksAdapter`, consistent with the factory pattern used by
 * every other adapter in this directory (e.g. `createCloudSchedulerAdapter`).
 * Always returns the mock — there is no real-API path for this adapter.
 */
export function createTasksAdapter(): TasksAdapter {
  return new MockTasksAdapter();
}

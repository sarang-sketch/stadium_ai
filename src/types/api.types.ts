/**
 * Shared API-layer types: authenticated session claims, the standard error
 * response taxonomy returned by `withApiHandler`, and the generic pagination
 * envelope used by paginated list endpoints.
 *
 * Covers:
 * - Session claims produced by the AuthGateway and consumed by
 *   `auth.middleware.ts` for role-gated access (Requirement 1.1, 1.5, 1.6)
 * - The standardized RouteHandler error response shapes for validation
 *   failures, authentication/authorization failures, not-found, conflict,
 *   rate limiting, and unknown/internal errors (Requirement 2.2)
 * - The paginated response envelope used by tournament/match/registration
 *   (and other) list endpoints (Requirement 23.3)
 *
 * These are domain/contract types only; the corresponding Zod schemas used
 * for runtime request/response validation are defined separately in
 * `src/lib/validators/`.
 */

/**
 * The Firebase Auth custom claim role assigned to an account, where `user`
 * represents a fan or team participant and `admin` represents a platform
 * administrator (Requirement 1.3, 1.4).
 */
export type UserRole = "admin" | "user";

/**
 * Decoded session claims produced by `AuthGateway.createSession`/
 * `verifySession` and consumed by `requireRole` for role-gated access
 * control. Mirrors the `SessionClaims` interface in the design document's
 * Auth & Session section.
 */
export interface SessionClaims {
  /** Firebase Auth user identifier the session belongs to. */
  uid: string;
  /** Role granted to this session, per Requirement 1.5, 1.6. */
  role: UserRole;
}

/**
 * Discriminates the standardized API error response shapes returned by
 * `withApiHandler`, matching the design document's Error Handling section:
 * 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404
 * (not-found), 409 (conflict), 429 (rate-limited), and 500 (internal/unknown).
 */
export type ApiErrorCode =
  | "validation_error"
  | "unauthenticated"
  | "unauthorized"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal_error";

/**
 * A single field-level validation failure, as surfaced by
 * `schema.safeParse(body)` on a Zod schema.
 */
export interface ValidationErrorDetail {
  /** Dot/array-index path to the invalid field within the request body. */
  path: string;
  /** Human-readable description of why the field failed validation. */
  message: string;
}

/**
 * 400 response returned when a request body fails Zod schema validation,
 * per Requirement 2.2. Business logic is never executed when this response
 * is returned.
 */
export interface ValidationErrorResponse {
  error: "validation_error";
  /** Per-field validation failure details from the Zod schema. */
  details: ValidationErrorDetail[];
}

/**
 * 401 response returned when a request has no valid session (missing,
 * invalid, or expired session cookie), per Requirement 1.2.
 */
export interface UnauthenticatedErrorResponse {
  error: "unauthenticated";
  message: string;
}

/**
 * 403 response returned when a request's session role does not satisfy the
 * role required by the RouteHandler, per Requirement 1.6.
 */
export interface UnauthorizedErrorResponse {
  error: "unauthorized";
  message: string;
}

/**
 * 404 response returned when a requested resource identifier does not
 * exist, per Requirement 3.3.
 */
export interface NotFoundErrorResponse {
  error: "not_found";
  message: string;
}

/**
 * 409 response returned when a request conflicts with the current state of
 * a resource (e.g. purchasing an already-sold seat, deleting a tournament
 * with sold tickets), per Requirements 6.2, 14.6.
 */
export interface ConflictErrorResponse {
  error: "conflict";
  message: string;
}

/**
 * 429 response returned when a client has exceeded the configured request
 * threshold for a rate-limited RouteHandler, per Requirement 2.3.
 */
export interface RateLimitedErrorResponse {
  error: "rate_limited";
  message: string;
  /** Unix epoch milliseconds at which the rate limit window resets. */
  resetAt: number;
}

/**
 * 500 response returned for unrecognized/unexpected errors. Never leaks
 * stack traces or internal error details to the caller, per the design
 * document's Error Handling section.
 */
export interface InternalErrorResponse {
  error: "internal_error";
  message: string;
}

/**
 * Union of every standardized API error response shape a RouteHandler may
 * return via `withApiHandler`, discriminated on the `error` field.
 */
export type ApiErrorResponse =
  | ValidationErrorResponse
  | UnauthenticatedErrorResponse
  | UnauthorizedErrorResponse
  | NotFoundErrorResponse
  | ConflictErrorResponse
  | RateLimitedErrorResponse
  | InternalErrorResponse;

/**
 * Generic wrapper for a successful RouteHandler response body. Optional —
 * most RouteHandlers return their resource shape directly, but this is
 * available where a uniform `{ data }` envelope is useful (e.g. simple
 * command endpoints with no natural resource shape of their own).
 */
export interface ApiSuccessResponse<T> {
  data: T;
}

/**
 * Generic paginated response envelope for list endpoints (tournaments,
 * matches, registrations, and other paginated collections), per
 * Requirement 23.3.
 */
export interface PaginatedResult<T> {
  /** Items included in this page, in the collection's documented sort order. */
  items: T[];
  /** Total number of items across all pages, ignoring pagination. */
  total: number;
  /** 1-indexed page number this result represents. */
  page: number;
  /** Maximum number of items requested per page. */
  pageSize: number;
}

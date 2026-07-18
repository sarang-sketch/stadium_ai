import { NextResponse } from "next/server";

/**
 * Custom application error class to handle API and operational errors gracefully.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: string;

  constructor(message: string, statusCode: number = 500, errorCode: string = "INTERNAL_SERVER_ERROR") {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Type guard to check if an unknown error is an instance of AppError.
 * @param error - The error to check.
 * @returns True if the error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Domain error classes consumed by `withApiHandler` (`src/middleware/api-handler.ts`)
 * to translate thrown service-layer failures into standardized HTTP responses.
 *
 * Each carries a `statusCode` and an `errorCode` drawn from the `ApiErrorCode`
 * taxonomy in `src/types/api.types.ts`, so the handler can map a thrown error
 * straight onto the matching `ApiErrorResponse` shape without leaking internals.
 */

/** 400 — request was syntactically valid JSON but violated a business rule. */
export class ValidationError extends AppError {
  constructor(message: string = "Validation failed.") {
    super(message, 400, "validation_error");
  }
}

/** 401 — the request has no valid authenticated session. */
export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required.") {
    super(message, 401, "unauthenticated");
  }
}

/** 403 — the session is valid but its role is not permitted for this action. */
export class ForbiddenError extends AppError {
  constructor(message: string = "Insufficient permissions.") {
    super(message, 403, "unauthorized");
  }
}

/** 404 — the requested resource identifier does not exist. */
export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found.") {
    super(message, 404, "not_found");
  }
}

/** 409 — the request conflicts with the current state of a resource. */
export class ConflictError extends AppError {
  constructor(message: string = "Request conflicts with current resource state.") {
    super(message, 409, "conflict");
  }
}

/**
 * Creates a standard JSON error response for Next.js API Routes / Route Handlers.
 * @param message - The error message.
 * @param statusCode - The HTTP status code.
 * @param errorCode - A specific string error code.
 * @returns A NextResponse containing the structured error.
 */
export function createErrorResponse(message: string, statusCode: number, errorCode: string): NextResponse {
  return NextResponse.json(
    {
      error: {
        message,
        code: errorCode,
      },
    },
    { status: statusCode }
  );
}

/**
 * Centralized error handler for API routes to process unknown errors.
 * @param error - The caught error.
 * @returns A NextResponse representing the error.
 */
export function handleApiError(error: unknown): NextResponse {
  console.error("[API Error]:", error);

  if (isAppError(error)) {
    return createErrorResponse(error.message, error.statusCode, error.errorCode);
  }

  // Handle generic errors
  const message = error instanceof Error ? error.message : "An unexpected error occurred.";
  return createErrorResponse(message, 500, "INTERNAL_SERVER_ERROR");
}

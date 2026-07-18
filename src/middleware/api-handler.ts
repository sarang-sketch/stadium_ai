import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { applySecurityHeaders } from './security';
import { rateLimiter, type RateLimiterOptions } from './rate-limiter';
import { verifySession } from './auth.middleware';
import { isAppError } from '@/utils/error-handler';
import { createLoggingAdapter } from '@/adapters/logging.adapter';
import type {
  SessionClaims,
  UserRole,
  ValidationErrorDetail,
} from '@/types/api.types';

const logger = createLoggingAdapter();

/** Default rate-limit window applied when a route does not override it. */
const DEFAULT_RATE_LIMIT: RateLimiterOptions = {
  windowMs: 60_000,
  maxRequests: 60,
};

/**
 * Next.js 15 route-handler context. Dynamic routes receive `params` as a
 * promise; static routes receive no second argument. Kept generic over the
 * param shape so wrapped handlers stay assignable to any route export.
 */
export interface RouteContext<TParams extends Record<string, string> = Record<string, string>> {
  params: Promise<TParams>;
}

/**
 * Context handed to a wrapped handler by {@link withApiHandler}: the validated
 * request `body` (typed from the Zod schema, or `undefined` when no schema is
 * configured), the authenticated `session` (present when `requireRole` is set,
 * otherwise `null`), and the resolved route `params`.
 */
export interface ApiHandlerContext<TBody, TParams extends Record<string, string>> {
  body: TBody;
  session: SessionClaims | null;
  params: TParams;
}

/** A handler wrapped by {@link withApiHandler}. */
export type ApiHandler<TBody, TParams extends Record<string, string>> = (
  req: NextRequest,
  ctx: ApiHandlerContext<TBody, TParams>
) => Promise<NextResponse> | NextResponse;

/**
 * The Next.js-compatible route handler returned by {@link withApiHandler}.
 *
 * Next.js 15 always invokes route handlers with a context object whose
 * `params` is a promise (empty for non-dynamic routes), and its generated
 * route type-checker requires the second parameter to be exactly
 * `RouteContext` (not `RouteContext | undefined`). The parameter is therefore
 * declared as required — the implementation still guards it defensively.
 */
export type WrappedRouteHandler<TParams extends Record<string, string>> = (
  req: NextRequest,
  context: RouteContext<TParams>
) => Promise<NextResponse>;

/** Configuration options for {@link withApiHandler}. */
export interface ApiHandlerOptions<TSchema extends z.ZodType> {
  /** When provided, the JSON body is validated with `schema.safeParse`. */
  schema?: TSchema;
  /** When set, the request must carry a valid session; `'admin'` requires the admin role. */
  requireRole?: UserRole;
  /** Overrides the default in-memory rate-limit window for this route. */
  rateLimit?: RateLimiterOptions;
}

/** Builds a standardized JSON error response and applies security headers. */
function errorResponse(body: Record<string, unknown>, status: number): NextResponse {
  return applySecurityHeaders(NextResponse.json(body, { status }));
}

/** Maps Zod issues onto the `ValidationErrorDetail[]` contract shape. */
function toValidationDetails(error: z.ZodError): ValidationErrorDetail[] {
  return error.issues.map((issue) => ({
    path: issue.path.map((segment) => String(segment)).join('.'),
    message: issue.message,
  }));
}

/**
 * Wraps a Next.js Route Handler, composing (in order): security headers on
 * every response, rate limiting, optional Zod body validation, optional
 * session/role authentication, handler invocation, and standardized error
 * normalization. Thrown domain errors (`src/utils/error-handler.ts`) map to
 * their status codes; unknown errors become a generic 500 and are logged.
 *
 * @example
 * export const POST = withApiHandler(
 *   async (req, ctx) => NextResponse.json({ id: ctx.body.id }),
 *   { schema: CreateSchema, requireRole: 'admin' }
 * );
 */
export function withApiHandler<
  TSchema extends z.ZodType,
  TParams extends Record<string, string> = Record<string, string>,
>(
  handler: ApiHandler<z.output<TSchema>, TParams>,
  options: ApiHandlerOptions<TSchema> & { schema: TSchema }
): WrappedRouteHandler<TParams>;
export function withApiHandler<
  TParams extends Record<string, string> = Record<string, string>,
>(
  handler: ApiHandler<undefined, TParams>,
  options?: ApiHandlerOptions<z.ZodType>
): WrappedRouteHandler<TParams>;
export function withApiHandler<
  TSchema extends z.ZodType,
  TParams extends Record<string, string> = Record<string, string>,
>(
  handler: ApiHandler<z.output<TSchema> | undefined, TParams>,
  options: ApiHandlerOptions<TSchema> = {}
): WrappedRouteHandler<TParams> {
  const { schema, requireRole, rateLimit } = options;
  const guard = rateLimiter(rateLimit ?? DEFAULT_RATE_LIMIT);

  return async (req: NextRequest, context: RouteContext<TParams>): Promise<NextResponse> => {
    try {
      // b. Rate limiting.
      const limited = await guard(req);
      if (limited) {
        return applySecurityHeaders(limited);
      }

      // c. Optional Zod body validation.
      let body: z.output<TSchema> | undefined;
      if (schema) {
        let raw: unknown;
        try {
          raw = await req.json();
        } catch {
          return errorResponse(
            {
              error: 'validation_error',
              details: [{ path: '', message: 'Request body must be valid JSON.' }],
            },
            400
          );
        }

        const parsed = schema.safeParse(raw);
        if (!parsed.success) {
          return errorResponse(
            { error: 'validation_error', details: toValidationDetails(parsed.error) },
            400
          );
        }
        body = parsed.data as z.output<TSchema>;
      }

      // d. Optional auth.
      let session: SessionClaims | null = null;
      if (requireRole) {
        const authHeader = req.headers.get('authorization');
        const token = authHeader?.startsWith('Bearer ')
          ? authHeader.slice('Bearer '.length)
          : '';
        session = await verifySession(token);

        if (!session) {
          return errorResponse(
            { error: 'unauthenticated', message: 'Authentication required.' },
            401
          );
        }
        // 'user' accepts any authenticated role; 'admin' requires the admin role.
        if (requireRole === 'admin' && session.role !== 'admin') {
          return errorResponse(
            { error: 'unauthorized', message: 'Insufficient permissions.' },
            403
          );
        }
      }

      // e. Invoke the handler and ensure security headers on the result.
      const params = ((await context?.params) ?? {}) as TParams;
      const result = await handler(req, { body, session, params });
      return applySecurityHeaders(result);
    } catch (error) {
      // Known domain errors normalize to their status + error code.
      if (isAppError(error)) {
        return errorResponse({ error: error.errorCode, message: error.message }, error.statusCode);
      }

      // Unknown errors: log and return a generic 500 (never leak stack traces).
      logger.error('Unhandled error in API handler', {
        errorMessage: error instanceof Error ? error.message : String(error),
        path: req.nextUrl?.pathname,
        method: req.method,
      });
      return errorResponse(
        { error: 'internal_error', message: 'An unexpected error occurred.' },
        500
      );
    }
  };
}

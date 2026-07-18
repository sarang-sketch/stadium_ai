/**
 * In-memory token-bucket rate limiter for Next.js API routes.
 *
 * Keys are scoped to `ip:path` so each client is rate-limited independently
 * per route. Expired records are garbage-collected when the store exceeds 500
 * entries to prevent memory leaks in long-running processes.
 *
 * @module middleware/rate-limiter
 */

import { NextRequest, NextResponse } from 'next/server';

/** Configuration for the rate limiter window. */
export interface RateLimiterOptions {
  /** Duration of the sliding window in milliseconds. */
  windowMs: number;
  /** Maximum number of requests allowed within the window. */
  maxRequests: number;
}

/** Internal tracking record for a single rate-limit bucket. */
interface RateLimitRecord {
  /** Number of requests made within the current window. */
  count: number;
  /** Epoch timestamp (ms) when this window resets. */
  resetTime: number;
}

/** Module-level store holding active rate-limit buckets keyed by `ip:path`. */
const store = new Map<string, RateLimitRecord>();

/** Custom error class thrown when a request exceeds the configured rate limit. */
export class RateLimitedErrorResponse extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'RateLimitedErrorResponse';
  }
}

/**
 * Creates a token-bucket rate limiter middleware scoped to `ip:path`.
 *
 * Returns `null` when the request is allowed to proceed, or a `429`
 * `NextResponse` with a `Retry-After` header when the limit is exceeded.
 *
 * @param options - Rate limiting window size and request ceiling.
 * @returns An async middleware function compatible with `withApiHandler`.
 */
export function rateLimiter(options: RateLimiterOptions) {
  return async (req: NextRequest): Promise<NextResponse | null> => {
    // Note: In Next.js Edge runtime, IP might be in headers
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const path = req.nextUrl?.pathname || '';
    const key = `${ip}:${path}`;
    const now = Date.now();

    // Prevent memory leaks: clean up expired records when the store grows
    if (store.size > 500) {
      for (const [k, v] of store.entries()) {
        if (v.resetTime < now) {
          store.delete(k);
        }
      }
    }

    let record = store.get(key);
    if (!record || record.resetTime < now) {
      record = { count: 1, resetTime: now + options.windowMs };
      store.set(key, record);
      return null; // Proceed
    }

    if (record.count >= options.maxRequests) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil((record.resetTime - now) / 1000).toString() } }
      );
    }

    record.count++;
    store.set(key, record);
    
    return null; // Proceed
  };
}

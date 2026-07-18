import { NextRequest, NextResponse } from 'next/server';

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitRecord>();

export class RateLimitedErrorResponse extends Error {
  constructor(public message: string) {
    super(message);
    this.name = 'RateLimitedErrorResponse';
  }
}

/**
 * Token bucket rate limiter middleware (in-memory)
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

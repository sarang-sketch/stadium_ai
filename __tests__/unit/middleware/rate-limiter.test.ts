import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { rateLimiter } from '@/middleware/rate-limiter';

/**
 * Constructs a minimal NextRequest suitable for rate-limiter testing.
 * @param path - The URL path to simulate.
 * @param ip - The IP address sent via the `x-forwarded-for` header.
 */
function createRequest(path: string = '/api/test', ip: string = '192.168.1.1'): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: { 'x-forwarded-for': ip },
  });
}

describe('Rate Limiter Middleware', () => {
  it('allows requests within the rate limit window', async () => {
    const guard = rateLimiter({ windowMs: 60_000, maxRequests: 5 });
    const req = createRequest('/api/allow-test', '10.0.0.1');
    const result = await guard(req);
    expect(result).toBeNull(); // null means "proceed"
  });

  it('blocks requests exceeding the max requests threshold', async () => {
    const guard = rateLimiter({ windowMs: 60_000, maxRequests: 2 });

    // First two requests should pass
    const req1 = createRequest('/api/block-test', '10.0.0.2');
    expect(await guard(req1)).toBeNull();

    const req2 = createRequest('/api/block-test', '10.0.0.2');
    expect(await guard(req2)).toBeNull();

    // Third request should be blocked
    const req3 = createRequest('/api/block-test', '10.0.0.2');
    const blocked = await guard(req3);
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);

    const body = await blocked!.json();
    expect(body.error).toContain('Too many requests');
  });

  it('returns a Retry-After header on rate-limited responses', async () => {
    const guard = rateLimiter({ windowMs: 60_000, maxRequests: 1 });

    // Exhaust the limit
    await guard(createRequest('/api/retry-test', '10.0.0.3'));

    const blocked = await guard(createRequest('/api/retry-test', '10.0.0.3'));
    expect(blocked).not.toBeNull();
    expect(blocked!.headers.get('Retry-After')).toBeDefined();
    expect(Number(blocked!.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('uses distinct rate-limit buckets for different routes', async () => {
    const guard = rateLimiter({ windowMs: 60_000, maxRequests: 1 });

    // Exhaust limit on route A
    await guard(createRequest('/api/route-a', '10.0.0.4'));
    const blockedA = await guard(createRequest('/api/route-a', '10.0.0.4'));
    expect(blockedA).not.toBeNull();

    // Route B from the same IP should still be allowed
    const allowedB = await guard(createRequest('/api/route-b', '10.0.0.4'));
    expect(allowedB).toBeNull();
  });

  it('uses distinct rate-limit buckets for different IPs', async () => {
    const guard = rateLimiter({ windowMs: 60_000, maxRequests: 1 });

    // Exhaust limit for IP-A
    await guard(createRequest('/api/ip-test', '10.0.0.5'));
    const blockedA = await guard(createRequest('/api/ip-test', '10.0.0.5'));
    expect(blockedA).not.toBeNull();

    // Different IP on the same route should still be allowed
    const allowedB = await guard(createRequest('/api/ip-test', '10.0.0.6'));
    expect(allowedB).toBeNull();
  });
});

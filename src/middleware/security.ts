import { NextRequest, NextResponse } from 'next/server';

/**
 * Applies security headers to the response.
 */
export function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline';");
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-XSS-Protection', '1; mode=block');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return res;
}

/**
 * Handles CORS configuration.
 */
export function handleCors(req: NextRequest): NextResponse | null {
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 });
    res.headers.set('Access-Control-Allow-Origin', '*'); // Configure properly for production
    res.headers.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
  }
  return null;
}

/**
 * Utility for basic input sanitization.
 * Removes potentially dangerous HTML tags.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.replace(/<\/?[^>]+(>|$)/g, '');
}

import { describe, expect, it } from 'vitest';
import { NextResponse } from 'next/server';
import { applySecurityHeaders, sanitizeInput, handleCors } from '@/middleware/security';
import { NextRequest } from 'next/server';

describe('Security Middleware', () => {
  describe('applySecurityHeaders', () => {
    it('sets Content-Security-Policy header', () => {
      const res = applySecurityHeaders(NextResponse.json({ ok: true }));
      expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    });

    it('sets X-Content-Type-Options to nosniff', () => {
      const res = applySecurityHeaders(NextResponse.json({ ok: true }));
      expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    });

    it('sets X-Frame-Options to DENY', () => {
      const res = applySecurityHeaders(NextResponse.json({ ok: true }));
      expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('sets X-XSS-Protection header', () => {
      const res = applySecurityHeaders(NextResponse.json({ ok: true }));
      expect(res.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });

    it('sets Referrer-Policy header', () => {
      const res = applySecurityHeaders(NextResponse.json({ ok: true }));
      expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    });
  });

  describe('sanitizeInput', () => {
    it('removes HTML script tags', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")');
    });

    it('removes nested HTML tags', () => {
      expect(sanitizeInput('<div><b>text</b></div>')).toBe('text');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('preserves clean text without HTML', () => {
      expect(sanitizeInput('Hello world')).toBe('Hello world');
    });

    it('handles null-like falsy input gracefully', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('handleCors', () => {
    it('returns a 204 response with CORS headers for OPTIONS requests', () => {
      const req = new NextRequest('http://localhost:3000/api/test', { method: 'OPTIONS' });
      const res = handleCors(req);
      expect(res).not.toBeNull();
      expect(res!.status).toBe(204);
      expect(res!.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res!.headers.get('Access-Control-Allow-Methods')).toContain('GET');
      expect(res!.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    });

    it('returns null for non-OPTIONS requests', () => {
      const req = new NextRequest('http://localhost:3000/api/test', { method: 'GET' });
      const res = handleCors(req);
      expect(res).toBeNull();
    });
  });
});

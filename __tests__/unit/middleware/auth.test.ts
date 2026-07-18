import { describe, expect, it } from 'vitest';
import { verifySession } from '@/middleware/auth.middleware';

describe('Auth Middleware — verifySession', () => {
  it('returns null for an empty token', async () => {
    const result = await verifySession('');
    expect(result).toBeNull();
  });

  it('accepts the dev-user fallback token in non-production', async () => {
    const result = await verifySession('valid-user-token');
    expect(result).not.toBeNull();
    expect(result!.uid).toBe('dev-user');
    expect(result!.role).toBe('user');
  });

  it('accepts the dev-admin fallback token in non-production', async () => {
    const result = await verifySession('valid-admin-token');
    expect(result).not.toBeNull();
    expect(result!.uid).toBe('dev-admin');
    expect(result!.role).toBe('admin');
  });

  it('returns a session (via mock admin SDK) for an arbitrary token', async () => {
    // The mock Firebase Admin SDK accepts any token, so unknown tokens
    // still produce a mock session in non-production
    const result = await verifySession('arbitrary-token');
    expect(result).not.toBeNull();
    expect(result!.uid).toBeDefined();
    expect(result!.role).toBe('user'); // defaults to user
  });

  it('the dev-admin token grants the admin role', async () => {
    const result = await verifySession('valid-admin-token');
    expect(result!.role).toBe('admin');
  });

  it('the dev-user token grants the user role', async () => {
    const result = await verifySession('valid-user-token');
    expect(result!.role).toBe('user');
  });
});

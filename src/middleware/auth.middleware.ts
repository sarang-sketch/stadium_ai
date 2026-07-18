import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import type { SessionClaims, UserRole } from '@/types/api.types';

export type { SessionClaims, UserRole };

/** Shape of the decoded token claims we read from the Firebase Admin SDK. */
interface DecodedTokenClaims {
  uid: string;
  role?: UserRole;
}

/**
 * DEV-ONLY fallback tokens.
 *
 * These well-known tokens are accepted *only* when
 * `process.env.NODE_ENV !== 'production'`, so local development and the test
 * suite keep working while the Firebase Admin SDK is unavailable/uncredentialed
 * (the current `src/lib/firebase/admin.ts` is a mock, and the real SDK cannot
 * be credentialed in this environment). This map is never consulted in
 * production — see the guard in `verifySession`.
 */
const DEV_FALLBACK_TOKENS: Readonly<Record<string, SessionClaims>> = {
  'valid-admin-token': { uid: 'dev-admin', role: 'admin' },
  'valid-user-token': { uid: 'dev-user', role: 'user' },
};

/** Narrows an arbitrary role claim to a supported `UserRole`, defaulting to `'user'`. */
function normalizeRole(role: unknown): UserRole {
  return role === 'admin' ? 'admin' : 'user';
}

/**
 * Verifies a Firebase session/ID token and returns the derived
 * {@link SessionClaims} (`uid` + `role`), defaulting `role` to `'user'` when
 * the custom claim is absent.
 *
 * Verification path: the token is checked against the Firebase Admin SDK
 * (`src/lib/firebase/admin.ts`) via `verifyIdToken`; the decoded token's
 * custom claims provide `uid` and `role`.
 *
 * This function never throws: it returns `null` on any verification failure
 * (missing token, invalid/expired token, or an admin SDK error).
 *
 * DEV-ONLY behavior: when `process.env.NODE_ENV !== 'production'`, the
 * well-known dev tokens `'valid-admin-token'` and `'valid-user-token'` are
 * honored (mapping to `dev-admin`/`admin` and `dev-user`/`user`) so local dev
 * and tests keep working without real Firebase credentials. This fallback is
 * fully disabled in production, where only real Admin SDK verification applies.
 */
export async function verifySession(token: string): Promise<SessionClaims | null> {
  if (!token) return null;

  // DEV-ONLY fallback — fully disabled in production.
  if (process.env.NODE_ENV !== 'production') {
    const fallback = DEV_FALLBACK_TOKENS[token];
    if (fallback) return fallback;
  }

  try {
    const decoded = (await adminAuth.verifyIdToken(token)) as DecodedTokenClaims;
    if (!decoded?.uid) return null;
    return { uid: decoded.uid, role: normalizeRole(decoded.role) };
  } catch {
    return null;
  }
}

/**
 * Higher-order function to wrap API route handlers with authentication and
 * role checking. Prefer `withApiHandler` (`src/middleware/api-handler.ts`) for
 * new routes; this remains for direct auth-only wrapping.
 *
 * When `allowedRoles` is omitted, any authenticated session is accepted.
 */
export function withAuth(
  handler: (req: NextRequest, session: SessionClaims) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid token' }, { status: 401 });
    }

    const token = authHeader.slice('Bearer '.length);
    const session = await verifySession(token);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    if (allowedRoles && !allowedRoles.includes(session.role)) {
      return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
    }

    return handler(req, session);
  };
}

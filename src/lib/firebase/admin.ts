/**
 * Firebase Admin SDK — mock implementation for development and hackathon demo.
 *
 * In production, install `firebase-admin` and replace these mocks with real
 * Firebase Admin SDK initialization using a service account credential.
 * No changes are required in any caller, since they depend only on the
 * exported `adminDb` and `adminAuth` shapes.
 */

/** Mock document reference returned by collection().doc(). */
interface MockDocRef {
  path: string;
  get: () => Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>;
  set: (data: Record<string, unknown>) => Promise<void>;
  update: (data: Record<string, unknown>) => Promise<void>;
  delete: () => Promise<void>;
}

/** Mock collection reference returned by adminDb.collection(). */
interface MockCollectionRef {
  doc: (id: string) => MockDocRef;
}

/** Mock Firestore admin interface for server-side operations. */
interface MockFirestoreAdmin {
  collection: (path: string) => MockCollectionRef;
}

/** Mock Auth admin interface for server-side token verification. */
interface MockAuthAdmin {
  verifyIdToken: (token: string) => Promise<{ uid: string; email?: string }>;
  createSessionCookie: (idToken: string, options: { expiresIn: number }) => Promise<string>;
}

const adminDb: MockFirestoreAdmin = {
  collection: (path: string) => ({
    doc: (id: string): MockDocRef => ({
      path: `${path}/${id}`,
      get: async () => ({ exists: false, data: () => undefined }),
      set: async () => { /* no-op mock */ },
      update: async () => { /* no-op mock */ },
      delete: async () => { /* no-op mock */ },
    }),
  }),
};

const adminAuth: MockAuthAdmin = {
  verifyIdToken: async (token: string) => ({
    uid: `mock-uid-${token.slice(0, 8)}`,
    email: 'mock@stadiumai.dev',
  }),
  createSessionCookie: async (_idToken: string, _options: { expiresIn: number }) =>
    'mock-session-cookie',
};

export { adminDb, adminAuth };

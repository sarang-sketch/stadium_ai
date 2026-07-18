import { auth } from './config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  UserCredential
} from 'firebase/auth';
import { SessionClaims, UserRole } from '@/types/api.types';

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signOut = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Returns whether the given token claims satisfy `requiredRole`. An `admin`
 * role satisfies any requirement; otherwise the roles must match exactly.
 * Accepts typed claims (or a partial claim / `null`) rather than `any`.
 */
export const checkUserRole = (
  tokenClaims: SessionClaims | { role?: UserRole } | null,
  requiredRole: UserRole
): boolean => {
  const role = tokenClaims?.role;
  return role === requiredRole || role === 'admin';
};

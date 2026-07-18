'use client';

import { createContext, useContext } from 'react';

type User = { id: string; name: string; role: 'user' | 'admin' };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: 'user' | 'admin' | null;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook to manage authentication state
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a dummy implementation if not wrapped in provider for now
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      role: null,
      signIn: async () => {},
      signUp: async () => {},
      signOut: async () => {},
    };
  }
  return context;
}

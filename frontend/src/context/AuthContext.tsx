import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import { AUTH_EXPIRED_EVENT, TOKEN_KEY } from '../services/api';
import type { AuthResult, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => localStorage.getItem(TOKEN_KEY) !== null);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const accept = useCallback((result: AuthResult) => {
    localStorage.setItem(TOKEN_KEY, result.token);
    setUser(result.user);
  }, []);

  useEffect(() => {
    if (localStorage.getItem(TOKEN_KEY) === null) return;
    let cancelled = false;
    authService
      .me()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [logout]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = useCallback(
    (email: string, password: string): Promise<void> => authService.login(email, password).then(accept),
    [accept],
  );
  const signup = useCallback(
    (name: string, email: string, password: string): Promise<void> =>
      authService.signup(name, email, password).then(accept),
    [accept],
  );

  const value = useMemo(() => ({ user, loading, login, signup, logout }), [user, loading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

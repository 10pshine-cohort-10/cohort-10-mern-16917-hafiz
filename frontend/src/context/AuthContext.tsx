import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import authService from '../services/authService';
import { AUTH_EXPIRED_EVENT, isSessionRejected } from '../services/api';
import { clearToken, readToken, saveToken } from '../services/tokenStorage';
import type { AuthResult, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** True when a saved session could not be verified because the server was unreachable. */
  unavailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  retry: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(() => readToken() !== null);
  const [unavailable, setUnavailable] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // Bumped on every login or logout so a slow session check can never overwrite a newer state.
  const sessionVersion = useRef(0);

  const logout = useCallback(() => {
    sessionVersion.current += 1;
    clearToken();
    setUser(null);
    setUnavailable(false);
  }, []);

  const accept = useCallback((result: AuthResult) => {
    sessionVersion.current += 1;
    saveToken(result.token);
    setUser(result.user);
    setUnavailable(false);
  }, []);

  const retry = useCallback(() => {
    setUnavailable(false);
    setLoading(true);
    setAttempt((n) => n + 1);
  }, []);

  useEffect(() => {
    if (readToken() === null) return;
    const version = sessionVersion.current;
    authService
      .me()
      .then((u) => {
        if (version === sessionVersion.current) setUser(u);
      })
      .catch((error: unknown) => {
        if (version !== sessionVersion.current) return;
        if (isSessionRejected(error)) {
          logout();
        } else {
          // Timeouts and 5xx responses do not prove the token is bad, so keep it and offer a retry.
          setUnavailable(true);
        }
      })
      .finally(() => setLoading(false));
  }, [logout, attempt]);

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

  const value = useMemo(
    () => ({ user, loading, unavailable, login, signup, logout, retry }),
    [user, loading, unavailable, login, signup, logout, retry],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export const TOKEN_KEY = 'notes_app_token';

/**
 * Storage can be unavailable (private mode, blocked cookies, quota errors).
 * These helpers never throw, so the app keeps working with an in-memory session.
 */
export const readToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const saveToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* session lives in memory only */
  }
};

export const clearToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nothing to clear */
  }
};

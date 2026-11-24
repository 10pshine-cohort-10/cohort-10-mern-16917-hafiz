export const TOKEN_KEY = 'notes_app_token';

/**
 * Storage can be unavailable (private mode, blocked cookies, quota errors). When it is, the
 * token is kept in memory for the current page session so authenticated requests keep working.
 * While storage works it stays the single source of truth, so a logout in another tab is respected.
 */
let memoryToken: string | null = null;
let storageWritable = true;

export const readToken = (): string | null => {
  if (!storageWritable) return memoryToken;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return memoryToken;
  }
};

export const saveToken = (token: string): void => {
  memoryToken = token;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    storageWritable = true;
  } catch {
    storageWritable = false;
  }
};

export const clearToken = (): void => {
  memoryToken = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* the in-memory copy is already cleared */
  }
};

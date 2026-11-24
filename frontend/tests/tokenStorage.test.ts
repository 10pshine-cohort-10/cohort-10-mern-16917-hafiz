import { TOKEN_KEY, clearToken, readToken, saveToken } from '../src/services/tokenStorage';

const block = (method: 'getItem' | 'setItem' | 'removeItem') =>
  jest.spyOn(Storage.prototype, method).mockImplementation(() => {
    throw new Error('storage blocked');
  });

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
    saveToken('reset'); // puts the module back into its "storage works" state
    clearToken();
  });

  test('stores and reads the token through localStorage', () => {
    saveToken('abc');
    expect(localStorage.getItem(TOKEN_KEY)).toBe('abc');
    expect(readToken()).toBe('abc');
  });

  test('keeps the token in memory when writing to storage fails', () => {
    block('setItem');
    saveToken('abc');
    expect(readToken()).toBe('abc');
  });

  test('keeps the token in memory when reading from storage fails', () => {
    saveToken('abc');
    block('getItem');
    expect(readToken()).toBe('abc');
  });

  test('clearToken removes the token everywhere', () => {
    saveToken('abc');
    clearToken();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(readToken()).toBeNull();
  });

  test('clearToken clears the in-memory copy even when storage removal fails', () => {
    block('setItem');
    saveToken('abc');
    block('removeItem');
    clearToken();
    expect(readToken()).toBeNull();
  });

  test('respects a logout done in another tab while storage works', () => {
    saveToken('abc');
    localStorage.removeItem(TOKEN_KEY);
    expect(readToken()).toBeNull();
  });
});

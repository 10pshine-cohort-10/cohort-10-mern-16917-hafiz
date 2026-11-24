import { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import authService from '../src/services/authService';
import { TOKEN_KEY } from '../src/services/tokenStorage';
import type { User } from '../src/types';

jest.mock('../src/services/authService');

const mocked = authService as jest.Mocked<typeof authService>;
const user: User = { id: 1, name: 'Hafiz', email: 'h@example.com', createdAt: new Date().toISOString() };

const httpError = (status: number): AxiosError =>
  new AxiosError('request failed', 'ERR_BAD_RESPONSE', undefined, undefined, { status } as AxiosResponse);

function Probe() {
  const { user: current, loading, unavailable, login, logout, retry } = useAuth();
  const state = loading ? 'loading' : unavailable ? 'unavailable' : current ? `hello ${current.name}` : 'anonymous';
  return (
    <div>
      <p>{state}</p>
      <button type="button" onClick={() => void login('h@example.com', 'Password123')}>
        sign in
      </button>
      <button type="button" onClick={logout}>
        sign out
      </button>
      <button type="button" onClick={retry}>
        retry
      </button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  test('starts anonymous when there is no saved token', () => {
    renderProbe();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
    expect(mocked.me).not.toHaveBeenCalled();
  });

  test('restores the session from a saved token', () => {
    localStorage.setItem(TOKEN_KEY, 'saved-token');
    mocked.me.mockResolvedValue(user);
    renderProbe();
    return screen.findByText('hello Hafiz').then((el) => expect(el).toBeInTheDocument());
  });

  test('drops a saved token the server rejects with 401', () => {
    localStorage.setItem(TOKEN_KEY, 'bad-token');
    mocked.me.mockRejectedValue(httpError(401));
    renderProbe();
    return screen.findByText('anonymous').then(() => {
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
  });

  test('keeps the token and offers a retry when the server is unavailable', () => {
    localStorage.setItem(TOKEN_KEY, 'good-token');
    mocked.me.mockRejectedValueOnce(httpError(503)).mockResolvedValueOnce(user);
    renderProbe();
    return screen
      .findByText('unavailable')
      .then(() => {
        expect(localStorage.getItem(TOKEN_KEY)).toBe('good-token');
        return userEvent.click(screen.getByRole('button', { name: /retry/i }));
      })
      .then(() => screen.findByText('hello Hafiz'))
      .then((el) => expect(el).toBeInTheDocument());
  });

  test('a slow session check cannot undo a logout', () => {
    localStorage.setItem(TOKEN_KEY, 'saved-token');
    let resolveMe: (value: User) => void = () => undefined;
    mocked.me.mockReturnValue(
      new Promise<User>((resolve) => {
        resolveMe = resolve;
      }),
    );
    renderProbe();
    return userEvent
      .click(screen.getByRole('button', { name: /sign out/i }))
      .then(() => {
        resolveMe(user);
        return waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument());
      })
      .then(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
  });

  test('login stores the token and logout clears it', () => {
    mocked.login.mockResolvedValue({ user, token: 'new-token' });
    renderProbe();
    return userEvent
      .click(screen.getByRole('button', { name: /sign in/i }))
      .then(() => screen.findByText('hello Hafiz'))
      .then(() => {
        expect(localStorage.getItem(TOKEN_KEY)).toBe('new-token');
        return userEvent.click(screen.getByRole('button', { name: /sign out/i }));
      })
      .then(() => waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument()))
      .then(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
  });

  test('keeps working when storage reads throw', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage blocked');
    });
    renderProbe();
    expect(screen.getByText('anonymous')).toBeInTheDocument();
  });

  test('logout clears the in-memory session even when storage removal throws', () => {
    mocked.login.mockResolvedValue({ user, token: 'new-token' });
    renderProbe();
    return userEvent
      .click(screen.getByRole('button', { name: /sign in/i }))
      .then(() => screen.findByText('hello Hafiz'))
      .then(() => {
        jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
          throw new Error('storage blocked');
        });
        return userEvent.click(screen.getByRole('button', { name: /sign out/i }));
      })
      .then(() => waitFor(() => expect(screen.getByText('anonymous')).toBeInTheDocument()));
  });
});

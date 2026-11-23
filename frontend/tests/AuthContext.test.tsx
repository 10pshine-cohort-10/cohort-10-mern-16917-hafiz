import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import authService from '../src/services/authService';
import { TOKEN_KEY } from '../src/services/api';
import type { User } from '../src/types';

jest.mock('../src/services/authService');

const mocked = authService as jest.Mocked<typeof authService>;
const user: User = { id: 1, name: 'Hafiz', email: 'h@example.com', createdAt: new Date().toISOString() };

function Probe() {
  const { user: current, loading, login, logout } = useAuth();
  return (
    <div>
      <p>{loading ? 'loading' : current ? `hello ${current.name}` : 'anonymous'}</p>
      <button type="button" onClick={() => void login('h@example.com', 'Password123')}>
        sign in
      </button>
      <button type="button" onClick={logout}>
        sign out
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

  test('drops an invalid saved token', () => {
    localStorage.setItem(TOKEN_KEY, 'bad-token');
    mocked.me.mockRejectedValue(new Error('401'));
    renderProbe();
    return screen.findByText('anonymous').then(() => {
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    });
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
});

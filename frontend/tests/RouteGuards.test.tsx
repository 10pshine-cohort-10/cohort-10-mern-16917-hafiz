import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import { ProtectedRoute, PublicRoute } from '../src/components/RouteGuards';
import type { User } from '../src/types';

const user: User = { id: 1, name: 'Hafiz', email: 'h@example.com', createdAt: new Date().toISOString() };

const renderAt = (path: string, current: User | null, loading = false) =>
  render(
    <AuthContext.Provider
      value={{ user: current, loading, login: jest.fn(), signup: jest.fn(), logout: jest.fn() }}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<p>Login page</p>} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<p>Private home</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );

describe('route guards', () => {
  test('redirects a visitor from a private page to login', () => {
    renderAt('/', null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  test('lets a signed-in user see private pages', () => {
    renderAt('/', user);
    expect(screen.getByText('Private home')).toBeInTheDocument();
  });

  test('sends a signed-in user away from the login page', () => {
    renderAt('/login', user);
    expect(screen.getByText('Private home')).toBeInTheDocument();
  });

  test('shows a loader while the session is being restored', () => {
    renderAt('/', null, true);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import Login from '../src/pages/Login';

const renderLogin = (login = jest.fn().mockResolvedValue(undefined)) => {
  render(
    <ThemeProvider>
      <ToastProvider>
        <AuthContext.Provider value={{ user: null, loading: false, login, signup: jest.fn(), logout: jest.fn(), unavailable: false, retry: jest.fn() }}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </ThemeProvider>,
  );
  return login;
};

const submit = () => userEvent.click(screen.getByRole('button', { name: /^log in$/i }));

describe('Login page', () => {
  test('shows validation errors and does not submit empty fields', () => {
    const login = renderLogin();
    return submit().then(() => {
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(login).not.toHaveBeenCalled();
    });
  });

  test('exposes validation errors to assistive technology', () => {
    renderLogin();
    return submit().then(() => {
      const email = screen.getByLabelText(/email/i);
      expect(email).toHaveAttribute('aria-invalid', 'true');
      expect(email).toHaveAccessibleDescription(/enter a valid email/i);
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test('submits valid credentials', () => {
    const login = renderLogin();
    return userEvent
      .type(screen.getByLabelText(/email/i), 'hafiz@example.com')
      .then(() => userEvent.type(screen.getByLabelText(/password/i), 'Password123'))
      .then(submit)
      .then(() => waitFor(() => expect(login).toHaveBeenCalledWith('hafiz@example.com', 'Password123')));
  });

  test('shows an error toast when login fails', () => {
    renderLogin(jest.fn().mockRejectedValue(new Error('boom')));
    return userEvent
      .type(screen.getByLabelText(/email/i), 'hafiz@example.com')
      .then(() => userEvent.type(screen.getByLabelText(/password/i), 'Password123'))
      .then(submit)
      .then(() => screen.findByText(/could not log in/i))
      .then((toast) => expect(toast).toBeInTheDocument());
  });
});

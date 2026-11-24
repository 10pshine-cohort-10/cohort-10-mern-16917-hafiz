import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import Signup from '../src/pages/Signup';

const renderSignup = (signup = jest.fn().mockResolvedValue(undefined)) => {
  render(
    <ThemeProvider>
      <ToastProvider>
        <AuthContext.Provider value={{ user: null, loading: false, login: jest.fn(), signup, logout: jest.fn(), unavailable: false, retry: jest.fn() }}>
          <MemoryRouter>
            <Signup />
          </MemoryRouter>
        </AuthContext.Provider>
      </ToastProvider>
    </ThemeProvider>,
  );
  return signup;
};

const fill = (name: string, email: string, password: string, confirm: string) =>
  userEvent
    .type(screen.getByLabelText(/full name/i), name)
    .then(() => userEvent.type(screen.getByLabelText(/^email/i), email))
    .then(() => userEvent.type(screen.getByLabelText(/^password/i), password))
    .then(() => userEvent.type(screen.getByLabelText(/confirm password/i), confirm))
    .then(() => userEvent.click(screen.getByRole('button', { name: /create account/i })));

describe('Signup page', () => {
  test('validates every field before submitting', () => {
    const signup = renderSignup();
    return userEvent.click(screen.getByRole('button', { name: /create account/i })).then(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/enter a valid email/i)).toBeInTheDocument();
      expect(screen.getByText(/8\+ characters/i)).toBeInTheDocument();
      expect(signup).not.toHaveBeenCalled();
    });
  });

  test('exposes validation errors to assistive technology', () => {
    renderSignup();
    return userEvent.click(screen.getByRole('button', { name: /create account/i })).then(() => {
      [/full name/i, /^email/i, /^password/i].forEach((label) => {
        expect(screen.getByLabelText(label)).toHaveAttribute('aria-invalid', 'true');
      });
      expect(screen.getByLabelText(/full name/i)).toHaveAccessibleDescription(/at least 2 characters/i);
    });
  });

  test('rejects mismatched passwords', () => {
    const signup = renderSignup();
    return fill('Hafiz', 'h@example.com', 'Password123', 'Password124').then(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(signup).not.toHaveBeenCalled();
    });
  });

  test('submits a valid form', () => {
    const signup = renderSignup();
    return fill('Hafiz', 'h@example.com', 'Password123', 'Password123').then(() =>
      waitFor(() => expect(signup).toHaveBeenCalledWith('Hafiz', 'h@example.com', 'Password123')),
    );
  });

  test('shows the server error message when signup fails', () => {
    renderSignup(jest.fn().mockRejectedValue(new Error('boom')));
    return fill('Hafiz', 'h@example.com', 'Password123', 'Password123')
      .then(() => screen.findByText(/could not create your account/i))
      .then((toast) => expect(toast).toBeInTheDocument());
  });

  test('shows the password strength while typing', () => {
    renderSignup();
    return userEvent.type(screen.getByLabelText(/^password/i), 'Str0ng!Passw0rd').then(() => {
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });
  });
});

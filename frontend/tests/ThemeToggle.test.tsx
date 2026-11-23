import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ThemeToggle } from '../src/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => localStorage.clear());

  test('switches between light and dark and persists the choice', async () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>,
    );
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');

    await userEvent.click(screen.getByRole('button', { name: /switch to dark mode/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('notes_app_theme')).toBe('dark');

    await userEvent.click(screen.getByRole('button', { name: /switch to light mode/i }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});

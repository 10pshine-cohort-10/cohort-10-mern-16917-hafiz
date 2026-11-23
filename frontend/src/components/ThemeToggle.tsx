import { useTheme } from '../context/ThemeContext';
import { Icon } from './Icon';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const next = theme === 'light' ? 'dark' : 'light';

  return (
    <button
      type="button"
      className="icon-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
    >
      <Icon name={theme === 'light' ? 'moon' : 'sun'} />
    </button>
  );
}

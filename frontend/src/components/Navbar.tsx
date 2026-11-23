import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { initials } from '../utils/format';
import { Icon } from './Icon';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="note" size={20} />
          </span>
          <span>Notely</span>
        </Link>
        <nav className="nav-actions">
          <ThemeToggle />
          {user && (
            <>
              <span className="avatar avatar-sm" title={user.name}>
                {initials(user.name)}
              </span>
              <button type="button" className="icon-btn" onClick={logout} aria-label="Log out" title="Log out">
                <Icon name="logout" />
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

export function ProtectedRoute() {
  const { user, loading, unavailable, retry, logout } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Loading your workspace…" />;

  if (!user && unavailable) {
    return (
      <main className="empty">
        <h1>Cannot reach the server</h1>
        <p className="muted">We could not verify your session. Check your connection and try again.</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
          <button type="button" className="btn btn-primary" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

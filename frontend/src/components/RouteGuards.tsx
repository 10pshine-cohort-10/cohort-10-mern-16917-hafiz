import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner label="Loading your workspace…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

export function PublicRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (user) return <Navigate to="/" replace />;
  return <Outlet />;
}

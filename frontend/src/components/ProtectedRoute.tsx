import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string;
}

export default function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('user_role');

  if (!token) {
    // No token, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Role mismatch, redirect to home page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

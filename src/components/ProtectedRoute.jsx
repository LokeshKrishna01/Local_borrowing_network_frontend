import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, allowPending = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Pending user can only see pending screen
  if (user.status === 'pending' && !allowPending) {
    return <Navigate to="/pending" replace />;
  }

  // Banned user
  if (user.status === 'banned') {
    return <Navigate to="/login" replace />;
  }

  // Admin-only route
  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

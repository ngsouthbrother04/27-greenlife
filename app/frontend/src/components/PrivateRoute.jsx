import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Loader2 } from 'lucide-react';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * 
 * Props:
 * - allowedRoles: Array of roles allowed to access the route (e.g. ['admin', 'customer'])
 * 
 * Logic:
 * 1. If loading, show spinner
 * 2. If not authenticated -> redirect to login (save location)
 * 3. If authenticated but role not allowed -> redirect to home or forbidden page
 * 4. If all good -> render Outlet (child routes)
 */
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#405741]" />
      </div>
    );
  }

  // Check if user is logged in
  if (!isAuthenticated()) {
    // Redirect to login, passing the current location state to redirect back after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role permission if allowedRoles is specified
  if (allowedRoles && (!user?.role || !allowedRoles.includes(user.role))) {
    // User logged in but doesn't have permission (e.g. user trying to access admin)
    return <Navigate to="/" replace />;
  }

  // Authorized
  return <Outlet />;
};

export default PrivateRoute;

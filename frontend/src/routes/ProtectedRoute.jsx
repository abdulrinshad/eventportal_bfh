import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Loader from '../components/Loader';

/**
 * ProtectedRoute - Guards routes that require authentication.
 * Redirects unauthenticated users to /login with return-to URL.
 * Ready to integrate with Django REST Framework JWT tokens.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin has access to everything
  if (user.role === 'ADMIN') {
    return children;
  }

  // If page restricts by role, check if user has access
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard
    if (user.role === 'ORGANIZER') {
      return <Navigate to="/organizer/dashboard" replace />;
    } else {
      if (allowedRoles.includes('ORGANIZER')) {
        return <Navigate to="/student/dashboard" state={{ toastMessage: "You must receive administrator approval before accessing the Organizer Panel." }} replace />;
      }
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

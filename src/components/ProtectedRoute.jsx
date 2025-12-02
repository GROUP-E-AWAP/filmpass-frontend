import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../authContext.jsx";

/**
 * Wrapper component that protects pages requiring authentication.
 *
 * Props:
 *  - children: the protected UI component
 *  - roles (optional): array of allowed roles, e.g. ["admin", "employee"]
 *
 * Behavior:
 *  1) If the user is not logged in → redirect to /login
 *  2) If roles are provided and user role isn't allowed → redirect to home
 *  3) Otherwise → render the protected children
 */
export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  // If user is not authenticated, send them to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If route requires specific roles, check permissions
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // All good → allow access
  return children;
}

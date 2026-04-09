import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getDefaultRouteForRole, type UserRole } from "@/lib/auth";

interface Props {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const location = useLocation();
  const { loading, session, role, mustChangePassword } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading secure workspace...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (mustChangePassword && location.pathname !== "/settings") {
    return <Navigate to="/settings" replace state={{ from: location.pathname, forcePasswordReset: true }} />;
  }

  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

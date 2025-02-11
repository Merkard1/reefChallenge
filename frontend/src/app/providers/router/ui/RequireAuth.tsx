import React, { useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRouteLogin, getRouteProducts } from "@/shared/const/router";
import { useUser } from "@/entities/User";
import { UserRole } from "@/entities/User";

interface RequireAuthProps {
  children: JSX.Element;
  roles?: UserRole[];
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const auth = useUser();
  const location = useLocation();

  // If no authenticated user, redirect to login.
  if (!auth) {
    return <Navigate to={getRouteLogin()} state={{ from: location }} replace />;
  }

  // If roles are required, check them.
  const hasRequiredRoles = useMemo(() => {
    if (!roles) return true;
    if (!auth.roles) return false;
    return roles.some((requiredRole) => auth.roles.includes(requiredRole));
  }, [roles, auth]);

  // If user doesn't have the required roles, redirect to a fallback (products)
  if (!hasRequiredRoles) {
    return (
      <Navigate to={getRouteProducts()} state={{ from: location }} replace />
    );
  }

  return children;
};

export default RequireAuth;

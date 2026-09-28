import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../contexts";
import { ROUTES } from "./routePaths";

/** Requires a session; otherwise redirect to /login (remembering the target). */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }
  return <Outlet />;
}

/** Only for signed-out users; signed-in users go to their dashboard. */
export function RequireGuest() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to={ROUTES.dashboard} replace />;
  return <Outlet />;
}

/** Restrict a branch to a single role. */
export function RequireRole({ role }) {
  const { user } = useAuth();
  const current = String(user?.role || "").toLowerCase();
  if (current !== role) return <Navigate to={ROUTES.dashboard} replace />;
  return <Outlet />;
}

import { Navigate } from "react-router-dom";
import { useAuthentication } from "../context/AuthContext";

const roleRankByName = {
  player: 1,
  admin: 2,
  super_admin: 3,
};

export function ProtectedPage({ minimumRole = "player", children }) {
  const { supabaseSession, authenticatedProfile, isAuthLoading } = useAuthentication();

  if (isAuthLoading) {
    return <div className="p-8 text-center text-slate-600">Loading authentication...</div>;
  }

  if (!supabaseSession) {
    return <Navigate to="/login" replace />;
  }

  const currentRoleRank = roleRankByName[authenticatedProfile?.role] || 0;
  const minimumRoleRank = roleRankByName[minimumRole] || 1;
  if (currentRoleRank < minimumRoleRank) {
    return <Navigate to="/" replace />;
  }

  return children;
}

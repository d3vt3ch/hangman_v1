import { Link } from "react-router-dom";
import { useAuthentication } from "../context/AuthContext";

export function AppLayout({ children }) {
  const { authenticatedProfile, supabaseSession, logoutCurrentUser } = useAuthentication();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-slate-800">Hangman Pro</h1>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/" className="rounded px-3 py-1 hover:bg-slate-100">
              Game
            </Link>
            <Link to="/leaderboard" className="rounded px-3 py-1 hover:bg-slate-100">
              Leaderboard
            </Link>
            {(authenticatedProfile?.role === "admin" || authenticatedProfile?.role === "super_admin") && (
              <Link to="/admin" className="rounded px-3 py-1 hover:bg-slate-100">
                Admin
              </Link>
            )}
            {authenticatedProfile?.role === "super_admin" && (
              <Link to="/super-admin" className="rounded px-3 py-1 hover:bg-slate-100">
                Super Admin
              </Link>
            )}
            {!supabaseSession ? (
              <Link to="/login" className="rounded bg-slate-900 px-3 py-1 text-white">
                Login
              </Link>
            ) : (
              <button
                type="button"
                className="rounded bg-slate-900 px-3 py-1 text-white"
                onClick={logoutCurrentUser}
              >
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl p-4">{children}</main>
    </div>
  );
}

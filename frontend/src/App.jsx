import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedPage } from "./components/ProtectedPage";
import { useAuthentication } from "./context/AuthContext";
import { AdminPage } from "./pages/AdminPage";
import { GamePage } from "./pages/GamePage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { LoginPage } from "./pages/LoginPage";
import { SuperAdminPage } from "./pages/SuperAdminPage";

function App() {
  const { supabaseSession } = useAuthentication();

  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedPage minimumRole="player">
              <GamePage />
            </ProtectedPage>
          }
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedPage minimumRole="admin">
              <AdminPage />
            </ProtectedPage>
          }
        />
        <Route
          path="/super-admin"
          element={
            <ProtectedPage minimumRole="super_admin">
              <SuperAdminPage />
            </ProtectedPage>
          }
        />
        <Route path="*" element={<Navigate to={supabaseSession ? "/" : "/login"} replace />} />
      </Routes>
    </AppLayout>
  );
}

export default App;

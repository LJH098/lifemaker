import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useApp } from "./context/AppContext";
import { AuthPage } from "./pages/AuthPage";
import { AvatarPage } from "./pages/AvatarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PlazaPage } from "./pages/PlazaPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuestsPage } from "./pages/QuestsPage";
import { RoomPage, RoomSettingsPage } from "./pages/RoomPage";

function ProtectedRoute() {
  const { isAuthenticated, loadingSession } = useApp();

  if (loadingSession) {
    return <div className="grid min-h-screen place-items-center bg-night text-slate-200">세션을 불러오는 중입니다...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute() {
  const { isAuthenticated, loadingSession } = useApp();

  if (loadingSession) {
    return <div className="grid min-h-screen place-items-center bg-night text-slate-200">세션을 불러오는 중입니다...</div>;
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
}

function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
      </Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/ai-quests" element={<Navigate to="/quests" replace />} />
          <Route path="/plaza" element={<PlazaPage />} />
          <Route path="/room" element={<RoomPage />} />
          <Route path="/room/settings" element={<RoomSettingsPage />} />
          <Route path="/avatar" element={<AvatarPage />} />
          <Route path="/shop" element={<Navigate to="/avatar" replace />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

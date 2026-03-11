import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AiQuestPage } from "./pages/AiQuestPage";
import { AuthPage } from "./pages/AuthPage";
import { AvatarPage } from "./pages/AvatarPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PlazaPage } from "./pages/PlazaPage";
import { ProfilePage } from "./pages/ProfilePage";
import { QuestsPage } from "./pages/QuestsPage";
import { RoomPage } from "./pages/RoomPage";
import { ShopPage } from "./pages/ShopPage";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/signup" element={<AuthPage mode="signup" />} />
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/quests" element={<QuestsPage />} />
        <Route path="/ai-quests" element={<AiQuestPage />} />
        <Route path="/plaza" element={<PlazaPage />} />
        <Route path="/room" element={<RoomPage />} />
        <Route path="/avatar" element={<AvatarPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

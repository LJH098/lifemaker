import { Bell, Coins, Home, LogOut, ScrollText, Sparkles, User, Users } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { AvatarPreview3D } from "./AvatarPreview3D";
import { useApp } from "../context/AppContext";

const navItems = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Quest Hub", path: "/quests", icon: ScrollText },
  { label: "Plaza", path: "/plaza", icon: Users },
  { label: "My Room", path: "/room", icon: Sparkles },
  { label: "Avatar Studio", path: "/avatar", icon: User },
  { label: "Profile", path: "/profile", icon: User }
];

export function Layout() {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const currentLevelFloor = (user.level - 1) * 300;
  const expProgress = Math.min(((user.exp - currentLevelFloor) / 300) * 100, 100);
  const statLabels: Record<string, string> = {
    focus: "집중력",
    knowledge: "지식",
    health: "체력",
    social: "소셜",
    discipline: "꾸준함"
  };
  const primaryStatEntry = Object.entries(user.stats).sort(([, left], [, right]) => right - left)[0];
  const primaryStatLabel = primaryStatEntry ? statLabels[primaryStatEntry[0]] ?? primaryStatEntry[0] : "집중력";

  return (
    <div className="min-h-screen bg-night text-ink">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-4 border-b border-white/50 liquid-panel-deep px-4 py-4 backdrop-blur lg:px-8">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3 lg:gap-6">
          <div className="min-w-[180px]">
            <p className="font-display text-2xl font-bold text-ink">인생게임</p>
            <p className="mt-1 text-sm text-slate-600">Life RPG Control Panel</p>
          </div>
          <nav className="flex flex-1 flex-wrap gap-2">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm transition ${
                    isActive ? "bg-accent/15 text-ink shadow-glow" : "bg-white/20 text-slate-600 hover:bg-white/35 hover:text-ink"
                  }`
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-2xl bg-card p-3 text-slate-600 transition hover:text-ink">
            <Bell size={18} />
          </button>
          <button
            className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-slate-600 transition hover:text-ink"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-89px)] xl:grid-cols-[360px_1fr]">
        <aside className="order-2 grid-panel border-b border-white/50 liquid-panel-soft p-5 backdrop-blur xl:order-none xl:border-b-0 xl:border-r">
          <div className="rounded-[30px] liquid-panel p-5">
            <div className="rounded-[28px] liquid-panel-soft p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-[156px] w-[112px] shrink-0 items-start justify-center overflow-visible rounded-[24px] bg-white/30 px-1 pt-3">
                  <div className="origin-top scale-[0.31]">
                    <AvatarPreview3D
                      nickname={user.nickname}
                      hair={user.avatar.hair}
                      clothes={user.avatar.clothes}
                      accessories={user.avatar.accessories}
                      skinColor={user.avatar.colors.skin}
                      hairColor={user.avatar.colors.hair}
                      clothesColor={user.avatar.colors.clothes}
                      showCaption={false}
                      spinDurationSeconds={28}
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-1 pt-1">
                  <p className="text-xl font-semibold text-ink">{user.nickname}</p>
                  <p className="mt-1 text-sm text-sky-500">Lv.{user.level} · {primaryStatLabel} 중심</p>
                  <p className="mt-1 text-sm text-slate-600">다음 레벨까지 {Math.max(currentLevelFloor + 300 - user.exp, 0)} EXP</p>
                  <div className="mt-3 h-2 rounded-full bg-white/60">
                    <div className="h-2 rounded-full bg-accent" style={{ width: `${expProgress}%` }} />
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-[#d6a63a]">
                    <Coins size={14} />
                    <span>{user.coins} 보유</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                {Object.entries(user.stats).map(([key, value]) => (
                  <div key={key} className="rounded-2xl liquid-chip px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">{statLabels[key] ?? key}</span>
                      <span className="font-semibold text-ink">{value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-white/60">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="order-1 p-4 lg:p-8 xl:order-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

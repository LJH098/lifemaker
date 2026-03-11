import { Bell, Coins, Home, ScrollText, Sparkles, Store, User, Users, WandSparkles } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { mockUser } from "../data/mockData";

const navItems = [
  { label: "Dashboard", path: "/", icon: Home },
  { label: "Quests", path: "/quests", icon: ScrollText },
  { label: "AI Goal Analysis", path: "/ai-quests", icon: WandSparkles },
  { label: "Plaza", path: "/plaza", icon: Users },
  { label: "My Room", path: "/room", icon: Sparkles },
  { label: "Avatar", path: "/avatar", icon: User },
  { label: "Shop", path: "/shop", icon: Store },
  { label: "Profile", path: "/profile", icon: User }
];

export function Layout() {
  const expProgress = Math.min((mockUser.exp / 800) * 100, 100);

  return (
    <div className="min-h-screen bg-night text-ink">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="grid-panel border-r border-slate-800 bg-slate-950/70 p-5 backdrop-blur">
          <div>
            <p className="font-display text-2xl font-bold text-white">인생게임</p>
            <p className="mt-1 text-sm text-slate-400">Life RPG Control Panel</p>
          </div>
          <nav className="mt-8 space-y-2">
            {navItems.map(({ label, path, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    isActive ? "bg-accent/15 text-white shadow-glow" : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex min-w-[220px] flex-1 items-center gap-4 rounded-2xl bg-card px-4 py-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-lg font-bold text-accent">
                {mockUser.nickname.slice(0, 1)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{mockUser.nickname}</span>
                  <span>Lv. {mockUser.level}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-700">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${expProgress}%` }} />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-3 text-reward">
              <Coins size={18} />
              <span className="font-semibold">{mockUser.coins}</span>
            </div>
            <button className="rounded-2xl bg-card p-3 text-slate-300 transition hover:text-white">
              <Bell size={18} />
            </button>
          </header>
          <main className="flex-1 p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

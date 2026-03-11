import { useApp } from "../context/AppContext";

export function ProfilePage() {
  const { user, quests } = useApp();

  if (!user) {
    return null;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-3xl text-ink">{user.nickname}</p>
        <p className="mt-2 text-slate-600">{user.email}</p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl liquid-panel-soft p-4">Level {user.level}</div>
          <div className="rounded-2xl liquid-panel-soft p-4">{user.coins} Coins</div>
          <div className="rounded-2xl liquid-panel-soft p-4">{user.exp} EXP</div>
          <div className="rounded-2xl liquid-panel-soft p-4">총 퀘스트 수 {quests.length}개</div>
        </div>
      </section>
      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-2xl text-ink">Stat Breakdown</p>
        <div className="mt-5 space-y-4">
          {Object.entries(user.stats).map(([key, value]) => (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-white/60">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

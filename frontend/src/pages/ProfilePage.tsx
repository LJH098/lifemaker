import { mockUser } from "../data/mockData";

export function ProfilePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-3xl text-white">{mockUser.nickname}</p>
        <p className="mt-2 text-slate-400">{mockUser.email}</p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl bg-slate-900/80 p-4">Level {mockUser.level}</div>
          <div className="rounded-2xl bg-slate-900/80 p-4">{mockUser.coins} Coins</div>
          <div className="rounded-2xl bg-slate-900/80 p-4">{mockUser.exp} EXP</div>
        </div>
      </section>
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-2xl text-white">Stat Breakdown</p>
        <div className="mt-5 space-y-4">
          {Object.entries(mockUser.stats).map(([key, value]) => (
            <div key={key}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="capitalize">{key}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-accent" style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { mockUser } from "../data/mockData";

export function AvatarPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-3xl text-white">Avatar Forge</p>
        <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[28px] bg-slate-900/80">
          <div className="text-center">
            <div className="mx-auto h-28 w-28 rounded-full" style={{ backgroundColor: mockUser.avatar.colors.hair }} />
            <div className="mx-auto mt-4 h-40 w-28 rounded-t-[40px]" style={{ backgroundColor: mockUser.avatar.colors.clothes }} />
          </div>
        </div>
      </section>
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-2xl text-white">Customize</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {[
            ["Hair", mockUser.avatar.hair],
            ["Clothes", mockUser.avatar.clothes],
            ["Accessories", mockUser.avatar.accessories.join(", ")],
            ["Hair Color", mockUser.avatar.colors.hair]
          ].map(([label, value]) => (
            <div key={label} className="rounded-3xl bg-slate-900/80 p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-lg font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

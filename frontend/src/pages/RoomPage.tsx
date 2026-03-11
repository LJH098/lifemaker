export function RoomPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-3xl text-white">My Room</p>
        <p className="mt-2 text-slate-400">집중과 회복을 위한 개인 공간입니다. 친구를 초대하거나 공개 상태를 전환할 수 있습니다.</p>
        <div className="mt-6 grid min-h-[360px] place-items-center rounded-[28px] bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6">
          <div className="w-full max-w-xl rounded-[28px] border border-slate-700 bg-slate-900/70 p-6">
            <div className="flex items-end justify-between">
              <div className="h-28 w-20 rounded-t-[40px] bg-accent/30" />
              <div className="h-20 w-28 rounded-3xl bg-reward/20" />
              <div className="h-16 w-16 rounded-full bg-sky-400/20" />
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-24 w-24 rounded-[32px] bg-accent/20" />
              <div>
                <p className="text-xl font-semibold text-white">QuestRunner&apos;s Base</p>
                <p className="mt-2 text-sm text-slate-400">상태: Public / 친구 초대 가능 / 집중 모드 ON</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        <div className="rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="font-display text-xl text-white">방 설정</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="rounded-2xl bg-slate-900/80 p-4">공개 여부: Public</div>
            <div className="rounded-2xl bg-slate-900/80 p-4">초대 링크: 활성화</div>
            <div className="rounded-2xl bg-slate-900/80 p-4">방명록 채팅: 사용 가능</div>
          </div>
        </div>
        <div className="rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="font-display text-xl text-white">장식 슬롯</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {["Desk", "Lamp", "Poster", "Plant"].map((item) => (
              <div key={item} className="rounded-2xl bg-slate-900/80 p-4 text-center text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

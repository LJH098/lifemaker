import { ArrowLeft, Settings2 } from "lucide-react";
import { Link } from "react-router-dom";

const decorSlots = ["Desk", "Lamp", "Poster", "Plant"];
const recentVisitors = ["민서", "하준", "유나"];
const guestbookEntries = [
  { name: "민서", message: "방 분위기 너무 좋다. 집중 잘 될 것 같아.", time: "방금" },
  { name: "하준", message: "Desk Lamp 업그레이드하면 더 예쁠 듯.", time: "12분 전" }
];

export function RoomPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.28fr_0.72fr]">
      <section className="overflow-hidden rounded-[32px] liquid-panel">
        <div className="flex flex-wrap items-start justify-between gap-4 px-6 pt-6">
          <div>
            <p className="font-display text-3xl text-ink">My Room</p>
            <p className="mt-2 text-slate-600">집중과 회복을 위한 개인 공간입니다. 친구를 초대하거나 공개 상태를 전환할 수 있습니다.</p>
          </div>
          <Link
            to="/room/settings"
            className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
          >
            <Settings2 size={16} />
            방 설정 열기
          </Link>
        </div>
        <div className="mt-5 rounded-t-[30px] bg-[linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,255,255,0.08))] p-5">
          <div className="relative min-h-[500px] overflow-hidden rounded-[28px] border border-white/35 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.68),rgba(225,235,244,0.86)_42%,rgba(205,219,235,0.96)_100%)] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)]">
            <div className="absolute inset-x-0 bottom-0 h-32 bg-[linear-gradient(180deg,rgba(189,206,220,0)_0%,rgba(189,206,220,0.48)_35%,rgba(172,192,209,0.82)_100%)]" />
            <div className="absolute left-8 top-8 h-24 w-24 rounded-full bg-white/35 blur-2xl" />
            <div className="absolute right-10 top-12 h-20 w-20 rounded-full bg-sky-100/60 blur-xl" />

            <div className="relative flex h-full min-h-[420px] flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="rounded-2xl border border-white/45 bg-white/35 px-4 py-3 text-sm text-slate-600 backdrop-blur">
                  상태: Public / 친구 초대 가능 / 집중 모드 ON
                </div>
                <div className="rounded-2xl border border-white/45 bg-white/35 px-4 py-3 text-sm text-slate-600 backdrop-blur">
                  Rest bonus +12
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-3xl flex-1">
                <div className="absolute bottom-24 left-[5%] h-[8.5rem] w-[6.5rem] rounded-t-[48px] rounded-b-[20px] bg-[linear-gradient(180deg,rgba(171,208,234,0.95),rgba(137,179,211,0.96))] shadow-[0_18px_40px_rgba(105,139,171,0.18)]" />
                <div className="absolute bottom-24 left-[14%] h-20 w-8 rounded-full bg-white/55" />
                <div className="absolute bottom-24 left-[27%] h-[10.5rem] w-[13rem] rounded-[34px] bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(221,232,242,0.92))] shadow-[0_26px_50px_rgba(109,140,171,0.16)]" />
                <div className="absolute bottom-[14.5rem] left-[35%] h-4 w-28 rounded-full bg-slate-200/80" />
                <div className="absolute bottom-24 left-[60%] h-[7.5rem] w-[7.5rem] rounded-[34px] bg-[linear-gradient(180deg,rgba(255,242,205,0.9),rgba(237,214,151,0.92))] shadow-[0_18px_36px_rgba(191,164,95,0.18)]" />
                <div className="absolute bottom-[11rem] left-[67%] h-10 w-10 rounded-full bg-white/65" />
                <div className="absolute bottom-24 right-[5%] h-[9.5rem] w-[6.5rem] rounded-[30px] bg-[linear-gradient(180deg,rgba(220,229,242,0.96),rgba(181,197,220,0.96))] shadow-[0_18px_34px_rgba(123,144,171,0.18)]" />
                <div className="absolute bottom-[16rem] right-[7%] h-12 w-12 rounded-full bg-emerald-100/85 shadow-[0_10px_24px_rgba(132,181,160,0.22)]" />

                <div className="absolute bottom-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-[34px] bg-[linear-gradient(180deg,rgba(179,213,236,0.95),rgba(142,188,219,0.96))] shadow-[0_18px_32px_rgba(96,134,167,0.22)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-xl text-ink">Room Activity</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl liquid-panel-soft p-4">
              <p>최근 방문한 친구 {recentVisitors.length}명</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recentVisitors.map((name) => (
                  <span key={name} className="rounded-full border border-white/40 bg-white/35 px-3 py-1 text-xs text-slate-600">
                    {name}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl liquid-panel-soft p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-ink">방명록</p>
                <span className="text-xs text-slate-500">{guestbookEntries.length} entries</span>
              </div>
              <div className="mt-3 space-y-3">
                {guestbookEntries.map((entry) => (
                  <div key={`${entry.name}-${entry.time}`} className="rounded-2xl border border-white/35 bg-white/30 px-3 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-ink">{entry.name}</span>
                      <span className="text-xs text-slate-500">{entry.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{entry.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function RoomSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-[32px] liquid-panel p-6">
        <div>
          <p className="font-display text-3xl text-ink">Room Settings</p>
          <p className="mt-2 text-slate-600">방 공개 범위, 초대 링크, 장식 슬롯을 한 화면에서 조정합니다.</p>
        </div>
        <Link
          to="/room"
          className="inline-flex items-center gap-2 rounded-2xl bg-white/60 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white/80 hover:text-ink"
        >
          <ArrowLeft size={16} />
          마이룸으로 돌아가기
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="rounded-[32px] liquid-panel p-6">
            <p className="font-display text-xl text-ink">Room Snapshot</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <div className="rounded-2xl liquid-panel-soft p-4">공개 여부: Public</div>
              <div className="rounded-2xl liquid-panel-soft p-4">초대 링크: 활성화</div>
              <div className="rounded-2xl liquid-panel-soft p-4">집중 모드: ON</div>
            </div>
          </div>

          <div className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-xl text-ink">방 설정</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl liquid-panel-soft p-4">공개 여부: Public</div>
            <div className="rounded-2xl liquid-panel-soft p-4">초대 링크: 활성화</div>
            <div className="rounded-2xl liquid-panel-soft p-4">방명록 채팅: 사용 가능</div>
            <div className="rounded-2xl liquid-panel-soft p-4">집중 모드: ON</div>
          </div>
          </div>
        </section>

        <section className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-xl text-ink">장식 슬롯</p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {decorSlots.map((item) => (
              <div key={item} className="rounded-2xl liquid-panel-soft p-4 text-center text-sm text-slate-600">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

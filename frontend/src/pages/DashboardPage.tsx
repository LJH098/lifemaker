import { Target, Trophy, UserRound } from "lucide-react";
import { QuestCard } from "../components/QuestCard";
import { mockQuests, mockUser } from "../data/mockData";

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="grid-panel rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Today&apos;s Run</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">현실을 플레이하는 메인 대시보드</h1>
          <p className="mt-3 max-w-2xl text-slate-400">
            오늘의 퀘스트를 완료하고 레벨을 올리세요. 작은 행동이 곧 캐릭터 성장으로 연결됩니다.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-accent">
                <Target size={16} />
                오늘의 퀘스트
              </div>
              <p className="mt-3 text-3xl font-bold text-white">5</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-reward">
                <Trophy size={16} />
                연속 달성
              </div>
              <p className="mt-3 text-3xl font-bold text-white">12일</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-sky-400">
                <UserRound size={16} />
                온라인 파티
              </div>
              <p className="mt-3 text-3xl font-bold text-white">18명</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="font-display text-xl text-white">능력치 패널</p>
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
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-white">오늘의 퀘스트</h2>
            <button className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">전체 보기</button>
          </div>
          {mockQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-slate-800 bg-card p-6">
            <p className="font-display text-xl text-white">추천 퀘스트</p>
            <div className="mt-4 rounded-3xl bg-slate-900/80 p-4">
              <p className="text-sm text-accent">AI 추천</p>
              <p className="mt-2 text-lg font-semibold text-white">이력서 한 줄 개선하기</p>
              <p className="mt-2 text-sm text-slate-400">오늘 커리어 성장 확률을 높이는 짧은 퀘스트입니다.</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-card p-6">
            <p className="font-display text-xl text-white">레벨 보상</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">Lv.8 달성 시 300 코인 지급</div>
              <div className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">희귀 후드 아바타 스킨 해금</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

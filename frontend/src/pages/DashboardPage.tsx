import { useState } from "react";
import { Sparkles, Target, Trophy, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { QuestCard } from "../components/QuestCard";
import { useApp } from "../context/AppContext";

export function DashboardPage() {
  const { user, quests, completeQuest } = useApp();
  const [busyQuestId, setBusyQuestId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const inProgressQuests = quests.filter((quest) => quest.status !== "completed");
  const completedCount = quests.length - inProgressQuests.length;

  const handleComplete = async (questId: string) => {
    setBusyQuestId(questId);
    try {
      await completeQuest(questId);
    } finally {
      setBusyQuestId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.9fr]">
        <div className="grid-panel rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Today&apos;s Run</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white">현실을 플레이하는 메인 대시보드</h1>
          <p className="mt-3 max-w-2xl text-slate-400">오늘의 퀘스트를 완료하고 레벨을 올리세요. 작은 행동이 곧 캐릭터 성장으로 연결됩니다.</p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-accent">
                <Target size={16} />
                오늘의 퀘스트
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{inProgressQuests.length}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-reward">
                <Trophy size={16} />
                완료 실적
              </div>
              <p className="mt-3 text-3xl font-bold text-white">{completedCount}</p>
            </div>
            <div className="rounded-3xl bg-slate-900/80 p-4">
              <div className="flex items-center gap-2 text-sky-400">
                <UserRound size={16} />
                현재 레벨
              </div>
              <p className="mt-3 text-3xl font-bold text-white">Lv.{user.level}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-800 bg-card p-6">
          <p className="font-display text-xl text-white">능력치 패널</p>
          <div className="mt-5 space-y-4">
            {Object.entries(user.stats).map(([key, value]) => (
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
            <Link to="/quests" className="rounded-2xl border border-slate-700 px-4 py-2 text-sm text-slate-300">
              전체 보기
            </Link>
          </div>
          {inProgressQuests.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-700 bg-card p-6 text-slate-400">
              아직 진행 중인 퀘스트가 없습니다. AI Goal Analysis에서 새 퀘스트를 생성해보세요.
            </div>
          ) : (
            inProgressQuests.slice(0, 3).map((quest) => (
              <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} busy={busyQuestId === quest.id} />
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] border border-slate-800 bg-card p-6">
            <p className="font-display text-xl text-white">추천 퀘스트</p>
            <div className="mt-4 rounded-3xl bg-slate-900/80 p-4">
              <p className="text-sm text-accent">AI 추천</p>
              <p className="mt-2 text-lg font-semibold text-white">{inProgressQuests[0]?.title ?? "목표를 입력하고 첫 퀘스트를 생성해보세요."}</p>
              <p className="mt-2 text-sm text-slate-400">{inProgressQuests[0]?.description ?? "현재 상황 분석을 기반으로 AI가 바로 실천 가능한 퀘스트를 설계해줍니다."}</p>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-card p-6">
            <p className="font-display text-xl text-white">레벨 보상</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">현재 보유 코인: {user.coins}</div>
              <div className="rounded-2xl bg-slate-900/80 p-4 text-sm text-slate-300">다음 300 EXP 단위마다 레벨업이 발생합니다.</div>
            </div>
          </div>
          <div className="rounded-[32px] border border-slate-800 bg-card p-6">
            <p className="font-display text-xl text-white">빠른 액션</p>
            <div className="mt-4 grid gap-3">
              <Link to="/ai-quests" className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 font-semibold text-slate-950">
                <Sparkles size={18} />
                목표 분석하고 퀘스트 받기
              </Link>
              <Link to="/avatar" className="rounded-2xl border border-slate-700 px-4 py-3 text-sm text-slate-300">
                아바타 커스터마이즈
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

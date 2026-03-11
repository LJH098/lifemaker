import { Sparkles, Target, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { QuestCard } from "../components/QuestCard";
import { useApp } from "../context/AppContext";
import { useState } from "react";

export function DashboardPage() {
  const { user, quests, completeQuest } = useApp();
  const [busyQuestId, setBusyQuestId] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const inProgressQuests = quests.filter((quest) => quest.status !== "completed");
  const completedCount = quests.length - inProgressQuests.length;
  const currentLevelFloor = (user.level - 1) * 300;
  const expProgress = Math.min(((user.exp - currentLevelFloor) / 300) * 100, 100);
  const expToNextLevel = Math.max(currentLevelFloor + 300 - user.exp, 0);
  const statLabels: Record<string, string> = {
    focus: "집중력",
    knowledge: "지식",
    health: "체력",
    social: "소셜",
    discipline: "꾸준함"
  };
  const primaryStatEntry = Object.entries(user.stats).sort(([, left], [, right]) => right - left)[0];
  const primaryStatLabel = primaryStatEntry ? statLabels[primaryStatEntry[0]] ?? primaryStatEntry[0] : "집중력";
  const primaryStatValue = primaryStatEntry?.[1] ?? 0;

  const handleComplete = async (questId: string) => {
    setBusyQuestId(questId);
    try {
      await completeQuest(questId);
    } finally {
      setBusyQuestId(null);
    }
  };

  return (
    <div className="space-y-5">
      <section className="grid gap-5">
        <div className="grid-panel rounded-[36px] liquid-panel p-6 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.32em] text-accent">Today&apos;s Run</p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-600">
                오늘 해야 할 퀘스트와 성장 흐름을 한 번에 확인하세요. 작은 행동이 쌓일수록 캐릭터도 같이 성장합니다.
              </p>
            </div>
            <Link to="/quests" className="inline-flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 font-semibold text-[#35516a]">
              <Sparkles size={18} />
              목표 분석하고 퀘스트 받기
            </Link>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-accent">
                <Target size={16} />
                오늘의 퀘스트
              </div>
              <p className="mt-3 text-3xl font-bold text-ink">{inProgressQuests.length}</p>
              <p className="mt-2 text-sm text-slate-600">오늘 처리해야 할 활성 퀘스트 수</p>
            </div>
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-reward">
                <Trophy size={16} />
                완료 누적
              </div>
              <p className="mt-3 text-3xl font-bold text-ink">{completedCount}</p>
              <p className="mt-2 text-sm text-slate-600">지금까지 보상 획득한 퀘스트 수</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Today summary</p>
              <p className="mt-2 text-xl font-semibold text-ink">오늘은 {inProgressQuests.length}개의 퀘스트를 진행합니다.</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                완료 누적 {completedCount}개, 다음 레벨까지 {expToNextLevel} EXP가 남아 있습니다. 우선순위 퀘스트부터 차례대로 처리하면 됩니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[36px] liquid-panel p-6 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-ink">오늘의 퀘스트 보드</h2>
              <p className="mt-2 text-sm text-slate-600">핵심 퀘스트를 처리하고 바로 보상과 레벨업 흐름으로 연결하세요.</p>
            </div>
            <Link to="/quests" className="rounded-2xl border border-white/45 px-4 py-2 text-sm text-slate-600 transition hover:bg-white/35 hover:text-ink">
              전체 보기
            </Link>
          </div>

          <div className="mt-6 space-y-4 xl:min-h-[390px]">
            {inProgressQuests.length === 0 ? (
              <div className="grid min-h-[300px] rounded-[30px] liquid-panel-soft px-6 py-10">
                <div className="my-auto">
                  <p className="text-sm uppercase tracking-[0.28em] text-accent">Quest queue is empty</p>
                  <p className="mt-3 text-2xl font-semibold text-ink">아직 진행 중인 퀘스트가 없습니다.</p>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">AI 분석에서 새 퀘스트를 생성하면 이 보드에 오늘의 핵심 액션들이 채워집니다.</p>
                  <div className="mt-5">
                    <Link to="/quests" className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 font-semibold text-[#35516a]">
                      <Sparkles size={16} />
                      첫 퀘스트 만들기
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              inProgressQuests.slice(0, 3).map((quest) => (
                <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} busy={busyQuestId === quest.id} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-[36px] liquid-panel p-6 lg:p-7">
            <div className="flex items-center justify-between gap-3">
              <p className="font-display text-2xl text-ink">추천 퀘스트</p>
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">AI 추천</span>
            </div>
            <div className="mt-5 rounded-[30px] liquid-panel-soft p-5">
              <p className="text-lg font-semibold text-ink">{inProgressQuests[0]?.title ?? "목표를 입력하고 첫 퀘스트를 생성하세요."}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{inProgressQuests[0]?.description ?? "현재 상황 분석을 기반으로 AI가 바로 퀘스트를 설계해줍니다."}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

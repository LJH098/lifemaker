import { useState } from "react";
import { QuestCard } from "../components/QuestCard";
import { useApp } from "../context/AppContext";

export function QuestsPage() {
  const { quests, completeQuest } = useApp();
  const [busyQuestId, setBusyQuestId] = useState<string | null>(null);

  const handleComplete = async (questId: string) => {
    setBusyQuestId(questId);
    try {
      await completeQuest(questId);
    } finally {
      setBusyQuestId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-ink">Quest Log</h1>
        <p className="mt-2 text-slate-600">진행 중인 퀘스트를 관리하고 완료 버튼으로 성장 보상을 획득해 보세요.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {quests.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/45 bg-card p-6 text-slate-600">생성된 퀘스트가 없습니다. AI Goal Analysis에서 첫 퀘스트를 만들어 보세요.</div>
        ) : (
          quests.map((quest) => <QuestCard key={quest.id} quest={quest} onComplete={handleComplete} busy={busyQuestId === quest.id} />)
        )}
      </div>
    </div>
  );
}

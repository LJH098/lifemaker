import { QuestCard } from "../components/QuestCard";
import { mockQuests } from "../data/mockData";

export function QuestsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">Quest Log</h1>
        <p className="mt-2 text-slate-400">진행 중인 퀘스트를 관리하고 완료 버튼으로 성장 보상을 획득하세요.</p>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {mockQuests.map((quest) => (
          <QuestCard key={quest.id} quest={quest} />
        ))}
      </div>
    </div>
  );
}

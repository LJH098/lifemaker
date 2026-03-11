import { Coins, Sparkles } from "lucide-react";
import { Quest } from "../types";

type Props = {
  quest: Quest;
  onComplete?: (questId: string) => Promise<void> | void;
  busy?: boolean;
};

export function QuestCard({ quest, onComplete, busy = false }: Props) {
  const isCompleted = quest.status === "completed";

  return (
    <div className="rounded-3xl liquid-panel p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg text-ink">{quest.title}</p>
          <p className="mt-2 text-sm text-slate-600">{quest.description}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full liquid-chip px-3 py-1 text-slate-600">{quest.category}</span>
            <span className="rounded-full liquid-chip px-3 py-1 text-slate-600">{quest.difficulty}</span>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isCompleted ? "bg-accent/20 text-accent" : "liquid-chip text-slate-600"
          }`}
        >
          {isCompleted ? "completed" : "in progress"}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-white/60">
        <div className="h-2 rounded-full bg-accent" style={{ width: `${quest.progress}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          <span className="flex items-center gap-1 text-accent">
            <Sparkles size={14} />
            {quest.rewardExp} EXP
          </span>
          <span className="flex items-center gap-1 text-reward">
            <Coins size={14} />
            {quest.rewardCoin}
          </span>
        </div>
        <button
          disabled={isCompleted || busy}
          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-[#35516a] transition hover:bg-[#7daedf] disabled:cursor-not-allowed disabled:bg-white/60 disabled:text-slate-600"
          onClick={() => onComplete?.(quest.id)}
        >
          {isCompleted ? "Completed" : busy ? "처리 중..." : "Complete"}
        </button>
      </div>
    </div>
  );
}

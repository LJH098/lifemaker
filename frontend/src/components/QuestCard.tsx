import { Coins, Sparkles } from "lucide-react";
import { Quest } from "../types";

type Props = {
  quest: Quest;
};

export function QuestCard({ quest }: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-card p-5 shadow-glow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-display text-lg text-white">{quest.title}</p>
          <p className="mt-2 text-sm text-slate-400">{quest.description}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            quest.status === "completed" ? "bg-accent/20 text-accent" : "bg-slate-800 text-slate-300"
          }`}
        >
          {quest.status}
        </span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-700">
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
        <button className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-green-400">
          Complete
        </button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { WandSparkles } from "lucide-react";

export function AiQuestPage() {
  const [generated, setGenerated] = useState({
    questTitle: "알고리즘 기초 문제 1개 풀이",
    questDescription: "자료구조 기본 개념을 복습한 뒤 쉬운 난이도 문제를 1개 해결하세요.",
    rewardExp: 90,
    rewardCoins: 140
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <div className="flex items-center gap-3 text-accent">
          <WandSparkles size={20} />
          <span className="font-display text-2xl text-white">AI Goal Analysis</span>
        </div>
        <p className="mt-3 text-slate-400">목표와 현재 상황을 입력하면 OpenAI 기반으로 수행 가능한 퀘스트를 생성합니다.</p>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Goal</span>
            <textarea className="min-h-28 w-full rounded-3xl border border-slate-700 bg-slate-900 p-4 outline-none" defaultValue="소프트웨어 개발자로 취업하기" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-300">Current Situation</span>
            <textarea className="min-h-28 w-full rounded-3xl border border-slate-700 bg-slate-900 p-4 outline-none" defaultValue="알고리즘 실력이 약하고 꾸준한 루틴이 없다" />
          </label>
          <button
            className="rounded-2xl bg-accent px-5 py-3 font-semibold text-slate-950"
            onClick={() =>
              setGenerated({
                questTitle: "코딩 테스트 2문제 풀이 + 오답 정리",
                questDescription: "배열/해시 유형 문제 2개를 풀고 틀린 이유를 문장으로 정리하세요.",
                rewardExp: 110,
                rewardCoins: 170
              })
            }
          >
            퀘스트 생성하기
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-800 bg-card p-6">
        <p className="font-display text-2xl text-white">Generated Quest</p>
        <div className="mt-6 rounded-[28px] bg-slate-900/80 p-5">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">Quest Title</p>
          <p className="mt-2 text-2xl font-bold text-white">{generated.questTitle}</p>
          <p className="mt-4 text-sm uppercase tracking-[0.3em] text-slate-500">Description</p>
          <p className="mt-2 text-slate-300">{generated.questDescription}</p>
          <div className="mt-6 flex gap-3">
            <span className="rounded-full bg-accent/15 px-4 py-2 text-sm text-accent">{generated.rewardExp} EXP</span>
            <span className="rounded-full bg-reward/15 px-4 py-2 text-sm text-reward">{generated.rewardCoins} Coins</span>
          </div>
        </div>
      </section>
    </div>
  );
}

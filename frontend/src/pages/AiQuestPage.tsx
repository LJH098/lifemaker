import { FormEvent, useState } from "react";
import { WandSparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { GeneratePlanPayload } from "../types";

export function AiQuestPage() {
  const { generatePlan } = useApp();
  const [goal, setGoal] = useState("프론트엔드 개발자로 취업하기");
  const [currentSituation, setCurrentSituation] = useState("알고리즘이 약하고, 포트폴리오가 부족하며, 꾸준한 지원 루틴이 아직 없다.");
  const [generated, setGenerated] = useState<GeneratePlanPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await generatePlan(goal, currentSituation);
      setGenerated(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "퀘스트 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center gap-3 text-accent">
          <WandSparkles size={20} />
          <span className="font-display text-2xl text-ink">AI Goal Analysis</span>
        </div>
        <p className="mt-3 text-slate-600">목표와 현재 상황을 입력하면 분석 결과와 실행 가능한 퀘스트 3개를 생성합니다.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Goal</span>
            <textarea value={goal} onChange={(event) => setGoal(event.target.value)} className="min-h-28 w-full rounded-3xl liquid-input p-4 outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">Current Situation</span>
            <textarea
              value={currentSituation}
              onChange={(event) => setCurrentSituation(event.target.value)}
              className="min-h-28 w-full rounded-3xl liquid-input p-4 outline-none"
            />
          </label>
          {error && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
          <button disabled={loading} className="rounded-2xl bg-accent px-5 py-3 font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600">
            {loading ? "분석 중..." : "퀘스트 생성하기"}
          </button>
        </form>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-2xl text-ink">Generated Plan</p>
          {generated && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                generated.source === "ai" ? "bg-accent/15 text-accent" : "bg-amber-500/15 text-amber-700"
              }`}
            >
              {generated.source === "ai" ? "OpenAI 생성" : "Fallback 템플릿"}
            </span>
          )}
        </div>
        {!generated ? (
          <div className="mt-6 rounded-[28px] liquid-panel-soft p-5 text-slate-600">목표를 입력하면 현재 상태 분석과 추천 퀘스트 3개가 여기에 표시됩니다.</div>
        ) : (
          <div className="mt-6 space-y-4">
            {generated.source === "fallback" && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
                현재 OpenAI 호출이 실패해서 fallback 퀘스트를 보여주고 있습니다. 사유: {getFallbackReasonLabel(generated.sourceReason)}
              </div>
            )}
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <p className="text-sm uppercase tracking-[0.3em] text-accent">Stage</p>
              <p className="mt-2 text-2xl font-bold text-ink">{generated.analysis.stage}</p>
              <p className="mt-4 text-sm text-slate-600">{generated.analysis.focusArea}</p>
              <div className="mt-5 grid gap-3 text-sm text-slate-600">
                <div className="rounded-2xl liquid-panel-deep p-4">{generated.analysis.reasoning}</div>
                <div className="rounded-2xl liquid-panel-deep p-4">{generated.analysis.caution}</div>
                <div className="rounded-2xl liquid-panel-deep p-4">{generated.analysis.suggestedRoutine}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">생성된 퀘스트는 동시에 Quest Log에도 저장됩니다.</div>
            <div className="space-y-3">
              {generated.quests.map((quest) => (
                <div key={quest.id} className="rounded-[28px] liquid-panel-soft p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-lg font-semibold text-ink">{quest.title}</p>
                    <span className="rounded-full liquid-chip px-3 py-1 text-xs text-slate-600">{quest.difficulty}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{quest.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-full bg-accent/15 px-4 py-2 text-accent">{quest.rewardExp} EXP</span>
                    <span className="rounded-full bg-reward/15 px-4 py-2 text-reward">{quest.rewardCoin} Coins</span>
                    <span className="rounded-full liquid-chip px-4 py-2 text-slate-600">{quest.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function getFallbackReasonLabel(reason?: string | null) {
  switch (reason) {
    case "insufficient_quota":
      return "OpenAI API 사용량 한도를 초과했습니다.";
    case "openai_key_missing":
      return "OpenAI API 키가 설정되지 않았습니다.";
    case "invalid_api_key":
      return "OpenAI API 키가 유효하지 않습니다.";
    case "openai_parse_error":
      return "OpenAI 응답 형식을 해석하지 못했습니다.";
    case "openai_empty_response":
      return "OpenAI 응답이 비어 있습니다.";
    case "openai_request_failed":
      return "OpenAI 요청이 네트워크 또는 서버 문제로 실패했습니다.";
    default:
      return "OpenAI 응답을 사용할 수 없어 템플릿 결과로 대체했습니다.";
  }
}

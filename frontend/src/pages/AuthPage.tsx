import { FormEvent, useState } from "react";
import { Lock, Mail, Swords, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { extractApiError } from "../services/api";

type Props = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: Props) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const { login, signup } = useApp();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        await login({ email, password });
      } else {
        await signup({ nickname, email, password });
      }
      navigate("/", { replace: true });
    } catch (requestError) {
      setError(extractApiError(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_0.8fr]">
      <section className="hidden liquid-hero p-12 lg:flex lg:items-center">
        <div className="flex max-w-2xl flex-col gap-10">
          <div className="hero-badge inline-flex w-fit items-center gap-3 rounded-full px-4 py-2 text-sm">
            <Swords size={16} />
            Life RPG Control Panel
          </div>
          <div>
            <p className="font-display text-6xl font-bold leading-[1.05] text-ink">
              현실 목표를
              <br />
              RPG처럼 성장시키세요.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              퀘스트를 받고, 경험치를 쌓고, 아바타와 방을 꾸미며
              <br />
              삶의 루틴을 게임처럼 지속하세요.
            </p>
          </div>
          <div className="rounded-3xl liquid-panel-soft p-6">
            <p className="text-sm text-slate-600">오늘의 추천 성장 루프</p>
            <p className="mt-2 text-xl font-semibold text-ink">목표 입력 → AI 퀘스트 생성 → 완료 → 레벨업</p>
          </div>
        </div>
      </section>

      <section className="auth-stage flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] liquid-panel-strong p-8 shadow-glow">
          <p className="font-display text-3xl font-bold text-ink">{isLogin ? "로그인" : "회원가입"}</p>
          <p className="mt-2 text-sm text-slate-600">인생게임에 접속해 오늘의 메인 퀘스트를 시작하세요.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">닉네임</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <UserRound size={16} className="text-slate-500" />
                  <input
                    value={nickname}
                    onChange={(event) => setNickname(event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="QuestRunner"
                  />
                </div>
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">이메일</span>
              <div className="flex items-center rounded-2xl liquid-input px-4">
                <Mail size={16} className="text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">비밀번호</span>
              <div className="flex items-center rounded-2xl liquid-input px-4">
                <Lock size={16} className="text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </label>
            {error && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
            <button
              disabled={submitting}
              className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-[#35516a] disabled:cursor-not-allowed disabled:bg-white/60 disabled:text-slate-600"
            >
              {submitting ? "처리 중..." : isLogin ? "로그인" : "계정 만들기"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            {isLogin ? "처음이신가요?" : "이미 계정이 있나요?"}{" "}
            <Link className="text-accent" to={isLogin ? "/signup" : "/login"}>
              {isLogin ? "회원가입" : "로그인"}
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}

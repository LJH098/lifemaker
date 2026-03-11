import { GoogleLogin } from "@react-oauth/google";
import { Lock, Mail, Swords } from "lucide-react";
import { Link } from "react-router-dom";

type Props = {
  mode: "login" | "signup";
};

export function AuthPage({ mode }: Props) {
  const isLogin = mode === "login";

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-slate-950 p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm text-accent">
          <Swords size={16} />
          Life RPG Control Panel
        </div>
        <div>
          <p className="font-display text-6xl font-bold leading-tight text-white">
            현실 목표를
            <br />
            RPG처럼 성장시키세요.
          </p>
          <p className="mt-6 max-w-lg text-lg text-slate-400">
            퀘스트를 받고, 경험치를 쌓고, 아바타와 방을 꾸미며 삶의 루틴을 게임처럼 지속하세요.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-card p-6">
          <p className="text-sm text-slate-400">오늘의 추천 성장 루프</p>
          <p className="mt-2 text-xl font-semibold text-white">목표 입력 → AI 퀘스트 생성 → 완료 → 레벨업</p>
        </div>
      </section>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-[32px] border border-slate-800 bg-card/95 p-8 shadow-glow">
          <p className="font-display text-3xl font-bold text-white">{isLogin ? "로그인" : "회원가입"}</p>
          <p className="mt-2 text-sm text-slate-400">인생게임에 접속해 오늘의 메인 퀘스트를 시작하세요.</p>

          <form className="mt-8 space-y-4">
            {!isLogin && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">닉네임</span>
                <input className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none" placeholder="QuestRunner" />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">이메일</span>
              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-4">
                <Mail size={16} className="text-slate-500" />
                <input className="w-full bg-transparent px-3 py-3 outline-none" placeholder="you@example.com" />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">비밀번호</span>
              <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-900 px-4">
                <Lock size={16} className="text-slate-500" />
                <input type="password" className="w-full bg-transparent px-3 py-3 outline-none" placeholder="••••••••" />
              </div>
            </label>
            <button className="w-full rounded-2xl bg-accent px-4 py-3 font-semibold text-slate-950">
              {isLogin ? "로그인" : "계정 만들기"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-sm text-slate-500">
            <div className="h-px flex-1 bg-slate-700" />
            또는
            <div className="h-px flex-1 bg-slate-700" />
          </div>

          <div className="overflow-hidden rounded-2xl">
            <GoogleLogin onSuccess={(credentialResponse) => console.log(credentialResponse)} onError={() => console.log("Google login failed")} />
          </div>

          <p className="mt-6 text-sm text-slate-400">
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

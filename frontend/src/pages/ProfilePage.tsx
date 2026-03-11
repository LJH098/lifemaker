import { FormEvent, useEffect, useState } from "react";
import { BellRing, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useApp } from "../context/AppContext";

const PROFILE_DRAFT_KEY = "lifemaker.profile-settings-draft";

type ProfileDraft = {
  nickname: string;
  email: string;
  bio: string;
  timezone: string;
  visibility: "public" | "friends" | "private";
  questReminders: boolean;
  weeklySummary: boolean;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const defaultDraft = (nickname: string, email: string): ProfileDraft => ({
  nickname,
  email,
  bio: "꾸준히 성장하는 루틴을 만들고 있어요.",
  timezone: "Asia/Seoul",
  visibility: "friends",
  questReminders: true,
  weeklySummary: false,
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
});

export function ProfilePage() {
  const { user } = useApp();
  const [draft, setDraft] = useState<ProfileDraft | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const baseDraft = defaultDraft(user.nickname, user.email);

    try {
      const rawDraft = localStorage.getItem(PROFILE_DRAFT_KEY);
      if (!rawDraft) {
        setDraft(baseDraft);
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as Partial<ProfileDraft>;
      setDraft({
        ...baseDraft,
        ...parsedDraft,
        nickname: parsedDraft.nickname?.trim() || user.nickname,
        email: parsedDraft.email?.trim() || user.email
      });
    } catch {
      setDraft(baseDraft);
    }
  }, [user]);

  if (!user || !draft) {
    return null;
  }

  const updateDraft = <Key extends keyof ProfileDraft>(key: Key, value: ProfileDraft[Key]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (draft.newPassword && !draft.currentPassword) {
      setMessage("비밀번호를 변경하려면 현재 비밀번호를 입력해 주세요.");
      return;
    }

    if (draft.newPassword && draft.newPassword.length < 8) {
      setMessage("비밀번호는 8자 이상으로 입력해 주세요.");
      return;
    }

    if (draft.newPassword !== draft.confirmPassword) {
      setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    setSaving(true);

    const nextDraft: ProfileDraft = {
      ...draft,
      nickname: draft.nickname.trim() || user.nickname,
      email: draft.email.trim() || user.email
    };

    window.setTimeout(() => {
      localStorage.setItem(PROFILE_DRAFT_KEY, JSON.stringify(nextDraft));
      setDraft({
        ...nextDraft,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setSaving(false);
      setMessage("프론트 미리보기용 개인정보 수정 사항을 저장했습니다.");
    }, 220);
  };

  const handleReset = () => {
    const nextDraft = defaultDraft(user.nickname, user.email);
    localStorage.removeItem(PROFILE_DRAFT_KEY);
    setDraft(nextDraft);
    setMessage("저장된 프론트 미리보기 설정을 초기화했습니다.");
  };

  return (
    <div className="rounded-[32px] liquid-panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-3xl text-ink">Profile Settings</p>
          <p className="mt-2 text-sm text-slate-600">닉네임, 이메일, 공개 범위와 알림 옵션을 프론트에서 먼저 편집해볼 수 있습니다.</p>
        </div>
        <span className="rounded-full border border-white/45 bg-white/35 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-500">
          FRONT ONLY
        </span>
      </div>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">닉네임</span>
              <div className="flex items-center rounded-2xl liquid-input px-4">
                <UserRound size={16} className="text-slate-500" />
                <input
                  value={draft.nickname}
                  onChange={(event) => updateDraft("nickname", event.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  placeholder="QuestRunner"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">이메일</span>
              <div className="flex items-center rounded-2xl liquid-input px-4">
                <Mail size={16} className="text-slate-500" />
                <input
                  type="email"
                  value={draft.email}
                  onChange={(event) => updateDraft("email", event.target.value)}
                  className="w-full bg-transparent px-3 py-3 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-slate-600">자기소개</span>
            <textarea
              value={draft.bio}
              onChange={(event) => updateDraft("bio", event.target.value)}
              rows={4}
              className="w-full rounded-[24px] liquid-input px-4 py-3 outline-none"
              placeholder="나를 소개하는 짧은 문장을 입력하세요."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">시간대</span>
              <select
                value={draft.timezone}
                onChange={(event) => updateDraft("timezone", event.target.value)}
                className="w-full rounded-2xl liquid-input px-4 py-3"
              >
                <option value="Asia/Seoul">Asia/Seoul</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">프로필 공개 범위</span>
              <select
                value={draft.visibility}
                onChange={(event) => updateDraft("visibility", event.target.value as ProfileDraft["visibility"])}
                className="w-full rounded-2xl liquid-input px-4 py-3"
              >
                <option value="public">전체 공개</option>
                <option value="friends">친구만</option>
                <option value="private">비공개</option>
              </select>
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole size={18} className="text-slate-500" />
              <p className="text-lg font-semibold text-ink">비밀번호 변경</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">프론트 미리보기용 입력 영역입니다. 저장 시 현재 비밀번호 입력 여부와 새 비밀번호 일치 여부만 확인합니다.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">현재 비밀번호</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <LockKeyhole size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.currentPassword}
                    onChange={(event) => updateDraft("currentPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="현재 비밀번호"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">새 비밀번호</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <LockKeyhole size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.newPassword}
                    onChange={(event) => updateDraft("newPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="8자 이상 입력"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">비밀번호 확인</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <ShieldCheck size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.confirmPassword}
                    onChange={(event) => updateDraft("confirmPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="비밀번호 재입력"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="flex items-start justify-between gap-4 rounded-[24px] liquid-panel-soft px-4 py-4">
              <div>
                <p className="font-medium text-ink">퀘스트 알림</p>
                <p className="mt-1 text-sm text-slate-600">아침 루틴과 마감 퀘스트 리마인드를 받습니다.</p>
              </div>
              <input
                type="checkbox"
                checked={draft.questReminders}
                onChange={(event) => updateDraft("questReminders", event.target.checked)}
                className="mt-1 h-5 w-5 rounded border-white/40 bg-white/40 text-accent"
              />
            </label>

            <label className="flex items-start justify-between gap-4 rounded-[24px] liquid-panel-soft px-4 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <BellRing size={16} className="text-slate-500" />
                  <p className="font-medium text-ink">주간 요약 메일</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">일주일 성취와 추천 루틴을 이메일 요약으로 받습니다.</p>
              </div>
              <input
                type="checkbox"
                checked={draft.weeklySummary}
                onChange={(event) => updateDraft("weeklySummary", event.target.checked)}
                className="mt-1 h-5 w-5 rounded border-white/40 bg-white/40 text-accent"
              />
            </label>
          </div>

          {message ? <div className="rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{message}</div> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-accent px-5 py-3 font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
            >
              {saving ? "저장 중..." : "변경사항 저장"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-white/45 bg-white/35 px-5 py-3 font-semibold text-slate-600 transition hover:bg-white/55 hover:text-ink"
            >
              초기화
            </button>
          </div>
      </form>
    </div>
  );
}

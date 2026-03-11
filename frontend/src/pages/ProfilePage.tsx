import { FormEvent, useEffect, useState } from "react";
import { BellRing, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { AvatarPreview3D } from "../components/AvatarPreview3D";
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
  bio: "Building a calmer daily rhythm and leveling up one quest at a time.",
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
      setMessage("Enter your current password before setting a new one.");
      return;
    }

    if (draft.newPassword && draft.newPassword.length < 8) {
      setMessage("New password must be at least 8 characters.");
      return;
    }

    if (draft.newPassword !== draft.confirmPassword) {
      setMessage("New password and confirmation do not match.");
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
      setMessage("Profile draft saved locally.");
    }, 220);
  };

  const handleReset = () => {
    const nextDraft = defaultDraft(user.nickname, user.email);
    localStorage.removeItem(PROFILE_DRAFT_KEY);
    setDraft(nextDraft);
    setMessage("Profile draft reset.");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.84fr_1.16fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-ink">Profile</p>
            <p className="mt-2 text-sm text-slate-600">Your current identity card, avatar look, and notification preferences.</p>
          </div>
          <span className="rounded-full border border-white/45 bg-white/35 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-slate-500">
            FRONT ONLY
          </span>
        </div>

        <div className="mt-6 rounded-[28px] liquid-panel-soft p-5">
          <div className="mx-auto max-w-[260px]">
            <AvatarPreview3D
              nickname={user.nickname}
              hair={user.avatar.hair}
              clothes={user.avatar.clothes}
              accessories={user.avatar.accessories}
              skinColor={user.avatar.colors.skin}
              hairColor={user.avatar.colors.hair}
              clothesColor={user.avatar.colors.clothes}
              characterScale={0.92}
              verticalOffset={0}
            />
          </div>
          <div className="mt-5 grid gap-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-white/40 px-4 py-3">Nickname: {user.nickname}</div>
            <div className="rounded-2xl bg-white/40 px-4 py-3">Level: {user.level}</div>
            <div className="rounded-2xl bg-white/40 px-4 py-3">Main hair: {user.avatar.hair}</div>
            <div className="rounded-2xl bg-white/40 px-4 py-3">Room invite: {user.room.inviteCode}</div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-3xl text-ink">Profile Settings</p>
        <p className="mt-2 text-sm text-slate-600">Nickname, email, visibility, and local notification preferences.</p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Nickname</span>
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
              <span className="mb-2 block text-sm text-slate-600">Email</span>
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
            <span className="mb-2 block text-sm text-slate-600">Bio</span>
            <textarea
              value={draft.bio}
              onChange={(event) => updateDraft("bio", event.target.value)}
              rows={4}
              className="w-full rounded-[24px] liquid-input px-4 py-3 outline-none"
              placeholder="Tell other players what you are working on."
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Timezone</span>
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
              <span className="mb-2 block text-sm text-slate-600">Visibility</span>
              <select
                value={draft.visibility}
                onChange={(event) => updateDraft("visibility", event.target.value as ProfileDraft["visibility"])}
                className="w-full rounded-2xl liquid-input px-4 py-3"
              >
                <option value="public">Public</option>
                <option value="friends">Friends</option>
                <option value="private">Private</option>
              </select>
            </label>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole size={18} className="text-slate-500" />
              <p className="text-lg font-semibold text-ink">Password</p>
            </div>
            <p className="mt-2 text-sm text-slate-600">Front-only validation for the MVP profile screen.</p>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Current password</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <LockKeyhole size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.currentPassword}
                    onChange={(event) => updateDraft("currentPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="Current password"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">New password</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <LockKeyhole size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.newPassword}
                    onChange={(event) => updateDraft("newPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="At least 8 characters"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Confirm password</span>
                <div className="flex items-center rounded-2xl liquid-input px-4">
                  <ShieldCheck size={16} className="text-slate-500" />
                  <input
                    type="password"
                    value={draft.confirmPassword}
                    onChange={(event) => updateDraft("confirmPassword", event.target.value)}
                    className="w-full bg-transparent px-3 py-3 outline-none"
                    placeholder="Repeat new password"
                  />
                </div>
              </label>
            </div>
          </div>

          <div className="grid gap-3">
            <label className="flex items-start justify-between gap-4 rounded-[24px] liquid-panel-soft px-4 py-4">
              <div>
                <p className="font-medium text-ink">Quest reminders</p>
                <p className="mt-1 text-sm text-slate-600">Receive reminders for daily quests and focus windows.</p>
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
                  <p className="font-medium text-ink">Weekly summary mail</p>
                </div>
                <p className="mt-1 text-sm text-slate-600">Receive a compact weekly digest of quests and stats.</p>
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
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-white/45 bg-white/35 px-5 py-3 font-semibold text-slate-600 transition hover:bg-white/55 hover:text-ink"
            >
              Reset
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

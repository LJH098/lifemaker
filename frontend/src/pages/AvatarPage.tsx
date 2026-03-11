import { FormEvent, useEffect, useState } from "react";
import { Crown, Palette, Shield, Sparkles, Star } from "lucide-react";
import { useApp } from "../context/AppContext";

const hairOptions = [
  { name: "Starter Cut", vibe: "깔끔한 기본형" },
  { name: "Cyber Cut", vibe: "미래적인 감성" },
  { name: "Wave Rider", vibe: "부드러운 자유형" },
  { name: "Guild Buzz", vibe: "강한 존재감" }
];

const clothesOptions = [
  { name: "Novice Hoodie", vibe: "입문자용 캐주얼" },
  { name: "Explorer Jacket", vibe: "모험가 스타일" },
  { name: "Focus Armor", vibe: "집중 특화 장비" },
  { name: "Guild Uniform", vibe: "길드 대표 유니폼" }
];

const accessoryOptions = ["Beginner Badge", "Focus Charm", "Green Visor", "Lucky Ring"];

export function AvatarPage() {
  const { user, updateAvatar } = useApp();
  const [hair, setHair] = useState("Starter Cut");
  const [clothes, setClothes] = useState("Novice Hoodie");
  const [accessories, setAccessories] = useState<string[]>(["Beginner Badge"]);
  const [skinColor, setSkinColor] = useState("#F1C27D");
  const [hairColor, setHairColor] = useState("#22C55E");
  const [clothesColor, setClothesColor] = useState("#38BDF8");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }
    setHair(user.avatar.hair);
    setClothes(user.avatar.clothes);
    setAccessories(user.avatar.accessories);
    setSkinColor(user.avatar.colors.skin);
    setHairColor(user.avatar.colors.hair);
    setClothesColor(user.avatar.colors.clothes);
  }, [user]);

  if (!user) {
    return null;
  }

  const toggleAccessory = (value: string) => {
    setAccessories((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateAvatar({ hair, clothes, accessories, skinColor, hairColor, clothesColor });
      setMessage("아바타 설정이 저장되었습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-3xl text-ink">Avatar Forge</p>
            <p className="mt-2 text-sm text-slate-600">실시간 미리보기로 현재 장착 중인 헤어, 의상, 장신구 조합을 바로 확인할 수 있습니다.</p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">Live Preview</div>
        </div>

        <div className="mt-6 overflow-hidden rounded-[28px] liquid-panel-soft p-8">
          <div className="mx-auto max-w-sm rounded-[32px] liquid-panel-deep p-6">
            <div className="relative mx-auto h-[360px] w-[240px]">
              <div className="absolute inset-x-10 top-0 h-24 rounded-t-[80px] rounded-b-[42px]" style={{ backgroundColor: hairColor }} />
              <div className="absolute inset-x-[54px] top-10 h-28 rounded-[48px] border-4 border-white/30" style={{ backgroundColor: skinColor }} />
              <div className="absolute left-[78px] top-[72px] h-3 w-3 rounded-full bg-slate-900" />
              <div className="absolute right-[78px] top-[72px] h-3 w-3 rounded-full bg-slate-900" />
              <div className="absolute left-[92px] top-[96px] h-2 w-14 rounded-full bg-slate-900/70" />
              <div className="absolute inset-x-8 top-[132px] h-44 rounded-[42px] border border-white/30" style={{ backgroundColor: clothesColor }} />
              <div className="absolute left-[30px] top-[150px] h-28 w-10 rounded-full" style={{ backgroundColor: clothesColor }} />
              <div className="absolute right-[30px] top-[150px] h-28 w-10 rounded-full" style={{ backgroundColor: clothesColor }} />
              <div className="absolute left-[70px] top-[286px] h-16 w-8 rounded-full bg-slate-500" />
              <div className="absolute right-[70px] top-[286px] h-16 w-8 rounded-full bg-slate-500" />
              <div className="absolute inset-x-16 top-[154px] h-10 rounded-2xl border border-white/20 bg-white/15" />
              <div className="absolute left-4 top-6 rounded-full border border-reward/30 bg-reward/15 px-3 py-1 text-[10px] font-semibold text-reward">{hair}</div>
              <div className="absolute right-2 top-[180px] rounded-full border border-accent/30 bg-accent/15 px-3 py-1 text-[10px] font-semibold text-accent">{clothes}</div>
              {accessories.length > 0 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                  {accessories.map((item) => (
                    <span key={item} className="rounded-full border border-white/35 bg-white/60 px-3 py-1 text-[10px] text-slate-700">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 rounded-3xl liquid-panel-soft p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-semibold text-ink">{user.nickname}</p>
                  <p className="mt-1 text-sm text-slate-600">Lv.{user.level} Life RPG Adventurer</p>
                </div>
                <div className="rounded-2xl bg-accent/15 p-3 text-accent">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center gap-3">
          <Palette className="text-accent" size={20} />
          <p className="font-display text-2xl text-ink">Customize</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <Crown size={16} />
              헤어 선택
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {hairOptions.map((option) => {
                const active = hair === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setHair(option.name)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      active ? "border-accent bg-accent/10" : "border-white/45 liquid-panel-soft hover:bg-white/65"
                    }`}
                  >
                    <p className="font-semibold text-ink">{option.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{option.vibe}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <Shield size={16} />
              의상 선택
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {clothesOptions.map((option) => {
                const active = clothes === option.name;
                return (
                  <button
                    key={option.name}
                    type="button"
                    onClick={() => setClothes(option.name)}
                    className={`rounded-3xl border p-4 text-left transition ${
                      active ? "border-accent bg-accent/10" : "border-white/45 liquid-panel-soft hover:bg-white/65"
                    }`}
                  >
                    <p className="font-semibold text-ink">{option.name}</p>
                    <p className="mt-1 text-sm text-slate-600">{option.vibe}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <Star size={16} />
              액세서리 선택
            </div>
            <div className="flex flex-wrap gap-3">
              {accessoryOptions.map((option) => {
                const active = accessories.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleAccessory(option)}
                    className={`rounded-2xl border px-4 py-2 text-sm ${
                      active ? "border-accent bg-accent/15 text-accent" : "border-white/45 liquid-panel-soft text-slate-600"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">최대 3개까지 선택할 수 있습니다.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Skin Color</span>
              <input type="color" value={skinColor} onChange={(event) => setSkinColor(event.target.value)} className="h-14 w-full rounded-2xl liquid-input p-2" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Hair Color</span>
              <input type="color" value={hairColor} onChange={(event) => setHairColor(event.target.value)} className="h-14 w-full rounded-2xl liquid-input p-2" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Clothes Color</span>
              <input type="color" value={clothesColor} onChange={(event) => setClothesColor(event.target.value)} className="h-14 w-full rounded-2xl liquid-input p-2" />
            </label>
          </div>

          {message && <div className="rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{message}</div>}

          <button disabled={saving} className="rounded-2xl bg-accent px-5 py-3 font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600">
            {saving ? "저장 중..." : "아바타 저장"}
          </button>
        </form>
      </section>
    </div>
  );
}

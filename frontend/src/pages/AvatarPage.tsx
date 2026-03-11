import { FormEvent, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const hairOptions = ["Starter Cut", "Cyber Cut", "Wave Rider", "Guild Buzz"];
const clothesOptions = ["Novice Hoodie", "Explorer Jacket", "Focus Armor", "Guild Uniform"];
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
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-3xl text-ink">Avatar Forge</p>
        <div className="mt-6 flex min-h-[320px] items-center justify-center rounded-[28px] liquid-panel-soft">
          <div className="text-center">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ backgroundColor: skinColor }}>
              <div className="h-20 w-20 rounded-full" style={{ backgroundColor: hairColor }} />
            </div>
            <div className="mx-auto mt-4 h-40 w-28 rounded-t-[40px]" style={{ backgroundColor: clothesColor }} />
            <p className="mt-4 text-lg font-semibold text-ink">{user.nickname}</p>
            <p className="mt-2 text-sm text-slate-600">{accessories.join(", ") || "액세서리 없음"}</p>
          </div>
        </div>
      </section>
      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-2xl text-ink">Customize</p>
        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Hair</span>
              <select value={hair} onChange={(event) => setHair(event.target.value)} className="w-full rounded-2xl liquid-input px-4 py-3">
                {hairOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Clothes</span>
              <select value={clothes} onChange={(event) => setClothes(event.target.value)} className="w-full rounded-2xl liquid-input px-4 py-3">
                {clothesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <p className="mb-2 text-sm text-slate-600">Accessories (최대 3개)</p>
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

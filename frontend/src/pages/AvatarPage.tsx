import { FormEvent, useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { mockItems } from "../data/mockData";

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
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.78fr_1.22fr]">
        <section className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-display text-3xl text-ink">Avatar Studio</p>
              <p className="mt-2 text-sm text-slate-600">커스터마이즈와 아이템 쇼핑을 한 화면에서 진행합니다.</p>
            </div>
            <div className="rounded-2xl liquid-panel-soft px-4 py-3 text-right text-sm text-slate-600">
              <p>Coins</p>
              <p className="mt-1 text-lg font-semibold text-reward">{user.coins}</p>
            </div>
          </div>
          <div className="mt-6 flex min-h-[420px] items-center justify-center rounded-[28px] liquid-panel-soft">
            <div className="text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full" style={{ backgroundColor: skinColor }}>
                <div className="h-20 w-20 rounded-full" style={{ backgroundColor: hairColor }} />
              </div>
              <div className="mx-auto mt-4 h-40 w-28 rounded-t-[40px]" style={{ backgroundColor: clothesColor }} />
              <p className="mt-4 text-lg font-semibold text-ink">{user.nickname}</p>
              <p className="mt-2 text-sm text-slate-600">{accessories.join(", ") || "액세서리 없음"}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-left text-xs text-slate-600">
                <div className="rounded-2xl bg-white/35 px-4 py-3">Hair: {hair}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Clothes: {clothes}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Skin: {skinColor}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Hair Color: {hairColor}</div>
              </div>
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

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-ink">Style Shop</p>
            <p className="mt-2 text-sm text-slate-600">아바타와 방 꾸미기 아이템을 같은 흐름에서 바로 둘러봅니다.</p>
          </div>
          <div className="rounded-2xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">보유 코인: {user.coins}</div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {mockItems.map((item) => (
            <div key={item.itemId} className="rounded-[28px] liquid-panel-soft p-5">
              <div className="grid h-36 place-items-center rounded-3xl bg-white/35 text-3xl font-bold text-ink">{item.image}</div>
              <p className="mt-4 text-lg font-semibold text-ink">{item.name}</p>
              <p className="mt-1 text-sm capitalize text-slate-600">{item.type}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-reward">{item.price} Coins</span>
                <button
                  disabled={user.coins < item.price}
                  className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

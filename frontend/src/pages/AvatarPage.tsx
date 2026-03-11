import { FormEvent, useEffect, useMemo, useState } from "react";
import { AvatarPreview3D } from "../components/AvatarPreview3D";
import { useApp } from "../context/AppContext";
import { mockItems } from "../data/mockData";

type HairOption = {
  name: string;
  note: string;
  previewColor?: string;
};

const hairOptions: HairOption[] = [
  { name: "Starter Cut", note: "Clean and balanced everyday cut" },
  { name: "Soft Crop", note: "Short top with a calmer front line" },
  { name: "City Layer", note: "Neat layered shape with a soft side" },
  { name: "Wave Rider", note: "Light texture with a subtle sweep" },
  { name: "Guild Buzz", note: "Ultra simple close-cropped style" },
  { name: "Cyber Cut", note: "Sharper line with a modern accent" },
  { name: "Street Snapback", note: "Cap silhouette for casual builds" }
];

const clothesOptions = ["Novice Hoodie", "Explorer Jacket", "Focus Armor", "Guild Uniform"];
const accessoryOptions = ["Beginner Badge", "Focus Charm", "Green Visor", "Lucky Ring"];

export function AvatarPage() {
  const { user, updateAvatar } = useApp();
  const [hair, setHair] = useState("Starter Cut");
  const [clothes, setClothes] = useState("Novice Hoodie");
  const [accessories, setAccessories] = useState<string[]>(["Beginner Badge"]);
  const [skinColor, setSkinColor] = useState("#F1C27D");
  const [hairColor, setHairColor] = useState("#6b7280");
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

  const activeHair = useMemo(() => hairOptions.find((option) => option.name === hair) ?? hairOptions[0], [hair]);

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
      setMessage("Avatar settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save avatar.");
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
              <p className="mt-2 text-sm text-slate-600">Tune your character live and save the look you want to bring into My Room and Plaza.</p>
            </div>
            <div className="rounded-2xl liquid-panel-soft px-4 py-3 text-right text-sm text-slate-600">
              <p>Coins</p>
              <p className="mt-1 text-lg font-semibold text-reward">{user.coins}</p>
            </div>
          </div>
          <div className="mt-6 flex min-h-[460px] items-center justify-center overflow-hidden rounded-[28px] liquid-panel-soft">
            <div className="w-full max-w-md px-4 py-6">
              <AvatarPreview3D
                nickname={user.nickname}
                hair={hair}
                clothes={clothes}
                accessories={accessories}
                skinColor={skinColor}
                hairColor={hairColor}
                clothesColor={clothesColor}
                characterScale={0.94}
                verticalOffset={0}
              />
              <p className="mt-4 text-center text-sm text-slate-600">{accessories.join(", ") || "No accessories selected"}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-left text-xs text-slate-600">
                <div className="rounded-2xl bg-white/35 px-4 py-3">Hair: {hair}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Clothes: {clothes}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Style: {activeHair.note}</div>
                <div className="rounded-2xl bg-white/35 px-4 py-3">Hair Color: {hairColor}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-2xl text-ink">Customize</p>
          <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-600">Hair Presets</span>
                <span className="text-xs text-slate-500">Click any style to preview instantly</span>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {hairOptions.map((option) => {
                  const active = option.name === hair;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setHair(option.name)}
                      className={`rounded-[24px] border px-4 py-4 text-left transition ${
                        active ? "border-accent bg-accent/10 shadow-glow" : "border-white/45 bg-white/35 hover:bg-white/55"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{option.name}</p>
                          <p className="mt-1 text-xs text-slate-500">{option.note}</p>
                        </div>
                        {active ? <span className="rounded-full bg-accent/15 px-2 py-1 text-[10px] font-semibold text-accent">LIVE</span> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
              <div className="rounded-[24px] liquid-panel-soft px-4 py-4">
                <p className="text-sm font-semibold text-ink">Live appearance</p>
                <p className="mt-2 text-sm text-slate-600">Every click changes the 3D preview immediately, so you can compare styles before saving.</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm text-slate-600">Accessories (up to 3)</p>
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

            {message ? <div className="rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{message}</div> : null}

            <button disabled={saving} className="rounded-2xl bg-accent px-5 py-3 font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600">
              {saving ? "Saving..." : "Save avatar"}
            </button>
          </form>
        </section>
      </div>

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-2xl text-ink">Style Shop</p>
            <p className="mt-2 text-sm text-slate-600">Quick glance at cosmetics and room items connected to your current look loop.</p>
          </div>
          <div className="rounded-2xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">Owned coins: {user.coins}</div>
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

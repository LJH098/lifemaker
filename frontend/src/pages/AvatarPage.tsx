import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Crown, Palette, Shirt, Sparkles, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Avatar, ShopItem } from "../types";
import { applyItemPreview, AvatarStage, getItemFlavor, ItemArtwork, makeStarterItem } from "../components/LifeGameArt";

const starterHair = [
  makeStarterItem("starter-hair-1", "Starter Cut", "hair"),
  makeStarterItem("starter-hair-2", "Cyber Cut", "hair"),
  makeStarterItem("starter-hair-3", "Wave Rider", "hair"),
  makeStarterItem("starter-hair-4", "Guild Buzz", "hair")
];

const starterClothes = [
  makeStarterItem("starter-clothes-1", "Novice Hoodie", "clothes"),
  makeStarterItem("starter-clothes-2", "Explorer Jacket", "clothes"),
  makeStarterItem("starter-clothes-3", "Focus Armor", "clothes"),
  makeStarterItem("starter-clothes-4", "Guild Uniform", "clothes")
];

const starterAccessories = [
  makeStarterItem("starter-accessory-1", "Beginner Badge", "accessories"),
  makeStarterItem("starter-accessory-2", "Focus Charm", "accessories"),
  makeStarterItem("starter-accessory-3", "Green Visor", "accessories"),
  makeStarterItem("starter-accessory-4", "Lucky Ring", "accessories")
];

export function AvatarPage() {
  const { user, shopItems, loadShopItems, updateAvatar } = useApp();
  const [hair, setHair] = useState("Starter Cut");
  const [clothes, setClothes] = useState("Novice Hoodie");
  const [accessories, setAccessories] = useState<string[]>(["Beginner Badge"]);
  const [skinColor, setSkinColor] = useState("#F1C27D");
  const [hairColor, setHairColor] = useState("#22C55E");
  const [clothesColor, setClothesColor] = useState("#38BDF8");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (shopItems.length === 0) {
      void loadShopItems().catch(() => undefined);
    }
  }, [loadShopItems, shopItems.length]);

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

  const ownedItems = useMemo(() => {
    if (!user) {
      return [];
    }

    const ownedIds = new Set(user.ownedItemIds);
    return shopItems.filter((item) => ownedIds.has(item.itemId));
  }, [shopItems, user]);

  const currentAvatar = useMemo<Avatar>(
    () => ({
      hair,
      clothes,
      accessories,
      colors: {
        skin: skinColor,
        hair: hairColor,
        clothes: clothesColor
      }
    }),
    [accessories, clothes, clothesColor, hair, hairColor, skinColor]
  );

  const previewAvatar = useMemo(() => applyItemPreview(currentAvatar, previewItem), [currentAvatar, previewItem]);

  const ownedHair = ownedItems.filter((item) => item.type === "hair");
  const ownedClothes = ownedItems.filter((item) => item.type === "clothes");
  const ownedAccessories = ownedItems.filter((item) => item.type === "accessories");
  const spotlightItem = previewItem ?? findCurrentEquippedSpotlight(currentAvatar, ownedItems);

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
      setMessage("Avatar saved. Your current look is now live.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save avatar right now.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-3xl text-ink">Avatar Forge</p>
            <p className="mt-2 text-sm text-slate-600">Hover an item to preview it instantly, then equip the look you want to keep.</p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">Live Preview</div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <AvatarStage avatar={previewAvatar} />

          <div className="space-y-4 rounded-[30px] bg-white/50 p-4">
            <div className="rounded-[28px] bg-slate-900 px-5 py-4 text-white shadow-[0_18px_40px_rgba(15,23,42,0.2)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{user.nickname}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/60">Lv.{user.level} Life Avatar</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3 text-[#86efac]">
                  <Sparkles size={18} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-sm text-white/75">
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Hair</span>
                  <span className="font-semibold text-white">{previewAvatar.hair}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span>Outfit</span>
                  <span className="font-semibold text-white">{previewAvatar.clothes}</span>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p>Accessories</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {previewAvatar.accessories.length === 0 ? (
                      <span className="text-white/50">No accessory equipped</span>
                    ) : (
                      previewAvatar.accessories.map((item) => (
                        <span key={item} className="rounded-full bg-white/12 px-3 py-1 text-xs text-white/80">
                          {item}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/50 bg-white/58 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{previewItem ? "Previewing" : "Current Signature Item"}</p>
              {spotlightItem ? (
                <div className="mt-3 grid gap-4 md:grid-cols-[120px_1fr]">
                  <ItemArtwork item={spotlightItem} compact />
                  <div>
                    <p className="text-lg font-semibold text-ink">{spotlightItem.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{spotlightItem.type.replace("_", " ")}</p>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{getItemFlavor(spotlightItem)}</p>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Equip or hover an item to see its detail card here.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center gap-3">
          <Palette className="text-accent" size={20} />
          <p className="font-display text-2xl text-ink">Inventory Equip</p>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <EquipSection
            title="Starter Hair"
            icon={<Crown size={16} />}
            items={starterHair}
            activeName={hair}
            onSelect={(item) => setHair(item.name)}
            onPreview={setPreviewItem}
          />
          <EquipSection
            title="Owned Hair"
            icon={<Crown size={16} />}
            items={ownedHair}
            activeName={hair}
            onSelect={(item) => setHair(item.name)}
            onPreview={setPreviewItem}
            emptyText="Buy new hair from the shop to expand your lookbook."
            newBadge
          />
          <EquipSection
            title="Starter Clothes"
            icon={<Shirt size={16} />}
            items={starterClothes}
            activeName={clothes}
            onSelect={(item) => setClothes(item.name)}
            onPreview={setPreviewItem}
          />
          <EquipSection
            title="Owned Clothes"
            icon={<Shirt size={16} />}
            items={ownedClothes}
            activeName={clothes}
            onSelect={(item) => setClothes(item.name)}
            onPreview={setPreviewItem}
            emptyText="Shop outfits appear here once you buy them."
            newBadge
          />

          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
              <Star size={16} />
              Accessories
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[...starterAccessories, ...ownedAccessories].map((item) => {
                const active = accessories.includes(item.name);
                const owned = !item.itemId.startsWith("starter-");
                return (
                  <button
                    key={item.itemId}
                    type="button"
                    onClick={() => toggleAccessory(item.name)}
                    onMouseEnter={() => setPreviewItem(item)}
                    onMouseLeave={() => setPreviewItem(null)}
                    className={`rounded-[28px] border p-4 text-left transition ${
                      active ? "border-accent bg-accent/12" : "border-white/45 bg-white/45 hover:bg-white/70"
                    }`}
                  >
                    <div className="grid gap-3 md:grid-cols-[100px_1fr]">
                      <ItemArtwork item={item} compact />
                      <div>
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-ink">{item.name}</p>
                          {owned ? <span className="rounded-full bg-reward/15 px-2 py-1 text-[10px] font-semibold text-reward">NEW</span> : null}
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{getItemFlavor(item)}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{active ? "Equipped" : "Hover to preview"}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-500">You can equip up to three accessories at the same time.</p>
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
            {saving ? "Saving..." : "Save Avatar"}
          </button>
        </form>
      </section>
    </div>
  );
}

function EquipSection({
  title,
  icon,
  items,
  activeName,
  onSelect,
  onPreview,
  emptyText,
  newBadge = false
}: {
  title: string;
  icon: ReactNode;
  items: ShopItem[];
  activeName: string;
  onSelect: (item: ShopItem) => void;
  onPreview: (item: ShopItem | null) => void;
  emptyText?: string;
  newBadge?: boolean;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white/45 px-4 py-3 text-sm text-slate-500">{emptyText ?? "No items available yet."}</div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => {
            const active = activeName === item.name;
            return (
              <button
                key={item.itemId}
                type="button"
                onClick={() => onSelect(item)}
                onMouseEnter={() => onPreview(item)}
                onMouseLeave={() => onPreview(null)}
                className={`rounded-[28px] border p-4 text-left transition ${
                  active ? "border-accent bg-accent/10" : "border-white/45 bg-white/45 hover:bg-white/70"
                }`}
              >
                <div className="grid gap-3 md:grid-cols-[100px_1fr]">
                  <ItemArtwork item={item} compact />
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-ink">{item.name}</p>
                      {newBadge ? <span className="rounded-full bg-reward/15 px-2 py-1 text-[10px] font-semibold text-reward">NEW</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{getItemFlavor(item)}</p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{active ? "Equipped" : "Hover to preview"}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function findCurrentEquippedSpotlight(avatar: Avatar, ownedItems: ShopItem[]) {
  const byName = new Map(ownedItems.map((item) => [item.name, item]));
  return (
    byName.get(avatar.hair) ??
    byName.get(avatar.clothes) ??
    avatar.accessories.map((entry) => byName.get(entry)).find(Boolean) ??
    makeStarterItem("starter-hair-1", avatar.hair, "hair")
  );
}

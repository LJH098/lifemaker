import { useEffect, useMemo, useState } from "react";
import { Coins, Eye, ShoppingBag, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext";
import { AvatarStage, applyItemPreview, FurnitureArtwork, getItemFlavor, ItemArtwork } from "../components/LifeGameArt";
import { ShopItem } from "../types";

export function ShopPage() {
  const { user, shopItems, loadShopItems, purchaseItem } = useApp();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [previewItem, setPreviewItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    if (shopItems.length === 0) {
      void loadShopItems().catch((error: Error) => {
        setMessage(error.message || "Could not load shop items.");
      });
    }
  }, [loadShopItems, shopItems.length]);

  useEffect(() => {
    if (!previewItem && shopItems.length > 0) {
      setPreviewItem(shopItems[0]);
    }
  }, [previewItem, shopItems]);

  const handlePurchase = async (itemId: string) => {
    setBusyItemId(itemId);
    setMessage("");
    try {
      await purchaseItem(itemId);
      setMessage("Item purchased. It is now available in your inventory.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Purchase failed.");
    } finally {
      setBusyItemId(null);
    }
  };

  const ownedItemIds = new Set(user?.ownedItemIds ?? []);
  const previewAvatar = useMemo(() => {
    if (!user || !previewItem || previewItem.type === "room_furniture") {
      return user?.avatar ?? null;
    }

    return applyItemPreview(user.avatar, previewItem);
  }, [previewItem, user]);

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl text-ink">Reward Shop</h1>
            <p className="mt-2 text-slate-600">Preview items before you buy them, then bring them into your avatar or minihome.</p>
          </div>
          <div className="rounded-2xl border border-reward/30 bg-reward/10 px-3 py-2 text-xs font-semibold text-reward">
            {user?.coins ?? 0} Coins
          </div>
        </div>

        <div className="mt-6 rounded-[30px] bg-white/55 p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            <Eye size={14} />
            Preview Booth
          </div>

          {previewItem ? (
            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_0.95fr]">
              <div>
                {previewItem.type === "room_furniture" ? (
                  <div className="rounded-[30px] bg-[linear-gradient(180deg,rgba(239,251,245,0.98),rgba(218,243,236,0.94),rgba(232,245,255,0.96))] p-5">
                    <div className="relative h-[330px] overflow-hidden rounded-[28px] border border-white/45 bg-white/28">
                      <div className="absolute inset-x-0 bottom-0 h-[34%] rounded-b-[28px] bg-[linear-gradient(180deg,rgba(213,184,150,0.95),rgba(188,154,116,0.95))]" />
                      <div className="absolute left-8 top-10 h-24 w-20 rounded-[24px] border border-white/45 bg-white/35" />
                      <div className="absolute left-12 top-14 h-16 w-12 rounded-[16px] bg-sky-200/65" />
                      {user ? (
                        <div className="absolute bottom-[78px] left-[54px] scale-[0.74]">
                          <AvatarStage avatar={user.avatar} compact className="bg-transparent p-0 shadow-none" />
                        </div>
                      ) : null}
                      <div className="absolute bottom-[62px] right-[42px]">
                        <FurnitureArtwork item={previewItem} />
                      </div>
                    </div>
                  </div>
                ) : previewAvatar ? (
                  <AvatarStage avatar={previewAvatar} />
                ) : (
                  <div className="rounded-[28px] bg-white/45 p-6 text-sm text-slate-500">Sign in to preview cosmetics on your avatar.</div>
                )}
              </div>

              <div className="rounded-[28px] bg-slate-900 px-5 py-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.24)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{previewItem.name}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-white/55">{previewItem.type.replace("_", " ")}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-3 text-[#fde68a]">
                    <Sparkles size={18} />
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-white/72">{getItemFlavor(previewItem)}</p>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm text-white/65">Price</span>
                  <span className="font-semibold text-[#fde68a]">{previewItem.price} Coins</span>
                </div>
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
                  <span className="text-sm text-white/65">Status</span>
                  <span className="font-semibold text-white">{ownedItemIds.has(previewItem.itemId) ? "Owned" : "Available"}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 rounded-[28px] bg-white/45 p-6 text-slate-600">The shop is waiting for items to load.</div>
          )}
        </div>

        {message ? <div className="mt-4 rounded-2xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">{message}</div> : null}
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-accent" />
          <p className="font-display text-2xl text-ink">Catalog</p>
        </div>
        {shopItems.length === 0 ? (
          <div className="mt-6 rounded-[28px] bg-white/45 p-6 text-slate-600">No shop items are available yet.</div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {shopItems.map((item) => {
              const owned = ownedItemIds.has(item.itemId);
              const affordable = (user?.coins ?? 0) >= item.price;
              const activePreview = previewItem?.itemId === item.itemId;

              return (
                <div
                  key={item.itemId}
                  onMouseEnter={() => setPreviewItem(item)}
                  className={`rounded-[28px] border p-5 transition ${
                    activePreview ? "border-accent bg-accent/10" : "border-white/45 bg-white/45 hover:bg-white/70"
                  }`}
                >
                  <div className="grid gap-4 md:grid-cols-[132px_1fr]">
                    <ItemArtwork item={item} compact />
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-lg font-semibold text-ink">{item.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">{item.type.replace("_", " ")}</p>
                        </div>
                        {owned ? <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">Owned</span> : null}
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{getItemFlavor(item)}</p>
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-2 rounded-full bg-reward/12 px-3 py-1.5 text-sm font-semibold text-reward">
                          <Coins size={14} />
                          {item.price}
                        </div>
                        <button
                          disabled={owned || !affordable || busyItemId === item.itemId}
                          onClick={() => void handlePurchase(item.itemId)}
                          className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
                        >
                          {owned ? "Owned" : busyItemId === item.itemId ? "Buying..." : "Buy"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

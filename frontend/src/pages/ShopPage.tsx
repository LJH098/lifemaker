import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

export function ShopPage() {
  const { user, shopItems, loadShopItems, purchaseItem } = useApp();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (shopItems.length === 0) {
      void loadShopItems().catch((error: Error) => {
        setMessage(error.message || "상점 데이터를 불러오지 못했습니다.");
      });
    }
  }, [loadShopItems, shopItems.length]);

  const handlePurchase = async (itemId: string) => {
    setBusyItemId(itemId);
    setMessage("");
    try {
      await purchaseItem(itemId);
      setMessage("아이템을 구매했습니다.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "구매에 실패했습니다.");
    } finally {
      setBusyItemId(null);
    }
  };

  const ownedItemIds = new Set(user?.ownedItemIds ?? []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">Reward Shop</h1>
        <p className="mt-2 text-slate-400">퀘스트로 얻은 코인으로 아바타와 방 꾸미기 아이템을 둘러보세요.</p>
        <p className="mt-2 text-sm text-reward">현재 보유 코인: {user?.coins ?? 0}</p>
        {message && <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-300">{message}</div>}
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {shopItems.map((item) => {
          const owned = ownedItemIds.has(item.itemId);
          const affordable = (user?.coins ?? 0) >= item.price;
          return (
            <div key={item.itemId} className="rounded-[28px] border border-slate-800 bg-card p-5">
              <div className="grid h-36 place-items-center rounded-3xl bg-slate-900/80 text-3xl font-bold text-white">{item.image}</div>
              <p className="mt-4 text-lg font-semibold text-white">{item.name}</p>
              <p className="mt-1 text-sm capitalize text-slate-400">{item.type}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-reward">{item.price} Coins</span>
                <button
                  disabled={owned || !affordable || busyItemId === item.itemId}
                  onClick={() => void handlePurchase(item.itemId)}
                  className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400"
                >
                  {owned ? "Owned" : busyItemId === item.itemId ? "Buying..." : "Buy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

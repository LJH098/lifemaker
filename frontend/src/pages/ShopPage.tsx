import { useApp } from "../context/AppContext";
import { mockItems } from "../data/mockData";

export function ShopPage() {
  const { user } = useApp();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-white">Reward Shop</h1>
        <p className="mt-2 text-slate-400">퀘스트로 얻은 코인으로 아바타와 방 꾸미기 아이템을 구매하세요.</p>
        <p className="mt-2 text-sm text-reward">현재 보유 코인: {user?.coins ?? 0}</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mockItems.map((item) => (
          <div key={item.itemId} className="rounded-[28px] border border-slate-800 bg-card p-5">
            <div className="grid h-36 place-items-center rounded-3xl bg-slate-900/80 text-3xl font-bold text-white">{item.image}</div>
            <p className="mt-4 text-lg font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-sm capitalize text-slate-400">{item.type}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-reward">{item.price} Coins</span>
              <button
                disabled={(user?.coins ?? 0) < item.price}
                className="rounded-2xl bg-accent px-4 py-2 text-sm font-semibold text-slate-950 disabled:bg-slate-700 disabled:text-slate-400"
              >
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { Home, Lock, Sparkles, Sofa, Sticker } from "lucide-react";
import { useApp } from "../context/AppContext";
import { RoomPlacement, ShopItem } from "../types";
import { AvatarStage, FurnitureArtwork, getItemFlavor } from "../components/LifeGameArt";

const ROOM_SLOTS = [
  { id: "slot-1", x: 18, y: 72, layer: 1, label: "Left Corner" },
  { id: "slot-2", x: 34, y: 61, layer: 2, label: "Window Side" },
  { id: "slot-3", x: 51, y: 78, layer: 0, label: "Center Floor" },
  { id: "slot-4", x: 68, y: 61, layer: 2, label: "Poster Wall" },
  { id: "slot-5", x: 84, y: 72, layer: 1, label: "Right Corner" }
];

export function RoomPage() {
  const { user, shopItems, loadShopItems, updateRoom } = useApp();
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [wallTheme, setWallTheme] = useState("mint");
  const [floorTheme, setFloorTheme] = useState("wood");
  const [placements, setPlacements] = useState<RoomPlacement[]>([]);
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<string | null>(null);
  const [hoveredFurnitureId, setHoveredFurnitureId] = useState<string | null>(null);
  const [hoveredSlotId, setHoveredSlotId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (shopItems.length === 0) {
      void loadShopItems().catch(() => undefined);
    }
  }, [loadShopItems, shopItems.length]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setTitle(user.room.title);
    setIsPublic(user.room.isPublic);
    setWallTheme(user.room.wallTheme);
    setFloorTheme(user.room.floorTheme);
    setPlacements(user.room.placements);
  }, [user]);

  const ownedFurniture = useMemo(() => {
    if (!user) {
      return [];
    }

    const ownedIds = new Set(user.ownedItemIds);
    return shopItems.filter((item) => ownedIds.has(item.itemId) && item.type === "room_furniture");
  }, [shopItems, user]);

  const selectedFurniture = ownedFurniture.find((item) => item.itemId === selectedFurnitureId) ?? null;
  const hoveredFurniture = ownedFurniture.find((item) => item.itemId === hoveredFurnitureId) ?? null;
  const spotlightFurniture = hoveredFurniture ?? selectedFurniture ?? ownedFurniture[0] ?? null;

  if (!user) {
    return null;
  }

  const placeFurniture = (slot: (typeof ROOM_SLOTS)[number]) => {
    if (!selectedFurnitureId) {
      setPlacements((prev) => prev.filter((item) => !(item.x === slot.x && item.y === slot.y)));
      return;
    }

    setPlacements((prev) => {
      const withoutSlot = prev.filter((item) => !(item.x === slot.x && item.y === slot.y));
      const withoutDuplicate = withoutSlot.filter((item) => item.itemId !== selectedFurnitureId);
      return [...withoutDuplicate, { itemId: selectedFurnitureId, x: slot.x, y: slot.y, layer: slot.layer }];
    });
  };

  const saveRoom = async () => {
    setSaving(true);
    setMessage("");

    try {
      await updateRoom({ title, isPublic, wallTheme, floorTheme, placements });
      setMessage("Miniroom saved. Your current layout is now live.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save room changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-3xl text-ink">My Room</p>
            <p className="mt-2 text-slate-600">Build a cozy minihome. Select furniture on the right, hover an empty slot, and place it into the room.</p>
          </div>
          <div className="rounded-2xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-semibold text-accent">Minihome Mode</div>
        </div>

        <div className={`mt-6 overflow-hidden rounded-[30px] p-5 ${getWallThemeClass(wallTheme)}`}>
          <div className="relative h-[460px] rounded-[28px] border border-white/35 bg-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)] backdrop-blur">
            <div className={`absolute inset-x-0 bottom-0 h-[34%] rounded-b-[28px] ${getFloorThemeClass(floorTheme)}`} />
            <div className="absolute left-8 top-10 h-28 w-20 rounded-[24px] border border-white/45 bg-white/35" />
            <div className="absolute left-12 top-14 h-20 w-12 rounded-[18px] bg-sky-200/65" />
            <div className="absolute right-10 top-8 rounded-full bg-white/55 px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              {isPublic ? "Public Room" : "Private Room"}
            </div>
            <div className="absolute right-8 top-20 h-24 w-28 rounded-[26px] border border-white/45 bg-white/35" />
            <div className="absolute right-16 top-28 h-2 w-12 rounded-full bg-slate-300/70" />

            <div className="absolute left-[42%] top-[39%] z-20 -translate-x-1/2">
              <AvatarStage avatar={user.avatar} compact className="bg-transparent p-0 shadow-none" />
              <div className="-mt-3 rounded-full bg-white/70 px-4 py-2 text-center text-xs font-semibold text-slate-700 shadow-sm">{user.nickname}</div>
            </div>

            {ROOM_SLOTS.map((slot) => {
              const placed = placements.find((item) => item.x === slot.x && item.y === slot.y);
              const shopItem = placed ? ownedFurniture.find((item) => item.itemId === placed.itemId) : undefined;
              const shouldShowGhost = !shopItem && !!selectedFurniture && hoveredSlotId === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => placeFurniture(slot)}
                  onMouseEnter={() => setHoveredSlotId(slot.id)}
                  onMouseLeave={() => setHoveredSlotId(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${slot.x}%`, top: `${slot.y}%`, zIndex: 10 + slot.layer }}
                  title={slot.label}
                >
                  {shopItem ? (
                    <FurnitureArtwork item={shopItem} compact className="rounded-[24px] border border-white/45 bg-white/52 shadow-[0_10px_26px_rgba(148,163,184,0.2)]" />
                  ) : shouldShowGhost && selectedFurniture ? (
                    <FurnitureArtwork item={selectedFurniture} compact ghost className="rounded-[24px] border border-dashed border-white/70 bg-white/25" />
                  ) : (
                    <div className="grid h-24 w-24 place-items-center rounded-[24px] border border-dashed border-white/60 bg-white/15 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Place
                    </div>
                  )}
                </button>
              );
            })}

            <div className="absolute left-6 top-6 rounded-[22px] bg-white/60 px-4 py-3 shadow-sm">
              <p className="text-sm font-semibold text-ink">{title || `${user.nickname}'s Mini Room`}</p>
              <p className="mt-1 text-xs text-slate-600">Click a slot to place or remove furniture.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Home size={18} className="text-accent" />
            <p className="font-display text-xl text-ink">Room Settings</p>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">Room Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="w-full rounded-2xl liquid-input px-4 py-3 outline-none" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Wall Theme</span>
                <select value={wallTheme} onChange={(event) => setWallTheme(event.target.value)} className="w-full rounded-2xl liquid-input px-4 py-3 outline-none">
                  <option value="mint">Mint Glass</option>
                  <option value="sunset">Sunset Peach</option>
                  <option value="sky">Sky Blue</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm text-slate-600">Floor Theme</span>
                <select value={floorTheme} onChange={(event) => setFloorTheme(event.target.value)} className="w-full rounded-2xl liquid-input px-4 py-3 outline-none">
                  <option value="wood">Wood Floor</option>
                  <option value="cloud">Cloud Mat</option>
                  <option value="check">Checker Tile</option>
                </select>
              </label>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600"
            >
              <span className="flex items-center gap-2">
                {isPublic ? <Sparkles size={16} className="text-accent" /> : <Lock size={16} className="text-slate-500" />}
                Visibility
              </span>
              <span className="font-semibold text-ink">{isPublic ? "Public" : "Private"}</span>
            </button>
          </div>
        </div>

        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Sofa size={18} className="text-reward" />
            <p className="font-display text-xl text-ink">Furniture Shelf</p>
          </div>
          <p className="mt-2 text-sm text-slate-600">Choose a piece, inspect it here, then click an empty room slot to place it.</p>

          <div className="mt-4 rounded-[28px] bg-white/55 p-4">
            {spotlightFurniture ? (
              <div className="grid gap-4 md:grid-cols-[120px_1fr]">
                <FurnitureArtwork item={spotlightFurniture} compact className="rounded-[24px] bg-white/80" />
                <div>
                  <p className="text-lg font-semibold text-ink">{spotlightFurniture.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                    {hoveredFurniture ? "Previewing" : selectedFurniture ? "Selected" : "Owned furniture"}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{getItemFlavor(spotlightFurniture)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">Buy furniture in the shop to start decorating your room.</p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {ownedFurniture.length === 0 ? (
              <div className="col-span-2 rounded-2xl bg-white/45 p-4 text-sm text-slate-500">Shop furniture appears here once you own it.</div>
            ) : (
              ownedFurniture.map((item) => {
                const active = selectedFurnitureId === item.itemId;
                const placed = placements.some((placement) => placement.itemId === item.itemId);
                return (
                  <button
                    key={item.itemId}
                    type="button"
                    onClick={() => setSelectedFurnitureId((prev) => (prev === item.itemId ? null : item.itemId))}
                    onMouseEnter={() => setHoveredFurnitureId(item.itemId)}
                    onMouseLeave={() => setHoveredFurnitureId(null)}
                    className={`rounded-[24px] border p-4 text-left transition ${
                      active ? "border-accent bg-accent/10" : "border-white/45 bg-white/45 hover:bg-white/70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <FurnitureArtwork item={item} compact className="rounded-[20px] bg-white/80" />
                      {placed ? <span className="rounded-full bg-reward/15 px-2 py-1 text-[10px] font-semibold text-reward">Placed</span> : null}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-ink">{item.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{active ? "Selected" : "Hover to inspect"}</p>
                  </button>
                );
              })
            )}
          </div>
          <button
            type="button"
            onClick={() => setSelectedFurnitureId(null)}
            className="mt-4 w-full rounded-2xl border border-white/45 px-4 py-3 text-sm text-slate-600"
          >
            Clear selection and use slot click to remove furniture
          </button>
        </div>

        <div className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center gap-2">
            <Sticker size={18} className="text-sky-500" />
            <p className="font-display text-xl text-ink">Room Notes</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            This MVP uses quick slot placement instead of free dragging, but the room now previews furniture before placement and shows your avatar live inside the scene.
          </p>
          {message ? <div className="mt-4 rounded-2xl liquid-input px-4 py-3 text-sm text-slate-600">{message}</div> : null}
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveRoom()}
            className="mt-4 w-full rounded-2xl bg-accent px-5 py-3 font-semibold text-[#35516a] disabled:bg-white/60 disabled:text-slate-600"
          >
            {saving ? "Saving..." : "Save Mini Room"}
          </button>
        </div>
      </section>
    </div>
  );
}

function getWallThemeClass(theme: string) {
  switch (theme) {
    case "sunset":
      return "bg-[linear-gradient(180deg,rgba(255,240,232,0.96),rgba(255,218,208,0.92),rgba(255,236,220,0.96))]";
    case "sky":
      return "bg-[linear-gradient(180deg,rgba(226,240,255,0.98),rgba(210,232,255,0.94),rgba(234,246,255,0.96))]";
    default:
      return "bg-[linear-gradient(180deg,rgba(239,251,245,0.98),rgba(218,243,236,0.94),rgba(232,245,255,0.96))]";
  }
}

function getFloorThemeClass(theme: string) {
  switch (theme) {
    case "cloud":
      return "bg-[linear-gradient(180deg,rgba(243,247,255,0.9),rgba(228,236,255,0.96))]";
    case "check":
      return "bg-[linear-gradient(45deg,rgba(240,240,250,0.95)_25%,rgba(225,230,245,0.95)_25%,rgba(225,230,245,0.95)_50%,rgba(240,240,250,0.95)_50%,rgba(240,240,250,0.95)_75%,rgba(225,230,245,0.95)_75%)] bg-[length:30px_30px]";
    default:
      return "bg-[linear-gradient(180deg,rgba(213,184,150,0.95),rgba(188,154,116,0.95))]";
  }
}

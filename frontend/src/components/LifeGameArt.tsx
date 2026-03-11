import { Avatar, ShopItem } from "../types";

type ItemType = ShopItem["type"] | "starter";

export function makeStarterItem(itemId: string, name: string, type: "hair" | "clothes" | "accessories"): ShopItem {
  return {
    itemId,
    name,
    type,
    price: 0,
    image: "ST"
  };
}

export function applyItemPreview(avatar: Avatar, item: ShopItem | null) {
  if (!item) {
    return avatar;
  }

  if (item.type === "hair") {
    return { ...avatar, hair: item.name };
  }

  if (item.type === "clothes") {
    return { ...avatar, clothes: item.name };
  }

  if (item.type === "accessories") {
    const nextAccessories = [item.name, ...avatar.accessories.filter((entry) => entry !== item.name)].slice(0, 3);
    return { ...avatar, accessories: nextAccessories };
  }

  return avatar;
}

export function getItemFlavor(item: ShopItem) {
  switch (item.name) {
    case "Pixel Blade Hair":
      return "Sharp neon fringe with arcade hero energy.";
    case "Cyber Cut":
      return "Smooth forward cut for a focused builder look.";
    case "Wave Rider":
      return "Loose layered hair with a relaxed creator vibe.";
    case "Guild Buzz":
      return "Clean guild-style buzz cut for simple daily grind mode.";
    case "Street Snapback":
      return "Cap-forward street look that leans playful and active.";
    case "Guild Hoodie":
      return "Soft hoodie with guild trim and easy daily wear.";
    case "Novice Hoodie":
      return "Starter hoodie built for cozy quest sessions.";
    case "Explorer Jacket":
      return "Adventure jacket with layered pockets and travel straps.";
    case "Focus Armor":
      return "Structured chest guard that feels disciplined and sturdy.";
    case "Guild Uniform":
      return "Academy uniform with clean lines and polished details.";
    case "Arcade Jacket":
      return "Retro varsity shell with bright game-center stripes.";
    case "Legend Pin":
      return "Chest pin that adds a tiny gold achievement sparkle.";
    case "Focus Charm":
      return "Pendant accessory that makes the avatar feel intentional.";
    case "Green Visor":
      return "Translucent visor with energetic runner vibes.";
    case "Lucky Ring":
      return "Subtle ring accent for small but satisfying detail.";
    case "Moon Bunny":
      return "Cute shoulder mascot that makes the avatar feel alive.";
    case "Beginner Badge":
      return "Starter badge for early-life RPG energy.";
    case "Focus Lamp":
      return "Warm standing lamp that softens the room instantly.";
    case "Mini Plant":
      return "Small leafy plant for a cozy desk-corner mood.";
    case "Cloud Bed":
      return "Chunky cloud bed that makes the room feel soft and dreamy.";
    case "Neon Poster":
      return "Bright poster splash for a more playful wall scene.";
    case "Retro Desk":
      return "Compact writing desk for study and coding sessions.";
    case "Vinyl Shelf":
      return "Display shelf with records and collectibles.";
    case "Mint Rug":
      return "Pastel rug that anchors the room and adds warmth.";
    default:
      return item.type === "room_furniture" ? "Room decoration for your minihome." : "Cosmetic gear for your avatar.";
  }
}

export function AvatarStage({
  avatar,
  className = "",
  compact = false,
  label
}: {
  avatar: Avatar;
  className?: string;
  compact?: boolean;
  label?: string;
}) {
  const shellHeight = compact ? "h-[270px]" : "h-[360px]";
  const shellWidth = compact ? "w-[220px]" : "w-[280px]";
  const scaleClass = compact ? "scale-[0.84]" : "scale-100";

  return (
    <div
      className={`rounded-[32px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(233,247,240,0.96),rgba(219,232,248,0.96))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ${className}`}
    >
      <div className={`relative mx-auto ${shellHeight} ${shellWidth}`}>
        <div className="absolute inset-x-3 bottom-3 h-10 rounded-full bg-slate-900/10 blur-xl" />
        <div className={`absolute inset-x-0 top-0 origin-top ${scaleClass}`}>
          <AvatarSilhouette avatar={avatar} />
        </div>
        {label ? (
          <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            {label}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ItemArtwork({
  item,
  className = "",
  compact = false
}: {
  item: ShopItem;
  className?: string;
  compact?: boolean;
}) {
  if (item.type === "room_furniture") {
    return <FurnitureArtwork item={item} className={className} compact={compact} />;
  }

  const mannequin = applyItemPreview(
    {
      hair: "Starter Cut",
      clothes: "Novice Hoodie",
      accessories: [],
      colors: {
        skin: "#F3C99B",
        hair: "#1E293B",
        clothes: "#22C55E"
      }
    },
    item
  );

  return <AvatarStage avatar={mannequin} compact={compact} className={className} label={item.type} />;
}

export function FurnitureArtwork({
  item,
  className = "",
  compact = false,
  ghost = false
}: {
  item: ShopItem;
  className?: string;
  compact?: boolean;
  ghost?: boolean;
}) {
  const sizeClass = compact ? "h-24 w-24" : "h-32 w-32";
  const ghostClass = ghost ? "opacity-45 saturate-50" : "";

  return (
    <div className={`grid place-items-center rounded-[26px] ${sizeClass} ${className} ${ghostClass}`}>
      {renderFurniture(item.name)}
    </div>
  );
}

function AvatarSilhouette({ avatar }: { avatar: Avatar }) {
  return (
    <div className="relative mx-auto h-[330px] w-[220px]">
      <div className="absolute inset-x-10 top-3 h-6 rounded-full bg-white/55 blur-md" />
      <div className="absolute inset-x-[52px] top-[26px] h-[92px] rounded-[44px] border-[5px] border-white/40" style={{ backgroundColor: avatar.colors.skin }} />
      <div className="absolute left-[88px] top-[64px] h-3 w-3 rounded-full bg-slate-900" />
      <div className="absolute right-[88px] top-[64px] h-3 w-3 rounded-full bg-slate-900" />
      <div className="absolute left-[94px] top-[86px] h-2 w-10 rounded-full bg-slate-900/75" />
      <div className="absolute left-[75px] top-[108px] h-10 w-[70px] rounded-b-[28px] bg-[#f5d2b8]" />
      <div className="absolute inset-x-8 top-[118px] h-[138px] rounded-[42px] border border-white/35 shadow-[inset_0_-16px_34px_rgba(0,0,0,0.12)]" style={{ backgroundColor: avatar.colors.clothes }} />
      <div className="absolute left-[18px] top-[134px] h-[92px] w-[26px] rounded-full shadow-[inset_0_-8px_10px_rgba(0,0,0,0.08)]" style={{ backgroundColor: avatar.colors.clothes }} />
      <div className="absolute right-[18px] top-[134px] h-[92px] w-[26px] rounded-full shadow-[inset_0_-8px_10px_rgba(0,0,0,0.08)]" style={{ backgroundColor: avatar.colors.clothes }} />
      <div className="absolute left-[74px] top-[248px] h-[74px] w-[20px] rounded-full bg-slate-500" />
      <div className="absolute right-[74px] top-[248px] h-[74px] w-[20px] rounded-full bg-slate-500" />
      <div className="absolute left-[64px] top-[302px] h-5 w-12 rounded-full bg-slate-800/70" />
      <div className="absolute right-[64px] top-[302px] h-5 w-12 rounded-full bg-slate-800/70" />
      {renderHair(avatar.hair, avatar.colors.hair)}
      {renderClothesDetail(avatar.clothes)}
      {avatar.accessories.map((accessory) => (
        <div key={accessory}>{renderAccessory(accessory)}</div>
      ))}
    </div>
  );
}

function renderHair(name: string, color: string) {
  switch (name) {
    case "Pixel Blade Hair":
      return (
        <>
          <div className="absolute inset-x-10 top-0 h-[72px] rounded-t-[54px] rounded-b-[20px]" style={{ backgroundColor: color }} />
          <div className="absolute left-[46px] top-[44px] h-7 w-14 -rotate-12 rounded-[18px] bg-white/18" />
          <div className="absolute right-[42px] top-[40px] h-9 w-8 rounded-b-[18px]" style={{ backgroundColor: color }} />
        </>
      );
    case "Cyber Cut":
      return (
        <>
          <div className="absolute inset-x-12 top-2 h-[66px] rounded-t-[44px] rounded-b-[28px]" style={{ backgroundColor: color }} />
          <div className="absolute left-[54px] top-[32px] h-7 w-20 rounded-br-[28px] rounded-tl-[18px] bg-white/15" />
        </>
      );
    case "Wave Rider":
      return (
        <>
          <div className="absolute inset-x-11 top-4 h-[58px] rounded-[32px]" style={{ backgroundColor: color }} />
          <div className="absolute left-[44px] top-[36px] h-8 w-12 rounded-full" style={{ backgroundColor: color }} />
          <div className="absolute right-[42px] top-[34px] h-9 w-14 rounded-full" style={{ backgroundColor: color }} />
        </>
      );
    case "Guild Buzz":
      return <div className="absolute inset-x-[58px] top-4 h-[34px] rounded-full" style={{ backgroundColor: color }} />;
    case "Street Snapback":
      return (
        <>
          <div className="absolute inset-x-[44px] top-4 h-[44px] rounded-t-[26px] rounded-b-[14px] bg-[#0f172a]" />
          <div className="absolute left-[42px] top-[38px] h-4 w-[82px] -rotate-6 rounded-full bg-[#1d4ed8]" />
          <div className="absolute right-[48px] top-[18px] h-5 w-9 rounded-full bg-[#1d4ed8]" />
        </>
      );
    default:
      return (
        <>
          <div className="absolute inset-x-11 top-4 h-[58px] rounded-t-[40px] rounded-b-[22px]" style={{ backgroundColor: color }} />
          <div className="absolute left-[48px] top-[40px] h-8 w-8 rounded-full" style={{ backgroundColor: color }} />
          <div className="absolute right-[48px] top-[40px] h-8 w-8 rounded-full" style={{ backgroundColor: color }} />
        </>
      );
  }
}

function renderClothesDetail(name: string) {
  switch (name) {
    case "Guild Hoodie":
    case "Novice Hoodie":
      return (
        <>
          <div className="absolute inset-x-[56px] top-[120px] h-10 rounded-t-[28px] border border-white/30 bg-white/18" />
          <div className="absolute inset-x-[82px] top-[180px] h-10 rounded-[18px] border border-white/20 bg-white/15" />
          <div className="absolute left-[72px] top-[124px] h-10 w-[26px] rounded-full border border-white/25 bg-transparent" />
          <div className="absolute right-[72px] top-[124px] h-10 w-[26px] rounded-full border border-white/25 bg-transparent" />
        </>
      );
    case "Explorer Jacket":
      return (
        <>
          <div className="absolute left-[72px] top-[122px] h-[132px] w-2 rounded-full bg-[#f8fafc]/60" />
          <div className="absolute right-[72px] top-[122px] h-[132px] w-2 rounded-full bg-[#f8fafc]/60" />
          <div className="absolute inset-x-[92px] top-[154px] h-16 rounded-[18px] bg-[#0f172a]/18" />
          <div className="absolute left-[48px] top-[180px] h-12 w-5 rounded-full bg-[#0f172a]/20" />
          <div className="absolute right-[48px] top-[180px] h-12 w-5 rounded-full bg-[#0f172a]/20" />
        </>
      );
    case "Focus Armor":
      return (
        <>
          <div className="absolute inset-x-[62px] top-[132px] h-20 rounded-[26px] border border-white/40 bg-slate-100/25" />
          <div className="absolute inset-x-[86px] top-[138px] h-[92px] rounded-[20px] bg-slate-900/18" />
          <div className="absolute inset-x-[74px] top-[206px] h-5 rounded-full bg-white/28" />
        </>
      );
    case "Guild Uniform":
      return (
        <>
          <div className="absolute inset-x-[72px] top-[122px] h-[120px] rounded-[24px] bg-white/16" />
          <div className="absolute left-1/2 top-[128px] h-20 w-4 -translate-x-1/2 rounded-full bg-[#1d4ed8]/70" />
          <div className="absolute left-1/2 top-[128px] h-8 w-8 -translate-x-1/2 rotate-45 bg-white/30" />
        </>
      );
    case "Arcade Jacket":
      return (
        <>
          <div className="absolute inset-x-[56px] top-[122px] h-8 rounded-full bg-[#f59e0b]/80" />
          <div className="absolute left-[62px] top-[154px] h-[82px] w-3 rounded-full bg-[#0f172a]/30" />
          <div className="absolute right-[62px] top-[154px] h-[82px] w-3 rounded-full bg-[#0f172a]/30" />
          <div className="absolute inset-x-[84px] top-[188px] h-10 rounded-[14px] bg-white/20" />
        </>
      );
    default:
      return <div className="absolute inset-x-[68px] top-[126px] h-10 rounded-full bg-white/15" />;
  }
}

function renderAccessory(name: string) {
  switch (name) {
    case "Green Visor":
      return (
        <>
          <div className="absolute left-[66px] top-[58px] h-7 w-[88px] rounded-[18px] border border-[#0f766e]/30 bg-[#34d399]/45 backdrop-blur-sm" />
          <div className="absolute left-[56px] top-[68px] h-3 w-11 rounded-full bg-[#34d399]/35" />
          <div className="absolute right-[56px] top-[68px] h-3 w-11 rounded-full bg-[#34d399]/35" />
        </>
      );
    case "Legend Pin":
      return <div className="absolute left-[78px] top-[162px] h-4 w-4 rounded-full border border-white/50 bg-[#f59e0b]" />;
    case "Beginner Badge":
      return <div className="absolute right-[76px] top-[170px] h-4 w-4 rounded-full border border-white/50 bg-[#38bdf8]" />;
    case "Focus Charm":
      return (
        <>
          <div className="absolute left-1/2 top-[118px] h-10 w-[2px] -translate-x-1/2 bg-white/65" />
          <div className="absolute left-1/2 top-[148px] h-6 w-6 -translate-x-1/2 rounded-full bg-[#f59e0b]/80 shadow-[0_0_12px_rgba(245,158,11,0.35)]" />
        </>
      );
    case "Lucky Ring":
      return <div className="absolute right-[22px] top-[186px] h-4 w-4 rounded-full border-2 border-[#f59e0b]" />;
    case "Moon Bunny":
      return (
        <>
          <div className="absolute right-[28px] top-[118px] h-9 w-8 rounded-full bg-white shadow-sm" />
          <div className="absolute right-[34px] top-[102px] h-6 w-2 rotate-[-16deg] rounded-full bg-white" />
          <div className="absolute right-[28px] top-[102px] h-6 w-2 rotate-[10deg] rounded-full bg-white" />
        </>
      );
    default:
      return null;
  }
}

function renderFurniture(name: string) {
  switch (name) {
    case "Focus Lamp":
      return (
        <div className="relative h-24 w-20">
          <div className="absolute left-1/2 top-2 h-9 w-9 -translate-x-1/2 rounded-t-full rounded-b-[18px] bg-[#fef3c7] shadow-[0_0_30px_rgba(245,158,11,0.35)]" />
          <div className="absolute left-1/2 top-10 h-10 w-1.5 -translate-x-1/2 bg-slate-500" />
          <div className="absolute bottom-3 left-1/2 h-3 w-10 -translate-x-1/2 rounded-full bg-slate-700" />
        </div>
      );
    case "Mini Plant":
      return (
        <div className="relative h-24 w-20">
          <div className="absolute bottom-4 left-1/2 h-8 w-11 -translate-x-1/2 rounded-b-[18px] rounded-t-[10px] bg-[#b45309]" />
          <div className="absolute bottom-9 left-[24px] h-10 w-4 rotate-[-18deg] rounded-full bg-[#22c55e]" />
          <div className="absolute bottom-10 left-[36px] h-11 w-4 rounded-full bg-[#16a34a]" />
          <div className="absolute bottom-9 right-[24px] h-10 w-4 rotate-[18deg] rounded-full bg-[#4ade80]" />
        </div>
      );
    case "Cloud Bed":
      return (
        <div className="relative h-24 w-28">
          <div className="absolute bottom-5 inset-x-3 h-10 rounded-[20px] bg-[#93c5fd]" />
          <div className="absolute bottom-11 left-4 h-10 w-14 rounded-full bg-white" />
          <div className="absolute bottom-12 left-12 h-9 w-11 rounded-full bg-white" />
          <div className="absolute bottom-6 left-2 h-12 w-3 rounded-full bg-[#475569]" />
          <div className="absolute bottom-6 right-2 h-12 w-3 rounded-full bg-[#475569]" />
        </div>
      );
    case "Neon Poster":
      return (
        <div className="relative h-24 w-20">
          <div className="absolute inset-2 rounded-[18px] border-2 border-[#38bdf8] bg-[#0f172a]" />
          <div className="absolute left-5 top-5 h-5 w-10 rounded-full bg-[#22c55e] shadow-[0_0_16px_rgba(34,197,94,0.55)]" />
          <div className="absolute left-7 top-12 h-2 w-8 rotate-[-14deg] rounded-full bg-[#f59e0b] shadow-[0_0_12px_rgba(245,158,11,0.55)]" />
        </div>
      );
    case "Retro Desk":
      return (
        <div className="relative h-24 w-28">
          <div className="absolute left-3 right-3 top-8 h-5 rounded-[10px] bg-[#8b5e3c]" />
          <div className="absolute bottom-4 left-6 h-12 w-2 rounded-full bg-[#6b4423]" />
          <div className="absolute bottom-4 right-6 h-12 w-2 rounded-full bg-[#6b4423]" />
          <div className="absolute right-6 top-12 h-8 w-7 rounded-[8px] bg-[#d8b892]" />
          <div className="absolute left-7 top-3 h-4 w-12 rounded-full bg-[#f8fafc]" />
        </div>
      );
    case "Vinyl Shelf":
      return (
        <div className="relative h-24 w-24">
          <div className="absolute inset-3 rounded-[16px] bg-[#475569]" />
          <div className="absolute left-6 top-7 h-12 w-2 rounded-full bg-white/30" />
          <div className="absolute right-6 top-7 h-12 w-2 rounded-full bg-white/30" />
          <div className="absolute left-8 top-8 h-8 w-8 rounded-full border-4 border-[#f59e0b] bg-[#0f172a]" />
          <div className="absolute left-12 top-12 h-2 w-2 rounded-full bg-white" />
        </div>
      );
    case "Mint Rug":
      return (
        <div className="relative h-24 w-28">
          <div className="absolute inset-x-3 bottom-5 h-12 rounded-full border border-white/60 bg-[radial-gradient(circle,rgba(255,255,255,0.8),rgba(110,231,183,0.92),rgba(45,212,191,0.92))]" />
          <div className="absolute inset-x-8 bottom-9 h-4 rounded-full bg-white/25" />
        </div>
      );
    default:
      return (
        <div className="relative h-24 w-24">
          <div className="absolute inset-4 rounded-[18px] bg-slate-200/80" />
        </div>
      );
  }
}

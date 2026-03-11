import type { CSSProperties, ReactNode } from "react";

type AvatarPreview3DProps = {
  nickname: string;
  hair: string;
  clothes: string;
  accessories: string[];
  skinColor: string;
  hairColor: string;
  clothesColor: string;
  showCaption?: boolean;
  spinDurationSeconds?: number;
};

type BoxProps = {
  className?: string;
  width: number;
  height: number;
  depth: number;
  frontColor: string;
  sideColor?: string;
  topColor?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

function shadeHexColor(hex: string, amount: number) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return hex;
  }

  const channels = normalized.match(/[A-Fa-f0-9]{2}/g);
  if (!channels) {
    return hex;
  }

  const adjusted = channels.map((channel) => {
    const value = Number.parseInt(channel, 16);
    const next = Math.max(0, Math.min(255, value + amount));
    return next.toString(16).padStart(2, "0");
  });

  return `#${adjusted.join("")}`;
}

function withAlpha(hex: string, alpha: number) {
  const normalized = normalizeHexColor(hex);
  if (!normalized) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const channels = normalized.match(/[A-Fa-f0-9]{2}/g);
  if (!channels) {
    return `rgba(255, 255, 255, ${alpha})`;
  }

  const [red, green, blue] = channels.map((channel) => Number.parseInt(channel, 16));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function normalizeHexColor(hex: string) {
  const value = hex.trim();

  if (/^#[A-Fa-f0-9]{6}$/.test(value)) {
    return value;
  }

  if (/^#[A-Fa-f0-9]{3}$/.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }

  return null;
}

function AvatarBox({
  className,
  width,
  height,
  depth,
  frontColor,
  sideColor = shadeHexColor(frontColor, -16),
  topColor = shadeHexColor(frontColor, 14),
  style,
  children
}: BoxProps) {
  const boxStyle = {
    ...style,
    ["--box-width" as "--box-width"]: `${width}px`,
    ["--box-height" as "--box-height"]: `${height}px`,
    ["--box-depth" as "--box-depth"]: `${depth}px`,
    ["--box-front" as "--box-front"]: frontColor,
    ["--box-side" as "--box-side"]: sideColor,
    ["--box-top" as "--box-top"]: topColor
  } as CSSProperties;

  return (
    <div className={`avatar-box ${className ?? ""}`.trim()} style={boxStyle}>
      <span className="avatar-face avatar-face-front" />
      <span className="avatar-face avatar-face-back" />
      <span className="avatar-face avatar-face-right" />
      <span className="avatar-face avatar-face-left" />
      <span className="avatar-face avatar-face-top" />
      <span className="avatar-face avatar-face-bottom" />
      {children}
    </div>
  );
}

export function AvatarPreview3D({
  nickname,
  hair,
  clothes,
  accessories,
  skinColor,
  hairColor,
  clothesColor,
  showCaption = true,
  spinDurationSeconds = 16
}: AvatarPreview3DProps) {
  const skinSide = shadeHexColor(skinColor, -18);
  const skinTop = shadeHexColor(skinColor, 12);
  const hairSide = shadeHexColor(hairColor, -20);
  const hairTop = shadeHexColor(hairColor, 18);
  const clothesSide = shadeHexColor(clothesColor, -22);
  const clothesTop = shadeHexColor(clothesColor, 14);
  const visorEnabled = accessories.includes("Green Visor");
  const badgeEnabled = accessories.includes("Beginner Badge");
  const charmEnabled = accessories.includes("Focus Charm");
  const ringEnabled = accessories.includes("Lucky Ring");

  const hairCapHeight = hair === "Guild Buzz" ? 18 : hair === "Starter Cut" ? 24 : 30;
  const hairCapDepth = hair === "Wave Rider" ? 74 : 64;
  const jacketHeight = clothes === "Explorer Jacket" ? 122 : clothes === "Guild Uniform" ? 128 : 114;
  const shoulderSize = clothes === "Focus Armor" ? 24 : 16;
  const hemColor = clothes === "Guild Uniform" ? "#F8FAFC" : shadeHexColor(clothesColor, 24);

  return (
    <div className="avatar-stage" style={{ ["--avatar-spin-duration" as string]: `${spinDurationSeconds}s` } as CSSProperties}>
      <div className="avatar-aura" style={{ background: `radial-gradient(circle, ${withAlpha(clothesColor, 0.28)} 0%, transparent 72%)` }} />
      <div className="avatar-platform" />
      <div className="avatar-shadow" />

      <div className="avatar-orbit">
        <div className="avatar-character">
          <AvatarBox
            className="avatar-torso"
            width={104}
            height={jacketHeight}
            depth={62}
            frontColor={clothesColor}
            sideColor={clothesSide}
            topColor={clothesTop}
          >
            <span className="avatar-chest-panel" style={{ background: `linear-gradient(180deg, ${withAlpha(hemColor, 0.92)}, ${withAlpha(hemColor, 0.45)})` }} />
            {badgeEnabled ? <span className="avatar-badge" /> : null}
            {charmEnabled ? <span className="avatar-charm" style={{ backgroundColor: shadeHexColor(hairColor, 22) }} /> : null}
          </AvatarBox>

          <AvatarBox
            className="avatar-head"
            width={74}
            height={80}
            depth={66}
            frontColor={skinColor}
            sideColor={skinSide}
            topColor={skinTop}
          >
            <span className="avatar-face-detail avatar-eye avatar-eye-left" />
            <span className="avatar-face-detail avatar-eye avatar-eye-right" />
            <span className="avatar-face-detail avatar-mouth" />
            {visorEnabled ? <span className="avatar-face-detail avatar-visor" /> : null}
          </AvatarBox>

          <AvatarBox
            className="avatar-hair-cap"
            width={84}
            height={hairCapHeight}
            depth={hairCapDepth}
            frontColor={hairColor}
            sideColor={hairSide}
            topColor={hairTop}
          />

          {hair !== "Guild Buzz" ? (
            <AvatarBox
              className="avatar-fringe"
              width={78}
              height={18}
              depth={22}
              frontColor={hairColor}
              sideColor={hairSide}
              topColor={hairTop}
            />
          ) : null}

          {hair === "Cyber Cut" ? (
            <>
              <AvatarBox className="avatar-side-panel avatar-side-panel-left" width={16} height={34} depth={18} frontColor={hairColor} sideColor={hairSide} topColor={hairTop} />
              <AvatarBox className="avatar-side-panel avatar-side-panel-right" width={16} height={34} depth={18} frontColor={hairColor} sideColor={hairSide} topColor={hairTop} />
            </>
          ) : null}

          {hair === "Wave Rider" ? (
            <AvatarBox className="avatar-wave-tail" width={62} height={52} depth={18} frontColor={hairColor} sideColor={hairSide} topColor={hairTop} />
          ) : null}

          <AvatarBox
            className="avatar-arm avatar-arm-left"
            width={26}
            height={102}
            depth={28}
            frontColor={skinColor}
            sideColor={skinSide}
            topColor={skinTop}
          />
          <AvatarBox
            className="avatar-arm avatar-arm-right"
            width={26}
            height={102}
            depth={28}
            frontColor={skinColor}
            sideColor={skinSide}
            topColor={skinTop}
          />

          {clothes === "Focus Armor" ? (
            <>
              <AvatarBox className="avatar-shoulder avatar-shoulder-left" width={shoulderSize} height={18} depth={40} frontColor={shadeHexColor(clothesColor, 8)} sideColor={clothesSide} topColor={clothesTop} />
              <AvatarBox className="avatar-shoulder avatar-shoulder-right" width={shoulderSize} height={18} depth={40} frontColor={shadeHexColor(clothesColor, 8)} sideColor={clothesSide} topColor={clothesTop} />
            </>
          ) : null}

          <AvatarBox
            className="avatar-leg avatar-leg-left"
            width={30}
            height={106}
            depth={34}
            frontColor={shadeHexColor(clothesColor, -8)}
            sideColor={shadeHexColor(clothesColor, -24)}
            topColor={shadeHexColor(clothesColor, 10)}
          />
          <AvatarBox
            className="avatar-leg avatar-leg-right"
            width={30}
            height={106}
            depth={34}
            frontColor={shadeHexColor(clothesColor, -8)}
            sideColor={shadeHexColor(clothesColor, -24)}
            topColor={shadeHexColor(clothesColor, 10)}
          />

          <AvatarBox className="avatar-shoe avatar-shoe-left" width={42} height={16} depth={58} frontColor="#EEF4FA" sideColor="#D0DCE8" topColor="#FFFFFF" />
          <AvatarBox className="avatar-shoe avatar-shoe-right" width={42} height={16} depth={58} frontColor="#EEF4FA" sideColor="#D0DCE8" topColor="#FFFFFF" />

          {ringEnabled ? <span className="avatar-ring" style={{ borderColor: withAlpha(hairColor, 0.9) }} /> : null}
        </div>
      </div>

      {showCaption ? (
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold text-ink">{nickname}</p>
          <p className="mt-1 text-sm text-slate-600">3D preview • {hair} • {clothes}</p>
        </div>
      ) : null}
    </div>
  );
}

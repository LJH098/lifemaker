import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, OrbitControls, RoundedBox } from "@react-three/drei";
import { useMemo, useRef } from "react";
import { Group } from "three";

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
  characterScale?: number;
  verticalOffset?: number;
  variant?: "studio" | "embedded";
};

type AvatarModelProps = {
  hair: string;
  clothes: string;
  accessories: string[];
  skinColor: string;
  hairColor: string;
  clothesColor: string;
  spinDurationSeconds: number;
  characterScale: number;
  verticalOffset: number;
  variant: "studio" | "embedded";
};

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

function accessoryFlags(accessories: string[]) {
  return {
    visor: accessories.includes("Green Visor"),
    badge: accessories.includes("Beginner Badge") || accessories.includes("Legend Pin"),
    charm: accessories.includes("Focus Charm"),
    ring: accessories.includes("Lucky Ring"),
    bunny: accessories.includes("Moon Bunny")
  };
}

function hairVariant(hair: string) {
  switch (hair) {
    case "Guild Buzz":
      return "buzz";
    case "Wave Rider":
      return "wave";
    case "Street Snapback":
      return "cap";
    case "Cyber Cut":
    case "Soft Crop":
    case "City Layer":
      return "cyber";
    default:
      return "starter";
  }
}

function outfitVariant(clothes: string) {
  switch (clothes) {
    case "Explorer Jacket":
      return "jacket";
    case "Focus Armor":
      return "armor";
    case "Guild Uniform":
      return "uniform";
    case "Arcade Jacket":
      return "arcade";
    default:
      return "hoodie";
  }
}

function AvatarModel({
  hair,
  clothes,
  accessories,
  skinColor,
  hairColor,
  clothesColor,
  spinDurationSeconds,
  characterScale,
  verticalOffset,
  variant
}: AvatarModelProps) {
  const rootRef = useRef<Group>(null);
  const flags = accessoryFlags(accessories);
  const hairStyle = hairVariant(hair);
  const outfitStyle = outfitVariant(clothes);
  const embedded = variant === "embedded";

  const palette = useMemo(
    () => ({
      skin: normalizeHexColor(skinColor) ?? "#d7a26c",
      skinShadow: shadeHexColor(skinColor, -24),
      skinGlow: shadeHexColor(skinColor, 12),
      hair: normalizeHexColor(hairColor) ?? "#2ecf72",
      hairLight: shadeHexColor(hairColor, 18),
      hairShadow: shadeHexColor(hairColor, -28),
      clothes: normalizeHexColor(clothesColor) ?? "#4ab8ff",
      clothesShadow: shadeHexColor(clothesColor, -32),
      clothesLight: shadeHexColor(clothesColor, 18),
      pants: shadeHexColor(clothesColor, -16),
      sole: "#edf3fb",
      metal: "#d8e4f3",
      dark: "#243648",
      blush: "#edb0ab",
      reward: "#f5ae28"
    }),
    [clothesColor, hairColor, skinColor]
  );

  const outfitAccent = useMemo(() => {
    switch (outfitStyle) {
      case "armor":
        return "#d9eef7";
      case "uniform":
        return "#203449";
      case "arcade":
        return "#ffc95b";
      case "jacket":
        return "#d9f3e7";
      default:
        return "#b9d9f7";
    }
  }, [outfitStyle]);

  useFrame((state) => {
    if (!rootRef.current) {
      return;
    }

    const elapsed = state.clock.getElapsedTime();
    const cycle = (Math.PI * 2) / Math.max(spinDurationSeconds, 6);
    const baseY = (embedded ? -1.26 : -1.18) + verticalOffset * 0.002;
    const bobAmount = embedded ? 0.01 : 0.018;
    rootRef.current.rotation.y = Math.sin(elapsed * cycle) * 0.34;
    rootRef.current.rotation.x = Math.sin(elapsed * 0.7) * 0.02;
    rootRef.current.position.set(0, baseY + Math.sin(elapsed * 1.2) * bobAmount, 0);
  });

  return (
    <group ref={rootRef} scale={Math.max(characterScale, 0.35) * 0.82} position={[0, embedded ? -1.26 : -1.18, 0]}>
      <group>
        <mesh castShadow position={[0, 2.58, -0.1]} scale={[0.92, 0.54, 0.9]}>
          <sphereGeometry args={[0.72, 28, 24]} />
          <meshStandardMaterial color={palette.hairShadow} roughness={0.78} metalness={0.04} />
        </mesh>

        {hairStyle !== "buzz" ? (
          <>
            <mesh castShadow position={[0, 2.62, -0.02]} scale={[0.92, 0.58, 0.88]}>
              <sphereGeometry args={[0.68, 28, 24]} />
              <meshStandardMaterial color={palette.hair} roughness={0.68} metalness={0.05} />
            </mesh>
            <RoundedBox args={[0.14, 0.28, 0.46]} radius={0.1} smoothness={4} position={[-0.44, 2.38, 0.08]} castShadow>
              <meshStandardMaterial color={palette.hairShadow} roughness={0.72} metalness={0.04} />
            </RoundedBox>
            <RoundedBox args={[0.14, 0.28, 0.46]} radius={0.1} smoothness={4} position={[0.44, 2.38, 0.08]} castShadow>
              <meshStandardMaterial color={palette.hairShadow} roughness={0.72} metalness={0.04} />
            </RoundedBox>
          </>
        ) : null}

        {hairStyle === "starter" ? (
          <RoundedBox args={[0.56, 0.08, 0.12]} radius={0.04} smoothness={4} position={[0, 2.46, 0.5]} castShadow>
            <meshStandardMaterial color={palette.hair} roughness={0.7} metalness={0.04} />
          </RoundedBox>
        ) : null}

        {hairStyle === "wave" ? (
          <>
            <RoundedBox args={[0.62, 0.1, 0.14]} radius={0.05} smoothness={4} position={[0.04, 2.46, 0.5]} castShadow rotation={[0.08, 0.06, 0]}>
              <meshStandardMaterial color={palette.hair} roughness={0.68} metalness={0.05} />
            </RoundedBox>
            <RoundedBox args={[0.22, 0.08, 0.1]} radius={0.04} smoothness={4} position={[0.2, 2.54, 0.45]} castShadow rotation={[0.16, 0, 0.06]}>
              <meshStandardMaterial color={palette.hairLight} roughness={0.66} metalness={0.04} />
            </RoundedBox>
          </>
        ) : null}

        {hairStyle === "cyber" ? (
          <>
            <RoundedBox args={[0.62, 0.08, 0.12]} radius={0.04} smoothness={4} position={[0, 2.46, 0.48]} castShadow>
              <meshStandardMaterial color={palette.hairShadow} roughness={0.58} metalness={0.2} />
            </RoundedBox>
            <RoundedBox args={[0.08, 0.18, 0.06]} radius={0.03} smoothness={4} position={[0.34, 2.56, 0.18]} castShadow>
              <meshStandardMaterial color="#d7f7ff" emissive="#79f5ff" emissiveIntensity={0.28} roughness={0.34} metalness={0.16} />
            </RoundedBox>
          </>
        ) : null}

        {hairStyle === "cap" ? (
          <>
            <RoundedBox args={[1.02, 0.28, 0.92]} radius={0.16} smoothness={5} position={[0, 2.62, 0.02]} castShadow>
              <meshStandardMaterial color={palette.hair} roughness={0.58} metalness={0.08} />
            </RoundedBox>
            <RoundedBox args={[0.74, 0.08, 0.26]} radius={0.05} smoothness={4} position={[0, 2.44, 0.56]} castShadow rotation={[-0.1, 0, 0]}>
              <meshStandardMaterial color={palette.hairShadow} roughness={0.56} metalness={0.08} />
            </RoundedBox>
          </>
        ) : null}
      </group>

      <RoundedBox args={[1.08, 1.06, 1.02]} radius={0.22} smoothness={6} position={[0, 2.14, 0]} castShadow>
        <meshStandardMaterial color={palette.skin} roughness={0.84} metalness={0.03} />
      </RoundedBox>

      <RoundedBox args={[0.24, 0.22, 0.14]} radius={0.07} smoothness={4} position={[0, 1.48, 0]} castShadow>
        <meshStandardMaterial color={palette.skinShadow} roughness={0.86} metalness={0.02} />
      </RoundedBox>

      <RoundedBox args={[0.28, 0.1, 0.08]} radius={0.03} smoothness={4} position={[-0.22, 2.2, 0.53]} castShadow>
        <meshStandardMaterial color="#fbfdff" roughness={0.32} metalness={0.02} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.1, 0.08]} radius={0.03} smoothness={4} position={[0.22, 2.2, 0.53]} castShadow>
        <meshStandardMaterial color="#fbfdff" roughness={0.32} metalness={0.02} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.05, 0.08]} radius={0.03} smoothness={4} position={[-0.22, 2.2, 0.57]} castShadow>
        <meshStandardMaterial color={palette.dark} roughness={0.3} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.05, 0.08]} radius={0.03} smoothness={4} position={[0.22, 2.2, 0.57]} castShadow>
        <meshStandardMaterial color={palette.dark} roughness={0.3} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.025, 0.05]} radius={0.02} smoothness={4} position={[0, 1.92, 0.57]} castShadow>
        <meshStandardMaterial color="#8f5b46" roughness={0.46} metalness={0.02} />
      </RoundedBox>
      <RoundedBox args={[0.16, 0.08, 0.06]} radius={0.03} smoothness={4} position={[0, 2.06, 0.56]} castShadow>
        <meshStandardMaterial color={palette.skinShadow} roughness={0.82} metalness={0.02} />
      </RoundedBox>

      {flags.visor ? (
        <RoundedBox args={[0.88, 0.2, 0.12]} radius={0.08} smoothness={4} position={[0, 2.24, 0.6]} castShadow>
          <meshStandardMaterial color="#8fe5ff" opacity={0.55} transparent roughness={0.08} metalness={0.36} />
        </RoundedBox>
      ) : null}

      <RoundedBox args={[1.46, 1.72, 0.96]} radius={0.22} smoothness={6} position={[0, 0.78, 0]} castShadow>
        <meshStandardMaterial color={palette.clothes} roughness={0.7} metalness={0.08} />
      </RoundedBox>

      <RoundedBox args={[0.96, 1.08, 0.12]} radius={0.12} smoothness={4} position={[0, 0.82, 0.46]} castShadow>
        <meshStandardMaterial color={palette.clothesLight} roughness={0.62} metalness={0.06} />
      </RoundedBox>

      <RoundedBox args={[0.76, 0.14, 0.09]} radius={0.06} smoothness={4} position={[0, 1.36, 0.52]} castShadow>
        <meshStandardMaterial color={outfitAccent} roughness={0.46} metalness={0.12} />
      </RoundedBox>

      {outfitStyle === "jacket" ? (
        <>
          <RoundedBox args={[0.14, 1.3, 0.08]} radius={0.05} smoothness={4} position={[0, 0.78, 0.52]} castShadow>
            <meshStandardMaterial color="#f4faf8" roughness={0.48} metalness={0.08} />
          </RoundedBox>
          <RoundedBox args={[0.34, 0.16, 0.08]} radius={0.05} smoothness={4} position={[-0.27, 1.47, 0.52]} castShadow rotation={[0, 0, 0.44]}>
            <meshStandardMaterial color="#eff8f0" roughness={0.42} metalness={0.08} />
          </RoundedBox>
          <RoundedBox args={[0.34, 0.16, 0.08]} radius={0.05} smoothness={4} position={[0.27, 1.47, 0.52]} castShadow rotation={[0, 0, -0.44]}>
            <meshStandardMaterial color="#eff8f0" roughness={0.42} metalness={0.08} />
          </RoundedBox>
        </>
      ) : null}

      {outfitStyle === "armor" ? (
        <>
          <RoundedBox args={[1.18, 0.78, 0.18]} radius={0.1} smoothness={4} position={[0, 1.0, 0.56]} castShadow>
            <meshStandardMaterial color="#eff8ff" roughness={0.34} metalness={0.32} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.18, 0.16]} radius={0.08} smoothness={4} position={[-0.74, 1.42, 0.22]} castShadow>
            <meshStandardMaterial color="#dff2fb" roughness={0.34} metalness={0.32} />
          </RoundedBox>
          <RoundedBox args={[0.42, 0.18, 0.16]} radius={0.08} smoothness={4} position={[0.74, 1.42, 0.22]} castShadow>
            <meshStandardMaterial color="#dff2fb" roughness={0.34} metalness={0.32} />
          </RoundedBox>
        </>
      ) : null}

      {outfitStyle === "uniform" ? (
        <>
          <RoundedBox args={[0.9, 0.16, 0.08]} radius={0.06} smoothness={4} position={[0, 0.62, 0.53]} castShadow>
            <meshStandardMaterial color="#183247" roughness={0.42} metalness={0.12} />
          </RoundedBox>
          <RoundedBox args={[0.14, 1.12, 0.08]} radius={0.06} smoothness={4} position={[0, 0.8, 0.53]} castShadow>
            <meshStandardMaterial color="#eff7fb" roughness={0.4} metalness={0.08} />
          </RoundedBox>
        </>
      ) : null}

      {outfitStyle === "arcade" ? (
        <>
          <RoundedBox args={[1.1, 0.22, 0.08]} radius={0.08} smoothness={4} position={[0, 0.84, 0.53]} castShadow>
            <meshStandardMaterial color="#ffd16a" roughness={0.34} metalness={0.16} />
          </RoundedBox>
          <RoundedBox args={[1.1, 0.1, 0.08]} radius={0.05} smoothness={4} position={[0, 0.56, 0.53]} castShadow>
            <meshStandardMaterial color="#eff8fe" roughness={0.36} metalness={0.1} />
          </RoundedBox>
        </>
      ) : null}

      {flags.badge ? (
        <mesh castShadow position={[0.48, 1.12, 0.56]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 28]} />
          <meshStandardMaterial color={palette.reward} roughness={0.32} metalness={0.28} />
        </mesh>
      ) : null}

      {flags.charm ? (
        <group position={[-0.44, 0.06, 0.52]}>
          <mesh castShadow>
            <torusGeometry args={[0.07, 0.02, 14, 30]} />
            <meshStandardMaterial color="#ffe1a6" roughness={0.34} metalness={0.24} />
          </mesh>
          <mesh castShadow position={[0, -0.14, 0]}>
            <sphereGeometry args={[0.05, 18, 18]} />
            <meshStandardMaterial color="#fff2d3" roughness={0.4} metalness={0.16} />
          </mesh>
        </group>
      ) : null}

      <RoundedBox args={[1.02, 0.52, 0.76]} radius={0.18} smoothness={5} position={[0, -0.3, 0]} castShadow>
        <meshStandardMaterial color={palette.pants} roughness={0.72} metalness={0.08} />
      </RoundedBox>

      <group position={[-0.92, 0.84, 0]}>
        <mesh castShadow position={[0.06, 0.56, 0]}>
          <sphereGeometry args={[0.21, 20, 18]} />
          <meshStandardMaterial color={palette.clothes} roughness={0.66} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, -0.14, 0]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.2, 1.08, 8, 18]} />
          <meshStandardMaterial color={palette.clothes} roughness={0.66} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0.08, -0.98, 0.04]}>
          <sphereGeometry args={[0.19, 20, 18]} />
          <meshStandardMaterial color={palette.skin} roughness={0.86} metalness={0.03} />
        </mesh>
      </group>

      <group position={[0.92, 0.84, 0]}>
        <mesh castShadow position={[-0.06, 0.56, 0]}>
          <sphereGeometry args={[0.21, 20, 18]} />
          <meshStandardMaterial color={palette.clothes} roughness={0.66} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, -0.14, 0]} rotation={[0, 0, -0.12]}>
          <capsuleGeometry args={[0.2, 1.08, 8, 18]} />
          <meshStandardMaterial color={palette.clothes} roughness={0.66} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[-0.08, -0.98, 0.04]}>
          <sphereGeometry args={[0.19, 20, 18]} />
          <meshStandardMaterial color={palette.skin} roughness={0.86} metalness={0.03} />
        </mesh>
      </group>

      <group position={[-0.34, -1.24, 0]}>
        <mesh castShadow position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.2, 20, 18]} />
          <meshStandardMaterial color={palette.pants} roughness={0.68} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.21, 1.06, 8, 18]} />
          <meshStandardMaterial color={palette.pants} roughness={0.68} metalness={0.08} />
        </mesh>
        <RoundedBox args={[0.56, 0.26, 0.96]} radius={0.14} smoothness={4} position={[0, -1.06, 0.18]} castShadow>
          <meshStandardMaterial color={palette.dark} roughness={0.58} metalness={0.06} />
        </RoundedBox>
        <RoundedBox args={[0.56, 0.08, 0.98]} radius={0.05} smoothness={4} position={[0, -1.15, 0.18]} castShadow>
          <meshStandardMaterial color={palette.sole} roughness={0.62} metalness={0.04} />
        </RoundedBox>
      </group>

      <group position={[0.34, -1.24, 0]}>
        <mesh castShadow position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.2, 20, 18]} />
          <meshStandardMaterial color={palette.pants} roughness={0.68} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, -0.34, 0]}>
          <capsuleGeometry args={[0.21, 1.06, 8, 18]} />
          <meshStandardMaterial color={palette.pants} roughness={0.68} metalness={0.08} />
        </mesh>
        <RoundedBox args={[0.56, 0.26, 0.96]} radius={0.14} smoothness={4} position={[0, -1.06, 0.18]} castShadow>
          <meshStandardMaterial color={palette.dark} roughness={0.58} metalness={0.06} />
        </RoundedBox>
        <RoundedBox args={[0.56, 0.08, 0.98]} radius={0.05} smoothness={4} position={[0, -1.15, 0.18]} castShadow>
          <meshStandardMaterial color={palette.sole} roughness={0.62} metalness={0.04} />
        </RoundedBox>
      </group>

      {flags.ring ? (
        <mesh castShadow position={[-0.82, -0.1, 0.2]} rotation={[Math.PI / 2, 0.3, 0.2]}>
          <torusGeometry args={[0.08, 0.018, 12, 24]} />
          <meshStandardMaterial color="#ffe4a4" roughness={0.24} metalness={0.42} />
        </mesh>
      ) : null}

      {flags.bunny ? (
        <group position={[0.66, 1.78, -0.04]} rotation={[0, 0, -0.12]}>
          <mesh castShadow position={[0, 0.02, 0]}>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshStandardMaterial color="#fff7fb" roughness={0.84} metalness={0.02} />
          </mesh>
          <mesh castShadow position={[-0.07, 0.24, 0]} rotation={[0, 0, 0.18]}>
            <capsuleGeometry args={[0.04, 0.2, 6, 12]} />
            <meshStandardMaterial color="#fff7fb" roughness={0.84} metalness={0.02} />
          </mesh>
          <mesh castShadow position={[0.07, 0.24, 0]} rotation={[0, 0, -0.18]}>
            <capsuleGeometry args={[0.04, 0.2, 6, 12]} />
            <meshStandardMaterial color="#fff7fb" roughness={0.84} metalness={0.02} />
          </mesh>
        </group>
      ) : null}
    </group>
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
  spinDurationSeconds = 16,
  characterScale = 1,
  verticalOffset = 0,
  variant = "studio"
}: AvatarPreview3DProps) {
  const embedded = variant === "embedded";

  return (
    <div className={`avatar-stage avatar-stage-3d ${embedded ? "avatar-stage-embedded" : ""}`}>
      <div className={`avatar-canvas-shell ${embedded ? "avatar-canvas-shell-embedded" : ""}`}>
        <Canvas
          dpr={[1, 1.8]}
          camera={embedded ? { position: [0, -0.12, 11.4], fov: 48 } : { position: [0, -0.02, 9.8], fov: 44 }}
          shadows
          gl={{ antialias: true, alpha: true }}
        >
          {!embedded ? <fog attach="fog" args={["#dfeef2", 8, 14]} /> : null}
          <ambientLight intensity={1.4} />
          <hemisphereLight intensity={0.95} groundColor="#c2d6dd" color="#ffffff" />
          <directionalLight
            castShadow
            position={[4.8, 7.2, 5.4]}
            intensity={1.5}
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-4, 3.5, -3.5]} intensity={0.4} color="#d6eef8" />

          <AvatarModel
            hair={hair}
            clothes={clothes}
            accessories={accessories}
            skinColor={skinColor}
            hairColor={hairColor}
            clothesColor={clothesColor}
            spinDurationSeconds={spinDurationSeconds}
            characterScale={characterScale}
            verticalOffset={verticalOffset}
            variant={variant}
          />

          <ContactShadows
            position={[0, embedded ? -2.36 : -2.28, 0]}
            scale={embedded ? 3.5 : 4.3}
            blur={2.2}
            opacity={embedded ? 0.24 : 0.28}
            far={4.6}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={embedded ? [0, -0.46, 0] : [0, -0.3, 0]}
            minPolarAngle={1.2}
            maxPolarAngle={1.76}
          />
        </Canvas>
      </div>

      {showCaption && !embedded ? (
        <div className="avatar-preview-copy">
          <p className="avatar-preview-name">{nickname}</p>
          <p className="avatar-preview-meta">3D character preview</p>
        </div>
      ) : null}
    </div>
  );
}

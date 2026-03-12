import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Html, RoundedBox } from "@react-three/drei";
import { useApp } from "../context/AppContext";
import { mockChat } from "../data/mockData";
import { connectChat, type ChatConnection } from "../services/chat";
import { Avatar, ChatMessage } from "../types";
import { AvatarRig } from "../components/AvatarPreview3D";

type AvatarPaletteName = "sky" | "mint" | "sunset" | "berry" | "gold";
type MovementState = "idle" | "walk";

type ParticipantAvatar = {
  hair: string;
  clothes: string;
  accessories: string[];
  skinColor: string;
  hairColor: string;
  clothesColor: string;
};

type Participant = {
  id: string;
  nickname: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  facingDirection: number;
  movementState: MovementState;
  palette: AvatarPaletteName;
  avatar: ParticipantAvatar;
  lastSeen: number;
  lastSpokeAt: number;
  speech: string;
  isSelf: boolean;
};

type PlazaCollider = {
  x: number;
  y: number;
  halfW: number;
  halfH: number;
};

const INITIAL_MESSAGES = mockChat.map((message) => ({ ...message, type: "CHAT" as const }));
const ROOM_ID = "plaza";
const MOVE_SPEED = 24;
const NETWORK_MOVE_THROTTLE_MS = 110;
const HEARTBEAT_INTERVAL_MS = 12000;
const STALE_PARTICIPANT_MS = 35000;
const SPEECH_BUBBLE_MS = 9000;
const LOCAL_LERP = 0.26;
const REMOTE_LERP = 0.14;
const BOUNDS = {
  minX: 10,
  maxX: 90,
  minY: 48,
  maxY: 94
};
const WORLD_HALF_WIDTH = 11.8;
const WORLD_HALF_DEPTH = 8.8;
const PLAZA_COLLIDERS: PlazaCollider[] = [
  worldRectToPercent(0, -0.2, 2.15, 2.15),
  worldRectToPercent(-4.3, 2.6, 1.9, 0.72),
  worldRectToPercent(4.4, 3.2, 1.9, 0.72),
  worldRectToPercent(-8.6, -6.4, 1.15, 1.15),
  worldRectToPercent(-10.8, 1.5, 1.15, 1.15),
  worldRectToPercent(8.8, -5.8, 1.15, 1.15),
  worldRectToPercent(10.2, 2.4, 1.15, 1.15),
  worldRectToPercent(-6.8, 7.1, 1.15, 1.15),
  worldRectToPercent(7.1, 7.8, 1.15, 1.15)
];

const PALETTES: Record<
  AvatarPaletteName,
  {
    glow: string;
    speechShadow: string;
  }
> = {
  sky: {
    glow: "rgba(128, 196, 255, 0.24)",
    speechShadow: "rgba(66, 129, 183, 0.2)"
  },
  mint: {
    glow: "rgba(126, 224, 176, 0.22)",
    speechShadow: "rgba(57, 133, 101, 0.2)"
  },
  sunset: {
    glow: "rgba(255, 159, 124, 0.24)",
    speechShadow: "rgba(161, 94, 68, 0.2)"
  },
  berry: {
    glow: "rgba(240, 139, 180, 0.22)",
    speechShadow: "rgba(132, 68, 95, 0.2)"
  },
  gold: {
    glow: "rgba(255, 209, 102, 0.22)",
    speechShadow: "rgba(148, 117, 44, 0.2)"
  }
};

const PLAZA_SPAWN_POINTS = [
  { x: 26, y: 78 },
  { x: 38, y: 82 },
  { x: 62, y: 82 },
  { x: 74, y: 78 },
  { x: 24, y: 58 },
  { x: 76, y: 58 },
  { x: 32, y: 68 },
  { x: 68, y: 68 }
];

export function PlazaPage() {
  const { user } = useApp();
  const guestIdRef = useRef(createClientId());
  const connectionRef = useRef<ChatConnection | null>(null);
  const localParticipantRef = useRef<Participant | null>(null);
  const participantsRef = useRef<Record<string, Participant>>({});
  const keysRef = useRef<Record<string, boolean>>({});
  const moveBroadcastAtRef = useRef(0);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [participants, setParticipants] = useState<Record<string, Participant>>({});
  const [draft, setDraft] = useState("");
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const localParticipantId = user?.id ?? guestIdRef.current;
  const localNickname = user?.nickname ?? "QuestRunner";
  const localPalette = paletteFromSeed(user?.nickname ?? localParticipantId);
  const localAvatar = useMemo(() => mapUserAvatar(user?.avatar, localPalette), [localPalette, user?.avatar]);

  const participantList = Object.values(participants).sort((left, right) => {
    if (left.isSelf !== right.isSelf) {
      return left.isSelf ? -1 : 1;
    }
    return left.nickname.localeCompare(right.nickname);
  });

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    const current = participantsRef.current[localParticipantId];
    const seededSpawn = seedSpawnPoint(localParticipantId);
    const startX = current?.x ?? seededSpawn.x;
    const startY = current?.y ?? seededSpawn.y;
    const nextParticipant: Participant = {
      id: localParticipantId,
      nickname: localNickname,
      x: startX,
      y: startY,
      targetX: startX,
      targetY: startY,
      facingDirection: current?.facingDirection ?? 0,
      movementState: current?.movementState ?? "idle",
      palette: current?.palette ?? localPalette,
      avatar: current?.avatar ?? localAvatar,
      lastSeen: Date.now(),
      lastSpokeAt: current?.lastSpokeAt ?? 0,
      speech: current?.speech ?? "",
      isSelf: true
    };

    localParticipantRef.current = nextParticipant;
    setParticipants((prev) => ({ ...prev, [localParticipantId]: nextParticipant }));
  }, [localAvatar, localNickname, localPalette, localParticipantId]);

  useEffect(() => {
    let cancelled = false;

    const handleRealtimeMessage = (message: ChatMessage) => {
      if (cancelled) {
        return;
      }

      setConnected(true);
      const eventType = message.type ?? "CHAT";
      const senderId = message.senderId ?? message.senderNickname;

      if (eventType === "PRESENCE_SYNC" && message.targetUserId && message.targetUserId !== localParticipantId) {
        return;
      }

      if (eventType === "LEAVE") {
        if (senderId === localParticipantId) {
          return;
        }
        setParticipants((prev) => {
          const next = { ...prev };
          delete next[senderId];
          return next;
        });
        return;
      }

      if (eventType === "CHAT") {
        setMessages((prev) => [...prev, message]);
      }

      const now = Date.now();

      setParticipants((prev) => {
        const existing = prev[senderId];
        const seededSpawn = seedSpawnPoint(senderId);
        const targetX = typeof message.avatarX === "number" ? clamp(message.avatarX, BOUNDS.minX, BOUNDS.maxX) : existing?.targetX ?? seededSpawn.x;
        const targetY = typeof message.avatarY === "number" ? clamp(message.avatarY, BOUNDS.minY, BOUNDS.maxY) : existing?.targetY ?? seededSpawn.y;
        const nextParticipant: Participant = {
          id: senderId,
          nickname: message.senderNickname || existing?.nickname || "Visitor",
          x: existing?.x ?? targetX,
          y: existing?.y ?? targetY,
          targetX,
          targetY,
          facingDirection: computeFacingDirection(existing?.targetX ?? targetX, existing?.targetY ?? targetY, targetX, targetY, existing?.facingDirection ?? 0),
          movementState: Math.abs(targetX - (existing?.x ?? targetX)) > 0.08 || Math.abs(targetY - (existing?.y ?? targetY)) > 0.08 ? "walk" : "idle",
          palette: parsePalette(message.avatarPalette, message.senderNickname || senderId),
          avatar: parseAvatarAppearance(message, existing?.avatar, parsePalette(message.avatarPalette, message.senderNickname || senderId)),
          lastSeen: now,
          lastSpokeAt: eventType === "CHAT" ? now : existing?.lastSpokeAt ?? 0,
          speech: eventType === "CHAT" ? message.content : existing?.speech ?? "",
          isSelf: senderId === localParticipantId
        };

        if (senderId === localParticipantId) {
          localParticipantRef.current = nextParticipant;
        }

        return { ...prev, [senderId]: nextParticipant };
      });

      if (eventType === "PRESENCE" && senderId !== localParticipantId) {
        sendRealtimeEvent("PRESENCE_SYNC", { targetUserId: senderId });
      }
    };

    void connectChat(ROOM_ID, handleRealtimeMessage)
      .then((connection) => {
        if (cancelled) {
          connection.disconnect();
          return;
        }

        connectionRef.current = connection;
        setError("");
        setConnected(true);
        sendRealtimeEvent("PRESENCE");
      })
      .catch((connectError) => {
        if (cancelled) {
          return;
        }
        setConnected(false);
        setError(connectError instanceof Error ? connectError.message : "Could not connect to plaza realtime.");
      });

    return () => {
      cancelled = true;
      sendRealtimeEvent("LEAVE");
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      setConnected(false);
    };
  }, [localAvatar, localNickname, localPalette, localParticipantId]);

  useEffect(() => {
    if (!connected) {
      return;
    }

    const heartbeatId = window.setInterval(() => {
      sendRealtimeEvent("PRESENCE");
    }, HEARTBEAT_INTERVAL_MS);

    return () => window.clearInterval(heartbeatId);
  }, [connected]);

  useEffect(() => {
    const cleanupId = window.setInterval(() => {
      const threshold = Date.now() - STALE_PARTICIPANT_MS;
      setParticipants((prev) => {
        let changed = false;
        const nextEntries = Object.entries(prev).filter(([participantId, participant]) => {
          const keep = participantId === localParticipantId || participant.lastSeen >= threshold;
          if (!keep) {
            changed = true;
          }
          return keep;
        });

        return changed ? Object.fromEntries(nextEntries) : prev;
      });
    }, 6000);

    return () => window.clearInterval(cleanupId);
  }, [localParticipantId]);

  useEffect(() => {
    let animationFrame = 0;
    let previousTime = performance.now();

    const tick = (now: number) => {
      const elapsedSeconds = (now - previousTime) / 1000;
      previousTime = now;

      const horizontal = (keysRef.current["ArrowRight"] || keysRef.current.KeyD ? 1 : 0) - (keysRef.current["ArrowLeft"] || keysRef.current.KeyA ? 1 : 0);
      const vertical = (keysRef.current["ArrowDown"] || keysRef.current.KeyS ? 1 : 0) - (keysRef.current["ArrowUp"] || keysRef.current.KeyW ? 1 : 0);

      setParticipants((prev) => {
        const next = { ...prev };
        let changed = false;

        Object.values(next).forEach((participant) => {
          const lerpSpeed = participant.isSelf ? LOCAL_LERP : REMOTE_LERP;
          const nextX = mathLerp(participant.x, participant.targetX, lerpSpeed);
          const nextY = mathLerp(participant.y, participant.targetY, lerpSpeed);
          const movementState =
            Math.abs(participant.targetX - nextX) > 0.06 || Math.abs(participant.targetY - nextY) > 0.06 ? "walk" : participant.isSelf && (horizontal !== 0 || vertical !== 0) ? "walk" : "idle";

          if (Math.abs(nextX - participant.x) > 0.001 || Math.abs(nextY - participant.y) > 0.001 || movementState !== participant.movementState) {
            next[participant.id] = {
              ...participant,
              x: nextX,
              y: nextY,
              movementState
            };
            if (participant.id === localParticipantId) {
              localParticipantRef.current = next[participant.id];
            }
            changed = true;
          }
        });

        if (horizontal !== 0 || vertical !== 0) {
          const current = next[localParticipantId] ?? createLocalParticipant(localParticipantId, localNickname, localPalette, localAvatar);
          const distance = MOVE_SPEED * elapsedSeconds;
          const diagonalOffset = horizontal !== 0 && vertical !== 0 ? Math.SQRT1_2 : 1;
          const resolvedTarget = resolvePlazaMovement(
            current.targetX,
            current.targetY,
            current.targetX + horizontal * distance * diagonalOffset,
            current.targetY + vertical * distance * diagonalOffset
          );
          const targetX = resolvedTarget.x;
          const targetY = resolvedTarget.y;
          const facingDirection = computeFacingDirection(current.targetX, current.targetY, targetX, targetY, current.facingDirection);

          next[localParticipantId] = {
            ...current,
            targetX,
            targetY,
            facingDirection,
            movementState: "walk",
            lastSeen: Date.now()
          };
          localParticipantRef.current = next[localParticipantId];
          changed = true;

          if (now - moveBroadcastAtRef.current >= NETWORK_MOVE_THROTTLE_MS) {
            moveBroadcastAtRef.current = now;
            sendRealtimeEvent("MOVE", { avatarX: targetX, avatarY: targetY });
          }
        }

        return changed ? next : prev;
      });

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [localAvatar, localNickname, localPalette, localParticipantId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      if (isMovementKey(event.code) || isMovementKey(event.key)) {
        keysRef.current[event.code] = true;
        keysRef.current[event.key] = true;
        event.preventDefault();
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (isMovementKey(event.code) || isMovementKey(event.key)) {
        keysRef.current[event.code] = false;
        keysRef.current[event.key] = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const handleSend = () => {
    if (!draft.trim() || !connectionRef.current) {
      return;
    }

    sendRealtimeEvent("CHAT", { content: draft.trim() });
    setDraft("");
  };

  const moveByStep = (deltaX: number, deltaY: number) => {
    setParticipants((prev) => {
      const current = prev[localParticipantId] ?? createLocalParticipant(localParticipantId, localNickname, localPalette, localAvatar);
      const resolvedTarget = resolvePlazaMovement(current.targetX, current.targetY, current.targetX + deltaX, current.targetY + deltaY);
      const targetX = resolvedTarget.x;
      const targetY = resolvedTarget.y;
      const nextParticipant: Participant = {
        ...current,
        targetX,
        targetY,
        facingDirection: computeFacingDirection(current.targetX, current.targetY, targetX, targetY, current.facingDirection),
        movementState: "walk",
        lastSeen: Date.now()
      };
      const next: Record<string, Participant> = {
        ...prev,
        [localParticipantId]: nextParticipant
      };
      localParticipantRef.current = nextParticipant;
      return next;
    });

    sendRealtimeEvent("MOVE", {
      avatarX: localParticipantRef.current?.targetX,
      avatarY: localParticipantRef.current?.targetY
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Users className="text-sky-500" />
              <h1 className="font-display text-2xl text-ink">3D Social Plaza</h1>
            </div>
            <p className="mt-3 max-w-2xl text-slate-600">
              The plaza now uses one shared 3D scene, so your real avatar can turn, idle, and walk with much smoother motion while realtime chat stays connected.
            </p>
          </div>
          <div className="rounded-3xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">
            Realtime:
            <span className={connected ? "ml-2 font-semibold text-emerald-600" : "ml-2 font-semibold text-amber-700"}>
              {connected ? "connected" : "connecting"}
            </span>
          </div>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,2.9fr)_minmax(280px,340px)]">
          <div className="rounded-[30px] border border-white/45 bg-white/30 p-4 shadow-[0_24px_60px_rgba(157,177,200,0.18)]">
            <div className="relative h-[520px] overflow-hidden rounded-[28px] border border-white/40 bg-[linear-gradient(180deg,#cfe4f0_0%,#deedf5_34%,#cfe2d6_34%,#9fc29f_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
              <Canvas camera={{ position: [0, 10.2, 22], fov: 36 }} shadows dpr={[1, 1.6]} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={1.1} />
                <hemisphereLight intensity={0.8} groundColor="#7cad88" color="#eef8ff" />
                <directionalLight castShadow position={[7, 10, 6]} intensity={1.45} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
                <directionalLight position={[-6, 4, -5]} intensity={0.28} color="#c7e4f2" />

                <mesh position={[0, 2.2, -13.6]}>
                  <sphereGeometry args={[6.6, 32, 20]} />
                  <meshStandardMaterial color="#ffffff" transparent opacity={0.1} />
                </mesh>

                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.02, 0]}>
                  <planeGeometry args={[40, 32]} />
                  <meshStandardMaterial color="#8abf96" roughness={0.94} />
                </mesh>

                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.01, 1.6]}>
                  <planeGeometry args={[6.2, 25]} />
                  <meshStandardMaterial color="#e7efe7" roughness={0.9} />
                </mesh>

                <PlazaEnvironment />

                <mesh position={[0, 0.18, -0.2]} receiveShadow>
                  <cylinderGeometry args={[1.15, 1.38, 0.18, 40]} />
                  <meshStandardMaterial color="#d3f1f8" roughness={0.5} metalness={0.08} />
                </mesh>
                <mesh position={[0, 0.34, -0.2]} receiveShadow>
                  <torusGeometry args={[1.08, 0.1, 16, 48]} />
                  <meshStandardMaterial color="#ffffff" roughness={0.32} metalness={0.08} />
                </mesh>
                <mesh position={[0, 0.54, -0.2]} receiveShadow>
                  <sphereGeometry args={[0.44, 28, 28]} />
                  <meshStandardMaterial color="#c8eef9" roughness={0.34} metalness={0.08} />
                </mesh>

                {participantList.map((participant) => (
                  <group key={participant.id} position={percentToWorld(participant.x, participant.y)}>
                    <AvatarRig
                      hair={participant.avatar.hair}
                      clothes={participant.avatar.clothes}
                      accessories={participant.avatar.accessories}
                      skinColor={participant.avatar.skinColor}
                      hairColor={participant.avatar.hairColor}
                      clothesColor={participant.avatar.clothesColor}
                      variant="plaza"
                      movementState={participant.movementState}
                      facingDirection={participant.facingDirection}
                      characterScale={0.46}
                    />
                    <Html position={[0, 5.6, 0]} center distanceFactor={11}>
                      <div className={`rounded-[20px] px-3 py-1 text-center text-[11px] font-semibold shadow-[0_10px_22px_rgba(109,133,160,0.18)] ${participant.isSelf ? "bg-white/92 text-sky-700" : "bg-white/84 text-slate-700"}`}>
                        {participant.nickname}
                      </div>
                    </Html>
                    {participant.speech && Date.now() - participant.lastSpokeAt < SPEECH_BUBBLE_MS ? (
                      <Html position={[0, 6.5, 0]} center distanceFactor={10}>
                        <div
                          className="relative w-max max-w-[220px] rounded-2xl bg-white/92 px-3 py-2 text-xs font-medium text-slate-700"
                          style={{ boxShadow: `0 16px 34px ${PALETTES[participant.palette].speechShadow}` }}
                        >
                          {participant.speech}
                          <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 bg-white/92" />
                        </div>
                      </Html>
                    ) : null}
                  </group>
                ))}

                <ContactShadows position={[0, -0.01, 0]} scale={28} blur={3.2} opacity={0.2} far={18} />
              </Canvas>

              <div className="pointer-events-none absolute left-4 top-4 rounded-2xl liquid-panel-soft px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-ink">{participantList.length}</span> players online
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-ink">
                <MessageCircle size={18} className="text-emerald-500" />
                <p className="font-display text-xl">Quick Chat</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">Type once. Your line appears above the avatar.</p>
              <div className="mt-4 flex gap-3">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 rounded-2xl liquid-input px-4 py-3 outline-none"
                  placeholder="Say something in plaza"
                />
                <button className="rounded-2xl bg-accent px-4 py-3 text-[#35516a]" onClick={handleSend}>
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {participantList.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between rounded-2xl bg-white/35 px-4 py-3">
                    <div>
                      <p className="font-semibold text-ink">{participant.nickname}</p>
                      <p className="text-xs text-slate-500">{participant.isSelf ? "You" : participant.movementState === "walk" ? "Walking" : "Idle"}</p>
                    </div>
                    <span className="rounded-full bg-white/50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {participant.isSelf ? "local" : "live"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-ink">
                <Sparkles size={18} className="text-sky-500" />
                <p className="font-display text-xl">Move Controls</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">`WASD` or tap pad. Collision is live.</p>
              <div className="mt-4 grid w-[152px] grid-cols-3 gap-2">
                <div />
                <ControlButton ariaLabel="move up" onClick={() => moveByStep(0, -3.2)}>
                  <ArrowUp size={16} />
                </ControlButton>
                <div />
                <ControlButton ariaLabel="move left" onClick={() => moveByStep(-3.2, 0)}>
                  <ArrowLeft size={16} />
                </ControlButton>
                <ControlButton ariaLabel="move down" onClick={() => moveByStep(0, 3.2)}>
                  <ArrowDown size={16} />
                </ControlButton>
                <ControlButton ariaLabel="move right" onClick={() => moveByStep(3.2, 0)}>
                  <ArrowRight size={16} />
                </ControlButton>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  function sendRealtimeEvent(
    type: NonNullable<ChatMessage["type"]>,
    overrides?: Partial<
      Pick<
        ChatMessage,
        | "content"
        | "targetUserId"
        | "avatarX"
        | "avatarY"
        | "avatarPalette"
        | "avatarHair"
        | "avatarClothes"
        | "avatarAccessories"
        | "avatarSkinColor"
        | "avatarHairColor"
        | "avatarClothesColor"
      >
    >
  ) {
    if (!connectionRef.current) {
      return;
    }

    const localParticipant = localParticipantRef.current ?? createLocalParticipant(localParticipantId, localNickname, localPalette, localAvatar);
    const payload: ChatMessage = {
      type,
      senderId: localParticipantId,
      senderNickname: localNickname,
      roomId: ROOM_ID,
      sentAt: "",
      content: overrides?.content ?? "",
      targetUserId: overrides?.targetUserId,
      avatarX: overrides?.avatarX ?? localParticipant.targetX,
      avatarY: overrides?.avatarY ?? localParticipant.targetY,
      avatarPalette: overrides?.avatarPalette ?? localParticipant.palette,
      avatarHair: overrides?.avatarHair ?? localParticipant.avatar.hair,
      avatarClothes: overrides?.avatarClothes ?? localParticipant.avatar.clothes,
      avatarAccessories: overrides?.avatarAccessories ?? localParticipant.avatar.accessories,
      avatarSkinColor: overrides?.avatarSkinColor ?? localParticipant.avatar.skinColor,
      avatarHairColor: overrides?.avatarHairColor ?? localParticipant.avatar.hairColor,
      avatarClothesColor: overrides?.avatarClothesColor ?? localParticipant.avatar.clothesColor
    };

    connectionRef.current.send(payload);
  }
}

function ControlButton({
  ariaLabel,
  children,
  onClick
}: {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/45 bg-white/45 text-slate-700 shadow-[0_12px_24px_rgba(157,177,200,0.16)] transition hover:bg-white/65"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function PlazaEnvironment() {
  return (
    <>
      <PlazaTree position={[-8.6, 0, -6.4]} />
      <PlazaTree position={[-10.8, 0, 1.5]} />
      <PlazaTree position={[8.8, 0, -5.8]} />
      <PlazaTree position={[10.2, 0, 2.4]} />
      <PlazaTree position={[-6.8, 0, 7.1]} />
      <PlazaTree position={[7.1, 0, 7.8]} />

      <RoundedBox args={[1.7, 0.18, 0.6]} radius={0.08} smoothness={4} position={[-4.3, 0.42, 2.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5fafc" roughness={0.54} metalness={0.06} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.68, 0.12]} radius={0.04} smoothness={4} position={[-4.9, 0.15, 2.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#dceaf2" roughness={0.56} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.68, 0.12]} radius={0.04} smoothness={4} position={[-3.7, 0.15, 2.6]} castShadow receiveShadow>
        <meshStandardMaterial color="#dceaf2" roughness={0.56} metalness={0.08} />
      </RoundedBox>

      <RoundedBox args={[1.7, 0.18, 0.6]} radius={0.08} smoothness={4} position={[4.4, 0.42, 3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#f5fafc" roughness={0.54} metalness={0.06} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.68, 0.12]} radius={0.04} smoothness={4} position={[3.8, 0.15, 3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#dceaf2" roughness={0.56} metalness={0.08} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.68, 0.12]} radius={0.04} smoothness={4} position={[5, 0.15, 3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#dceaf2" roughness={0.56} metalness={0.08} />
      </RoundedBox>

      <mesh position={[-2.8, 0.62, -0.6]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#d7f7ff" emissive="#93f4ff" emissiveIntensity={0.55} roughness={0.26} metalness={0.12} />
      </mesh>
      <mesh position={[2.9, 0.62, 0.4]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        <meshStandardMaterial color="#fff2c7" emissive="#ffd669" emissiveIntensity={0.35} roughness={0.26} metalness={0.12} />
      </mesh>
    </>
  );
}

function PlazaTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.14, 0.18, 1.04, 12]} />
        <meshStandardMaterial color="#7c5b3a" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.82, 24, 20]} />
        <meshStandardMaterial color="#74d8aa" roughness={0.72} />
      </mesh>
      <mesh position={[0.34, 1.9, 0.18]} castShadow>
        <sphereGeometry args={[0.46, 20, 18]} />
        <meshStandardMaterial color="#8ce5b7" roughness={0.72} />
      </mesh>
      <mesh position={[-0.38, 1.82, -0.14]} castShadow>
        <sphereGeometry args={[0.42, 20, 18]} />
        <meshStandardMaterial color="#69c99a" roughness={0.72} />
      </mesh>
    </group>
  );
}

function createClientId() {
  if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `guest-${Math.random().toString(36).slice(2, 10)}`;
}

function createLocalParticipant(id: string, nickname: string, palette: AvatarPaletteName, avatar: ParticipantAvatar): Participant {
  const spawn = seedSpawnPoint(id);
  const x = spawn.x;
  const y = spawn.y;

  return {
    id,
    nickname,
    x,
    y,
    targetX: x,
    targetY: y,
    facingDirection: 0,
    movementState: "idle",
    palette,
    avatar,
    lastSeen: Date.now(),
    lastSpokeAt: 0,
    speech: "",
    isSelf: true
  };
}

function isMovementKey(key: string) {
  return ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyW", "KeyA", "KeyS", "KeyD", "w", "a", "s", "d"].includes(key);
}

function parsePalette(rawPalette: string | undefined, seed: string) {
  if (rawPalette && rawPalette in PALETTES) {
    return rawPalette as AvatarPaletteName;
  }

  return paletteFromSeed(seed);
}

function paletteFromSeed(seed: string): AvatarPaletteName {
  const palettes = Object.keys(PALETTES) as AvatarPaletteName[];
  const total = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return palettes[total % palettes.length];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function mapUserAvatar(avatar: Avatar | undefined, palette: AvatarPaletteName): ParticipantAvatar {
  if (avatar) {
    return {
      hair: avatar.hair,
      clothes: avatar.clothes,
      accessories: avatar.accessories,
      skinColor: avatar.colors.skin,
      hairColor: avatar.colors.hair,
      clothesColor: avatar.colors.clothes
    };
  }

  const defaultColors: Record<AvatarPaletteName, { hair: string; clothes: string }> = {
    sky: { hair: "#6b7280", clothes: "#60a5fa" },
    mint: { hair: "#4b5563", clothes: "#34d399" },
    sunset: { hair: "#7c5a45", clothes: "#fb923c" },
    berry: { hair: "#8b5cf6", clothes: "#f472b6" },
    gold: { hair: "#6b4f27", clothes: "#fbbf24" }
  };

  return {
    hair: "Starter Cut",
    clothes: "Novice Hoodie",
    accessories: ["Beginner Badge"],
    skinColor: "#e8c39f",
    hairColor: defaultColors[palette].hair,
    clothesColor: defaultColors[palette].clothes
  };
}

function parseAvatarAppearance(message: ChatMessage, previous: ParticipantAvatar | undefined, palette: AvatarPaletteName): ParticipantAvatar {
  return {
    hair: message.avatarHair ?? previous?.hair ?? "Starter Cut",
    clothes: message.avatarClothes ?? previous?.clothes ?? "Novice Hoodie",
    accessories: message.avatarAccessories ?? previous?.accessories ?? ["Beginner Badge"],
    skinColor: message.avatarSkinColor ?? previous?.skinColor ?? "#e8c39f",
    hairColor: message.avatarHairColor ?? previous?.hairColor ?? mapUserAvatar(undefined, palette).hairColor,
    clothesColor: message.avatarClothesColor ?? previous?.clothesColor ?? mapUserAvatar(undefined, palette).clothesColor
  };
}

function percentToWorld(x: number, y: number): [number, number, number] {
  const normalizedX = ((x - 50) / 50) * WORLD_HALF_WIDTH;
  const normalizedZ = ((y - 67) / 24) * WORLD_HALF_DEPTH;
  return [normalizedX, 0, normalizedZ];
}

function seedSpawnPoint(seed: string) {
  const total = [...seed].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const baseSpawn = PLAZA_SPAWN_POINTS[total % PLAZA_SPAWN_POINTS.length];

  if (!collidesWithPlazaObject(baseSpawn.x, baseSpawn.y)) {
    return baseSpawn;
  }

  return { x: 20, y: 80 };
}

function worldToPercent(x: number, z: number) {
  return {
    x: (x / WORLD_HALF_WIDTH) * 50 + 50,
    y: (z / WORLD_HALF_DEPTH) * 24 + 67
  };
}

function worldRectToPercent(centerX: number, centerZ: number, width: number, depth: number): PlazaCollider {
  const center = worldToPercent(centerX, centerZ);
  const edgeX = worldToPercent(centerX + width / 2, centerZ);
  const edgeZ = worldToPercent(centerX, centerZ + depth / 2);

  return {
    x: center.x,
    y: center.y,
    halfW: Math.abs(edgeX.x - center.x),
    halfH: Math.abs(edgeZ.y - center.y)
  };
}

function collidesWithPlazaObject(x: number, y: number) {
  return PLAZA_COLLIDERS.some((collider) => Math.abs(x - collider.x) <= collider.halfW && Math.abs(y - collider.y) <= collider.halfH);
}

function resolvePlazaMovement(fromX: number, fromY: number, desiredX: number, desiredY: number) {
  const clampedX = clamp(desiredX, BOUNDS.minX, BOUNDS.maxX);
  const clampedY = clamp(desiredY, BOUNDS.minY, BOUNDS.maxY);

  if (!collidesWithPlazaObject(clampedX, clampedY)) {
    return { x: clampedX, y: clampedY };
  }

  if (!collidesWithPlazaObject(clampedX, fromY)) {
    return { x: clampedX, y: fromY };
  }

  if (!collidesWithPlazaObject(fromX, clampedY)) {
    return { x: fromX, y: clampedY };
  }

  return { x: fromX, y: fromY };
}

function computeFacingDirection(fromX: number, fromY: number, toX: number, toY: number, fallback: number) {
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;

  if (Math.abs(deltaX) < 0.01 && Math.abs(deltaY) < 0.01) {
    return fallback;
  }

  return Math.atan2(deltaX, deltaY);
}

function mathLerp(start: number, end: number, alpha: number) {
  return start + (end - start) * alpha;
}

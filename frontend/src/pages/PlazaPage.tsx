import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, MessageCircle, Send, Sparkles, Users } from "lucide-react";
import { useApp } from "../context/AppContext";
import { mockChat } from "../data/mockData";
import { connectChat, type ChatConnection } from "../services/chat";
import { ChatMessage } from "../types";

type Participant = {
  id: string;
  nickname: string;
  x: number;
  y: number;
  palette: AvatarPaletteName;
  lastSeen: number;
  lastSpokeAt: number;
  speech: string;
  isSelf: boolean;
};

type AvatarPaletteName = "sky" | "mint" | "sunset" | "berry" | "gold";

const INITIAL_MESSAGES = mockChat.map((message) => ({ ...message, type: "CHAT" as const }));
const ROOM_ID = "plaza";
const MOVE_SPEED = 24;
const NETWORK_MOVE_THROTTLE_MS = 90;
const HEARTBEAT_INTERVAL_MS = 12000;
const STALE_PARTICIPANT_MS = 35000;
const SPEECH_BUBBLE_MS = 9000;
const BOUNDS = {
  minX: 7,
  maxX: 93,
  minY: 26,
  maxY: 91
};

const PALETTES: Record<
  AvatarPaletteName,
  {
    body: string;
    trim: string;
    shadow: string;
    glow: string;
  }
> = {
  sky: {
    body: "#80c4ff",
    trim: "#205c93",
    shadow: "rgba(66, 129, 183, 0.32)",
    glow: "rgba(128, 196, 255, 0.28)"
  },
  mint: {
    body: "#7ee0b0",
    trim: "#1f7b5b",
    shadow: "rgba(57, 133, 101, 0.28)",
    glow: "rgba(126, 224, 176, 0.26)"
  },
  sunset: {
    body: "#ff9f7c",
    trim: "#99523b",
    shadow: "rgba(161, 94, 68, 0.3)",
    glow: "rgba(255, 159, 124, 0.28)"
  },
  berry: {
    body: "#f08bb4",
    trim: "#8d3961",
    shadow: "rgba(132, 68, 95, 0.3)",
    glow: "rgba(240, 139, 180, 0.28)"
  },
  gold: {
    body: "#ffd166",
    trim: "#987325",
    shadow: "rgba(148, 117, 44, 0.28)",
    glow: "rgba(255, 209, 102, 0.28)"
  }
};

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
    const nextParticipant: Participant = {
      id: localParticipantId,
      nickname: localNickname,
      x: current?.x ?? seedCoordinate(localParticipantId, "x"),
      y: current?.y ?? seedCoordinate(localParticipantId, "y"),
      palette: current?.palette ?? localPalette,
      lastSeen: Date.now(),
      lastSpokeAt: current?.lastSpokeAt ?? 0,
      speech: current?.speech ?? "",
      isSelf: true
    };

    localParticipantRef.current = nextParticipant;
    setParticipants((prev) => ({ ...prev, [localParticipantId]: nextParticipant }));
  }, [localNickname, localPalette, localParticipantId]);

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
      const nextPalette = parsePalette(message.avatarPalette, message.senderNickname || senderId);

      setParticipants((prev) => {
        const existing = prev[senderId];
        const nextParticipant: Participant = {
          id: senderId,
          nickname: message.senderNickname || existing?.nickname || "Visitor",
          x: typeof message.avatarX === "number" ? clamp(message.avatarX, BOUNDS.minX, BOUNDS.maxX) : existing?.x ?? seedCoordinate(senderId, "x"),
          y: typeof message.avatarY === "number" ? clamp(message.avatarY, BOUNDS.minY, BOUNDS.maxY) : existing?.y ?? seedCoordinate(senderId, "y"),
          palette: existing?.palette ?? nextPalette,
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
        setError(connectError instanceof Error ? connectError.message : "광장 서버에 연결하지 못했습니다.");
      });

    return () => {
      cancelled = true;
      sendRealtimeEvent("LEAVE");
      connectionRef.current?.disconnect();
      connectionRef.current = null;
      setConnected(false);
    };
  }, [localParticipantId, localPalette, localNickname]);

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

      if (horizontal !== 0 || vertical !== 0) {
        setParticipants((prev) => {
          const current = prev[localParticipantId] ?? createLocalParticipant(localParticipantId, localNickname, localPalette);
          const distance = MOVE_SPEED * elapsedSeconds;
          const diagonalOffset = horizontal !== 0 && vertical !== 0 ? Math.SQRT1_2 : 1;
          const nextParticipant: Participant = {
            ...current,
            x: clamp(current.x + horizontal * distance * diagonalOffset, BOUNDS.minX, BOUNDS.maxX),
            y: clamp(current.y + vertical * distance * diagonalOffset, BOUNDS.minY, BOUNDS.maxY),
            lastSeen: Date.now()
          };

          localParticipantRef.current = nextParticipant;
          return { ...prev, [localParticipantId]: nextParticipant };
        });

        if (now - moveBroadcastAtRef.current >= NETWORK_MOVE_THROTTLE_MS) {
          moveBroadcastAtRef.current = now;
          sendRealtimeEvent("MOVE");
        }
      }

      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [localParticipantId, localNickname, localPalette]);

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
      const current = prev[localParticipantId] ?? createLocalParticipant(localParticipantId, localNickname, localPalette);
      const nextParticipant: Participant = {
        ...current,
        x: clamp(current.x + deltaX, BOUNDS.minX, BOUNDS.maxX),
        y: clamp(current.y + deltaY, BOUNDS.minY, BOUNDS.maxY),
        lastSeen: Date.now()
      };

      localParticipantRef.current = nextParticipant;
      return { ...prev, [localParticipantId]: nextParticipant };
    });

    sendRealtimeEvent("MOVE");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
      <section className="rounded-[32px] liquid-panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Users className="text-sky-500" />
              <h1 className="font-display text-2xl text-ink">Social Plaza Metaverse</h1>
            </div>
            <p className="mt-3 max-w-2xl text-slate-600">
              채팅창 옆에서 바로 움직이는 도트 아바타를 확인할 수 있습니다. 화살표 키 또는 `WASD`로 걷고, 메시지를 보내면 머리 위에
              말풍선이 뜹니다.
            </p>
          </div>
          <div className="rounded-3xl liquid-panel-soft px-4 py-3 text-sm text-slate-600">
            실시간 상태:{" "}
            <span className={connected ? "font-semibold text-emerald-600" : "font-semibold text-amber-700"}>
              {connected ? "연결됨" : "재연결 중"}
            </span>
          </div>
        </div>

        {error && <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <div className="mt-6 grid gap-5 xl:grid-cols-[1.7fr_0.9fr]">
          <div className="rounded-[30px] border border-white/45 bg-white/30 p-4 shadow-[0_24px_60px_rgba(157,177,200,0.18)]">
            <div
              className="relative h-[520px] overflow-hidden rounded-[28px] border border-white/40"
              style={{
                background:
                  "linear-gradient(180deg, rgba(179, 222, 255, 0.72) 0%, rgba(232, 245, 255, 0.88) 44%, rgba(173, 221, 191, 0.88) 44%, rgba(129, 192, 153, 0.96) 100%)"
              }}
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(255,255,255,0))]" />
              <div className="absolute left-[8%] top-[16%] h-20 w-20 rounded-full bg-white/45 blur-xl" />
              <div className="absolute right-[12%] top-[12%] h-24 w-24 rounded-full bg-white/35 blur-xl" />
              <div className="absolute inset-x-0 bottom-0 h-[55%] opacity-70" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.16) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
              <div className="absolute left-[18%] top-[21%] h-24 w-20 rounded-[24px] bg-white/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" />
              <div className="absolute left-[20%] top-[15%] h-10 w-10 rounded-full bg-emerald-400/70 blur-[2px]" />
              <div className="absolute right-[16%] top-[24%] h-28 w-24 rounded-[28px] bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]" />
              <div className="absolute right-[18%] top-[17%] h-12 w-12 rounded-full bg-teal-300/70 blur-[2px]" />
              <div className="absolute left-1/2 top-[38%] h-24 w-24 -translate-x-1/2 rounded-full border-[10px] border-white/45 bg-cyan-200/55 shadow-[0_0_0_12px_rgba(255,255,255,0.14)]" />
              <div className="absolute left-1/2 top-[42%] h-12 w-12 -translate-x-1/2 rounded-full bg-cyan-100/85" />

              {participantList.map((participant) => (
                <PlazaAvatar key={participant.id} participant={participant} />
              ))}

              <div className="absolute left-4 top-4 rounded-2xl liquid-panel-soft px-3 py-2 text-xs text-slate-600">
                <span className="font-semibold text-ink">{participantList.length}</span> players online
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-ink">
                <Sparkles size={18} className="text-sky-500" />
                <p className="font-display text-xl">Move Controls</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">키보드가 편하면 `WASD`, 터치나 마우스는 아래 방향 패드를 쓰면 됩니다.</p>
              <div className="mt-4 grid w-[152px] grid-cols-3 gap-2">
                <div />
                <ControlButton ariaLabel="move up" onClick={() => moveByStep(0, -4)}>
                  <ArrowUp size={16} />
                </ControlButton>
                <div />
                <ControlButton ariaLabel="move left" onClick={() => moveByStep(-4, 0)}>
                  <ArrowLeft size={16} />
                </ControlButton>
                <ControlButton ariaLabel="move down" onClick={() => moveByStep(0, 4)}>
                  <ArrowDown size={16} />
                </ControlButton>
                <ControlButton ariaLabel="move right" onClick={() => moveByStep(4, 0)}>
                  <ArrowRight size={16} />
                </ControlButton>
              </div>
            </div>

            <div className="rounded-[28px] liquid-panel-soft p-5">
              <div className="flex items-center gap-2 text-ink">
                <MessageCircle size={18} className="text-emerald-500" />
                <p className="font-display text-xl">Now In Plaza</p>
              </div>
              <div className="mt-4 space-y-3">
                {participantList.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between rounded-2xl bg-white/35 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <PixelPortrait palette={participant.palette} compact />
                      <div>
                        <p className="font-semibold text-ink">{participant.nickname}</p>
                        <p className="text-xs text-slate-500">{participant.isSelf ? "You" : "Exploring plaza"}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-white/50 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {participant.isSelf ? "local" : "live"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] liquid-panel p-6">
        <p className="font-display text-2xl text-ink">Plaza Chat</p>
        <p className="mt-2 text-sm text-slate-600">보낸 메시지는 채팅창과 아바타 위 말풍선에 함께 반영됩니다.</p>
        <div className="mt-4 h-[520px] space-y-3 overflow-y-auto rounded-[28px] liquid-panel-soft p-4">
          {messages.map((message, index) => (
            <div key={`${message.sentAt}-${index}-${message.senderNickname}-${message.content}`} className="rounded-2xl liquid-panel-deep p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{message.senderNickname}</span>
                <span className="text-slate-500">{message.sentAt}</span>
              </div>
              <p className="mt-2 text-slate-600">{message.content}</p>
            </div>
          ))}
        </div>
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
            placeholder="광장에 메시지를 보내보세요"
          />
          <button className="rounded-2xl bg-accent px-4 py-3 text-[#35516a]" onClick={handleSend}>
            <Send size={18} />
          </button>
        </div>
      </section>
    </div>
  );

  function sendRealtimeEvent(
    type: NonNullable<ChatMessage["type"]>,
    overrides?: Partial<Pick<ChatMessage, "content" | "targetUserId" | "avatarX" | "avatarY" | "avatarPalette">>
  ) {
    if (!connectionRef.current) {
      return;
    }

    const localParticipant = localParticipantRef.current ?? createLocalParticipant(localParticipantId, localNickname, localPalette);
    const payload: ChatMessage = {
      type,
      senderId: localParticipantId,
      senderNickname: localNickname,
      roomId: ROOM_ID,
      sentAt: "",
      content: overrides?.content ?? "",
      targetUserId: overrides?.targetUserId,
      avatarX: overrides?.avatarX ?? localParticipant.x,
      avatarY: overrides?.avatarY ?? localParticipant.y,
      avatarPalette: overrides?.avatarPalette ?? localParticipant.palette
    };

    connectionRef.current.send(payload);
  }
}

function PlazaAvatar({ participant }: { participant: Participant }) {
  const palette = PALETTES[participant.palette];
  const showSpeech = participant.speech && Date.now() - participant.lastSpokeAt < SPEECH_BUBBLE_MS;

  return (
    <div
      className="absolute select-none"
      style={{
        left: `${participant.x}%`,
        top: `${participant.y}%`,
        transform: "translate(-50%, -100%)"
      }}
    >
      {showSpeech && (
        <div className="absolute bottom-[105%] left-1/2 w-max max-w-[180px] -translate-x-1/2 rounded-2xl bg-white/90 px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_14px_30px_rgba(108,133,160,0.18)]">
          {participant.speech}
          <div className="absolute left-1/2 top-full h-3 w-3 -translate-x-1/2 rotate-45 bg-white/90" />
        </div>
      )}

      <div
        className="absolute left-1/2 top-[88%] h-4 w-12 -translate-x-1/2 rounded-full blur-[4px]"
        style={{ backgroundColor: palette.shadow }}
      />
      <div
        className={`rounded-[20px] px-2 py-1 text-center text-[11px] font-semibold shadow-[0_10px_22px_rgba(109,133,160,0.18)] ${
          participant.isSelf ? "mb-2 bg-white/90 text-sky-700" : "mb-2 bg-white/80 text-slate-700"
        }`}
      >
        {participant.nickname}
      </div>
      <div
        className="rounded-[24px] p-2"
        style={{
          background: `radial-gradient(circle, ${palette.glow} 0%, rgba(255,255,255,0) 72%)`
        }}
      >
        <PixelPortrait palette={participant.palette} />
      </div>
    </div>
  );
}

function PixelPortrait({ compact = false, palette }: { compact?: boolean; palette: AvatarPaletteName }) {
  const size = compact ? 8 : 10;
  const paletteStyles = PALETTES[palette];

  return (
    <div className="relative" style={{ width: size * 5, height: compact ? size * 5 : size * 6 }}>
      <PixelBlock x={1} y={0} size={size} color="#f8e1c7" />
      <PixelBlock x={2} y={0} size={size} color="#f8e1c7" />
      <PixelBlock x={1} y={1} size={size} color="#f8e1c7" />
      <PixelBlock x={2} y={1} size={size} color="#f8e1c7" />
      <PixelBlock x={0} y={2} size={size} color={paletteStyles.body} />
      <PixelBlock x={1} y={2} size={size} color={paletteStyles.body} />
      <PixelBlock x={2} y={2} size={size} color={paletteStyles.body} />
      <PixelBlock x={3} y={2} size={size} color={paletteStyles.body} />
      <PixelBlock x={1} y={3} size={size} color={paletteStyles.body} />
      <PixelBlock x={2} y={3} size={size} color={paletteStyles.trim} />
      <PixelBlock x={1} y={4} size={size} color={paletteStyles.trim} />
      <PixelBlock x={2} y={4} size={size} color={paletteStyles.trim} />
      <PixelBlock x={0} y={5} size={size} color={paletteStyles.trim} />
      <PixelBlock x={3} y={5} size={size} color={paletteStyles.trim} />
    </div>
  );
}

function PixelBlock({ color, size, x, y }: { color: string; size: number; x: number; y: number }) {
  return <div className="absolute" style={{ left: x * size, top: y * size, width: size, height: size, backgroundColor: color }} />;
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

function createClientId() {
  if ("crypto" in globalThis && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `guest-${Math.random().toString(36).slice(2, 10)}`;
}

function createLocalParticipant(id: string, nickname: string, palette: AvatarPaletteName): Participant {
  return {
    id,
    nickname,
    x: seedCoordinate(id, "x"),
    y: seedCoordinate(id, "y"),
    palette,
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

function seedCoordinate(seed: string, axis: "x" | "y") {
  const codeTotal = [...`${seed}-${axis}`].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  const min = axis === "x" ? BOUNDS.minX : BOUNDS.minY;
  const max = axis === "x" ? BOUNDS.maxX : BOUNDS.maxY;
  return min + (codeTotal % Math.max(1, max - min));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

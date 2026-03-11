import { useEffect, useMemo, useRef, useState } from "react";
import { Navigation, Send, Wifi, WifiOff } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  applyLocalMove,
  applyPlazaEvent,
  clampPlazaPosition,
  MOVEMENT_SPEED,
  PLAZA_ID,
  PlazaParticipantMap,
  PlazaParticipantState,
  SEND_THROTTLE_MS,
  snapshotToState,
  tickParticipants
} from "../features/plaza/plazaState";
import type { PlazaDirection } from "../types";
import { connectPlaza, type PlazaConnection } from "../services/plaza";

const TOKEN_KEY = "lifemaker-token";
const MAP_DECORATIONS = [
  { label: "Quest Board", className: "plaza-board", style: { left: "12%", top: "18%" } },
  { label: "Fountain", className: "plaza-fountain", style: { left: "50%", top: "34%" } },
  { label: "Lounge", className: "plaza-lounge", style: { left: "78%", top: "22%" } },
  { label: "Garden", className: "plaza-garden", style: { left: "24%", top: "62%" } },
  { label: "Focus Spot", className: "plaza-focus", style: { left: "74%", top: "66%" } }
] as const;

export function PlazaPage() {
  const { user } = useApp();
  const [participants, setParticipants] = useState<PlazaParticipantMap>({});
  const [draft, setDraft] = useState("");
  const [connectionState, setConnectionState] = useState<"connecting" | "connected" | "reconnecting">("connecting");
  const [error, setError] = useState("");
  const [desktopMovementEnabled, setDesktopMovementEnabled] = useState(true);

  const connectionRef = useRef<PlazaConnection | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const disposedRef = useRef(false);
  const keysRef = useRef<Set<string>>(new Set());
  const participantsRef = useRef<PlazaParticipantMap>({});
  const sequenceRef = useRef(0);
  const lastSentAtRef = useRef(0);
  const lastMovementDirectionRef = useRef<PlazaDirection>("down");

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 960px) and (pointer: fine)");
    const update = () => setDesktopMovementEnabled(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    disposedRef.current = false;

    const openConnection = async (reconnecting: boolean) => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setError("A valid login session is required to enter the plaza.");
        setConnectionState("reconnecting");
        return;
      }

      setConnectionState(reconnecting ? "reconnecting" : "connecting");

      try {
        const connection = await connectPlaza({
          token,
          onSnapshot: (snapshot) => {
            if (snapshot.plazaId !== PLAZA_ID) {
              return;
            }
            setParticipants(snapshotToState(snapshot.participants));
            setConnectionState("connected");
            setError("");
          },
          onEvent: (event) => {
            setParticipants((current) => applyPlazaEvent(current, event, Date.now()));
          },
          onDisconnect: (reason) => {
            connectionRef.current = null;
            scheduleReconnect(reason);
          }
        });

        if (disposedRef.current) {
          connection.disconnect();
          return;
        }

        connectionRef.current = connection;
        setConnectionState("connected");
        setError("");
        connection.join({ plazaId: PLAZA_ID });
      } catch (connectError) {
        const reason = connectError instanceof Error ? connectError.message : "Failed to connect to the plaza server.";
        scheduleReconnect(reason);
      }
    };

    const scheduleReconnect = (reason: string) => {
      if (disposedRef.current) {
        return;
      }

      setConnectionState("reconnecting");
      setError(reason);
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
      }
      reconnectTimerRef.current = window.setTimeout(() => {
        reconnectTimerRef.current = null;
        void openConnection(true);
      }, 1600);
    };

    void openConnection(false);

    return () => {
      disposedRef.current = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      connectionRef.current?.disconnect();
      connectionRef.current = null;
    };
  }, [user?.id]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!desktopMovementEnabled || isTypingTarget(event.target) || !isMovementKey(event.key)) {
        return;
      }

      event.preventDefault();
      keysRef.current.add(event.key.toLowerCase());
    };

    const keyup = (event: KeyboardEvent) => {
      if (!isMovementKey(event.key)) {
        return;
      }
      keysRef.current.delete(event.key.toLowerCase());
    };

    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [desktopMovementEnabled]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let animationFrame = 0;
    let lastFrameAt = 0;

    const loop = (frameAt: number) => {
      const now = Date.now();
      const self = participantsRef.current[user.id];
      const movement = desktopMovementEnabled ? getMovementVector(keysRef.current) : null;

      if (self && movement) {
        const delta = lastFrameAt === 0 ? 1 : (frameAt - lastFrameAt) / 16.67;
        const nextPosition = clampPlazaPosition(
          self.targetX + movement.dx * MOVEMENT_SPEED * delta,
          self.targetY + movement.dy * MOVEMENT_SPEED * delta
        );

        const nextSequence = sequenceRef.current + 1;
        sequenceRef.current = nextSequence;
        setParticipants((current) => applyLocalMove(current, user.id, nextPosition, movement.direction, true, nextSequence));

        const shouldSend =
          frameAt - lastSentAtRef.current >= SEND_THROTTLE_MS ||
          movement.direction !== lastMovementDirectionRef.current ||
          !self.moving;

        if (shouldSend && connectionRef.current) {
          connectionRef.current.move({
            plazaId: PLAZA_ID,
            x: nextPosition.x,
            y: nextPosition.y,
            direction: movement.direction,
            moving: true,
            seq: nextSequence
          });
          lastSentAtRef.current = frameAt;
          lastMovementDirectionRef.current = movement.direction;
        }
      } else if (self?.moving) {
        const stopSequence = sequenceRef.current + 1;
        sequenceRef.current = stopSequence;
        setParticipants((current) =>
          applyLocalMove(current, user.id, { x: self.targetX, y: self.targetY }, self.direction, false, stopSequence)
        );
        connectionRef.current?.move({
          plazaId: PLAZA_ID,
          x: self.targetX,
          y: self.targetY,
          direction: self.direction,
          moving: false,
          seq: stopSequence
        });
        lastSentAtRef.current = frameAt;
      }

      setParticipants((current) => tickParticipants(current, user.id, now));
      lastFrameAt = frameAt;
      animationFrame = window.requestAnimationFrame(loop);
    };

    animationFrame = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(animationFrame);
  }, [desktopMovementEnabled, user?.id]);

  const roster = useMemo(() => {
    return Object.values(participants).sort((left, right) => {
      if (!user) {
        return left.nickname.localeCompare(right.nickname);
      }
      if (left.userId === user.id) {
        return -1;
      }
      if (right.userId === user.id) {
        return 1;
      }
      return left.nickname.localeCompare(right.nickname);
    });
  }, [participants, user]);

  const self = user ? participants[user.id] : null;
  const connectionLabel =
    connectionState === "connected"
      ? "Live"
      : connectionState === "reconnecting"
        ? "Reconnecting"
        : "Connecting";

  if (!user) {
    return null;
  }

  const handleSend = () => {
    const content = draft.trim();
    if (!content || !connectionRef.current) {
      return;
    }

    connectionRef.current.chat({
      plazaId: PLAZA_ID,
      content
    });
    setDraft("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_340px]">
      <section className="rounded-[32px] liquid-panel p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-3xl text-ink">Social Plaza</p>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              One shared square for the whole guild. Move around, see everyone live, and speak through floating speech bubbles.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="rounded-2xl liquid-panel-soft px-4 py-3">
              <span className="font-semibold text-ink">{roster.length}</span> online
            </div>
            <div className="rounded-2xl liquid-panel-soft px-4 py-3">
              {connectionState === "connected" ? <Wifi className="inline-block text-emerald-500" size={16} /> : <WifiOff className="inline-block text-amber-600" size={16} />}{" "}
              {connectionLabel}
            </div>
          </div>
        </div>

        <div className="mt-5 plaza-stage rounded-[28px] border border-white/45 p-4 sm:p-6">
          <div className="plaza-path plaza-path-main" />
          <div className="plaza-path plaza-path-side" />
          {MAP_DECORATIONS.map((item) => (
            <div key={item.label} className={`plaza-decoration ${item.className}`} style={item.style}>
              <span>{item.label}</span>
            </div>
          ))}

          {roster.map((participant) => (
            <ParticipantAvatar key={participant.userId} participant={participant} isSelf={participant.userId === user.id} />
          ))}

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-3 rounded-[24px] border border-white/45 bg-white/25 px-4 py-3 text-sm text-slate-600 backdrop-blur">
            <Navigation size={16} className="text-sky-500" />
            <span>{desktopMovementEnabled ? "Move with WASD or arrow keys." : "Observer mode on this device. Chat is still available."}</span>
            {self && <span className="rounded-full bg-white/45 px-3 py-1 text-xs text-ink">You are facing {self.direction}</span>}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-2xl text-ink">Plaza Status</p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="rounded-2xl liquid-panel-soft p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Connection</p>
              <p className="mt-2 text-lg font-semibold text-ink">{connectionLabel}</p>
              <p className="mt-2 text-sm text-slate-600">{error || "Realtime position sync and speech bubbles are active."}</p>
            </div>
            <div className="rounded-2xl liquid-panel-soft p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Mode</p>
              <p className="mt-2 text-lg font-semibold text-ink">{desktopMovementEnabled ? "Desktop movement" : "Observer mode"}</p>
              <p className="mt-2 text-sm text-slate-600">
                {desktopMovementEnabled ? "Keyboard movement is enabled on this device." : "Movement is disabled here to keep mobile browsing stable."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] liquid-panel p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-2xl text-ink">Nearby</p>
            <span className="rounded-full liquid-chip px-3 py-2 text-xs text-slate-600">{roster.length} active</span>
          </div>
          <div className="mt-4 space-y-3">
            {roster.map((participant) => (
              <div key={participant.userId} className="rounded-2xl liquid-panel-soft p-4">
                <div className="flex items-center gap-3">
                  <div className="plaza-roster-swatch" style={{ backgroundColor: participant.avatar.colors.clothes }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-semibold text-ink">{participant.nickname}</p>
                      {participant.userId === user.id && <span className="rounded-full bg-accent/15 px-2 py-1 text-[11px] font-semibold text-accent">You</span>}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Lv.{participant.level} · facing {participant.direction}</p>
                  </div>
                </div>
                {participant.bubble && <p className="mt-3 rounded-2xl bg-white/35 px-3 py-2 text-sm text-slate-600">"{participant.bubble.content}"</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] liquid-panel p-6">
          <p className="font-display text-2xl text-ink">Speak</p>
          <p className="mt-2 text-sm text-slate-600">Send a short message and your avatar will speak to everyone around the plaza.</p>
          <form
            className="mt-4 flex gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              className="flex-1 rounded-2xl liquid-input px-4 py-3 outline-none"
              maxLength={120}
              placeholder="Share your progress, invite people over, or say hello."
            />
            <button className="rounded-2xl bg-accent px-4 py-3 text-[#35516a]" type="submit">
              <Send size={18} />
            </button>
          </form>
        </section>
      </aside>
    </div>
  );
}

type ParticipantAvatarProps = {
  participant: PlazaParticipantState;
  isSelf: boolean;
};

function ParticipantAvatar({ participant, isSelf }: ParticipantAvatarProps) {
  const accessoryLabel = participant.avatar.accessories[0]?.slice(0, 2)?.toUpperCase() ?? "LM";

  return (
    <div
      className={`plaza-avatar${isSelf ? " is-self" : ""}`}
      style={{
        left: `${participant.renderX}%`,
        top: `${participant.renderY}%`
      }}
    >
      {participant.bubble && (
        <div className="plaza-bubble">
          <p>{participant.bubble.content}</p>
          <span>{participant.bubble.sentAt}</span>
        </div>
      )}
      <div className="plaza-nameplate">
        <strong>{participant.nickname}</strong>
        <span>Lv.{participant.level}</span>
      </div>
      <div className={`plaza-sprite ${participant.moving ? "is-moving" : ""}${isSelf ? " is-self" : ""}`}>
        <div className="plaza-shadow" />
        <div className="plaza-body" style={{ backgroundColor: participant.avatar.colors.clothes }}>
          <div className="plaza-body-shine" />
        </div>
        <div className="plaza-head" style={{ backgroundColor: participant.avatar.colors.skin }}>
          <div className="plaza-hair" style={{ backgroundColor: participant.avatar.colors.hair }} />
          <div className="plaza-face" />
        </div>
        <div className="plaza-accessory">{accessoryLabel}</div>
      </div>
    </div>
  );
}

function getMovementVector(keys: Set<string>) {
  const up = keys.has("w") || keys.has("arrowup");
  const down = keys.has("s") || keys.has("arrowdown");
  const left = keys.has("a") || keys.has("arrowleft");
  const right = keys.has("d") || keys.has("arrowright");

  const dx = (right ? 1 : 0) - (left ? 1 : 0);
  const dy = (down ? 1 : 0) - (up ? 1 : 0);
  if (dx === 0 && dy === 0) {
    return null;
  }

  const length = Math.hypot(dx, dy) || 1;
  const direction = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";

  return {
    dx: dx / length,
    dy: dy / length,
    direction
  } satisfies { dx: number; dy: number; direction: PlazaDirection };
}

function isMovementKey(key: string) {
  const normalized = key.toLowerCase();
  return normalized === "w" || normalized === "a" || normalized === "s" || normalized === "d" || normalized.startsWith("arrow");
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea" || target.isContentEditable;
}

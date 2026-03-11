import type { PlazaDirection, PlazaEvent, PlazaParticipant } from "../../types";

export const PLAZA_ID = "main";
export const CHAT_BUBBLE_TTL_MS = 4200;
export const MOVEMENT_SPEED = 0.48;
export const SEND_THROTTLE_MS = 70;
export const PLAZA_BOUNDS = {
  minX: 8,
  maxX: 92,
  minY: 14,
  maxY: 82
} as const;

export type PlazaBubbleState = {
  content: string;
  sentAt: string;
  expiresAt: number;
};

export type PlazaParticipantState = PlazaParticipant & {
  renderX: number;
  renderY: number;
  targetX: number;
  targetY: number;
  bubble: PlazaBubbleState | null;
  lastSeq: number;
};

export type PlazaParticipantMap = Record<string, PlazaParticipantState>;

export function clampPlazaPosition(x: number, y: number) {
  return {
    x: clamp(x, PLAZA_BOUNDS.minX, PLAZA_BOUNDS.maxX),
    y: clamp(y, PLAZA_BOUNDS.minY, PLAZA_BOUNDS.maxY)
  };
}

export function snapshotToState(participants: PlazaParticipant[]): PlazaParticipantMap {
  return participants.reduce<PlazaParticipantMap>((state, participant) => {
    state[participant.userId] = createParticipantState(participant, null, 0);
    return state;
  }, {});
}

export function applyPlazaEvent(state: PlazaParticipantMap, event: PlazaEvent, now: number): PlazaParticipantMap {
  if (!event.plazaId || event.plazaId !== PLAZA_ID) {
    return state;
  }

  switch (event.type) {
    case "joined":
      return event.participant ? upsertServerParticipant(state, event.participant, event.seq ?? 0) : state;
    case "moved":
      return event.participant ? upsertServerParticipant(state, event.participant, event.seq ?? 0) : state;
    case "chatted":
      if (!event.participant || !event.content) {
        return state;
      }
      return attachBubble(upsertServerParticipant(state, event.participant, event.seq ?? 0), event.participant.userId, event.content, event.sentAt ?? "Now", now);
    case "left":
      return event.userId ? removeParticipant(state, event.userId) : state;
    default:
      return state;
  }
}

export function applyLocalMove(
  state: PlazaParticipantMap,
  userId: string,
  position: { x: number; y: number },
  direction: PlazaDirection,
  moving: boolean,
  seq: number
): PlazaParticipantMap {
  const existing = state[userId];
  if (!existing || seq < existing.lastSeq) {
    return state;
  }

  const clamped = clampPlazaPosition(position.x, position.y);
  const next: PlazaParticipantState = {
    ...existing,
    x: clamped.x,
    y: clamped.y,
    targetX: clamped.x,
    targetY: clamped.y,
    renderX: clamped.x,
    renderY: clamped.y,
    direction,
    moving,
    lastSeq: seq
  };

  if (isSameParticipant(existing, next)) {
    return state;
  }

  return {
    ...state,
    [userId]: next
  };
}

export function tickParticipants(state: PlazaParticipantMap, selfUserId: string, now: number): PlazaParticipantMap {
  let nextState: PlazaParticipantMap | null = null;

  for (const [userId, participant] of Object.entries(state)) {
    let nextParticipant = participant;
    let changed = false;

    const bubbleExpired = participant.bubble && participant.bubble.expiresAt <= now;
    if (bubbleExpired) {
      nextParticipant = {
        ...nextParticipant,
        bubble: null
      };
      changed = true;
    }

    const desiredX = userId === selfUserId ? nextParticipant.targetX : ease(nextParticipant.renderX, nextParticipant.targetX);
    const desiredY = userId === selfUserId ? nextParticipant.targetY : ease(nextParticipant.renderY, nextParticipant.targetY);

    if (desiredX !== nextParticipant.renderX || desiredY !== nextParticipant.renderY) {
      nextParticipant = {
        ...nextParticipant,
        renderX: desiredX,
        renderY: desiredY
      };
      changed = true;
    }

    if (changed) {
      if (!nextState) {
        nextState = { ...state };
      }
      nextState[userId] = nextParticipant;
    }
  }

  return nextState ?? state;
}

function upsertServerParticipant(state: PlazaParticipantMap, participant: PlazaParticipant, seq: number): PlazaParticipantMap {
  const existing = state[participant.userId];
  if (existing && seq < existing.lastSeq) {
    return state;
  }

  const next = createParticipantState(participant, existing, seq);
  if (existing && isSameParticipant(existing, next)) {
    return state;
  }

  return {
    ...state,
    [participant.userId]: next
  };
}

function attachBubble(
  state: PlazaParticipantMap,
  userId: string,
  content: string,
  sentAt: string,
  now: number
): PlazaParticipantMap {
  const participant = state[userId];
  if (!participant) {
    return state;
  }

  const next: PlazaParticipantState = {
    ...participant,
    bubble: {
      content,
      sentAt,
      expiresAt: now + CHAT_BUBBLE_TTL_MS
    }
  };

  return {
    ...state,
    [userId]: next
  };
}

function removeParticipant(state: PlazaParticipantMap, userId: string): PlazaParticipantMap {
  if (!state[userId]) {
    return state;
  }

  const nextState = { ...state };
  delete nextState[userId];
  return nextState;
}

function createParticipantState(
  participant: PlazaParticipant,
  existing: PlazaParticipantState | null,
  seq: number
): PlazaParticipantState {
  const position = clampPlazaPosition(participant.x, participant.y);

  return {
    ...participant,
    x: position.x,
    y: position.y,
    targetX: position.x,
    targetY: position.y,
    renderX: existing ? existing.renderX : position.x,
    renderY: existing ? existing.renderY : position.y,
    bubble: existing?.bubble ?? null,
    lastSeq: Math.max(existing?.lastSeq ?? 0, seq)
  };
}

function ease(current: number, target: number) {
  const delta = target - current;
  if (Math.abs(delta) < 0.08) {
    return target;
  }
  return current + delta * 0.24;
}

function clamp(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }
  return Math.max(min, Math.min(max, value));
}

function isSameParticipant(left: PlazaParticipantState, right: PlazaParticipantState) {
  return (
    left.nickname === right.nickname &&
    left.level === right.level &&
    left.x === right.x &&
    left.y === right.y &&
    left.targetX === right.targetX &&
    left.targetY === right.targetY &&
    left.renderX === right.renderX &&
    left.renderY === right.renderY &&
    left.direction === right.direction &&
    left.moving === right.moving &&
    left.lastSeq === right.lastSeq &&
    left.avatar.colors.skin === right.avatar.colors.skin &&
    left.avatar.colors.hair === right.avatar.colors.hair &&
    left.avatar.colors.clothes === right.avatar.colors.clothes &&
    left.avatar.hair === right.avatar.hair &&
    left.avatar.clothes === right.avatar.clothes &&
    left.avatar.accessories.join("|") === right.avatar.accessories.join("|") &&
    bubbleKey(left.bubble) === bubbleKey(right.bubble)
  );
}

function bubbleKey(bubble: PlazaBubbleState | null) {
  return bubble ? `${bubble.content}-${bubble.sentAt}-${bubble.expiresAt}` : "";
}


import assert from "node:assert/strict";
import { applyLocalMove, applyPlazaEvent, clampPlazaPosition, snapshotToState, tickParticipants } from "./src/features/plaza/plazaState.ts";
import type { PlazaEvent, PlazaParticipant } from "./src/types.ts";

const baseParticipant: PlazaParticipant = {
  userId: "u-1",
  nickname: "QuestRunner",
  level: 8,
  avatar: {
    hair: "Starter Cut",
    clothes: "Novice Hoodie",
    accessories: ["Badge"],
    colors: {
      skin: "#F1C27D",
      hair: "#22C55E",
      clothes: "#38BDF8"
    }
  },
  x: 40,
  y: 40,
  direction: "down",
  moving: false
};

run("clampPlazaPosition keeps positions inside plaza bounds", () => {
  assert.deepEqual(clampPlazaPosition(-20, 150), { x: 8, y: 82 });
  assert.deepEqual(clampPlazaPosition(24, 40), { x: 24, y: 40 });
});

run("lower sequence move events are ignored", () => {
  const initial = snapshotToState([baseParticipant]);
  const withLocalMove = applyLocalMove(initial, baseParticipant.userId, { x: 66, y: 54 }, "right", true, 5);
  const staleEvent: PlazaEvent = {
    type: "moved",
    plazaId: "main",
    participant: { ...baseParticipant, x: 20, y: 22, direction: "left", moving: true },
    userId: baseParticipant.userId,
    content: null,
    sentAt: null,
    seq: 4
  };

  const next = applyPlazaEvent(withLocalMove, staleEvent, Date.now());

  assert.equal(next[baseParticipant.userId].targetX, 66);
  assert.equal(next[baseParticipant.userId].direction, "right");
});

run("left events remove a participant from state", () => {
  const initial = snapshotToState([baseParticipant]);
  const next = applyPlazaEvent(
    initial,
    {
      type: "left",
      plazaId: "main",
      participant: null,
      userId: baseParticipant.userId,
      content: null,
      sentAt: null,
      seq: null
    },
    Date.now()
  );

  assert.equal(Object.keys(next).length, 0);
});

run("chat bubbles expire during ticks", () => {
  const initial = snapshotToState([baseParticipant]);
  const chatted = applyPlazaEvent(
    initial,
    {
      type: "chatted",
      plazaId: "main",
      participant: baseParticipant,
      userId: baseParticipant.userId,
      content: "hello plaza",
      sentAt: "09:12",
      seq: null
    },
    1000
  );

  assert.equal(chatted[baseParticipant.userId].bubble?.content, "hello plaza");

  const expired = tickParticipants(chatted, baseParticipant.userId, 6000);
  assert.equal(expired[baseParticipant.userId].bubble, null);
});

console.log("All plaza state tests passed.");

function run(name: string, assertion: () => void) {
  assertion();
  console.log(`ok - ${name}`);
}

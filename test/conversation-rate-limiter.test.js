import test from "node:test";
import assert from "node:assert/strict";
import { createConversationRateLimiter } from "../src/ai/conversation-rate-limiter.js";

test("limita interpretación ambiental por canal", () => {
  let current = 1000;
  const limiter = createConversationRateLimiter({ cooldownMs: 4000, now: () => current });
  assert.equal(limiter.allow("channel-a"), true);
  assert.equal(limiter.allow("channel-a"), false);
  current += 4000;
  assert.equal(limiter.allow("channel-a"), true);
});

test("prioriza menciones, pero aplica enfriamiento por usuario", () => {
  let current = 1000;
  const limiter = createConversationRateLimiter({ addressedCooldownMs: 1500, now: () => current });
  assert.equal(limiter.allow("channel-a", { addressedToDM: true, userId: "user-1" }), true);
  assert.equal(limiter.allow("channel-a", { addressedToDM: true, userId: "user-1" }), false);
  assert.equal(limiter.allow("channel-a", { addressedToDM: true, userId: "user-2" }), true);
  current += 1500;
  assert.equal(limiter.allow("channel-a", { addressedToDM: true, userId: "user-1" }), true);
});

test("limita estado y permite limpiar un canal", () => {
  const limiter = createConversationRateLimiter({ maxChannels: 2, now: () => 1000 });
  limiter.allow("a");
  limiter.allow("b", { addressedToDM: true, userId: "u1" });
  limiter.allow("b", { addressedToDM: true, userId: "u2" });
  assert.equal(limiter.size, 2);
  limiter.clear("b");
  assert.equal(limiter.size, 0);
});

test("rechaza configuración y entradas inválidas", () => {
  assert.throws(() => createConversationRateLimiter({ cooldownMs: -1 }), /cooldownMs/);
  const limiter = createConversationRateLimiter();
  assert.throws(() => limiter.allow(" "), /channelId/);
  assert.throws(() => limiter.allow("channel", { addressedToDM: true }), /userId/);
});

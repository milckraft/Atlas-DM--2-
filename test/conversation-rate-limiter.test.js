import test from "node:test";
import assert from "node:assert/strict";
import { createConversationRateLimiter } from "../src/ai/conversation-rate-limiter.js";

test("limits ambient AI interpretation per channel", () => {
  let current = 1000;
  const limiter = createConversationRateLimiter({ cooldownMs: 4000, now: () => current });
  assert.equal(limiter.allow("channel-a"), true);
  assert.equal(limiter.allow("channel-a"), false);
  current += 3999;
  assert.equal(limiter.allow("channel-a"), false);
  current += 1;
  assert.equal(limiter.allow("channel-a"), true);
});

test("prioritizes messages explicitly addressed to Atlas", () => {
  const limiter = createConversationRateLimiter({ cooldownMs: 4000, now: () => 1000 });
  assert.equal(limiter.allow("channel-a"), true);
  assert.equal(limiter.allow("channel-a"), false);
  assert.equal(limiter.allow("channel-a", { addressedToDM: true }), true);
});

test("keeps channel state bounded and supports clearing", () => {
  const limiter = createConversationRateLimiter({ maxChannels: 1, now: () => 1000 });
  limiter.allow("a");
  limiter.allow("b");
  assert.equal(limiter.size, 1);
  limiter.clear("b");
  assert.equal(limiter.size, 0);
});

test("rejects invalid configuration and channel IDs", () => {
  assert.throws(() => createConversationRateLimiter({ cooldownMs: -1 }), /cooldownMs/);
  const limiter = createConversationRateLimiter();
  assert.throws(() => limiter.allow(" "), /channelId/);
});

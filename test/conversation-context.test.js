import test from "node:test";
import assert from "node:assert/strict";
import { classifyDiscordMessage, createConversationContextStore } from "../src/ai/conversation-context.js";

test("keeps a bounded recent context per channel", () => {
  const store = createConversationContextStore({ maxMessagesPerChannel: 2 });
  for (let i = 1; i <= 3; i++) store.append("channel-a", { authorId: "player", content: `message ${i}` });
  assert.deepEqual(store.getRecent("channel-a").map(item => item.content), ["message 2", "message 3"]);
});

test("isolates channel context and evicts oldest channel at capacity", () => {
  const store = createConversationContextStore({ maxChannels: 1 });
  store.append("a", { authorId: "p1", content: "hola" });
  store.append("b", { authorId: "p2", content: "buenas" });
  assert.equal(store.getRecent("a").length, 0);
  assert.equal(store.getRecent("b").length, 1);
});

test("does not forward bots, webhooks, DMs or slash commands", () => {
  assert.equal(classifyDiscordMessage({ author: { bot: true }, guildId: "g", channelId: "c", content: "hola" }).kind, "ignore");
  assert.equal(classifyDiscordMessage({ author: { bot: false }, webhookId: "w", guildId: "g", channelId: "c", content: "hola" }).kind, "ignore");
  assert.equal(classifyDiscordMessage({ author: { bot: false }, guildId: null, channelId: null, content: "hola" }).kind, "ignore");
  assert.equal(classifyDiscordMessage({ author: { bot: false }, guildId: "g", channelId: "c", content: "/campana ver" }).kind, "ignore");
});

test("keeps player-to-player messages as ambient context and detects direct address", () => {
  const ambient = classifyDiscordMessage({ author: { bot: false }, guildId: "g", channelId: "c", content: "¿Qué opinas?", mentions: { users: new Map() } }, { botUserId: "atlas" });
  const mention = classifyDiscordMessage({ author: { bot: false }, guildId: "g", channelId: "c", content: "Atlas, ¿qué ves?", mentions: { users: new Map([["atlas", {}]]) } }, { botUserId: "atlas" });
  assert.equal(ambient.kind, "ambient");
  assert.equal(mention.kind, "addressed_to_dm");
});

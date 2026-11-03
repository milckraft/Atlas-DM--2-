import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCampaignCharacterContext,
  buildConversationPayload,
  decideCampaignConversation
} from "../src/ai/conversation-orchestrator.js";

test("incluye el trasfondo y la historia de cada personaje como contexto narrativo", () => {
  const profiles = buildCampaignCharacterContext({
    characters: [{
      id: "char-1", playerId: "player-1", name: "Jiedem", level: 3,
      class: "rogue", species: "elf", background: "criminal",
      backstory: "Creció en las calles y aprendió a sobrevivir robando.",
      personality: "Desconfiado", ideals: "Libertad", bonds: "Su vieja amiga",
      flaws: "No confía fácilmente", goals: ["Descubrir su origen"]
    }]
  });
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].name, "Jiedem");
  assert.equal(profiles[0].background, "Criminal");
  assert.equal(profiles[0].class, "Pícaro");
  assert.match(profiles[0].backstory, /Creció en las calles/);
  assert.deepEqual(profiles[0].goals, ["Descubrir su origen"]);
});

test("no filtra notas privadas o campos arbitrarios del registro de campaña", () => {
  const profiles = buildCampaignCharacterContext({
    characters: [{
      id: "c", playerId: "p", name: "Aventurero", level: 1,
      class: "wizard", species: "human", background: "sage",
      dmSecret: "SECRETO PRIVADO", privateNotes: "NO ENVIAR"
    }]
  });
  assert.equal(JSON.stringify(profiles).includes("SECRETO PRIVADO"), false);
  assert.equal(JSON.stringify(profiles).includes("NO ENVIAR"), false);
});

test("construye el contexto de conversación con indicación de mención directa", () => {
  const payload = buildConversationPayload({
    campaign: { name: "Edrava", worldId: "edrava", characters: [] },
    messages: [{ authorName: "Jugador", content: "Atlas, ¿qué veo?" }],
    addressedToDM: true,
    currentAuthorId: "player-1"
  });
  assert.equal(payload.addressedToDM, true);
  assert.equal(payload.currentAuthorId, "player-1");
  assert.match(payload.campaignContext, /Edrava/);
});

test("acepta decisiones válidas y rechaza formas desconocidas", async () => {
  const valid = await decideCampaignConversation({
    interpretConversation: async () => ({ decision: "observe", reply: "", action: null })
  }, { messages: [] });
  assert.equal(valid.status, "ok");
  assert.equal(valid.decision.decision, "observe");

  const invalid = await decideCampaignConversation({
    interpretConversation: async () => ({ decision: "delete_campaign", reply: "hecho" })
  }, { messages: [] });
  assert.equal(invalid.status, "invalid_response");
});

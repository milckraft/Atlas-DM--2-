import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState, appendAbilityCheckEvent } from "../src/campaign/campaign-schema.js";
test("conserva el resultado de prueba de habilidad al normalizar la campaña", () => {
  const state = createCampaignState({ campaignId: "check-test", name: "Checks" });
  const result = { type: "ability_check", ability: "DEX", skill: "stealth", rolls: [14], kept: 14, mode: "normal", abilityModifier: 2, proficiencyBonus: 2, total: 18, dc: 15, success: true, proficient: true };
  const updated = appendAbilityCheckEvent(state, { result, actorId: "player-1", characterId: "hero-1" });
  const loaded = createCampaignState(updated);
  assert.equal(loaded.events[0].check.characterId, "hero-1");
  assert.equal(loaded.events[0].check.total, 18);
  assert.deepEqual(loaded.events[0].roll, { mode: "normal", rolls: [14], kept: 14 });
});

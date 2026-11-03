import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState } from "../src/campaign/campaign-schema.js";
import { registerCampaignCharacter, selectActiveCampaignCharacter, getActiveCampaignCharacter, listCampaignCharacters } from "../src/campaign/character-roster.js";

const campaign = createCampaignState({ campaignId: "roster-test", name: "Prueba" });
const character = { id: "hero-1", name: "Aventurero", playerId: "player-1", level: 1, class: "rogue", background: "criminal", species: "human", abilities: { STR: 10, DEX: 15, CON: 12, INT: 13, WIS: 10, CHA: 8 }, languages: ["Common"], proficiencies: { skills: ["stealth"] } };
test("registra y selecciona una ficha del propietario", () => {
  const added = registerCampaignCharacter(campaign, character, "player-1");
  const selected = selectActiveCampaignCharacter(added, "hero-1", "player-1");
  assert.equal(getActiveCampaignCharacter(selected, "player-1").name, "Aventurero");
  assert.equal(listCampaignCharacters(selected, "player-1").length, 1);
});
test("rechaza fichas ajenas e IDs duplicados", () => {
  assert.throws(() => registerCampaignCharacter(campaign, character, "player-2"), /pertenecen/);
  const added = registerCampaignCharacter(campaign, character, "player-1");
  assert.throws(() => registerCampaignCharacter(added, character, "player-1"), /ID/);
});
test("impide seleccionar personajes de otro jugador", () => {
  const other = { ...character, id: "hero-2", playerId: "player-2" };
  const added = registerCampaignCharacter(campaign, other, "player-2");
  assert.throws(() => selectActiveCampaignCharacter(added, "hero-2", "player-1"), /otro jugador/);
});

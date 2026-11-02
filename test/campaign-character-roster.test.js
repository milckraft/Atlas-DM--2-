import test from "node:test";
import assert from "node:assert/strict";
import { createCampaignState } from "../src/campaign/campaign-schema.js";
import { createCharacterDraft } from "../src/characters/character-schema.js";
import {
  getActiveCampaignCharacter,
  registerCampaignCharacter,
  selectActiveCampaignCharacter
} from "../src/campaign/character-roster.js";

const campaign = () => createCampaignState({ campaignId: "guild-1", name: "Edrava" });
const character = (playerId, name = "Lira") => createCharacterDraft({
  name, playerId, class: "rogue", background: "wayfarer", species: "elf",
  abilities: { STR: 8, DEX: 17, CON: 13, INT: 12, WIS: 15, CHA: 10 },
  languages: ["Común", "Élfico", "Enano"]
});

test("registers a character and selects the first one as active", () => {
  const result = registerCampaignCharacter(campaign(), character("player-1"), "player-1", { id: "char-1" });
  assert.equal(result.state.characters.length, 1);
  assert.equal(getActiveCampaignCharacter(result.state, "player-1").id, "char-1");
});

test("does not allow registering a character for another player", () => {
  assert.throws(
    () => registerCampaignCharacter(campaign(), character("player-2"), "player-1"),
    /propia cuenta/
  );
});

test("a player can select only their own registered character", () => {
  const registered = registerCampaignCharacter(campaign(), character("player-1"), "player-1", { id: "char-1" }).state;
  assert.throws(() => selectActiveCampaignCharacter(registered, "char-1", "player-2"), /No se encontró/);
});

test("supports multiple characters without changing another player's active character", () => {
  let state = registerCampaignCharacter(campaign(), character("player-1", "Lira"), "player-1", { id: "char-1" }).state;
  state = registerCampaignCharacter(state, character("player-2", "Borin"), "player-2", { id: "char-2" }).state;
  state = selectActiveCampaignCharacter(state, "char-2", "player-2");
  assert.equal(getActiveCampaignCharacter(state, "player-1").id, "char-1");
  assert.equal(getActiveCampaignCharacter(state, "player-2").id, "char-2");
});

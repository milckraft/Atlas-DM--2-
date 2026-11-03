import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createCampaignState, appendAbilityCheckEvent } from "../src/campaign/campaign-schema.js";
import { createCampaignStore } from "../src/campaign/campaign-store.js";
import {
  registerCampaignCharacter, selectActiveCampaignCharacter, getActiveCampaignCharacter
} from "../src/campaign/character-roster.js";
import { resolveCharacterSkillCheck } from "../src/rules/character-checks.js";

test("flujo de personaje activo y prueba de habilidad persiste en campaña", async () => {
  const directory = await mkdtemp(join(tmpdir(), "atlas-character-flow-"));
  try {
    const store = createCampaignStore({ directory });
    let campaign = createCampaignState({ campaignId: "guild-1", name: "Edrava" });
    const character = {
      id: "hero-1", name: "Explorador", playerId: "player-1", level: 1,
      class: "rogue", background: "criminal", species: "human",
      abilities: { STR: 10, DEX: 16, CON: 12, INT: 13, WIS: 14, CHA: 8 },
      languages: ["Common"], proficiencies: { skills: ["stealth"] }
    };
    campaign = registerCampaignCharacter(campaign, character, "player-1");
    campaign = selectActiveCampaignCharacter(campaign, "hero-1", "player-1");
    await store.create(campaign);

    const loaded = await store.get("guild-1");
    const active = getActiveCampaignCharacter(loaded, "player-1");
    assert.equal(active.id, "hero-1");

    const result = resolveCharacterSkillCheck({
      character: active, skill: "stealth", dc: 15, randomD20: () => 12
    });
    assert.equal(result.total, 17);
    assert.equal(result.success, true);

    const updated = appendAbilityCheckEvent(loaded, {
      result, actorId: "player-1", characterId: active.id
    });
    await store.save(updated);
    const persisted = await store.get("guild-1");
    assert.equal(persisted.events[0].check.characterId, "hero-1");
    assert.equal(persisted.events[0].check.total, 17);
    assert.equal(persisted.events[0].check.success, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
